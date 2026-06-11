// --- 1. 基础配置 & 枚举 ---
export const LAYOUT_DIRECTION = {
  LR: 'LR',
  TB: 'TB',
}

export const ELEMENT_TYPES = {
  NODE: {
    STATUS: 'statusNode', // 对应你之前的 statusNode
  },
  EDGE: {
    EDITABLE: 'editable', // 对应你之前的 customEdge
  },
}

export const KEY_CODES = {
  DELETE: ['Backspace', 'Delete'],
}

// --- 2. 颜色定义 (保持你原有的) ---
export const COLORS = {
  PRIMARY: '#276EFE',
  EDGE_DEFAULT: '#C9CDD4',
  NODE_BORDER: '#D9D9D9',
  WHITE: '#FFFFFF',
  HANDLE_BG: '#C9CDD4',
}

export const NODE_STATUS = {
  TO_CONFIG: 1, // 待配置
  CONFIGURED: 2, // 已配置
  RUNNING: 3, // 运行中
  SUCCESS: 4, // 成功
  FAILED: 5, // 失败
  DEFAULT: 6,
  IDLE: 7,
}

export const STATUS_COLORS = {
  [NODE_STATUS.TO_CONFIG]: '#FF7D00', // 橙色
  [NODE_STATUS.CONFIGURED]: '#6193F9', // 蓝色
  [NODE_STATUS.RUNNING]: '#6193F9', // 蓝色 (带动画)
  [NODE_STATUS.SUCCESS]: '#00B42A', // 绿色
  [NODE_STATUS.FAILED]: '#F53F3F', // 红色
  [NODE_STATUS.DEFAULT]: '#C9CDD4', // 红色
  [NODE_STATUS.IDLE]: '#bb85b3',
}

// --- 4. 布局默认值 (整合并扩展) ---
export const LAYOUT_DEFAULTS = {
  FLOW_ID: 'default-flow',
  DIRECTION: LAYOUT_DIRECTION.LR,
  NODE_WIDTH: 256,
  NODE_HEIGHT: 61,
  RANK_SEP: 80,
  NODE_SEP: 50,
  BG_GAP: 16,
}

// --- 5. 样式常量 (保持你原有的) ---
export const NODE_STYLES = {
  WIDTH: '150px',
  HEIGHT: '50px',
  RADIUS: '5px',
  HANDLE_SIZE: 10,
}

export const ACTIVE_STYLE = {
  stroke: '#276EFE',
  strokeWidth: 2,
  animated: true,
  markerColor: '#276EFE',
  showDelete: true,
}

export const DEFAULT_STYLE = {
  stroke: '#C9CDD4',
  strokeWidth: 1,
  animated: false,
  markerColor: '#C9CDD4',
  showDelete: false,
}
