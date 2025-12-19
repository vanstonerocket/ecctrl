import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

export function AvatarRPM({ avatarId, urlParams = "", scale = 1 }) {
  const url = useMemo(
    () => `https://models.readyplayer.me/${avatarId}.glb${urlParams}`,
    [avatarId, urlParams]
  );

  const gltf = useGLTF(url);

  useEffect(() => {
    gltf.scene.traverse((o) => {
      // Make avatar purely visual and lightweight
      o.castShadow = true;
      o.receiveShadow = false;

      // Prevent it from being “hit tested” or used by some collision/raycast systems
      o.raycast = () => null;

      // Tag for any code that checks userData
      o.userData = { ...(o.userData || {}), isAvatarVisual: true, camExcludeCollision: true };
    });
  }, [gltf]);

  return (
    <group dispose={null} scale={scale}>
      <primitive object={gltf.scene} />
    </group>
  );
}
