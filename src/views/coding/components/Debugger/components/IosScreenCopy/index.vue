<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import { getWdaWsUrl } from "@/api/agent/device"
import { useDeviceStore } from "@/store/modules/device"
import { AndroidMotionEventAction } from "@/data/scrcpy-data"
import { emitter } from "@/utils/mitt"
import { UploadFilled, Search, SwitchButton, Scissor } from "@element-plus/icons-vue"
import Inspector from "../Inspector/index.vue"
import InstallApp from "../InstallApp/index.vue"

const URL = window.URL || window.webkitURL
const BLANK_IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

const deviceStore = useDeviceStore()

const emit = defineEmits(["closed"])

let logicalWidth = 0
let logicalHeight = 0
const canvasRef = ref()
let ws

const connect = () => {
  ws = new WebSocket(getWdaWsUrl(deviceStore.device.token, deviceStore.device.location))
  ws.binaryType = "blob"
  ws.onopen = () => {
    console.log("wda ws onopen")
    ws.send(
      JSON.stringify({
        command: "WDA_FRAME"
      })
    )
  }

  const canvas = canvasRef.value
  const g = canvas.getContext("2d")
  g.clearRect(0, 0, canvas.width, canvas.height) // 清除上次的图片

  // 图片展示逻辑主要来自openstf
  // https://github.com/openstf/stf/blob/master/res/app/components/stf/screen/screen-directive.js
  ws.onmessage = (event) => {
    const data = event.data
    if (data instanceof Blob) {
      let blob = new Blob([data], { type: "image/jpeg" })
      let img = new Image()
      img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        g.drawImage(img, 0, 0, img.width, img.height)

        // Try to forcefully clean everything to get rid of memory
        // leaks. Note that despite this effort, Chrome will still
        // leak huge amounts of memory when the developer tools are
        // open, probably to save the resources for inspection. When
        // the developer tools are closed no memory is leaked.
        img.onload = img.onerror = null
        img.src = BLANK_IMG
        img = null
        blob = null

        URL.revokeObjectURL(url)
        url = null
      }

      img.onerror = function () {
        // Happily ignore. I suppose this shouldn't happen, but
        // sometimes it does, presumably when we're loading images
        // too quickly.

        // Do the same cleanup here as in onload.
        img.onload = img.onerror = null
        img.src = BLANK_IMG
        img = null
        blob = null

        URL.revokeObjectURL(url)
        url = null
      }

      let url = URL.createObjectURL(blob)
      img.src = url
    } else {
      if (data === "pong") {
        return
      }
      console.log("wda ws: ", data)
      const response = JSON.parse(data)
      if (response?.data?.width && response?.data?.height) {
        logicalWidth = response.data.width
        logicalHeight = response.data.height
      }
    }
  }

  ws.onclose = () => {
    console.log("wda ws onclose")
    ws = undefined
    emit("closed")
  }
}

const disconnect = () => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.close()
  }
}

defineExpose({
  connect,
  disconnect
})

emitter.on("iosTakeScreenshot", () => {
  const imgBase64 = screenshotFromCanvas(false)
  emitter.emit("iosScreenshot", imgBase64)
})

onUnmounted(() => {
  console.log("ios screen copy onUnmounted")
  emitter.off("iosTakeScreenshot")
  disconnect()
})

onMounted(() => {
  const canvas = canvasRef.value
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    // 复用android action
    sendTouch(AndroidMotionEventAction.Down, e)
  })
  canvas.addEventListener("pointermove", (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.buttons === 1) {
      // 复用android action
      sendTouch(AndroidMotionEventAction.Move, e)
    }
  })
  canvas.addEventListener("pointerup", (e) => {
    e.preventDefault()
    e.stopPropagation()
    // 复用android action
    sendTouch(AndroidMotionEventAction.Up, e)
  })
  canvas.addEventListener("pointerleave", (e) => {
    e.preventDefault()
    e.stopPropagation()
    // 复用android action
    sendTouch(AndroidMotionEventAction.Up, e)
  })
})

const sendTouch = (action, e) => {
  if (!ws) return
  const { x, y, width, height } = clientPositionToDevicePosition(e.clientX, e.clientY)
  ws.send(
    JSON.stringify({
      timestamp: new Date().getTime(),
      command: "WDA_TOUCH",
      data: {
        action,
        x,
        y,
        width,
        height
      }
    })
  )
}

const clientPositionToDevicePosition = (clientX: number, clientY: number) => {
  const rect = canvasRef.value.getBoundingClientRect()

  const screenOrientationChanged =
    (rect.width / rect.height < 1 && logicalWidth / logicalHeight > 1) ||
    (rect.width / rect.height > 1 && logicalWidth / logicalHeight < 1)
  if (screenOrientationChanged) {
    // 横竖屏切换了，交换宽高
    const width = logicalWidth
    logicalWidth = logicalHeight
    logicalHeight = width
  }

  const x = ((clientX - rect.x) / rect.width) * logicalWidth
  const y = ((clientY - rect.y) / rect.height) * logicalHeight

  return { x, y, width: logicalWidth, height: logicalHeight }
}

const sendButton = (name) => {
  if (!ws) return
  ws.send(
    JSON.stringify({
      command: "WDA_PRESS_BUTTON",
      data: name
    })
  )
}

const screenshotFromCanvas = (download: boolean) => {
  const imgBase64 = canvasRef.value.toDataURL("image/png")
  if (download) {
    const link = document.createElement("a")
    link.href = imgBase64
    link.download = "screenshot.png"
    link.click()
  }
  return imgBase64
}
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1 overflow-auto flex justify-center items-center">
      <canvas ref="canvasRef" class="max-h-100% max-w-100%" />
    </div>
    <div class="w-8 flex flex-col justify-center items-center">
      <div>
        <el-button text :icon="SwitchButton" @click="sendButton('power')" />
      </div>
      <div>
        <el-button text @click="sendButton('volumeup')">
          <svg-icon name="volume-up" />
        </el-button>
      </div>
      <div>
        <el-button text @click="sendButton('volumedown')">
          <svg-icon name="volume-down" />
        </el-button>
      </div>
      <div>
        <el-popover trigger="click" :hide-after="0" placement="right" width="50%" popper-style="height: 80%">
          <!-- 考虑到这个组件后续可能会迁移到别的地方，所以不用父子组件通信方式传递数据 -->
          <Inspector :is-android="false" />
          <template #reference>
            <el-button text :icon="Search" />
          </template>
        </el-popover>
      </div>
      <div>
        <el-button text :icon="Scissor" @click="screenshotFromCanvas(true)" />
      </div>
      <div>
        <el-popover trigger="click" :hide-after="0" placement="right" width="30%">
          <InstallApp />
          <template #reference>
            <el-button text :icon="UploadFilled" />
          </template>
        </el-popover>
      </div>
      <div>
        <el-button text @click="sendButton('home')">
          <svg-icon name="circle" />
        </el-button>
      </div>
    </div>
  </div>
</template>
