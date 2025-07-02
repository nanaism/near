"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import type {
  Html5QrcodeError,
  Html5QrcodeResult,
} from "html5-qrcode/esm/core";
import { useEffect } from "react";

const QRCODE_REGION_ID = "html5qr-code-full-region";

type Props = {
  onScanSuccess: (decodedText: string, result: Html5QrcodeResult) => void;
  onScanFailure: (error: string, errorv2?: Html5QrcodeError) => void;
};

export const QrCodeScanner = ({ onScanSuccess, onScanFailure }: Props) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      QRCODE_REGION_ID,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );
    scanner.render(onScanSuccess, onScanFailure);
    return () => {
      scanner
        .clear()
        .catch((err) => console.error("Scanner clear failed:", err));
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id={QRCODE_REGION_ID} />;
};
