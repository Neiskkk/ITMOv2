import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const runCheck = (scriptPath, cwd) =>
  new Promise((resolve) => {
    execFile("bash", [scriptPath], { cwd, timeout: 120_000 }, (error, stdout, stderr) => {
      resolve({
        code: error && typeof error.code === "number" ? error.code : error ? 1 : 0,
        stdout,
        stderr,
      })
    })
  })

export default {
  id: "practice04.check-after-edit",

  async setup(ctx) {
    // This file lives at <repo>/.opencode/plugins/check-after-edit.js.
    // Resolve paths from the plugin file itself: ctx.location may point to
    // practices/practice_04 for a session opened from that directory.
    const pluginDirectory = path.dirname(fileURLToPath(import.meta.url))
    const repositoryRoot = path.resolve(pluginDirectory, "..", "..")
    const practiceDirectory = path.join(repositoryRoot, "practices", "practice_04")
    const scriptPath = path.join(practiceDirectory, "scripts", "check.sh")

    if (!existsSync(scriptPath)) {
      throw new Error(`Automatic check runner not found: ${scriptPath}`)
    }

    let running = false

    await ctx.tool.hook("execute.after", async (event) => {
      if (event.status !== "completed" || running) return
      if (!/(write|edit|patch|create)/i.test(event.tool)) return

      running = true
      try {
        const result = await runCheck(scriptPath, practiceDirectory)
        const output = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n")
        const status = result.code === 0 ? "PASS" : "FAIL"

        await ctx.session.synthetic({
          sessionID: event.sessionID,
          text: `AUTO-CHECK ${status}: scripts/check.sh exited ${result.code}${output ? `\n${output}` : ""}`,
        })
      } finally {
        running = false
      }
    })
  },
}
