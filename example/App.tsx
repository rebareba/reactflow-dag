import {
  CodeOutlined,
  CompressOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ExpandOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import React, {useCallback, useRef, useState} from 'react'
import {Button, Divider, Layout, message, Modal, Space, Switch, Tooltip} from 'antd'

import DagFlow, {NODE_STATUS} from '../src/index'

const {Sider, Content} = Layout

const businessData = {
  nodes: [
    {id: '101', name: '订单接入', status: 3, type: 'source'},
    {
      id: '102',
      name: '风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗风控清洗',
      status: 'idle',
      type: 'filter',
      // outputs: [
      //   { id: 'h-pass', label: '通过', color: '#52c41a' },
      //   { id: 'h-reject', label: '拦截', color: '#ff4d4f' }
      // ]
    },
    {id: '103', name: '数据落库', status: 'idle', type: 'sink'},
    {id: '104', name: '告警中心', status: 'idle', type: 'sink'},
  ],
  connections: [
    {from: '101', to: '102'},
    {from: '101', to: '103'},
    {from: '103', to: '104'},
    // { from: '102', to: '103', sourceHandle: 'h-pass' },
    // { from: '102', to: '104', sourceHandle: 'h-reject' },
  ],
}

const App = () => {
  const [bizNodes, setBizNodes] = useState(businessData.nodes)
  const [bizLinks, setBizLinks] = useState(businessData.connections)
  const [isRunning, setIsRunning] = useState(false)
  const [canRemove, setCanRemove] = useState(true)
  const [canUnSelect, setCanUnSelect] = useState(true)
  const [currentSelectId, setCurrentSelectId] = useState(null)

  const dagRef = useRef(null)
  const flowId = 'my-workflow-v2'

  const parseNode = node => {
    let sourceAnchors = [{id: 'default-source'}]
    const targetAnchors = [{id: 'default-target'}]

    if (node.outputs && node.outputs.length > 0) {
      sourceAnchors = node.outputs.map(out => ({
        id: out.id,
        style: {background: out.color || '#777'},
      }))
    }

    return {
      id: node.id,
      type: 'statusNode',
      data: {
        label: node.name,
        status: node.status,
        bizType: node.type,
        sourceAnchors,
        targetAnchors,
        innerTipList: [
          {
            name: 'RULE',
            status: 3,
            onClick: () => {
              console.log('点击')
            },
          },
        ],
      },
      position: node.position || {x: 0, y: 0},
    }
  }

  const parseLink = link => {
    return {
      id: `e-${link.from}-${link.to}-${link.sourceHandle || 'default'}`,
      source: link.from,
      target: link.to,
      sourceHandle: link.sourceHandle || 'default-source',
      targetHandle: link.targetHandle || 'default-target',
      animated: !!link.active,
      style: link.active
        ? {stroke: '#1890ff', strokeWidth: 2}
        : {stroke: '#b1b1b7', strokeWidth: 1},
    }
  }

  const buildMenu = useCallback(node => {
    // 兼容代码：防止 node.data 未定义
    const data = node.data || {}
    const isRunning = data.status === NODE_STATUS?.PROCESSING
    const isExpanded = data.expanded !== false

    return [
      {
        label: '查看详情',
        icon: <EyeOutlined />,
        action: (e, n) => message.info(`业务ID: ${n.id}, 名称: ${n.data.label}`),
      },
      {
        label: isExpanded ? '收起下游' : '展开下游',
        icon: isExpanded ? <CompressOutlined /> : <ExpandOutlined />,
        disabled: isRunning,
        action: (e, n) => {
          if (dagRef.current) {
            if (isExpanded) {
              dagRef.current.unexpandNode(n.id)
              message.success(`已收起 [${n.data.label}] 的下游节点`)
            } else {
              dagRef.current.expandNode(n.id)
              message.success(`已展开 [${n.data.label}] 的下游节点`)
            }
          }
        },
      },
      {
        label: '删除节点',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: isRunning,
        action: (e, n) => {
          setBizNodes(prev => prev.filter(item => item.id !== n.id))
          setBizLinks(prev => prev.filter(l => l.from !== n.id && l.to !== n.id))
        },
      },
    ]
  }, [])

  const handleLoad2kData = () => {
    const COUNT = 2000
    message.loading(`正在生成 ${COUNT} 个节点...`, 1)

    const newNodes = []
    const newLinks = []

    // 为了模拟稍微真实一点的场景，生成多条并行的业务链路
    for (let i = 0; i < COUNT; i++) {
      const id = `stress-${i}`
      const typeOptions = ['source', 'filter', 'sink', 'custom']
      const randomType = typeOptions[i % 4]

      newNodes.push({
        id,
        name: `性能测试节点 ${i}`,
        status: 'idle',
        type: randomType,
        // 这里给个随机初始位置，避免所有点重叠在一起
        // 注意：DagFlow 如果开启了自动布局，这些位置会被覆盖
        // 但对于大量节点，如果不给初始位置，dagre 计算可能会非常耗时
        position: {x: (i % 50) * 200, y: Math.floor(i / 50) * 100},
      })

      // 简单的连接逻辑：连接到前一个节点 (形成长链，每10个断开一次形成多条链)
      if (i > 0 && i % 10 !== 0) {
        newLinks.push({
          from: `stress-${i - 1}`,
          to: id,
        })
      }
    }

    // 批量更新状态
    setBizNodes(newNodes)
    setBizLinks(newLinks)

    setTimeout(() => {
      message.success('渲染完成! 尝试缩放或拖拽看看性能')
    }, 500)
  }

  const clearCache = () => {
    if (dagRef.current && dagRef.current.clearPositionCache) {
      dagRef.current.clearPositionCache()
      message.success('位置缓存已清除，刷新页面生效')
    }
    setTimeout(() => window.location.reload(), 500)
  }

  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    message.loading('工作流开始运行...', 1)

    setBizNodes(prev => prev.map(n => ({...n, status: 'idle'})))
    setBizLinks(prev => prev.map(l => ({...l, active: false})))

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

    // 简单的模拟运行逻辑
    for (let i = 0; i < bizNodes.length; i++) {
      const currentNodeId = bizNodes[i].id
      setBizLinks(prev =>
        prev.map(link => (link.to === currentNodeId ? {...link, active: true} : link)),
      )
      setBizNodes(prev =>
        prev.map(node =>
          node.id === currentNodeId
            ? {...node, status: NODE_STATUS?.PROCESSING || 'processing'}
            : node,
        ),
      )
      // eslint-disable-next-line no-await-in-loop
      await sleep(500)
      setBizLinks(prev =>
        prev.map(link => (link.to === currentNodeId ? {...link, active: false} : link)),
      )
      setBizNodes(prev =>
        prev.map(node =>
          node.id === currentNodeId ? {...node, status: NODE_STATUS?.SUCCESS || 'success'} : node,
        ),
      )
    }
    setIsRunning(false)
    message.success('运行完成')
  }

  const handleAddNode = () => {
    const newNode = {
      id: `new-${Date.now()}`,
      name: '新业务节点',
      status: 'idle',
      type: 'custom',
    }
    setBizNodes(prev => [...prev, newNode])
    message.info('已添加业务节点 (触发自动布局)')
  }

  const handleRemoveNode = () => {
    if (!currentSelectId) return message.warning('请先选中一个节点')
    setBizNodes(prev => prev.filter(n => n.id !== currentSelectId))
    setBizLinks(prev => prev.filter(l => l.from !== currentSelectId && l.to !== currentSelectId))
    setCurrentSelectId(null)
  }

  const handleZoomIn = () => dagRef.current?.zoomIn()
  const handleZoomOut = () => dagRef.current?.zoomOut()
  const handleFit = () => dagRef.current?.fitView()

  const handleLogData = () => {
    console.log('当前业务数据:', {bizNodes, bizLinks})
    console.log('当前UI数据(Ref):', dagRef.current?.getNodes())
    message.info('数据已打印到控制台')
  }

  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({type: nodeType, label}))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (position, event) => {
    const dataString = event.dataTransfer.getData('application/reactflow')
    if (!dataString) return
    const {label, type} = JSON.parse(dataString)

    const newBizNode = {
      id: `dnd-${Date.now()}`,
      name: label,
      status: 'idle',
      type,
      position,
    }
    setBizNodes(prev => [...prev, newBizNode])
    message.success(`已添加业务节点: ${label}`)
  }

  const beforeConnection = connection => {
    if (connection.source === connection.target) return false
    return true
  }

  const onConnection = async ({source, target}) => {
    message.loading({content: '正在校验连线规则...', key: 'checkLink'})
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (source === '103') {
      message.error({content: '数据落库节点不支持作为源头!', key: 'checkLink', duration: 2})
      return false
    }
    message.success({content: '校验通过，连接成功', key: 'checkLink', duration: 2})
    setBizLinks(prev => [...prev, {from: source, to: target}])
    return true
  }

  const onConnectionRemove = edge => {
    return new Promise(resolve => {
      Modal.confirm({
        title: '确认删除连线?',
        icon: <ExclamationCircleOutlined />,
        content: `将删除从 ${edge.source} 到 ${edge.target} 的连线`,
        onOk() {
          setBizLinks(prev => prev.filter(l => !(l.from === edge.source && l.to === edge.target)))
          resolve(true)
        },
        onCancel() {
          resolve(false)
        },
      })
    })
  }

  const itemStyle = {
    padding: '10px',
    border: '1px dashed #999',
    marginBottom: '10px',
    cursor: 'grab',
    background: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  return (
    <Layout style={{height: '100vh'}}>
      <Sider width={200} theme="light" style={{borderRight: '1px solid #eee', padding: '15px'}}>
        <div style={{marginBottom: 15, fontWeight: 'bold'}}>组件库 (拖拽添加)</div>
        <div draggable onDragStart={e => onDragStart(e, 'source', '数据源')} style={itemStyle}>
          <DatabaseOutlined /> 数据源
        </div>
        <div draggable onDragStart={e => onDragStart(e, 'filter', '过滤器')} style={itemStyle}>
          <FilterOutlined /> 过滤器
        </div>
        <div draggable onDragStart={e => onDragStart(e, 'sink', '存储器')} style={itemStyle}>
          <SaveOutlined /> 存储器
        </div>
      </Sider>

      <Layout>
        <div
          style={{
            padding: '12px 24px',
            background: '#fff',
            borderBottom: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            zIndex: 10,
          }}
        >
          <Space split={<Divider type="vertical" />} wrap>
            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleRun}
                loading={isRunning}
                disabled={isRunning}
              >
                运行业务流
              </Button>
              <Button
                onClick={() => {
                  setBizNodes(businessData.nodes)
                  setBizLinks(businessData.connections)
                }}
              >
                重置
              </Button>
            </Space>
            <Space>
              <Button icon={<PlusOutlined />} onClick={handleAddNode}>
                添加节点
              </Button>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={handleRemoveNode}
                disabled={!currentSelectId}
              >
                删除选中
              </Button>
            </Space>
            <Space>
              <Tooltip title="放大">
                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
              </Tooltip>
              <Tooltip title="缩小">
                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
              </Tooltip>
              <Tooltip title="自适应">
                <Button icon={<ReloadOutlined />} onClick={handleFit} />
              </Tooltip>
            </Space>
            <Space>
              <span>删线:</span>
              <Switch size="small" checked={canRemove} onChange={setCanRemove} />
              <span>取消选中:</span>
              <Switch size="small" checked={canUnSelect} onChange={setCanUnSelect} />
              <Button size="small" onClick={clearCache}>
                清缓存
              </Button>
            </Space>
            <Space>
              <Button icon={<RocketOutlined />} onClick={handleLoad2kData}>
                加载2k数据
              </Button>
              <Button icon={<CodeOutlined />} onClick={handleLogData}>
                看数据
              </Button>
            </Space>
          </Space>
        </div>

        <Content style={{flex: 1, position: 'relative'}}>
          <DagFlow
            ref={dagRef}
            nodeList={bizNodes}
            links={bizLinks}
            nodeParse={parseNode}
            linkParse={parseLink}
            layoutOptions={{direction: 'TB', ranksep: 80}}
            buildMenu={buildMenu}
            flowId={flowId}
            running={isRunning}
            allowLinkRemove={canRemove}
            canUnSelectNode={canUnSelect}
            defaultSelectedId="101"
            activeSelectedId={currentSelectId}
            onNodeSelect={node => {
              if (node) {
                message.info(`点击: ${node.data.label}`)
              }
              setCurrentSelectId(node ? node.id : null)
            }}
            onDoubleClick={node => message.info(`双击: ${node.data.label}`)}
            onEdgesDelete={deletedEdges => {
              setBizLinks(prev => {
                const targets = deletedEdges.map(e => `${e.source}-${e.target}`)
                return prev.filter(l => !targets.includes(`${l.from}-${l.to}`))
              })
            }}
            onDrop={handleDrop}
            beforeConnection={beforeConnection}
            onConnection={onConnection}
            onConnectionRemove={onConnectionRemove}
            onRefresh={() => {}}
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
