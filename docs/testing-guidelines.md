# Testing Guidelines

This document outlines the testing standards and conventions for this project.

## Unit Tests

- Unit tests should be written with **Jest**
- All unit test files should follow the naming format: `*.test.js` or `*.test.ts`
- Backend unit tests should be placed in the `packages/backend/__tests__/` directory
- Frontend unit tests should be placed in the `packages/frontend/src/__tests__/` directory
- Unit tests should be named after the file they are testing (e.g., `app.test.ts` for `app.ts`)

## Integration Tests

- Use **Jest + Supertest** to test backend API endpoints with real HTTP requests
- Integration tests should live under the `packages/backend/__tests__/integration` directory
- All integration test files should follow the naming format: `*.test.js` or `*.test.ts`
- Integration tests should be named after the file they are testing (e.g., `app.test.ts` for `app.ts`)

## End-to-End (E2E) Tests

- E2E tests should be placed in the `tests/e2e` directory
- E2E tests should follow the naming convention: `*.spec.ts` or `*.spec.js`
- E2E tests should be named after the user actions they are testing (e.g., `user-sign-in.spec.ts`)
- Limit E2E tests to at most **8 critical user journeys** — focus on happy paths and edge cases
- Playwright tests must only use **one browser**
- Playwright tests must use the **Page Object Model (POM)** pattern for maintainability

## Port Configuration

- Always use **environment variables** with standard default ports for configuration

## General Rules

- All tests must be **isolated and independent** — each test should set up its own data and not rely on other tests
- All tests must use **setup and teardown hooks**
- Test coverage should be a **minimum of 85%**
- All tests should be maintainable and follow all project best practices
