import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // preflightリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${Deno.env.get(
              "SUPABASE_SERVICE_ROLE_KEY"
            )}`,
          },
        },
      }
    );

    // 'pending'状態のキューアイテムを最大5件取得
    const { data: queueItems, error: selectError } = await supabaseClient
      .from("analysis_queue")
      .select("id, conversation_id")
      .eq("status", "pending")
      .limit(5);

    if (selectError) throw selectError;

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending items to process." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const processingPromises = queueItems.map(async (item) => {
      try {
        // ここでNext.jsのAPIエンドポイントを叩く
        const response = await fetch(
          `${Deno.env.get("AUTH_URL")}/api/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get(
                "SUPABASE_WEBHOOK_SECRET"
              )}`,
            },
            // conversationテーブルから元のレコードを取得してbodyとして渡す
            body: JSON.stringify({
              record: (
                await supabaseClient
                  .from("conversations")
                  .select("*")
                  .eq("id", item.conversation_id)
                  .single()
              ).data,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Analysis API failed with status ${response.status}`);
        }

        // 成功したらキューのステータスを更新
        await supabaseClient
          .from("analysis_queue")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id);
      } catch (e) {
        // 失敗したらエラーメッセージを記録
        const errorMessage = e instanceof Error ? e.message : String(e);
        await supabaseClient
          .from("analysis_queue")
          .update({ status: "failed", error_message: errorMessage })
          .eq("id", item.id);
      }
    });

    await Promise.all(processingPromises);

    return new Response(
      JSON.stringify({ success: true, processed: queueItems.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
