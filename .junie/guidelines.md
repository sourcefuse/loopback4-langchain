# Project Guidelines

Welcome to the **LangChain × LoopBack 4 Monorepo**.  
These guidelines explain how Junie (or any contributor) should structure the repo, build, test, and style code. Keep this file in the root of the repository so new collaborators can ramp up quickly.

---

## 1  Repository Layout

```text
langchain-loopback-monorepo/
├── package.json             # root – npm‑workspaces config & helper scripts
├── package-lock.json        # single lockfile for all workspaces
├── tsconfig.base.json       # shared TypeScript config
├── .eslintrc.cjs            # shared ESLint rules
├── .prettierrc              # Prettier config
├── .npmrc                   # (optional) registry / publish settings
├── packages/
│   └── loopback4-langchain/       # reusable component package
│       ├── src/             # Component, Booter, Keys, CLI, etc.
│       ├── dist/            # emitted JS (git‑ignored)
│       ├── tsconfig.json
│       ├── README.md
│       └── package.json     # name: @yourorg/loopback4-langchain
└── examples/
    └── support-bot/         # demo LoopBack‑4 application
        ├── src/
        ├── dist/
        ├── tsconfig.json
        └── package.json
```

_All new reusable code lives under **`packages/`**.  
All runnable demos or tutorials live under **`examples/`**._

---

## 2  Installing Dependencies

```bash
# Always install from the repo root
npm install
```

> NPM workspaces will hoist shared dependencies to the root and link local packages automatically.

---

## 3  Build Commands

| Scope                   | Command                                         | What it does                            |
| ----------------------- | ----------------------------------------------- | --------------------------------------- |
| **All workspaces**      | `npm run build --workspaces`                    | Compiles every TS project with `tsc -b` |
| **Single workspace**    | `npm run build -w=@yourorg/loopback4-langchain` | Builds just that package                |
| **Example app (watch)** | `npm run dev -w=support-bot`                    | Nodemon + TS‑node for hot reload        |

The root `package.json` provides shortcuts:

```jsonc
"scripts": {
  "build": "npm run build --workspaces",
  "dev": "npm run dev --workspace=support-bot"
}
```

---

## 4  Running Tests

We use **Vitest** for unit & integration tests.

```bash
# Entire repo
npm test               # same as: npm run test --workspaces

# A single workspace
npm test -w=@yourorg/loopback4-langchain
```

### Special test helpers

- **LoopBack Boot Tests** – import `BootTestApp` from `@loopback/boot` to verify auto‑binding.
- **Fake LLMs** – use `langchain/testing`’s `FakeLLM` when you need deterministic chain tests.

---

## 5  Linting & Formatting

| Tool     | Invocation                  | Autocorrect                          |
| -------- | --------------------------- | ------------------------------------ |
| ESLint   | `npm run lint --workspaces` | `npm run lint --workspaces -- --fix` |
| Prettier | `npx prettier . --check`    | `npx prettier . --write`             |

_Rules_: Airbnb base, TypeScript strict, no semicolons (unless required).  
_A pre‑commit hook (Husky + lint‑staged) will run **Prettier** and **ESLint (--fix)** automatically._

---

## 6  Versioning & Releases

- **Independent versions** per package (managed by **Changesets**).
- To release `@yourorg/loopback4-langchain`:

```bash
npm version patch -w=@yourorg/loopback4-langchain
npm publish --workspace=@yourorg/loopback4-langchain
```

_A GitHub Action publishes to npm when a PR containing a changeset is merged into `main`._

---

## 7  Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`) performs:

1. `actions/setup-node` (Node 20) with `cache: npm`
2. `npm ci`
3. `npm run build`
4. `npm test`
5. `npm run lint`

Merge only if the workflow passes ✔︎.

---

## 8  Code Style Essentials

- **TypeScript**:
  - `strict: true`, `noImplicitAny`, `exactOptionalPropertyTypes`
  - Use **interfaces** for contracts; **types** for unions/utility.
- **Imports**: absolute via `@/<package>` path mapping; no `../../../`.
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `chore:`).
- **Documentation**: Every exported symbol requires a JSDoc comment.
- **Avoid default exports** except when exporting a LoopBack component/CLI command.

---

## 9  Adding New Packages or Examples

1. **Package**:

   ```bash
   mkdir -p packages/<name> && cd packages/<name>
   npm init -y
   ```

   Add `"main":"dist/index.js"` and ensure `"private": false`.

2. **Example**:

   ```bash
   mkdir -p examples/<name> && cd examples/<name>
   npm init -y
   ```

   Depend on local packages with:

   ```jsonc
   "@yourorg/loopback4-langchain": "*"
   ```

3. Run `npm install` at root – npm wires everything.
4. Add build & test scripts consistent with the template.

---

## 10  Local Development Tips

```bash
# Terminal 1 – watch the component
npm run build:watch -w=@yourorg/loopback4-langchain

# Terminal 2 – start the app in watch mode
npm run dev -w=support-bot
```

If you add a new file under `prompts/`, `tools/`, etc., simply restart the demo app to let the Booter pick it up.

---

## 11  Open Questions

- **Publishing strategy** – are releases automated or manual?
- **License** – MIT is recommended; update if needed.
- **Node version support** – Node LTS 20 is default; back‑port only if required.

---

## 12 Checklist before opening a PR

- [ ] `npm run build` (root) passes without errors
- [ ] `npm test` (root) is green
- [ ] `npm run lint` shows 0 warnings
- [ ] Updated or created relevant docs / README sections
- [ ] Added a Changeset if any public package API changed
- [ ] CI workflow passes on the PR branch

---

Happy coding, Junie! 🎉
