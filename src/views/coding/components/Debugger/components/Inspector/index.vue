<script lang="ts" setup>
import { ref, onUnmounted } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import { dumpHierarchy } from "@/api/agent/device"
import { XMLParser } from "fast-xml-parser"
import { findMatchedNode } from "@/utils/bounds"
import { getXPath, getXPathLite, scanAttrValueCount } from "@/utils/locator"
import { emitter } from "@/utils/mitt"
import { ElMessage } from "element-plus"
import { Refresh } from "@element-plus/icons-vue"
import useClipboard from "vue-clipboard3"

const props = defineProps({
  isAndroid: {
    type: Boolean,
    default: true
  }
})

const { toClipboard } = useClipboard()

const deviceStore = useDeviceStore()

const isNativeContext = ref(true)

const imgRef = ref()
const canvasRef = ref()
let canvasCtx
const treeRef = ref()
const treeData = ref([])
const loading = ref(false)
const nodeInfo = ref()
// 推荐定位方式
const suggestedAttrs = ref([])
// 按序展示
const nodeInfoAttrs = props.isAndroid
  ? [
      "resource-id",
      "content-desc",
      "text",
      "xpath-lite",
      "xpath",
      "center",
      "bounds",
      "index",
      "package",
      "class",
      "enabled",
      "checkable",
      "checked",
      "clickable",
      "focusable",
      "focused",
      "long-clickable",
      "password",
      "scrollable",
      "selected",
      "displayed"
    ]
  : [
      "value",
      "name",
      "label",
      "xpath-lite",
      "xpath",
      "type",
      "center",
      "bounds",
      "index",
      "enabled",
      "visible",
      "accessible"
    ]

// xml解析文档 https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md
const xmlParser = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: false,
  updateTag(tagName, jPath, attrs) {
    // ios新增class属性，与android统一，方便后续处理
    if (attrs.type) {
      attrs.class = attrs.type
    }
    // android:hierarchy | ios:AppiumAUT 统一成hierarchy
    if (tagName === "AppiumAUT" || tagName === "hierarchy") {
      return "hierarchy"
    }
    return "node"
  }
})

if (props.isAndroid) {
  emitter.on("androidScreenshot", (imgBase64) => {
    imgRef.value.src = imgBase64
  })
} else {
  emitter.on("iosScreenshot", (imgBase64) => {
    imgRef.value.src = imgBase64
  })
}

const fetchData = async () => {
  if (!deviceStore.device) {
    ElMessage.warning("设备未连接")
    return
  }

  loading.value = true
  try {
    const { token, location } = deviceStore.device
    const { native, pageSource } = await dumpHierarchy(token, location)
    isNativeContext.value = native
    if (!native) {
      return
    }

    emitter.emit(props.isAndroid ? "androidTakeScreenshot" : "iosTakeScreenshot")
    const { hierarchy } = xmlParser.parse(pageSource)
    console.log("hierarchy", hierarchy)
    treeData.value = [adaptor(hierarchy.node)]
    console.log("treeData", treeData.value)

    const canvas = canvasRef.value
    if (props.isAndroid) {
      canvas.width = hierarchy.width
      canvas.height = hierarchy.height
    } else {
      // ios pageSource没有返回布局逻辑宽高，我们取根节点的宽高
      canvas.width = parseInt(hierarchy.node.width)
      canvas.height = parseInt(hierarchy.node.height)
    }
    canvasCtx = canvas.getContext("2d")
    canvas.onclick = (e) => {
      const canvasRect = canvas.getBoundingClientRect()
      // 缩放比例 = hierarchy返回的宽 / 页面显示的宽度
      const scale = canvas.width / canvasRect.width
      const x = (e.clientX - canvasRect.x) * scale
      const y = (e.clientY - canvasRect.y) * scale
      const { node, path } = findMatchedNode(hierarchy.node, x, y)
      treeRef.value.setCurrentKey(node.id) // 选中树节点
      document.getElementById(node.id).scrollIntoView({ block: "center" }) // 滚动到选中节点
      displayNodeInfo(node, path)
    }

    suggestedAttrs.value = []
    nodeInfo.value = undefined
  } finally {
    loading.value = false
  }
}

