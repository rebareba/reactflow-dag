const path = require('path')

/* 解析路径 上一级目录 */
const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  // 为我们提供运行环境，一个环境定义了一组预定义的全局变量
  env: {
    browser: true,
    es6: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  // 配置解析器支持的语法
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  // 一个配置文件可以被基础配置中的已启用的规则继承。
  extends: [
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  // 自定义全局变量
  globals: {
    window: true,
    '@': true,
  },
  ignorePatterns: [
    // ".eslintrc.js",
    '*.js', // 忽略 js 文件
    '*.d.ts', // 忽略 js 文件
  ],
  settings: {
    'import/extensions': ['.jsx', '.ts', '.tsx'],
    // 'import/parsers': {
    //   '@typescript-eslint/parser': ['.ts', '.tsx'],
    // },
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['web', '.', 'uikit', 'packages'], 
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      alias: {
        map: [
          ['@src', resolve('src')],
          ['@pages', resolve('src/pages')],
          ['@models', resolve('src/models')],
          ['@components', resolve('src/components')],
          ['@utils', resolve('src/utils')],
          ['@i18n', resolve('src/i18n')],
          ['@common', resolve('src/common')],
          ['@assets', resolve('src/assets')],
          ['@hooks', resolve('src/hooks')],
        ],
        extensions: ['.ts', '.tsx', '.jsx', '.json', 'svg'],
      },
    },
  },
  // 0: off , 1: warn, 2: error , 复杂的 [level, options]
  // eslint (http://eslint.cn/docs/rules)
  rules: {
    'no-console': 'off', // 关闭控制台输出
    '@typescript-eslint/no-unused-vars': 'off', // 关闭未使用的变量警告
    'react/react-in-jsx-scope': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {includeInternal: true, packageDir: ['.', 'web', 'packages', 'uikit']}],
    'import/prefer-default-export': 'off', // 关闭默认使用 export default 方式导出
    'consistent-return': 0, // 要求 return 语句要有返回值
    'no-promise-executor-return': 'off', // 禁止在 Promise executor 函数中返回值
    // "react/no-unused-prop-types": "warn", // 禁止未使用的 prop-types
    'react/require-default-props': 'off', // 关闭默认 props 验证
    'react/no-unused-prop-types': 'warn',
    'react/function-component-definition': [2, {namedComponents: 'arrow-function'}], // 要求函数组件定义使用箭头函数
    '@typescript-eslint/default-param-last': 'off', // 关闭默认参数必须在最后
    'no-param-reassign': 'off', // 关闭参数修改
    'no-plusplus': ['error', {allowForLoopAfterthoughts: true}],
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off', // 关闭 强制任何 JSX 属性均不扩展。通过更明确地说明组件接收了哪些 props，可以提高代码的可读性
    'no-nested-ternary': 'off', // 关闭 禁止使用嵌套的三元表达式
    'react/self-closing-comp': 'off', // 关闭 防止组件没有内容时添加额外的关闭标签
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/alt-text': 'off', // 关闭 图片的 alt 属性不能为空
    'react/no-unstable-nested-components': 'off', // 关闭 防止不稳定的组件嵌套
    'no-bitwise': 'off', // 关闭 禁止使用按位运算符
    // 'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    // 'class-methods-use-this': 'off',

    // 'no-unused-expressions': 'off',
    'no-restricted-syntax': 'off', // 关闭 禁止使用特定的语法
    'jsx-a11y/anchor-is-valid': 'off', // 关闭 禁止使用无效的锚点
    //
    // '@typescript-eslint/ban-types': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    // 'import/no-unresolved': 'off',

    // '@typescript-eslint/no-use-before-define': 0,
    // 'no-use-before-define': 0,
    // '@typescript-eslint/no-var-requires': 0,
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript 模块和命名空间。
    // 'no-shadow': 'off',
    // // "@typescript-eslint/no-var-requires": "off"
    // 'import/extensions': [
    //   'error',
    //   'ignorePackages',
    //   {
    //     '': 'never',
    //     js: 'never',
    //     jsx: 'never',
    //     ts: 'never',
    //     tsx: 'never'
    //   }
    // ],
    // "no-var": "error", // 要求使用 let 或 const 而不是 var
    // "no-multiple-empty-lines": ["error", { max: 1 }], // 不允许多个空行
    // "no-use-before-define": "off", // 禁止在 函数/类/变量 定义之前使用它们
    // "prefer-const": "off", // 此规则旨在标记使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    // "no-irregular-whitespace": "off", // 禁止不规则的空白

    // // typeScript (https://typescript-eslint.io/rules)

    // "@typescript-eslint/no-inferrable-types": "off", // 可以轻松推断的显式类型可能会增加不必要的冗长
    // "@typescript-eslint/no-namespace": "off", // 禁止使用自定义 TypeScript 模块和命名空间。
    // "@typescript-eslint/no-explicit-any": "off", // 禁止使用 any 类型
    // "@typescript-eslint/ban-ts-ignore": "off", // 禁止使用 @ts-ignore
    // "@typescript-eslint/ban-types": "off", // 禁止使用特定类型
    // "@typescript-eslint/explicit-function-return-type": "off", // 不允许对初始化为数字、字符串或布尔值的变量或参数进行显式类型声明
    // "@typescript-eslint/no-var-requires": "off", // 不允许在 import 语句中使用 require 语句
    // "@typescript-eslint/no-empty-function": "off", // 禁止空函数
    // "@typescript-eslint/no-use-before-define": "off", // 禁止在变量定义之前使用它们
    // "@typescript-eslint/ban-ts-comment": "off", // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
    // "@typescript-eslint/no-non-null-assertion": "off", // 不允许使用后缀运算符的非空断言(!)
    // "@typescript-eslint/explicit-module-boundary-types": "off", // 要求导出函数和类的公共类方法的显式返回和参数类型

    // // react (https://github.com/jsx-eslint/eslint-plugin-react)
    // "react-hooks/rules-of-hooks": "error",
    // "react-hooks/exhaustive-deps": "off"
    // 'import/no-extraneous-dependencies': 'off',
  },
}
