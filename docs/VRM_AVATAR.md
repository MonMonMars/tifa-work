# VRM avatar swap ticket (M2)

## Current

- `AvatarStage` hosts **`GlAvatarView`** (expo-gl + Three.js procedural mesh) with expression-driven motion.
- `MorphTargetPanel` shows morph target bars from `ExpressionSnapshot` (stand-in until VRM blend shapes).
- Static emoji fallback if WebGL fails.
- **No licensed VRM file in repo yet** — add under `assets/models/` when ready.

## Target

- **VRM-first** (align `amoji-app` / `@pixiv/three-vrm`, not AIVA MakeHuman GLB long-term).
- Render in **Expo GL** (`expo-gl` + `three`) on the Home stage while chat/settings stay overlays.

## Integration steps

1. Add dependencies: `expo-gl`, `expo-asset`, `three`, `@pixiv/three-vrm` (evaluate RN compatibility; may need native build).
2. Ship one small legal VRM under `assets/models/` (see amoji-app cast manifest policy).
3. Replace `AvatarPlaceholder` with `AvatarStage` that loads VRM and applies blend shapes from `weightsToMorphTargets`.
4. Port or depend on `@amoji/emotion-core` for text→emotion (replace keyword adapter in `emotionAdapter.ts`).
5. Optional: `@amoji/vrm-renderer` concepts from amoji-app — adapt, do not copy Next.js shell.

## AIVA patterns to keep

- Home keeps 3D mounted; chat is overlay.
- Progressive load gate before heavy avatar work (see aiva `preload` pattern).

## Out of scope for M2 stub

- Dumping full `amoji_engine_02` asset tree into this repo.
- Capacitor iframe companion shell.
