// src/index.js
import DagFlow from './components/DagFlow'

// 导出主组件
export default DagFlow

// 导出辅助常量或工具，方便使用者自定义
export {ELEMENT_TYPES, LAYOUT_DIRECTION, NODE_STATUS, STATUS_COLORS} from './constants'
export * from './components/dagUtils'
