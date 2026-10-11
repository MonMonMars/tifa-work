# VRM avatar swap ticket (M2 → production)

## Current (shipped)

- `AvatarStage` → `GlAvatarView` (expo-gl + Three.js **icosahedron**)
- Motion from `stageMotionFromWeights()` — joy/sad/anger/fear/surprise/thinking affect spin, bob, tilt, emissive, shake
- `MorphTargetPanel` — morph **bars** (VRM blend shape names as preview)
- Badge: `GL · {dominant emotion} · VRM TODO`
- **No `.vrm` file in repository** — see `assets/models/README.md`

## Target

- **VRM-first** (align `amoji-app` / `@pixiv/three-vrm`, not AIVA MakeHuman GLB long-term)
- Home stage stays mounted under chat overlay (aiva pattern)

## When Mon adds `assets/models/companion.vrm`

### 1. Dependencies

```bash
npx expo install expo-gl expo-asset three
npm install @pixiv/three-vrm
```

Evaluate Expo dev client vs Expo Go — VRM + three often needs a **development build** after prebuild.

### 2. Asset

- Place legal VRM under `assets/models/` (see `assets/models/README.md`)
- Register with `expo-asset` or `require()` per Expo asset docs

### 3. Code touch points

| File | Change |
|------|--------|
| `src/components/avatar/GlAvatarView.tsx` | Replace icosahedron with VRM load + idle animation |
| `src/expression/stageMotion.ts` | Keep motion for body; drive face via blend shapes |
| `src/expression/emotionAdapter.ts` | Swap keyword adapter → `@amoji/emotion-core` when ready |
| `MorphTargetPanel.tsx` | Optional: read actual blend shape values from VRM instance |

### 4. Expression pipeline

```
assistant reply → parseEmotionTagFromReply → ExpressionSnapshot.weights
  → weightsToMorphTargets() (VRM expression names)
  → VRMExpressionManager.setValue(name, weight)
  → stageMotionFromWeights() for subtle body motion until full rig
```

### 5. Verify

- [ ] Idle loop at 30fps+ on target iPhone
- [ ] Chat reply updates face within one frame of message finalize
- [ ] Memory / GL context survives chat overlay open/close
- [ ] Dispose VRM + renderer on persona switch

## Out of scope

- Copying `amoji_engine_02` asset trees into this repo
- Bundling unlicensed VRoid / paid marketplace models
