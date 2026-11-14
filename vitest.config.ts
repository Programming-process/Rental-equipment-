import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./tests/test-setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      thresholds: {
        statements: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
