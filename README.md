# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## NOTE

AWS CodeBuildの情報を取得するためのcliツールと、その結果を表示するwebのviewで構成されています。

### 準備

CodeBuildの情報を取得するための設定を行います。

environment.jsonまたは、environment.local.jsonを設定してください。

```json
{
  "codebuildSettings": [
    {
      "awsProfileName": "default",
      "region": "ap-northeast-1",
      "codeBuildProjectName": "my-codebuild-project"
    }
  ]
}
```

### CodeBuildの結果情報の取得

```shell
cd cli
# 事前にaws cliにてssoでログインしている必要があります。
AWS_PROFILE=AWSSSOLoginのProfile名 aws sso login
deno run --unstable-kv --allow-sys --allow-env --allow-read --allow-net --allow-write main.ts
```

上記を実行することで、AWS CodeBuildの実行結果をcodeBuildResult/に保存します。
各ビルド結果は、Deno.KV上にキャッシュされるため、二回目移行の実行は、キャッシュがヒットしない差分だけ取得します。
