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
npm run lerna-echo-concurrently -- --scope @benr-ts-experiments/lib2
```

Unfortunately, the script defined in the child can't be used in the child package itself:
```
npm run --prefix=packages/lib2 echo-concurrently

> @ts-experiments/lib2@1.0.0 echo-concurrently /ts-experiments/packages/lib2
> concurrently 'echo 1' 'echo 2'

sh: 1: concurrently: not found
```

# Stage 7

Add Nx to manage build dependencies
```
npm install -D nx
npx nx init
```

This sets up the nx build and enables the local build cache.

Now set up some script dependencies to increase build efficiency.  This avoids the need for scripts to explicitly declare the same dependencies at the package level, which is obviously unneeded duplication.

In nx.json:
```
...
"tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build","test"]
      }
    }
  }
},
```
This says that any time a build or test script is executed, cache the result so that, if nothing else changes then the cache version can be used instead or re-running the script.

```
...
"targetDefaults": {
  "build": {
    "dependsOn": [
      "^build", "clean"
    ]
  }
}
```
This says that any time a build is executed, run the build script of all the dependencies first and the clean script of the local package, before finally running the local package build script.

# Stage 7b Update to node 16

I updated the environment I was using from node 14 to node 16, and took the opportunity to upgrade
some core packages along the way.

Delete existing node_modules:
```
npx lerna clean
```

Upgrade lerna:
```
npm install -D lerna@5.6.2
```

Fix vulnerable packages:
```
npm audit fix
```

Rebuild binaries:
```
npm run bootstrap
npm run test
```

Also added an "engines" clause to root package.json to reflect.

# Stage 8 - Add Husky

```
npm install -D husky
npx husky install
npm pkg set scripts.prepare="husky install"
```

Add a git precommit hook to run tests
```
npx husky add .husky/pre-commit "npm test"
```

In this repo, the new pre-commit hook was detected by git but if your
.gitignore blocks it, do
```
git add .husky/pre-commit
```