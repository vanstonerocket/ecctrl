import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

export function AvatarRPM({ avatarId, urlParams = "", scale = 1 }) {
  const url = useMemo(() => {
    return `https://models.readyplayer.me/${avatarId}.glb${urlParams}`;
  }, [avatarId, urlParams]);

  const gltf = useGLTF(url);

  return (
    <group dispose={null} scale={scale}>
      <primitive object={gltf.scene} />
    </group>
  );
}