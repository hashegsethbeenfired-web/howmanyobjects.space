"use client";

import { useState, useCallback, useEffect } from "react";
import { formatNumber } from "@/lib/utils";

interface ShareActionsProps {
  totalCount: number;
}

export default function ShareActions({ totalCount }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const shareText = `Right now, there are ${formatNumber(totalCount)} human-made objects orbiting Earth. howmanyobjects.space`;
  const shareUrl = "https://howmanyobjects.space";

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const shareTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "How Many Objects Are Orbiting Earth?",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled — that's fine
      }
    }
  }, [shareText]);

  return (
    <div className="share" id="share">
      <button
        className={`share__button ${copied ? "share__button--copied" : ""}`}
        onClick={copyLink}
        aria-label={copied ? "Link copied!" : "Copy link to clipboard"}
      >
        {copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5 4.5L6 12L2.5 8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="5"
                y="5"
                width="8"
                height="8"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M3 11V3.5C3 2.67 3.67 2 4.5 2H11"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Copy link
          </>
        )}
      </button>

      <button
        className="share__button"
        onClick={shareTwitter}
        aria-label="Share on Twitter / X"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </button>

      {canShare && (
        <button
          className="share__button"
          onClick={shareNative}
          aria-label="Share using device share menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1v9M4.5 4.5L8 1l3.5 3.5M3 10v3.5a1 1 0 001 1h8a1 1 0 001-1V10"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Share
        </button>
      )}
    </div>
  );
}
