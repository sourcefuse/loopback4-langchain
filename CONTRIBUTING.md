# Contributing to loopback4-langchain

Thank you for your interest in contributing to loopback4-langchain! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v7 or later)
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/loopback4-langchain.git
   cd loopback4-langchain
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/sourcefuse/loopback4-langchain.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes and ensure they follow the project's coding standards

3. Run tests to ensure your changes don't break existing functionality:
   ```bash
   npm test
   ```

4. Commit your changes following the [commit message guidelines](#commit-message-guidelines)

5. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a pull request from your fork to the main repository

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Include the relevant issue number if applicable
3. Update documentation as needed
4. Make sure all tests pass
5. Address any review feedback
6. Once approved, your PR will be merged by a maintainer

## Coding Standards

This project uses ESLint and Prettier to enforce coding standards:

- Run linting checks:
  ```bash
  npm run lint
  ```

- Fix linting issues automatically:
  ```bash
  npm run lint:fix
  ```

### TypeScript Guidelines

- Use TypeScript's static typing features
- Document public APIs with JSDoc comments
- Follow the [LoopBack 4 style guide](https://loopback.io/doc/en/lb4/code-style-guide.html)

## Testing Guidelines

- Write tests for all new features and bug fixes
- Maintain or improve test coverage
- Tests should be clear and easy to understand

To run tests:
```bash
npm test
```

## Commit Message Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages that are easy to follow when looking through the project history.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Scope

The scope should be the name of the package/module affected.

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

### Examples

```
feat(tools): add weather tool for location-based queries

Add a new tool that allows the LLM to query weather information for specific locations.

Closes #123
```

```
fix(service): handle undefined API key gracefully

Previously the service would throw an error when no API key was provided. Now it checks for this case and provides a helpful error message.

Closes #456
```

Thank you for contributing to loopback4-langchain!