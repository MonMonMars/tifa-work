# VRM models (Mon-provided)

Weepo does **not** ship large avatar binaries in git. Drop a **redistributable** VRM here when ready.

## Expected layout

```
assets/models/
  companion.vrm          # primary avatar (example name)
  companion.vrm.meta.json  # optional: license, source URL, author
```

## Load checklist (after file is present)

1. Confirm license allows in-app use + App Store distribution.
2. Install/load path (see `docs/VRM_AVATAR.md`):
   - `expo-asset` + `@pixiv/three-vrm` in a dev client or prebuild
3. Replace procedural mesh in `GlAvatarView` / new `VrmAvatarView.tsx`.
4. Map `MorphTargetPanel` weights → VRM expression manager blend shapes.
5. Keep `assets/models/` out of git if the file is large — use `.gitignore` entry + download script (amoji-app manifest pattern).

## Placeholder until then

Home uses **expo-gl icosahedron** + morph bars driven by `ExpressionSnapshot`.
