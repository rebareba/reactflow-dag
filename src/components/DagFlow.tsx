import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import 'reactflow/dist/style.css'
import './DagFlow.css'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  ControlButton,
  MarkerType,
  updateEdge,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
  Position,
} from 'reactflow'
import {debounce} from 'lodash'
import {PlusOutlined, SyncOutlined, MinusOutlined, ExpandOutlined} from '@ant-design/icons'
import {Tooltip} from 'antd'
import {
  ACTIVE_STYLE,
  DEFAULT_STYLE,
  ELEMENT_TYPES,
  KEY_CODES,
  LAYOUT_DEFAULTS,
  LAYOUT_DIRECTION,
} from '../constants'
import type {DagFlowProps, DagFlowRef, NodeData, EdgeData} from '../types'
import {getDescendants, getLayoutedElements, isGraphStructureChanged} from './dagUtils'

import CustomEdge from './CustomEdge'
import CustomNode from './CustomNode'

const nodeTypes = {[ELEMENT_TYPES.NODE.STATUS]: CustomNode}
const edgeTypes = {[ELEMENT_TYPES.EDGE.EDITABLE]: CustomEdge}
const EMPTY_ARRAY: [] = []

const DagFlow = forwardRef<DagFlowRef, DagFlowProps>(
  (
    {
      initialNodes = EMPTY_ARRAY,
      initialEdges = EMPTY_ARRAY,
      nodeList = EMPTY_ARRAY,
      links = EMPTY_ARRAY,
      nodeParse,
      linkParse,
      buildMenu,
      onDrop,
      onEdgesDelete,
      onNodeSelect,
      onFlowInit,
      onDoubleClick,
      onConnection,
      onConnectionRemove,
      beforeConnection,
      layoutOptions = {},
      flowId = LAYOUT_DEFAULTS.FLOW_ID,
      allowLinkRemove = true,
      running = false,
      connectionsDetachable = false,
      defaultSelectedId = null,
      canUnSelectNode = true,
      onRefresh,
    },
    ref,
  ) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([])
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

    const callbacksRef = useRef({
      onConnection,
      onConnectionRemove,
      beforeConnection,
      onEdgesDelete,
      onNodeSelect,
      onDoubleClick,
    })

    useEffect(() => {
      callbacksRef.current = {
        onConnection,
        onConnectionRemove,
        beforeConnection,
        onEdgesDelete,
        onNodeSelect,
        onDoubleClick,
      }
    }, [
      onDoubleClick,
      onConnection,
      onConnectionRemove,
      beforeConnection,
      onEdgesDelete,
      onNodeSelect,
    ])

    const getCacheKey = useCallback(() => `dag-pos-${flowId}`, [flowId])

    const updateNodePosCache = useCallback(
      (node: Node<NodeData>) => {
        if (!flowId) return
        try {
          const key = getCacheKey()
          const stored = localStorage.getItem(key)
          const cacheMap = stored ? JSON.parse(stored) : {}
          cacheMap[node.id] = node.position
          localStorage.setItem(key, JSON.stringify(cacheMap))
        } catch (e) {
          console.error('Cache Update Error:', e)
        }
      },
      [flowId, getCacheKey],
    )

    const getPositionCache = useCallback((): Record<string, {x: number; y: number}> | null => {
      if (!flowId) return null
      try {
        return JSON.parse(localStorage.getItem(getCacheKey()) as string)
      } catch (e) {
        return null
      }
    }, [flowId, getCacheKey])

    const setHighlight = useCallback(
      (id: string, type: 'edge' | 'target' | 'source') => {
        setEdges(eds =>
          eds.map(e => {
            const isMatch =
              (type === 'edge' && e.id === id) ||
              (type === 'target' && e.target === id) ||
              (type === 'source' && e.source === id)
            if (isMatch) {
              return {
                ...e,
                animated: true,
                style: {stroke: ACTIVE_STYLE.stroke, strokeWidth: ACTIVE_STYLE.strokeWidth},
                markerEnd: {type: MarkerType.ArrowClosed, color: ACTIVE_STYLE.markerColor},
                data: {...e.data, showDelete: !running && allowLinkRemove && type === 'edge'},
              }
            }
            return e
          }),
        )
      },
      [setEdges, allowLinkRemove, running],
    )

    const resetAllEdges = useCallback(() => {
      setEdges(eds =>
        eds.map(e => ({
          ...e,
          animated: DEFAULT_STYLE.animated,
          style: {stroke: DEFAULT_STYLE.stroke, strokeWidth: DEFAULT_STYLE.strokeWidth},
          markerEnd: {type: MarkerType.ArrowClosed, color: DEFAULT_STYLE.markerColor},
          data: {...e.data, showDelete: false},
        })),
      )
    }, [setEdges])

    const onConnect = useCallback(
      async (params: Connection) => {
        const cb = callbacksRef.current
        if (cb.onConnection) {
          try {
            const pass = await cb.onConnection(params)
            if (!pass) return
          } catch (e) {
            return
          }
        }

        const newEdge = {
          ...params,
          type: ELEMENT_TYPES.EDGE.EDITABLE,
          markerEnd: {type: MarkerType.ArrowClosed, color: DEFAULT_STYLE.markerColor},
          data: {
            showDelete: false,
            allowRemove: allowLinkRemove,
            onDelete: async (id: string) => {
              setEdges(es => es.filter(edge => edge.id !== id))
              if (cb.onEdgesDelete) cb.onEdgesDelete([{id} as Edge<EdgeData>])
            },
          },
        }
        setEdges(eds => addEdge(newEdge, eds))
      },
      [setEdges, allowLinkRemove],
    )

    const edgeReconnectRef = useRef(true)
    const onReconnectStart = useCallback(() => {
      edgeReconnectRef.current = false
    }, [])
    const onReconnect = useCallback(
      (oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectRef.current = true
        setEdges(els => updateEdge(oldEdge, newConnection, els))
      },
      [setEdges],
    )
    const onReconnectEnd = useCallback(
      (_: MouseEvent | TouchEvent, edge: Edge) => {
        if (!edgeReconnectRef.current) {
          setEdges(eds => eds.filter(e => e.id !== edge.id))
          if (callbacksRef.current.onEdgesDelete) callbacksRef.current.onEdgesDelete([edge])
        }
        edgeReconnectRef.current = true
      },
      [setEdges],
    )

    const onNodeDragStop = useCallback(
      (_e: React.MouseEvent, node: Node<NodeData>) => updateNodePosCache(node),
      [updateNodePosCache],
    )

    useEffect(() => {
      const rawNodesData = nodeList.length > 0 ? nodeList : initialNodes
      const rawLinksData = links.length > 0 ? links : initialEdges

      if (rawNodesData.length === 0 && nodeList.length === 0) return

      const parsedNodes = nodeParse ? rawNodesData.map(nodeParse) : rawNodesData
      const parsedLinks = linkParse ? rawLinksData.map(linkParse) : rawLinksData

      const currentEdges = reactFlowInstance.current?.getEdges() || []

      const processedEdges = parsedLinks.map(e => {
        const existingEdge = currentEdges.find(ce => ce.id === e.id)
        return {
          ...e,
          type: ELEMENT_TYPES.EDGE.EDITABLE,
          markerEnd: {type: MarkerType.ArrowClosed, color: DEFAULT_STYLE.markerColor},
          hidden: existingEdge ? existingEdge.hidden : e.hidden || false,
          data: {
            ...e.data,
            showDelete: false,
            allowRemove: allowLinkRemove,
            onDelete: async (id: string) => {
              const cb = callbacksRef.current
              if (cb.onConnectionRemove) {
                try {
                  const shouldDelete = await cb.onConnectionRemove(e)
                  if (!shouldDelete) return
                } catch (err) {
                  return
                }
              }
              setEdges(es => es.filter(edge => edge.id !== id))
              if (cb.onEdgesDelete) cb.onEdgesDelete([e])
            },
          },
        }
      })

      const currentNodes = reactFlowInstance.current?.getNodes() || []

      const nodesWithState = parsedNodes.map(pn => {
        const cn = currentNodes.find(c => c.id === pn.id)
        return {...pn, hidden: cn ? cn.hidden : pn.hidden || false}
      })

      const shouldReLayout =
        nodes.length === 0 || isGraphStructureChanged(currentNodes, nodesWithState)

      let finalNodes: Node<NodeData>[] = []

      if (shouldReLayout) {
        const layoutResult = getLayoutedElements(
          nodesWithState,
          processedEdges,
          {
            direction: layoutOptions.direction || LAYOUT_DEFAULTS.DIRECTION,
            nodeWidth: layoutOptions.nodeWidth || LAYOUT_DEFAULTS.NODE_WIDTH,
            nodeHeight: layoutOptions.nodeHeight || LAYOUT_DEFAULTS.NODE_HEIGHT,
            ranksep: layoutOptions.ranksep || LAYOUT_DEFAULTS.RANK_SEP,
            nodesep: layoutOptions.nodesep || LAYOUT_DEFAULTS.NODE_SEP,
          },
          getPositionCache,
        )
        finalNodes = layoutResult.nodes
      } else {
        finalNodes = nodesWithState.map(n => {
          const existing = currentNodes.find(c => c.id === n.id)
          return {
            ...n,
            position: existing ? existing.position : n.position || {x: 0, y: 0},
            targetPosition:
              layoutOptions.direction === LAYOUT_DIRECTION.LR ? Position.Left : Position.Top,
            sourcePosition:
              layoutOptions.direction === LAYOUT_DIRECTION.LR ? Position.Right : Position.Bottom,
          }
        })
      }

      finalNodes = finalNodes.map(n => ({
        ...n,
        selected: defaultSelectedId ? n.id === defaultSelectedId : n.selected,
        data: {
          ...n.data,
          buildMenu,
          onHandleHover: (nid: string, type: 'source' | 'target') => setHighlight(nid, type),
          onHandleLeave: resetAllEdges,
        },
      }))

      setNodes(finalNodes)
      setEdges(processedEdges)
    }, [
      nodeList,
      links,
      initialNodes,
      initialEdges,
      flowId,
      allowLinkRemove,
      layoutOptions,
      nodeParse,
      linkParse,
      buildMenu,
      defaultSelectedId,
      getCacheKey,
      getPositionCache,
      nodes.length,
      setNodes,
      setEdges,
      resetAllEdges,
      setHighlight,
    ])

    useImperativeHandle(
      ref,
      () => ({
        getNodes: () => nodes,
        getLinks: () => edges,
        fitView: () => reactFlowInstance.current?.fitView(),
        zoomIn: () => reactFlowInstance.current?.zoomIn(),
        zoomOut: () => reactFlowInstance.current?.zoomOut(),
        clearPositionCache: () => {
          if (flowId) localStorage.removeItem(getCacheKey())
        },
        expandNode: (
          id: string,
          inputNodes?: Node<NodeData>[],
          _addEndpoints?: unknown,
          inputLinks?: Edge<EdgeData>[],
        ) => {
          const {nodeIds, edgeIds} = getDescendants(id, nodes, edges)
          setEdges(eds =>
            eds.map(e => {
              const shouldShow = inputLinks
                ? inputLinks.some(l => l.id === e.id)
                : edgeIds.includes(e.id)
              return shouldShow ? {...e, hidden: false} : e
            }),
          )
          setNodes(nds =>
            nds.map(n => {
              if (n.id === id) return {...n, data: {...n.data, expanded: true}}
              const shouldShow = inputNodes
                ? inputNodes.some(inNode => inNode.id === n.id)
                : nodeIds.includes(n.id)
              return shouldShow ? {...n, hidden: false} : n
            }),
          )
        },
        unexpandNode: (
          id: string,
          inputNodes?: Node<NodeData>[],
          inputLinks?: Edge<EdgeData>[],
        ) => {
          const {nodeIds, edgeIds} = getDescendants(id, nodes, edges)
          setEdges(eds =>
            eds.map(e => {
              const shouldHide = inputLinks
                ? inputLinks.some(l => l.id === e.id)
                : edgeIds.includes(e.id)
              return shouldHide ? {...e, hidden: true} : e
            }),
          )
          setNodes(nds =>
            nds.map(n => {
              if (n.id === id) return {...n, data: {...n.data, expanded: false}}
              const shouldHide = inputNodes
                ? inputNodes.some(inNode => inNode.id === n.id)
                : nodeIds.includes(n.id)
              return shouldHide ? {...n, hidden: true} : n
            }),
          )
        },
      }),
      [edges, flowId, getCacheKey, nodes, setEdges, setNodes],
    )

    const onDropHandler = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault()
        if (!reactFlowInstance.current || !onDrop) return
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        })
        onDrop(position, e)
      },
      [onDrop],
    )

    const onDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }, [])

    const debouncedClick = useMemo(
      () =>
        debounce((_e: React.MouseEvent, node: Node<NodeData>) => {
          if (callbacksRef.current.onNodeSelect) callbacksRef.current.onNodeSelect(node)
        }, 300),
      [],
    )

    useEffect(
      () => () => {
        debouncedClick.cancel()
      },
      [debouncedClick],
    )

    return (
      <div className="dag-wrapper">
        <ReactFlow
          id={flowId}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={changes => {
            if (!canUnSelectNode && changes.some(c => c.type === 'select' && !c.selected)) return
            onNodesChange(changes)
          }}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onEdgeMouseEnter={(_, e) => setHighlight(e.id, 'edge')}
          onEdgeMouseLeave={resetAllEdges}
          onNodeClick={(e, n) => debouncedClick(e, n)}
          onNodeDoubleClick={(e, n) => {
            debouncedClick.cancel()
            if (callbacksRef.current.onDoubleClick) callbacksRef.current.onDoubleClick(n, e)
          }}
          onPaneClick={() => {
            if (canUnSelectNode && callbacksRef.current.onNodeSelect) {
              callbacksRef.current.onNodeSelect(null)
            }
          }}
          onInit={instance => {
            reactFlowInstance.current = instance
            if (onFlowInit) onFlowInit(instance)
          }}
          onDrop={onDropHandler}
          onDragOver={onDragOver}
          isValidConnection={conn => {
            const cb = callbacksRef.current
            return cb.beforeConnection ? cb.beforeConnection(conn) : true
          }}
          deleteKeyCode={running ? null : allowLinkRemove ? KEY_CODES.DELETE : null}
          nodesDraggable={!running}
          nodesConnectable={!running}
          defaultEdgeOptions={{
            updatable: connectionsDetachable,
            type: ELEMENT_TYPES.EDGE.EDITABLE,
          }}
          onEdgeUpdate={onReconnect}
          onEdgeUpdateStart={onReconnectStart}
          onEdgeUpdateEnd={onReconnectEnd}
          fitView
          fitViewOptions={{
            maxZoom: 0.8,
          }}
          onlyRenderVisibleElements
          proOptions={{hideAttribution: true}}
        >
          <Background id={`bg-${flowId}`} gap={LAYOUT_DEFAULTS.BG_GAP} />
          <Controls
            className="task-orchestration-container"
            showZoom={false}
            showFitView={false}
            showInteractive={false}
            position="top-right"
          >
            <ControlButton>
              <Tooltip
                overlayClassName="task-orchestration-control"
                title="缩小比例"
                placement="bottomLeft"
              >
                <MinusOutlined
                  onClick={() => {
                    reactFlowInstance.current?.zoomOut()
                  }}
                />
              </Tooltip>
            </ControlButton>
            <ControlButton>
              <Tooltip
                overlayClassName="task-orchestration-control"
                title="放大比例"
                placement="bottomLeft"
              >
                <PlusOutlined
                  onClick={() => {
                    reactFlowInstance.current?.zoomIn()
                  }}
                />
              </Tooltip>
            </ControlButton>
            <ControlButton>
              <Tooltip
                overlayClassName="task-orchestration-control"
                title="适配画布"
                placement="bottomLeft"
              >
                <ExpandOutlined
                  onClick={() => {
                    reactFlowInstance.current?.fitView()
                  }}
                />
              </Tooltip>
            </ControlButton>
            {onRefresh && (
              <Tooltip
                overlayClassName="task-orchestration-control"
                title="刷新数据"
                placement="bottomLeft"
              >
                <ControlButton onClick={() => onRefresh && onRefresh()}>
                  <SyncOutlined />
                </ControlButton>
              </Tooltip>
            )}
          </Controls>
        </ReactFlow>
      </div>
    )
  },
)

export default DagFlow
