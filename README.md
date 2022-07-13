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

## Stage 6

Add concurrently as a root dev dependency and verify it can be used in a child package.
```
npm run lerna-echo-concurrently
```

To run it without including all possible modules containing that script:
```
```
npm run lerna-echo-concurrently -- --scope @benr-ts-experiments/lib2
```

Unfortunately, the script defined in the child can't be used in the child package itself:
```
npm run --prefix=packages/lib2 echo-concurrently

> @ts-experiments/lib2@1.0.0 echo-concurrently /ts-experiments/packages/lib2
> concurrently 'echo 1' 'echo 2'

sh: 1: concurrently: not found
```
