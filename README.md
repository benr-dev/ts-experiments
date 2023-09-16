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

# Stage 9 - Convert to npm workspaces

Lerna maintainers have indicated they are no longer going to provide support
for workspace management features since they are bundled with npm, pnpm and yarn.
https://lerna.js.org/docs/getting-started#adding-lerna-to-an-existing-repo

Remove existing node_modules and package-lock.json files:
```
npx lerna clean
find . -name "package-lock.json" -exec rm {} \;
```

Add the workspace declaration to root package.json:
```
  "workspaces":[
    "packages/*"
  ]
```

Remove the bootstrap script from root package.json

Add the workspace declaration to lerna:
```
  "useWorkspaces": "true"
```

Initialise repo:
```
npm install
```

# Stage 10 - replace lerna with nx in package scripts

Lerna is no longer recommended for package actions other than version and publish,
so replace all scripts using lerna with the equivalent nx command

Before:
```
    "build": "lerna run build",
    "build:test": "lerna run build:test",
    "clean": "lerna run clean",
    "test": "lerna run test",
```

After:
```
    "build": "nx run-many --target build",
    "build:test": "nx run-many --target build:test",
    "clean": "nx run-many --target clean",
    "test": "nx run-many --target test",
```

# Stage 11 - introduce package versioning on push

As source code is changed in the packages, their version number should
increment to reflect.

Using semver, this means that:
- on non-code change (eg docs), no version changes
- on zero impact code change (eg refactor), patch version increments
- on new features or bugfix which is non-breaking, minor version increments
- on any breaking change, major version increments

Add a commit message to lerna.json to comply with conventional commits:
```
  "command": {
    "version": {
      "message": "chore: bump versions"
    }
  }
```

Change the versioning type to independent in lerna.json:
```
  "version": "independent",
```

Add a prepush hook for husky:
```
npx husky add .husky/pre-push "npm run prepush"
```

Add a script to run lerna version on prepush. *Note* this script must not be
called 'version' as that is the reserved name of a lerna version lifecycle
script.
```
    "prepush": "npm run version-all",
    "version-all": "npx lerna version --conventional-commits --no-push"
```

Lerna complained about 'main' not existing on 'remote', so a force push
was necessary to create .git/remotes/origin/main.
```
git push --no-verify origin main
```

Now, when a feature change is pushed, the version is bumped:
```
› git push                                                               

> ts-experiments@1.0.0 prepush
> npm run version-all -- --yes


> ts-experiments@1.0.0 version-all
> npx lerna version --conventional-commits --no-push --yes

lerna notice cli v5.6.2
lerna info versioning independent
lerna info Looking for changed packages since @benr-ts-experiments/app@1.3.0
lerna info getChangelogConfig Successfully resolved preset "conventional-changelog-angular"

Changes:
 - @benr-ts-experiments/app: 1.3.0 => 1.4.0

lerna info auto-confirmed 
lerna info execute Skipping git push
lerna info execute Skipping releases
lerna success version finished
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (9/9), 866 bytes | 866.00 KiB/s, done.
Total 9 (delta 5), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (5/5), completed with 4 local objects.
To github.com:benr-dev/ts-experiments.git
   21fb85c..b33ff5b  main -> main
```

Unfortunately, in the absense of git providing a hook on post push,
the tags that lerna creates to indicate the bump don't get pushed
so it is necessary to also push tags
```
› git push --tags

> ts-experiments@1.0.0 prepush
> npm run version-all -- --yes


> ts-experiments@1.0.0 version-all
> npx lerna version --conventional-commits --no-push --yes

lerna notice cli v5.6.2
lerna info versioning independent
lerna notice Current HEAD is already released, skipping change detection.
lerna success No changed packages to version 
Enumerating objects: 14, done.
Counting objects: 100% (14/14), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (8/8), 1002 bytes | 1002.00 KiB/s, done.
Total 8 (delta 4), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To github.com:benr-dev/ts-experiments.git
 * [new tag]         @benr-ts-experiments/app@1.4.0 -> @benr-ts-experiments/app@1.4.0

```