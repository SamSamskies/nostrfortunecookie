import { Html, Head, Main, NextScript } from "next/document";
import Image from "next/image";
import React from "react";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <footer>
          <a href="https://github.com/SamSamskies" target="_blank">
            <Image
              src="/github-mark.png"
              width={32}
              height={32}
              alt="GitHub logo"
            />
          </a>
          <p
            id="nostr-zap-target"
            data-npub="npub1f948ng6s3spk9wv990tuyh4dl0uujt6jq9uduanzt3yy653e6f6s77uvzg"
          >
            ⚡️
          </p>
        </footer>
        <script
          async
          src="https://cdn.jsdelivr.net/npm/nostr-zap@0.1.6"
        ></script>
        <NextScript />
      </body>
    </Html>
  );
}
