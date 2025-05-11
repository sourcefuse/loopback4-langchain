# Changesets

This directory contains [changesets](https://github.com/changesets/changesets) which are used to manage versioning and changelogs for this monorepo.

## What are changesets?

Changesets are a way to manage versioning and changelogs for monorepos. They allow you to:

- Record changes to packages in a structured way
- Automatically generate changelogs
- Bump versions of packages based on semantic versioning
- Handle dependencies between packages

## How to use changesets

### Adding a changeset

When you make a change to a package, you should add a changeset to describe the change:

```bash
npm run changeset
```

This will prompt you to:
1. Select the packages that have changed
2. Choose the type of version bump (patch, minor, major)
3. Write a description of the change

A new markdown file will be created in the `.changeset` directory.

### Versioning and publishing

When a PR with changesets is merged to main, the CI will:
1. Create a PR to version the packages (or publish directly if configured)
2. When that PR is merged, the packages will be published to npm

## Current Status

The initial changeset is for a minor version bump (0.0.0 -> 0.1.0) for the `loopback4-langchain` package.