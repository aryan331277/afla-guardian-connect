# ONNX Model Placement

Place your ONNX model file here with the exact filename:

- File path in repo: `public/models/farmer.onnx`
- Served URL at runtime: `/models/farmer.onnx`

This matches the code in `src/components/RiskAnalysis.tsx`, which loads the model with:

```ts
await ort.InferenceSession.create('/models/farmer.onnx');
```

Notes:
- `.pkl` (pickle) models cannot run in the browser. Use ONNX for client-side inference, or set up a backend service to run the `.pkl`.
- After adding the file, perform a hard refresh (Shift+Reload) to bypass any caching.
- Recommendations are generated automatically based on the returned risk score and your current insights.
