import type {Node as RFNode, Edge as RFEdge, Connection, ReactFlowInstance} from 'reactflow'
import type {CSSProperties, MouseEvent, ReactNode} from 'react'

// --- Shared types ---

export interface InnerTipItem {
  name: string
  status?: number
  onClick?: (e: MouseEvent) => void
}

export interface AnchorItem {
  id: string
  style?: CSSProperties
}

export interface MenuItem {
  label: string
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  action?: (e: MouseEvent, nodeInfo: {id: string; data: NodeData}) => void
  children?: MenuItem[]
}

export interface NodeData {
  label: string
  status?: number
  type?: string
  icon?: ReactNode
  buildMenu?: (params: {id: string; data: NodeData}) => MenuItem[]
  onHandleHover?: (nodeId: string, type_: 'source' | 'target') => void
  onHandleLeave?: () => void
  innerTipList?: InnerTipItem[]
  targetAnchors?: AnchorItem[]
  sourceAnchors?: AnchorItem[]
  expanded?: boolean
  showDelete?: boolean
  allowRemove?: boolean
  onDelete?: (id: string) => void
  [key: string]: unknown
}

export interface EdgeData {
  showDelete?: boolean
  allowRemove?: boolean
  onDelete?: (id: string) => void
  [key: string]: unknown
}

export interface LayoutOptions {
  direction?: string
  nodeWidth?: number
  nodeHeight?: number
  ranksep?: number
  nodesep?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawData = any

export interface DagFlowProps {
  initialNodes?: RFNode<NodeData>[]
  initialEdges?: RFEdge<EdgeData>[]
  nodeList?: RawData[]
  links?: RawData[]
  nodeParse?: (node: RawData) => RFNode<NodeData>
  linkParse?: (link: RawData) => RFEdge<EdgeData>
  buildMenu?: (params: {id: string; data: NodeData}) => MenuItem[]
  onDrop?: (position: {x: number; y: number}, event: React.DragEvent) => void
  onEdgesDelete?: (edges: RFEdge<EdgeData>[]) => void
  onNodeSelect?: (node: RFNode<NodeData> | null) => void
  onFlowInit?: (instance: ReactFlowInstance) => void
  onDoubleClick?: (node: RFNode<NodeData>, event: React.MouseEvent) => void
  onConnection?: (connection: Connection) => boolean | Promise<boolean> | void
  onConnectionRemove?: (edge: RFEdge<EdgeData>) => boolean | Promise<boolean> | void
  beforeConnection?: (connection: Connection) => boolean
  layoutOptions?: LayoutOptions
  flowId?: string
  allowLinkRemove?: boolean
  running?: boolean
  connectionsDetachable?: boolean
  defaultSelectedId?: string | null
  canUnSelectNode?: boolean
  onRefresh?: () => void
}

export interface DagFlowRef {
  getNodes: () => RFNode<NodeData>[]
  getLinks: () => RFEdge<EdgeData>[]
  fitView: () => void
  zoomIn: () => void
  zoomOut: () => void
  clearPositionCache: () => void
  expandNode: (
    id: string,
    inputNodes?: RFNode<NodeData>[],
    addEndpoints?: unknown,
    inputLinks?: RFEdge<EdgeData>[],
  ) => void
  unexpandNode: (
    id: string,
    inputNodes?: RFNode<NodeData>[],
    inputLinks?: RFEdge<EdgeData>[],
  ) => void
}
