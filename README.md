# Experiments setting up a modern ts monorepo

## Stage 1

Create a basic lerna monorepo with multiple module dependencies

## Stage 2

Add incremental builds using tsconfig references and tsc --build

## Stage 3

Add jest unit test to lib1

## Stage 4

Use wildcard versions for local packages.

Remove test scripts from modules with no tests.

Update tsconfig files to provide build config separate to development.

## Stage 5

Move dev dependencies to root module.

Add generated dirs to .gitignore