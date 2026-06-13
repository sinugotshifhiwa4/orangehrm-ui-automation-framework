# Contributor Workflows

**[← Back to Main Documentation](../../../README.md)**

This section explains the practical contributor workflows used in the framework.

These pages are not high-level architecture reference pages.

They are step-by-step guides for common framework work such as:

- adding a new class
- registering it in fixtures
- using it in tests
- adding tags correctly
- adding cleanup coverage when data risk exists

## Table of Contents

- [Why This Section Exists](#why-this-section-exists)
- [Workflow Order](#workflow-order)
- [Main Principle](#main-principle)

## Why This Section Exists

The framework has a strong structure already, but contributors often need a practical sequence rather than only a structural explanation.

This section exists to answer questions like:

- where should this class live
- how do I expose it through fixtures
- how do I use it in tests
- what tags must I add
- when do I also need cleanup and CI changes

## Workflow Order

The pages in this section follow the normal contribution flow:

- 01-overview.md (this page)
- [02-add-a-class.md](./02-add-a-class.md)
- [03-register-in-fixtures.md](./03-register-in-fixtures.md)
- [04-use-in-tests.md](./04-use-in-tests.md)
- [05-test-tags-workflow.md](./05-test-tags-workflow.md)
- [06-add-cleanup-coverage.md](./06-add-cleanup-coverage.md)
- [07-end-to-end-example.md](./07-end-to-end-example.md)

## Main Principle

In this framework, adding a feature is usually not only about writing one class.

A complete change often touches:

- the class itself
- fixture registration
- the test spec
- tags
- cleanup coverage
- CI tag options

That full chain is what this section documents.
