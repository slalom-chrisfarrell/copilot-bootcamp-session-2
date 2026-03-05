# Coding Guidelines

This document defines the coding standards and style rules for this project. All contributors and AI code generation tools must follow these guidelines.

---

## Formatting

### Indentation
- Use **4 spaces** per indentation level. Do not use tab characters (`\t`).

### Line Length
- Lines must not exceed **180 characters**.
- Break long expressions across multiple lines at logical boundaries (e.g., after a comma, before an operator, or at a method chain).

---

## Typing

- **Everything must be typed** where the language supports it.
- In TypeScript files (`.ts`, `.tsx`), all variables, function parameters, and return values must have explicit type annotations.
- In JavaScript files (`.js`, `.jsx`), use **JSDoc type annotations** to provide type information for all functions, parameters, and return values.
- Avoid `any` in TypeScript. Prefer `unknown` and narrow the type explicitly.
- Prefer `interface` over `type` for object shapes unless union or intersection types are required.

```ts
// Good
function getUser(id: number): Promise<User> { ... }

// Bad
function getUser(id) { ... }
```

---

## Imports

### Minimum Imports
- Only import the specific names you need from a module. Do not import an entire namespace when only a subset is used.

```ts
// Good
import { useState, useEffect } from "react";

// Bad
import React from "react";
// then using React.useState, React.useEffect
```

### Import Order
Imports must be organized into the following four groups, in order, with **a blank line between each group**:

1. **React / Node built-ins** — React itself, Node.js core modules (e.g., `path`, `fs`, `http`)
2. **External libraries / packages** — third-party npm packages (e.g., `express`, `axios`, `lodash`)
3. **Internal libraries / packages** — modules from within this monorepo (e.g., `packages/`, shared utilities)
4. **Types** — type-only imports (`import type { ... }`)

```ts
// 1. React / Node built-ins
import { useEffect, useState } from "react";
import path from "path";

// 2. External libraries / packages
import axios from "axios";
import express from "express";

// 3. Internal libraries / packages
import { TodoService } from "../services/TodoService";
import { apiClient } from "../utils/apiClient";

// 4. Types
import type { Todo } from "../types/Todo";
import type { User } from "../types/User";
```

### Alphabetical Ordering
- Within each import group, imports must be **sorted alphabetically** by module path.
- Within a single import statement, named imports must also be **sorted alphabetically**.

```ts
// Good — alphabetical by path, alphabetical named imports
import { useCallback, useEffect, useMemo, useState } from "react";
import path from "path";

// Bad — unordered
import { useState, useCallback } from "react";
```

---

## Linting — JSLint

This project uses **[JSLint](https://www.jslint.com/)** as the linter. As many JSLint rules as possible are enforced. JSLint is configured via inline directives at the top of each file.

### Standard File Header Directive

Include the following directive at the top of every JavaScript/TypeScript file:

```js
/*jslint node, browser, indent: 4, maxlen: 180 */
```

Adjust environment flags as appropriate:

| Flag | When to use |
|---|---|
| `node` | Backend / Node.js files |
| `browser` | Frontend / browser files |
| `indent: 4` | Always — enforces 4-space indentation |
| `maxlen: 180` | Always — enforces 180-character line limit |

### Additional JSLint Rules Applied

The following JSLint conventions are enforced across the codebase:

| Rule | Description |
|---|---|
| **No `var`** | Use `let` or `const` instead. JSLint prefers block-scoped declarations. |
| **Strict equality** | Always use `===` and `!==`. Never use `==` or `!=`. |
| **No `++` / `--`** | Use `+= 1` / `-= 1` instead to avoid ambiguity. |
| **Semicolons required** | Every statement must end with a semicolon. |
| **No bitwise operators** | Avoid `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>` unless explicitly necessary. |
| **No implicit globals** | All variables must be explicitly declared. |
| **Single quotes** | Use single quotes `'` for string literals in JS. Use double quotes `"` when JSX attributes require it. |
| **No trailing whitespace** | Files must not contain trailing whitespace on any line. |
| **Newline at end of file** | Every file must end with a single newline character. |
| **No unused variables** | Remove any variable, parameter, or import that is declared but never used. |
| **Function declarations before use** | Functions should be declared before they are called (hoisting is permitted by JS but discouraged). |
| **No `eval`** | Use of `eval()` is forbidden. |
| **No `with`** | Use of `with` statements is forbidden. |

### Running JSLint

Install JSLint as a dev dependency and run it via npm:

```bash
npm install --save-dev jslint
npx jslint packages/backend/src/**/*.js packages/frontend/src/**/*.js
```

Or add a `lint` script to `package.json`:

```json
"lint": "jslint packages/backend/src/**/*.js packages/frontend/src/**/*.js"
```
