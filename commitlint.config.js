module.exports = {
  extends: ['@commitlint/config-conventional'],
  // type-case[(scope-case)]:subject-case  示例：     fix(server): send cors headers
  rules: {
    // 2: 错误级别，会使提交失败 always': 规则始终生效 lower-case': 小写。
    'type-case': [2, 'always', 'lower-case'],  // 2: 错误级别，会使提交失败。
    'scope-case': [2, 'always', 'lower-case'], // 非必须得 
    'subject-case': [0, 'never'], // subject大小写不做校验
    //  'header-case': [2, 'always', 'lower-case'], // Git 提交信息头部（包括 type、scope 和 subject）的大小写
    'type-enum': [
      2, //代表必须输入
      'always',
      [
        'docs', //  仅仅修改了文档，比如README, CHANGELOG, CONTRIBUTE等等
        'chore', //  改变构建流程、或者增加依赖库、工具等
        'feat', // 新增feature
        'fix', // 修复bug
        'merge', // 仅进行分支合并.
        'improvement', // 用于对当前实现进行改进而没有添加新功能或修复错误的提交.
        'perf',   //  优化相关，比如提升性能、体验
        'refactor', //代码重构，没有加新功能或者修复bug
        'revert', //  回滚到上一个版本
        'style', // 仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑
        'test', // 测试用例，包括单元测试、集成测试等
        'ci', //主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交
        'build', //主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
      ],
    ],
  },
  // 'subject-case': [0], // subject大小写不做校验
}
