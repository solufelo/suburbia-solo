// Cross-platform "KEY=value command": node scripts/with-env.mjs A=1 B=2 -- next dev
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const split = args.indexOf("--");
const pairs = split === -1 ? [] : args.slice(0, split);
const command = split === -1 ? args : args.slice(split + 1);

const env = { ...process.env };
for (const pair of pairs) {
  const i = pair.indexOf("=");
  if (i > 0) env[pair.slice(0, i)] = pair.slice(i + 1);
}

const child = spawn(command.join(" "), { stdio: "inherit", env, shell: true });
child.on("exit", (code) => process.exit(code ?? 1));
