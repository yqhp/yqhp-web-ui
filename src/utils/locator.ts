function getChildIndex(node, nodes) {
  let index = 0
  for (const _node of nodes) {
    if (_node.class === node.class) {
      index++
    }
    if (node === _node) {
      break
    }
  }
  return index
}

function scanNodes(nodes, attrs, attrValueCount) {
  if (!nodes) {
    return
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    for (const attr of attrs) {
      attrValueCount[attr] = attrValueCount[attr] || {}
      const value = node[attr]
      if (value) {
        attrValueCount[attr][value] = (attrValueCount[attr][value] && attrValueCount[attr][value] + 1) || 1
      }
    }
    scanNodes(node.nodes, attrs, attrValueCount)
  }
}

export function scanAttrValueCount(nodes, attrs) {
  const attrValueCount = {} // {"resource-id": {"id1": 1, "id2": 2}, "text": {"text1": 1, "text2": 2}}
  scanNodes(nodes, attrs, attrValueCount)
  return attrValueCount
}

export function getXPathLite(tree, nodePath, attrs) {
  let nodes = tree
  // {"resource-id": {"id1": 1, "id2": 2}, "text": {"text1": 1, "text2": 2}}
  const attrValueCount = scanAttrValueCount(nodes, attrs)

  const paths = [0, ...nodePath]
  let xpathLite = ""

  for (const path of paths) {
    const node = nodes[path]
    let attrValueIsUnique = false
    for (const attr of attrs) {
      const attrValue = node[attr]
      if (attrValue && attrValueCount[attr][attrValue] === 1) {
        xpathLite = `/*[@${attr}='${attrValue}']`
        attrValueIsUnique = true
        break
      }
    }
    if (!attrValueIsUnique) {
      const index = getChildIndex(node, nodes)
      xpathLite = `${xpathLite}/${node.class}[${index}]`
    }
    nodes = node.nodes
  }
  return `/${xpathLite}`
}

export function getXPath(tree, nodePath) {
  const array = []
  let nodes = tree
  const paths = [0, ...nodePath]

  for (const path of paths) {
    const node = nodes[path]
    const index = getChildIndex(node, nodes)
    const tagName = node.class
    array.push(`${tagName}[${index}]`)
    nodes = node.nodes
  }

  return `//${array.join("/")}`
}
