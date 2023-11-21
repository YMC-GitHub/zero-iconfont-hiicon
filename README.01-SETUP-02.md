## mono repo npm  & vite & ts

- [x] check npm version (need npm 7+)
```bash
npm --version
```

- [x] update npm version
```bash
npm i -g npm@7
# 7.24.2

# todo:
# install npm when npm 7- in nodejs
# eg. tsx src/index.ts i npm@7
```

- [x] set workspace via the `workspaces` property of the package.json file
```json

  "workspaces": [
    "scaffold",
    "package",
    "coreui",
    "app"
]
```

- run ts script:
```bash
tsx src/cli.ts touch ./package/noop/src/index.ts
# add 
tsx src/cli.ts edit-keywords -w ./ --file package.json --include "scaffold,package,coreui,app" --ns workspaces --sep ","
# --exclude "package\\noop"

# del
tsx src/cli.ts edit-keywords -w ./ --file package.json --exclude "scaffold,package,coreui,app" --ns workspaces --sep ","
```

- run npm cli:
```bash
# add:
yours  edit-keywords -w ./ --file package.json --include "scaffold,package,coreui,app" --ns workspaces --sep ","
# del:
yours  edit-keywords -w ./ --file package.json --exclude "scaffold,package,coreui,app" --ns workspaces --sep ","
```


