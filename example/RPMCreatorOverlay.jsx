import { useEffect, useMemo, useRef } from "react";

function parseRpmMessage(event) {
  // RPM often sends JSON as a string
  if (!event || event.data == null) return null;

  if (typeof event.data === "string") {
    try {
      return JSON.parse(event.data);
    } catch {
      return null;
    }
  }

  // Sometimes it may already be an object
  if (typeof event.data === "object") return event.data;

  return null;
}

function extractAvatarIdFromUrl(url) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).at(-1) || "";
    return last.replace(".glb", "");
  } catch {
    const last = (url || "").split("/").pop() || "";
    return last.split(".glb")[0];
  }
}

export function RPMCreatorOverlay({ open, onClose, onAvatarExported, subdomain }) {
  const iframeRef = useRef(null);

  const creatorUrl = useMemo(() => {
    return `https://${subdomain}.readyplayer.me/avatar?frameApi`;
  }, [subdomain]);

  useEffect(() => {
    if (!open) return;

    function onMessage(event) {
      const msg = parseRpmMessage(event);
      if (!msg || msg.source !== "readyplayerme" || typeof msg.eventName !== "string") return;

      // Debug: you should see these in console once it works
      // console.log("RPM:", msg.eventName, msg);

      // Subscribe once the frame is ready
      if (msg.eventName === "v1.frame.ready") {
        const frameWindow = iframeRef.current && iframeRef.current.contentWindow;
        if (!frameWindow) return;

        frameWindow.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        );
        return;
      }

      // Avatar exported (Done button)
      if (msg.eventName === "v1.avatar.exported") {
        const url = msg.data && msg.data.url;
        if (!url) return;

        const avatarId = extractAvatarIdFromUrl(url);
        onAvatarExported({ avatarId, url });
        onClose();
        return;
      }

      // Some setups also emit v2 events, so handle that too
      if (msg.eventName === "v2.avatar.exported") {
        const url = msg.data && msg.data.url;
        if (!url) return;

        const avatarId = extractAvatarIdFromUrl(url);
        onAvatarExported({ avatarId, url });
        onClose();
      }
    }

    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage); // helps on some browsers/embeds :contentReference[oaicite:2]{index=2}

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onMessage);
    };
  }, [open, onAvatarExported, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 999999,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ width: "min(1100px, 95vw)", height: "min(720px, 90vh)", background: "#111" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
          <button onClick={onClose}>Close</button>
        </div>

        <iframe
          ref={iframeRef}
          title="Ready Player Me Avatar Creator"
          src={creatorUrl}
          style={{ width: "100%", height: "calc(100% - 44px)", border: 0 }}
          allow="camera *; microphone *"
        />
      </div>
    </div>
  );
}
