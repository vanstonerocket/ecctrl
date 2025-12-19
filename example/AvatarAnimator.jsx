import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useFBX, useGLTF, useKeyboardControls } from "@react-three/drei";

export const AvatarAnimator = forwardRef(function AvatarAnimator(
  {
    avatarId,
    urlParams = "",
    scale = 1,
    animPaths = {
      idle: "/F_Standing_Idle_001.fbx",
      walk: "/F_Standing_Idle_001.fbx",
      run: "/F_Standing_Idle_001.fbx",
    },
    fade = 0.2,
  },
  ref
) {
  const group = useRef(null);
  const current = useRef("idle");

  // 1) Load avatar GLB
  const avatarUrl = useMemo(() => `https://models.readyplayer.me/${avatarId}.glb${urlParams}`, [
    avatarId,
    urlParams,
  ]);
  const avatar = useGLTF(avatarUrl);

  // 2) Load FBX clips
  const idleFbx = useFBX(animPaths.idle);
  const walkFbx = useFBX(animPaths.walk);
  const runFbx = useFBX(animPaths.run);

  // Guard: some FBX files may have 0 animations if load failed
  const idleClip = idleFbx.animations?.[0];
  const walkClip = walkFbx.animations?.[0];
  const runClip = runFbx.animations?.[0];

  if (idleClip) idleClip.name = "idle";
  if (walkClip) walkClip.name = "walk";
  if (runClip) runClip.name = "run";

  const clips = [];
  if (idleClip) clips.push(idleClip);
  if (walkClip) clips.push(walkClip);
  if (runClip) clips.push(runClip);

  // 3) Bind clips to the same group that contains the avatar scene
  const { actions } = useAnimations(clips, group);

  const [, getKeys] = useKeyboardControls();

  const play = (name) => {
    if (!actions || !actions[name]) return;

    Object.values(actions).forEach((a) => a && a.fadeOut(fade));
    actions[name].reset().fadeIn(fade).play();
    current.current = name;
  };

  // Autoplay idle when ready
  useEffect(() => {
    if (!group.current) return;
    if (!actions) return;

    // Debug helpers
    // console.log("AvatarAnimator ready. Actions:", Object.keys(actions));
    // console.log("Avatar scene children:", avatar.scene.children?.length);

    if (actions.idle) play("idle");
  }, [actions, avatar]);

  // Drive walk/run based on keys
  useFrame(() => {
    if (!actions) return;

    const k = getKeys();
    const moving = k.forward || k.backward || k.leftward || k.rightward;
    const desired = moving ? (k.run ? "run" : "walk") : "idle";

    if (desired !== current.current && actions[desired]) {
      play(desired);
    }
  });

  useImperativeHandle(ref, () => ({ play }));

  // IMPORTANT: ensure avatar.scene is actually under the animated group
  return (
    <group ref={group} dispose={null} scale={scale}>
      <primitive object={avatar.scene} />
    </group>
  );
});
