/*jslint node, indent: 4, maxlen: 180 */
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: "html",
    use: {
        baseURL: process.env.BASE_URL || "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
    },
});
