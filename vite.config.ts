import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

// Read amplify_outputs.json at build time.
// The file is gitignored and written by `npx ampx sandbox` (dev) or
// `npx ampx generate outputs` (CI). If it doesn't exist, we inject an
// empty object so the app boots without crashing — it will warn in the
// console that the cloud is inactive.
function loadAmplifyOutputs(): string {
  const outputsPath = resolve(__dirname, 'amplify_outputs.json');
  if (existsSync(outputsPath)) {
    try {
      const content = readFileSync(outputsPath, 'utf-8');
      // Validate it's real JSON
      JSON.parse(content);
      return content;
    } catch {
      return '{}';
    }
  }
  return '{}';
}

export default defineConfig({
  plugins: [react()],
  define: {
    // Injected as a JSON string; main.tsx parses it at runtime.
    __AMPLIFY_OUTPUTS__: JSON.stringify(loadAmplifyOutputs()),
  },
});
