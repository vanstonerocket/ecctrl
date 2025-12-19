import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Leva } from "leva";
import { EcctrlJoystick } from "../src/EcctrlJoystick";
import { Suspense, useEffect, useState } from "react";
import { Bvh } from "@react-three/drei";

// If your overlay file is in the same folder as index.jsx:
import { RPMCreatorOverlay } from "./RPMCreatorOverlay"; // rename file to match

const root = ReactDOM.createRoot(document.querySelector("#root"));

const EcctrlJoystickControls = () => {
  const [isTouchScreen, setIsTouchScreen] = useState(false);

  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchScreen(true);
    } else {
      setIsTouchScreen(false);
    }
  }, []);

  return <>{isTouchScreen && <EcctrlJoystick buttonNumber={5} />}</>;
};

function App() {
  const [creatorOpen, setCreatorOpen] = useState(false);

  // Put any known working avatarId here to start
  const [avatarId, setAvatarId] = useState("");

  return (
    <>
      <Leva collapsed />
      <EcctrlJoystickControls />

      {/* Simple HUD button to open the creator */}
      <button
        onClick={() => setCreatorOpen(true)}
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 10000,
          padding: "8px 10px",
        }}
      >
        Create Avatar
      </button>

      {/* The overlay lives OUTSIDE the Canvas */}
      <RPMCreatorOverlay
        open={creatorOpen}
        subdomain="demo"
        onClose={() => setCreatorOpen(false)}
        onAvatarExported={({ avatarId, url }) => {
          console.log("RPM exported:", { avatarId, url });
          setAvatarId(avatarId);
        }}
      />

      <Canvas
        shadows
        camera={{
          fov: 65,
          near: 0.1,
          far: 1000,
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") {
            e.target.requestPointerLock();
          }
        }}
      >
        <Suspense fallback={null}>
          <Bvh firstHitOnly>
            <Experience avatarId={avatarId} />
          </Bvh>
        </Suspense>
      </Canvas>
    </>
  );
}

root.render(<App />);