- enable this to npm cli:
```bash
# bind cli yours to  "./lib/index.js"
tsx src/cli.ts edit-script -w ./ --file package.json --exclude "scaffold,package,coreui,app" --name "yours" --value "./lib/index.js" --ns "bin" --ns-sep "."

# use 'yours' or 'yrs' replace 'tsx src/cli.ts' if using yours - @zero/iconfont-hiicon@1.0.0

# bind cli yrs to  "./lib/index.js"
tsx src/cli.ts edit-script -w ./ --file package.json --exclude "scaffold,package,coreui,app" --name "yrs" --value "./lib/index.js" --ns "bin" --ns-sep "."


# build and deploy cli in local pkg to  local global node_modules
# pnpm run build ; npm link -g 
# Please re-run this command with --local

pnpm run build
# tsx src/cli.ts set-bin-head -w ./ --file "lib/index.js"--head "#! /usr/bin/env node"
node lib/index.js set-bin-head -w ./ --file "lib/index.js"--head "#! /usr/bin/env node"
# yours set-bin-head -w ./ --file "lib/index.js"--head "#! /usr/bin/env node"
npm install --global ./
# pnpm install --global ./ # fail - The "path" argument must be of type string. Received undefined
# pnpm link --global ./ # PLEASE DO NOT USE: pnpm link -g ./
# del D:\CustomSoftware\windows\Scoop\shims\tsx*

yours noop



# npm link --local
# npm unlink @zero/iconfont-hiicon
# npm link;npm unlink --no-save package && npm install;


# echo "#! /usr/bin/env node"
# npm install --global ./
# npm ls -g 

# npm uninstall --global ./
# Invalid package name ".pnpm" when `npm unlink`

# pnpm link --global
# done: del this pkg linked to global
# npm unlink -g;npm ls -g

# done:
# pnpm uninstall --global @zero/iconfont-hiicon

# manage link with pnpm
# add:
# pnpm link --global ./
# del:
# pnpm uninstall @zero/iconfont-hiicon

# manage link with npm
# add:
# npm install --global ./ # PLEASE DO NOT USE: npm link -g ./
# del:

# npm unlink -g;npm ls -g



# npx link <package-path> vs   npm install --no-save <package-path-a> <package-path-b>  vs npm link
```
[Native package debugging](https://juejin.cn/post/6898119841149485063)
[4 reasons to avoid using npm link](https://juejin.cn/post/7092227756603228173)

- [x] add a pkg name noop
```bash
npm init -w ./package/noop
# read more:
# rm -rf  ./package/noop

# rm -rf ./package
```

- [ ] code pkg noop in vscode editor
```bash
tsx src/cli.ts touch ./package/noop/src/index.ts
tsx src/cli.ts edit-keywords ./package/noop --file package.json
```

- [x] build *.ts files to *.d.ts files
```bash
npm set-script "types" "tsc" -w ./package/noop 

npm run types --workspace=package/noop --if-present
```

- [x] build *.ts files to *.js files with watching for development or debug 
```bash
npm set-script "dev" "vite build --watch" -w ./package/noop 

npm run dev --workspace=package/noop --if-present
```

- [x] build *.ts files to *.js files
```bash
npm set-script "build" "vite build" -w ./package/noop 

npm run build --workspace=package/noop --if-present
```



- [x] mini *.js files (solution 1)
```bash
# to use teser cli in cmd:
pnpm add -g terser;
# mini js
ws=$(pwd);cd ./package/noop ;terser --compress --mangle -o lib/index.min.js -- lib/index.js;cd $ws;
```

- [x] mini *.js files (solution 2)
```bash
# pnpm add -WD terser;
npm set-script "mini:js" "terser --compress --mangle -o lib/index.min.js -- lib/index.js" -w ./package/noop 

npm run mini:js --workspace=package/noop --if-present
```

- [ ] fmt *.js files (solution 2)
```bash
# pnpm add -WD prettier;
npm set-script "fmt:js" "prettier --write --list-different \\\"{*,{src,examples,test}/**/*,.github/**/*}.{ts,tsx,json,yml,md}\\\"" -w ./package/noop 

npm run fmt:js --workspace=package/noop --if-present
```

- [x] sort package.json keys
```bash
tsx src/cli.ts sortjsonkey ./package/noop/package.json
```

- [x] edit package.json keywords property
```bash
# add
tsx src/cli.ts edit-keywords ./package/noop --file package.json --include "zero,noop,typescript,do nothing"
# read more:
# tsx src/cli.ts edit-keywords -w ./package/noop  --file package.json --exclude "zero,noop,typescript,do nothing"
```

- [x] edit package.json files property
```bash
tsx src/cli.ts edit-keywords -w ./package/noop --file package.json --ns files --include "package.json,lib"

# tsx src/cli.ts edit-keywords -w ./package/noop --file package.json --ns files --include "package.json,browser,node"
# https://github.com/maraisr/meros/blob/main/package.json
```

- [x] edit package.json name property
```bash
tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns name --org "zero" --name "noop"

# read more:
# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns name --name "noop"
```

- [x] edit package.json author property
```bash
# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns author --name "ymc-github"
tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns author --name "yemiancheng <ymc.github@gmail.com> (https://github.com/ymc-github)"
```

- [x] edit package.json license property
```bash
tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns license --name "MIT"
```

- [x] edit package.json main property
```bash
tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns main --name "./lib/index.ts"

# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns main --name "./lib/index.umd.js"

# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns main --name "node/index.js"
```

- [x] edit package.json module property
```bash
# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns module --name "./lib/index.es.js"
# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns module --name "node/index.mjs"
```


- [x] edit package.json browser property
```bash
# tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns browser --name "browser/index.mjs"
```

- [x] edit package.json types property
```bash
tsx src/cli.ts edit-name -w ./package/noop --file package.json --ns types --name "./lib/index.d.ts"
```



- [x] edit package.json private property
```bash
tsx src/cli.ts edit-bool -w ./package/noop --file package.json --name private --value false
```

- [x] edit package.json github repo info
```bash
tsx src/cli.ts edit-repo -w ./package/noop --file package.json --user ymc-github --repo zero-iconfont-hiicon
# tsx src/cli.ts edit-repo -w ./package/noop --file package.json --user ymc-github --repo zero-iconfont-hiicon --mono true --name noop --packageLoc package --branch main
```


- [ ] edit package.json workspaces property
```bash
# tsx src/cli.ts edit-keywords -w ./ --file package.json --ns workspaces --include "package,lib"
```

- [ ] download resource file from remote
```bash
tsx ./src/cli.ts download --url https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/circle.svg --file svg/circle.svg
```

- [ ] add a pkg name hijs
- [ ] add a pkg name hits


- [x] add deps to some pkg
```bash
npm i xx -w noop
```

- [x] run npm script in workspace
```bash
npm run test --workspace=noop --if-present
```

- [x] set npm script in root
```json
  "scripts": {
    "build": "npm run build -ws",
    "clean": "npx -y rimraf node_modules **/node_modules/ package-lock.json && npm i",
    "lint": "npm run lint -ws"
  },
```


- [x] set Typescript Project References of the package.json file
- in `<root>/tsconfig.json`
```json
"references": [{ "path": "app" }, { "path": "coreui" }]
```

- in `<root>/app/tsconfig.json`
```json
{
  "compilerOptions": {
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [
    {
      "path": "../coreui"
    }
  ]
}
```
[refer: adiun/vite-monorepo source code](https://github.com/adiun/vite-monorepo/)

- in `<root>/scaffold/tsconfig.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationDir": "lib",
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "module": "CommonJS",
    "moduleResolution": "node",
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "target": "ES2019"
  }
}
```

- in `<root>/scaffold/tsconfig.ui.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "esnext",
    "target": "ESNext"
  }
}
```

- in `<root>/coreui/tsconfig.json`
```json
{
  "extends": "@adiun/vm-scaffold/tsconfig.ui.json",
  "compilerOptions": {
    "declarationDir": "lib",
    "emitDeclarationOnly": true,
    "rootDir": "src"
  },
  "include": ["src"]
}
```


[refer: adiun/vite-monorepo source code](https://github.com/adiun/vite-monorepo/)


## mono repo yarn  & vite & ts

## mono repo pnpm & vite & ts



## migrate exec out of project to a small project
```bash
ws=$(pwd);
# ds=/d/code/nodejs/exec;
ds=outpkgs

mkdir -p $ds;
cd $ds;npm init -y;cd $ws;

tsx src/cli.ts edit-keywords "$ds" --file package.json --include "zero,exec,typescript,run commandline"
tsx src/cli.ts edit-keywords -w "$ds" --file package.json --ns files --include "package.json,lib"
tsx src/cli.ts edit-name -w "$ds" --file package.json --ns name --org "zerots" --name "exec"
tsx src/cli.ts edit-name -w "$ds" --file package.json --ns author --name "yemiancheng <ymc.github@gmail.com> (https://github.com/ymc-github)"
tsx src/cli.ts edit-name -w "$ds" --file package.json --ns license --name "MIT"
tsx src/cli.ts edit-name -w "$ds" --file package.json --ns main --name "./lib/index.js"
tsx src/cli.ts edit-name -w "$ds" --file package.json --ns types --name "./lib/index.d.js"
tsx src/cli.ts edit-bool -w "$ds" --file package.json --name private --value false
tsx src/cli.ts edit-repo -w "$ds" --file package.json --user ymc-github --repo exec
tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name "types" --value "tsc"
# tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name "test" --value ""
tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name "test"
tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name "dev" --value "vite build --watch"
tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name "build" --value "vite build"
tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name "mini:js" --value  "terser --compress --mangle -o lib/index.min.js -- lib/index.js"
# tsx src/cli.ts edit-script -w "$ds" --file package.json --ns scripts --name  "fmt:js" --value "prettier --write --list-different \"{*,{src,examples,test}/**/*,.github/**/*}.{ts,tsx,json,yml,md}\"" 
tsx src/cli.ts sortjsonkey -w "$ds" --file package.json

# tsx src/cli.ts cp "input" "desdir"
tsx src/cli.ts cp "tsconfig.json"  "$ds" 
tsx src/cli.ts cp "vite.config.ts"  "$ds" 

# tsx src/cli.ts rm "src
tsx src/cli.ts rm "$ds/tsconfig"

# tsx src/cli.ts mv "src" "des"
# tsx src/cli.ts mkdir "loc"
# cd $ds;npm run build;cd $ws;
# cd $ds;npm run "mini:js";cd $ws;
tsx src/cli.ts file-size -w "$ds"

tsx src/cli.ts git-cmt-msg-history-to-json --file commitlog.tmp.json --count-all true
tsx src/cli.ts git-cmt-msg-history-to-json --file commitlog.tmp.json --count 30

tsx src/cli.ts get-cmted-pkg --file cmtedpkgs.tmp.json --packages-loc  "package/"
# tsx src/cli.ts get-cmted-pkg --file cmtedpkgs.tmp.json --packages-loc  "packages/"
# tsx src/cli.ts get-cmted-pkg --file cmtedfiles.tmp.json --packages-loc  ".*"
 
tsx src/cli.ts changelog  --repo "https://github.com/ymc-github/zero-iconfont-hiicon"  --mono-repo false --ignore-types 'docs,style' --latest-count 10
# --mono-repo false 
# --latest-count 10
# --ignore-types 'docs,style'
# --log-info true --log-task true

rm -r $ds;
```

## add some func in files
```bash
tsx src/cli.ts touch src/cli-util.ts
tsx src/cli.ts touch src/changelog-util.ts
```

```bash
pnpm add -D vite-plugin-plain-text
```