# @harshcode/devsnap

Capture and diff your dev environment from the terminal.

---

## Install

```bash
npm install -g @harshcode/devsnap
```

Requires Node 18+. Works on macOS, Linux, and Windows.

---

## Quickstart

```bash
# 1. Register and get an API key
curl -X POST https://devsnap-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'

# 2. Save your API key
devsnap auth --key YOUR_API_KEY

# 3. Capture before a change
devsnap capture --tag "before"

# 4. Make your change, then capture again
devsnap capture --tag "after"

# 5. Diff them
devsnap diff <id1> <id2>
```

---

## Commands

| Command | Description |
|---------|-------------|
| `devsnap capture` | Snapshot current environment |
| `devsnap capture --tag <tag>` | Snapshot with a label |
| `devsnap capture --note <note>` | Snapshot with a note |
| `devsnap list` | List recent snapshots |
| `devsnap list --limit <n>` | List up to n snapshots |
| `devsnap diff <id1> <id2>` | Diff two snapshots |
| `devsnap auth --key <key>` | Save your API key |

---

## What gets captured

| | |
|-|-|
| Runtimes | Node, npm, Python, pip, Go, Rust, Java, Ruby |
| Packages | npm global + pip global |
| Env keys | Key names only — values never stored |
| Git | Branch, dirty flag, last 5 commits |
| Ports | All TCP LISTEN ports |
| System | OS, arch, CPU, memory, shell |

---

## Links

- 🌐 **Dashboard:** [devsnap-frontend.vercel.app](https://devsnap-frontend.vercel.app)
- 📦 **npm:** [npmjs.com/package/@harshcode/devsnap](https://www.npmjs.com/package/@harshcode/devsnap)
- 💻 **GitHub:** [github.com/hars310/devsnap](https://github.com/hars310/devsnap)

---

MIT © [Harsh Kumar](https://github.com/hars310)