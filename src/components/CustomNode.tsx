import React, {useMemo} from 'react'
import {MoreOutlined, DeploymentUnitOutlined} from '@ant-design/icons'
import {Handle, Position} from 'reactflow'
import {Dropdown} from 'antd'

import {COLORS, NODE_STYLES, STATUS_COLORS, NODE_STATUS} from '../constants'

const CustomNode = ({
  id,
  data,
  selected,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}) => {
  // 1. 获取状态
  const status = data.status || NODE_STATUS.CONFIGURED
  // 2. 颜色映射
  const mainColor = STATUS_COLORS[status] || STATUS_COLORS[NODE_STATUS.CONFIGURED]

  // 3. 判断是否运行中
  const isRunning = status === NODE_STATUS.RUNNING

  const {onHandleHover, onHandleLeave, buildMenu, innerTipList} = data
  const targetAnchors = data.targetAnchors || [{id: 'default-target'}]
  const sourceAnchors = data.sourceAnchors || [{id: 'default-source'}]

  const menuOverlay = useMemo(() => {
    if (!buildMenu) return null
    const rawMenu = buildMenu({id, data})
    if (!Array.isArray(rawMenu) || rawMenu.length === 0) return null

    const renderItem = (item, index, isChild = false) => {
      let className = 'custom-dropdown-item'
      if (item.danger) className += ' danger'
      if (item.disabled) className += ' disabled'
      if (isChild) className += ' child'

      return (
        <div
          key={index}
          className={className}
          onClick={e => {
            if (item.disabled) return
            e.stopPropagation()
            if (item.action) item.action(e, {id, data})
          }}
        >
          {item.icon && <span className="ant-dropdown-menu-item-icon">{item.icon}</span>}
          <span style={{flex: 1}}>{item.label}</span>
        </div>
      )
    }

    return (
      <div className="custom-dropdown-menu">
        {rawMenu.map((item, index) => {
          if (item.children && item.children.length > 0) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={`group-${index}`}>
                <div className="custom-dropdown-group-title">{item.label}</div>
                {item.children.map((child, cIndex) =>
                  renderItem(child, `child-${index}-${cIndex}`, true),
                )}
              </React.Fragment>
            )
          }
          return renderItem(item, `item-${index}`)
        })}
      </div>
    )
  }, [buildMenu, id, data])

  // Handle 样式
  const baseHandleStyle = {
    background: COLORS.HANDLE_BG,
    width: NODE_STYLES.HANDLE_SIZE,
    height: NODE_STYLES.HANDLE_SIZE,
    zIndex: 12,
    position: 'absolute',
    transition: 'all 0.2s ease-in-out',
    border: '2px solid #fff',
  }

  const getHandleStyle = (position, index, total) => {
    const offset = total === 1 ? '50%' : `${((index + 1) * 100) / (total + 1)}%`
    const positionMap = {
      [Position.Top]: {top: '-4px', left: offset},
      [Position.Bottom]: {bottom: '-4px', left: offset},
      [Position.Left]: {left: '-4px', top: offset},
      [Position.Right]: {right: '-4px', top: offset},
    }
    return {
      ...baseHandleStyle,
      ...positionMap[position],
    }
  }

  const renderInnerTip = () => {
    if (innerTipList && Array.isArray(innerTipList) && innerTipList.length) {
      return (
        <>
          {innerTipList.map(item => {
            const {name = '', status = 1, onClick = () => {}} = item
            const statusCls = `inner-tip-status-${status}`
            return (
              <span
                key={name}
                className={`inner-tip ${statusCls}`}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (onClick && typeof onClick === 'function') {
                    onClick(e)
                  }
                }}
              >
                <span className="inner-tip-text">{name}</span>
              </span>
            )
          })}
        </>
      )
    }
    return null
  }

  return (
    <div
      className={`custom-node-wrapper ${isRunning ? 'node-running' : ''} ${selected ? 'node-selected' : ''}`}
      style={{
        borderColor: isRunning ? 'transparent' : mainColor,
        minWidth: 256,
        // maxWidth: 800,
        width: 'fit-content',
      }}
    >
      {/* 运行中的虚线边框动画 */}
      {isRunning && (
        <svg className="node-dashed-border" preserveAspectRatio="none">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="4"
            ry="4"
            fill="none"
            stroke="#1677ff"
            strokeWidth="2"
            strokeDasharray="8 4"
            className="dashed-rect"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {targetAnchors.map((anchor, index) => (
        <Handle
          key={anchor.id || index}
          id={anchor.id}
          type="target"
          position={targetPosition}
          className="custom-anchor"
          style={{...getHandleStyle(targetPosition, index, targetAnchors.length), ...anchor.style}}
          onMouseEnter={() => onHandleHover && onHandleHover(id, 'target')}
          onMouseLeave={onHandleLeave}
        />
      ))}
      {/* 左侧图标区域 */}
      <div className="node-icon-area" style={{backgroundColor: `${mainColor}2A`}}>
        {data.icon || <DeploymentUnitOutlined />}
      </div>
      <div className="node-text-area">
        <div>{data.label}</div>
        {data.type && <div className="node-type-title">{data.type}</div>}
      </div>
      {renderInnerTip()}
      {menuOverlay && (
        <div className="node-menu-area" onClick={e => e.stopPropagation()}>
          <Dropdown
            overlay={menuOverlay}
            trigger={['hover']}
            placement="bottomLeft"
            arrow
            transitionName=""
          >
            <div className="more-btn">
              <MoreOutlined style={{fontSize: '16px'}} />
            </div>
          </Dropdown>
        </div>
      )}
      {sourceAnchors.map((anchor, index) => (
        <Handle
          key={anchor.id || index}
          id={anchor.id}
          type="source"
          className="custom-anchor"
          position={sourcePosition}
          style={{...getHandleStyle(sourcePosition, index, sourceAnchors.length), ...anchor.style}}
          onMouseEnter={() => onHandleHover && onHandleHover(id, 'source')}
          onMouseLeave={onHandleLeave}
        />
      ))}
    </div>
  )
}

export default React.memo(CustomNode)
