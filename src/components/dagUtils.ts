import dagre from 'dagre'
import {Position, type Node, type Edge} from 'reactflow'

import {LAYOUT_DEFAULTS, LAYOUT_DIRECTION} from '../constants'
import type {LayoutOptions, NodeData, EdgeData} from '../types'

// Module-level variable for canvas caching instead of function property
let textWidthCanvas: HTMLCanvasElement | null = null

/**
 * 辅助函数：使用 Canvas 测量文本宽度
 * @param text 文本内容
 * @param font 字体样式 (需与 CSS 保持一致)
 */
const getTextWidth = (
  text: string,
  font: string = "500 13px 'PingFang SC', sans-serif",
): number => {
  if (!text) return 0
  if (!textWidthCanvas) {
    textWidthCanvas = document.createElement('canvas')
  }
  const context = textWidthCanvas.getContext('2d')
  if (!context) return 0
  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
}

/**
 * 辅助函数：计算节点的动态尺寸
 * @param node 节点对象
 * @param minWidth 最小宽度
 * @param defaultHeight 默认高度
 */
const calculateNodeSize = (
  node: Node<NodeData>,
  minWidth: number,
  defaultHeight: number,
): {width: number; height: number} => {
  const label = node.data?.label || ''
  // 测量文字宽度
  const textWidth = getTextWidth(label)
  // 宽度计算公式：
  // 图标区域(40px) + 文字左padding(12px) + 文字宽度 + 文字右padding(12px) + 更多按钮区域(~32px) + 边框/缓冲(4px)
  // 这里的数值对应 DagFlow.css 中的布局
  let contentWidth = 40 + 12 + textWidth + 12 + 32 + 4
  if (node.data?.innerTipList?.length) {
    contentWidth += node.data.innerTipList.length * 105
  }
  return {
    width: Math.max(minWidth, Math.ceil(contentWidth)),
    height: defaultHeight,
  }
}

/**
 * 递归查找指定节点的所有后代节点ID和连线ID
 */
export const getDescendants = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
): {nodeIds: string[]; edgeIds: string[]} => {
  const descendantsNodes = new Set<string>()
  const descendantsEdges = new Set<string>()

  const traverse = (currentId: string) => {
    const outgoingEdges = edges.filter(e => e.source === currentId)
    outgoingEdges.forEach(edge => {
      descendantsEdges.add(edge.id)
      const targetNodeId = edge.target
      if (!descendantsNodes.has(targetNodeId)) {
        descendantsNodes.add(targetNodeId)
        traverse(targetNodeId)
      }
    })
  }

  traverse(nodeId)
  return {
    nodeIds: Array.from(descendantsNodes),
    edgeIds: Array.from(descendantsEdges),
  }
}

/**
 * 核心布局算法 (纯函数)
 */
export const getLayoutedElements = (
  nodes: Node<NodeData>[],
  edges: Edge<EdgeData>[],
  options: LayoutOptions = {},
  getPositionCache?: () => Record<string, {x: number; y: number}> | null,
): {nodes: Node<NodeData>[]; edges: Edge<EdgeData>[]} => {
  const {
    direction = LAYOUT_DEFAULTS.DIRECTION,
    nodeWidth = LAYOUT_DEFAULTS.NODE_WIDTH,
    nodeHeight = LAYOUT_DEFAULTS.NODE_HEIGHT,
    ranksep = LAYOUT_DEFAULTS.RANK_SEP,
    nodesep = LAYOUT_DEFAULTS.NODE_SEP,
  } = options

  const isHorizontal = direction === LAYOUT_DIRECTION.LR
  const g = new dagre.graphlib.Graph()

  g.setGraph({rankdir: direction, ranksep, nodesep})
  g.setDefaultEdgeLabel(() => ({}))

  const visibleNodes = nodes.filter(n => !n.hidden)
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id))

  const visibleEdges = edges.filter(
    e => !e.hidden && visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
  )

  // 1. 设置节点 (使用动态宽度)
  visibleNodes.forEach(node => {
    const {width, height} = calculateNodeSize(node, nodeWidth, nodeHeight)
    g.setNode(node.id, {width, height})
  })
  // 2. 设置连线
  visibleEdges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const positionCache = getPositionCache ? getPositionCache() : null

  const layoutedNodes = nodes.map(node => {
    if (node.hidden) return node

    const nodeWithPosition = g.node(node.id)

    let position = {x: 0, y: 0}
    const hasManualPos = node.position && (node.position.x !== 0 || node.position.y !== 0)

    if (hasManualPos) {
      position = node.position
    } else if (positionCache && positionCache[node.id]) {
      position = positionCache[node.id]
    } else {
      // 注意：Dagre 返回的是中心点，React Flow 需要左上角
      position = {
        x: (nodeWithPosition?.x || 0) - (nodeWithPosition?.width || nodeWidth) / 2,
        y: (nodeWithPosition?.y || 0) - (nodeWithPosition?.height || nodeHeight) / 2,
      }
    }

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position,
    }
  })

  return {nodes: layoutedNodes, edges}
}

export const isGraphStructureChanged = (prevNodes: Node[], nextNodes: Node[]): boolean => {
  if (prevNodes.length !== nextNodes.length) return true
  // 如果文字长度变化可能导致布局改变，这里也可以加上 label 的比较
  // 但为了性能，通常只比较显隐状态
  return !nextNodes.every(next => {
    const prev = prevNodes.find(p => p.id === next.id)
    return prev && prev.hidden === next.hidden
  })
}