const displayNodeInfo = (node, path) => {
  console.log("node", node)
  console.log("path", path)
  fillCanvas(node.bounds)
  const tree = treeData.value
  // 用于计算xpathLite 以及 推荐定位
  const attrs = props.isAndroid ? ["resource-id", "content-desc", "text"] : ["value", "name", "label"]
  const xpathLite = getXPathLite(tree, path, attrs)
  const xpath = getXPath(tree, path)
  const [x, y, width, height] = node.bounds
  const center = [x + width / 2, y + height / 2]
  nodeInfo.value = {
    ...node,
    "xpath-lite": xpathLite,
    xpath,
    center
  }

  // 推荐定位方式
  const _suggestedAttrs = []
  const attrValueCount = scanAttrValueCount(tree, attrs)
  for (const attr of attrs) {
    const value = node[attr]
    // value唯一，则推荐
    if (value && attrValueCount[attr][value] === 1) {
      _suggestedAttrs.push(attr)
    }
  }
  suggestedAttrs.value = _suggestedAttrs
}

let id = 0
const adaptor = (node) => {
  // 每个节点加id，方便el-tree操作
  node.id = id++

  if (node.bounds) {
    // android
    // [0,0][1536,2560]
    const bounds = node.bounds.match(/\d+/g)
    // [x,y,width,height]
    node.bounds = [~~bounds[0], ~~bounds[1], bounds[2] - bounds[0], bounds[3] - bounds[1]]
  } else if (node.x !== undefined && node.y !== undefined && node.width !== undefined && node.height !== undefined) {
    // ios
    node.bounds = [parseInt(node.x), parseInt(node.y), parseInt(node.width), parseInt(node.height)]
  }

  if (node.node) {
    node.nodes = node.node.length ? node.node : [node.node]
    node.nodes.forEach(adaptor)
    delete node.node
  }
  return node
}

const treeNodeClick = (data, node) => {
  const path = []
  while (node.parent) {
    const idx = node.parent.childNodes.findIndex((item) => item.data.id === node.data.id)
    path.unshift(idx)
    node = node.parent
  }
  if (path.length) {
    path.splice(0, 1)
  }
  displayNodeInfo(data, path)
}

const fillCanvas = (bounds) => {
  const canvas = canvasRef.value
  // 清除上次画的
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
  canvasCtx.fillStyle = "red"
  canvasCtx.globalAlpha = 0.5 // 透明度
  canvasCtx.fillRect(...bounds)
}

const copyText = async (data) => {
  if (!data) {
    return
  }
  const text = Array.isArray(data) ? data.join(",") : data
  await toClipboard(text)
}

onUnmounted(() => {
  console.log("inspector onUnmounted")
  props.isAndroid ? emitter.off("androidScreenshot") : emitter.off("iosScreenshot")
})
</script>

<template>
  <div class="absolute top-5 right-5 z-1">
    <el-button type="primary" :icon="Refresh" circle @click="fetchData" :loading="loading" />
  </div>
  <!-- 这里不能用v-if，isNativeContext从false变为true，会导致img不显示，因为截图给img赋src时，img可能还没挂载到dom -->
  <div v-show="isNativeContext" class="h-full overflow-hidden flex" v-loading="loading">
    <div class="relative overflow-auto mr-1">
      <canvas ref="canvasRef" class="w-80 absolute" />
      <img ref="imgRef" class="w-80" />
    </div>
    <div class="flex-1 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-auto mb-1">
        <el-tree
          ref="treeRef"
          class="min-w-max"
          :data="treeData"
          :props="{ label: 'class', children: 'nodes' }"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          node-key="id"
          @node-click="treeNodeClick"
        >
          <template #default="{ node, data }">
            <!-- id用于定位该节点，并滚动到这个位置 -->
            <span class="text-12px" :id="data.id">
              ({{ data.index }}){{ data.class.replace("android.widget.", "") }}
            </span>
          </template>
        </el-tree>
      </div>
      <div class="flex-1 overflow-auto">
        <el-descriptions v-if="nodeInfo" size="small" border :column="1">
          <el-descriptions-item v-for="attr in nodeInfoAttrs" :key="attr" :label="attr" label-class-name="w-30">
            <el-tag v-if="suggestedAttrs.some((suggested) => suggested === attr)" type="success" size="small">
              推荐
            </el-tag>
            {{ nodeInfo[attr] }}
            <el-button v-if="nodeInfo[attr]" size="small" text bg @click="copyText(nodeInfo[attr])">复制</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
  <div v-if="!isNativeContext" class="h-full flex items-center justify-center font-black">当前Context非原生</div>
</template>
