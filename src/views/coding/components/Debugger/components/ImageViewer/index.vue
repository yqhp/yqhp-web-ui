<script lang="ts" setup>
import { ref } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import { screenshotByToken } from "@/api/agent/device"
import useClipboard from "vue-clipboard3"
import { ElMessage } from "element-plus"

const { toClipboard } = useClipboard()

const deviceStore = useDeviceStore()

const loading = ref(false)
const canvasRef = ref()
const tableData = ref([])

const mousePosition = ref({ x: 0, y: 0 })

const fetchScreenshot = async () => {
  const { token, location } = deviceStore.device
  loading.value = true
  try {
    // 截原图并绘制到canvas
    const base64 = await screenshotByToken(token, location)
    const canvas = canvasRef.value
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.src = "data:image/png;base64," + base64
    img.onload = function () {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }

    // 清空列表
    tableData.value = []

    // 点击canvas
    canvas.onclick = (e) => {
      const canvasRect = canvas.getBoundingClientRect()
      const x = e.clientX - canvasRect.x
      const y = e.clientY - canvasRect.y

      // 1, 1 代表像素数据宽度和高度，因为只取单个像素，所以都是1
      const pixelData = ctx.getImageData(x, y, 1, 1).data
      const alpha = pixelData[3]
      const red = pixelData[0]
      const green = pixelData[1]
      const blue = pixelData[2]
      const argb = (alpha << 24) | (red << 16) | (green << 8) | blue

      tableData.value.push({ x, y, argb })
    }

    // 在canvas上移动
    canvas.onmousemove = (e) => {
      const canvasRect = canvas.getBoundingClientRect()
      const x = e.clientX - canvasRect.x
      const y = e.clientY - canvasRect.y
      mousePosition.value = { x, y }
    }
  } finally {
    loading.value = false
  }
}

const copyColor = async (row) => {
  if (!row) {
    return
  }
  const text = `${row.x}, ${row.y}, ${row.argb}`
  await toClipboard(text)
  ElMessage.success(text + " 复制成功")
}

const copyColorObj = async (row) => {
  if (!row) {
    return
  }
  const text = `Color.of(${row.x}, ${row.y}, ${row.argb})`
  await toClipboard(text)
  ElMessage.success(text + " 复制成功")
}

const selectedColors = ref([])

const handleSelectionChange = (val) => {
  selectedColors.value = val
}

const copySelectedColors = async () => {
  const colors = selectedColors.value.map((color) => `Color.of(${color.x}, ${color.y}, ${color.argb})`).join(", ")
  const text = `List.of(${colors})`
  await toClipboard(text)
  ElMessage.success("复制成功")
}
</script>

<template>
  <div class="h-full overflow-hidden flex">
    <div class="absolute top-1 left-1">
      <el-tag type="info">{{ `${mousePosition.x}, ${mousePosition.y}` }}</el-tag>
    </div>
    <div class="w-50% overflow-auto">
      <canvas ref="canvasRef" />
    </div>
    <div class="flex-1 ml-1">
      <el-table :data="tableData" height="100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column>
          <template #header>
            <el-button
              text
              bg
              size="small"
              type="primary"
              :disabled="selectedColors.length === 0"
              @click="copySelectedColors"
            >
              复制勾选
            </el-button>
            x,y,argb
          </template>
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="copyColor(row)">
              {{ `${row.x}, ${row.y}, ${row.argb}` }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column>
          <template #header>
            <el-button text bg size="small" type="primary" @click="tableData = []">清空列表</el-button>
            <el-button text bg size="small" type="primary" @click="fetchScreenshot" :loading="loading">
              截屏
            </el-button>
          </template>
          <template #default="scope">
            <el-button text bg size="small" type="primary" @click="copyColorObj(scope.row)">复制</el-button>
            <el-button text bg size="small" type="danger" @click="tableData.splice(scope.$index, 1)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
