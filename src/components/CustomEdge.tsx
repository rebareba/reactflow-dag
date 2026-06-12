import React from 'react'
import {CloseCircleOutlined} from '@ant-design/icons'
import {BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps} from 'reactflow'

import type {EdgeData} from '../types'

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<EdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const shouldShowDelete = data.showDelete && data.allowRemove

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {shouldShowDelete && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan edge-item"
          >
            <CloseCircleOutlined
              className="edge-delete-icon"
              onClick={e => {
                e.stopPropagation()
                data.onDelete?.(id)
              }}
            />
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}

export default CustomEdge
