// 这个配置需要与eslint一致，否则在启用 eslint auto fix 的情况下会造成冲突
module.exports = {
  printWidth: 140, //一行的字符数，如果超过会进行换行，默认为80
  trailingComma: "all", //是否使用尾逗号，有三个可选值"<none|es5|all>"
  bracketSpacing: false, //对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  // "jsxBracketSameLine": true,
  // "insertPragma": true,
  endOfLine: "auto", // window和mac的文件最后一行默认换行不一样问题
  tabWidth: 2, // 一个tab代表几个空格数，默认就是2
  useTabs: false, // 是否启用tab取代空格符缩进，.editorconfig设置空格缩进，所以设置为false
  printWidth: 100, // 一行的字符数，如果超过会进行换行
  semi: false, // 行尾是否使用分号，默认为true
  singleQuote: true, // 字符串是否使用单引号
  jsxSingleQuote: false, // 在jsx里是否使用单引号，你看着办
  arrowParens: 'avoid' // 箭头函数如果只有一个参数则省略括号
};