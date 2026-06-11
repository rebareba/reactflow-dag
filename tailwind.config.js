module.exports = {
  darkMode: 'selector',
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],

  corePlugins: {
    preflight: false, // 不需要初始化，这个在主应用里面实现
  },
  theme: {
    // 覆盖 要全覆盖，没有的就没有了嘛
    // spacing: {}
    // 扩展
    extend: {
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '40px',
        xxl: '48px',
      },
      colors: {
        primary: 'var(--ant-color-primary)',
        shallow: 'var(--ant-color-bg-text-hover)',
        'gray-fill-light': 'var(--gray-fill-light)',
        'text-secondary': 'var(--text-secondary)',
        'text-sub-emphasis': 'var(--text-sub-emphasis),',
      },
      fontSize: {
        xs: ['12px', '16px'], // 正文3信息牧多且需要多呈现时的正文使用+对主观进行释意的文字＋协议条款文字等 Regular 12pt 16H 400
        sm: ['14px', '20px'], // 正文1 大部分正文文字+导航栏的文字 Regular 14pt 20H 400
        base: ['16px', '22px'], // 标准标题 Medium 16pt 22H 400
        lg: ['18px', '24px'], //小标题  Medium 18pt 24H 500
        xl: ['20px', '28px'], //中标题  Medium 20pt 28H 500
        xxl: ['26px', '34px'], //大标题  Medium 26pt 34H 500
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

