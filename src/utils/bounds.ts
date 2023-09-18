// 面积
export function boundsArea(bounds) {
  const [x, y, width, height] = bounds
  return width * height
}

export function isInRect(x, y, bounds) {
  const [_x, _y, width, height] = bounds
  return x >= _x && x <= _x + width && y >= _y && y <= _y + height
}

export function findMatchedNode(tree, x, y) {
  let bestNode = null
  let bestBounds = null
  let bestPath = null

  function walk(node, path) {
    const bounds = node.bounds
    if (isInRect(x, y, bounds)) {
      // 找到面积最小的节点
      if (!bestBounds || boundsArea(bounds) <= boundsArea(bestBounds)) {
        bestNode = node
        bestBounds = bounds
        bestPath = path
      }
      if (node.nodes) {
        node.nodes.forEach((child, index) => {
          walk(child, path.concat([index]))
        })
      }
    }
  }
  walk(tree, [])
  return {
    node: bestNode,
    path: bestPath
  }
}
