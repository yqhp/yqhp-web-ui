<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import JMuxer from "jmuxer"
import { getScrcpyWsUrl } from "@/api/agent/device"
import {
  AndroidMotionEventAction,
  ScrcpyPointerId,
  AndroidKeyEventAction,
  AndroidKeyCode,
  AndroidKeyEventMeta
} from "@/data/scrcpy-data"
import { emitter } from "@/utils/mitt"
import { Search, ChromeFilled, UploadFilled, Picture, SwitchButton, Scissor } from "@element-plus/icons-vue"
import Inspector from "../Inspector/index.vue"
import BrowserList from "../BrowserList/index.vue"
import InstallApp from "../InstallApp/index.vue"
import ImageViewer from "../ImageViewer/index.vue"

const deviceStore = useDeviceStore()

const emit = defineEmits(["closed"])

let scrcpyWidth = 0
let scrcpyHeight = 0
const videoRef = ref()
let ws

const connect = () => {
  const jmuxer = new JMuxer({
    node: videoRef.value,
    mode: "video",
    flushingTime: 0,
    fps: 60,
    debug: false
  })

  ws = new WebSocket(getScrcpyWsUrl(deviceStore.device.token, deviceStore.device.location))
  ws.binaryType = "arraybuffer"
  ws.onopen = () => {
    console.log("scrcpy ws onopen")
    ws.send(
      JSON.stringify({
        command: "SCRCPY_FRAME",
        data: {
          ...deviceStore.device.extra?.scrcpyOptions,
          maxSize: 1080
        }
      })
    )
  }
  ws.onmessage = (event) => {
    const data = event.data
    if (typeof data === "object") {
      jmuxer.feed({ video: new Uint8Array(data) })
    } else {
      if (data === "pong") {
        return
      }
      console.log("scrcpy ws: ", data)
      const response = JSON.parse(data)
      if (response?.data?.width && response?.data?.height) {
        scrcpyWidth = response.data.width
        scrcpyHeight = response.data.height
      }
    }
  }
  ws.onclose = () => {
    console.log("scrcpy ws onclose")
    ws = undefined
    console.log("jmuxer destroy")
    jmuxer.destroy()
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

onMounted(() => {
  const video = videoRef.value
  video.addEventListener("pointerdown", (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    sendTouch(AndroidMotionEventAction.Down, e)
  })
  video.addEventListener("pointermove", (e) => {
    e.preventDefault()
    e.stopPropagation()
    // sendTouch(e.buttons === 0 ? AndroidMotionEventAction.HoverMove : AndroidMotionEventAction.Move, e)
    if (e.buttons === 1) {
      sendTouch(AndroidMotionEventAction.Move, e)
    }
  })
  video.addEventListener("pointerup", (e) => {
    e.preventDefault()
    e.stopPropagation()
    sendTouch(AndroidMotionEventAction.Up, e)
  })
  video.addEventListener("pointerenter", (e) => {
    e.preventDefault()
    e.stopPropagation()
    video.focus() // focus后才能监听到keydown keyup
  })
  video.addEventListener("keydown", (e) => {
    handleKeyEvent(e)
  })
  video.addEventListener("keyup", (e) => {
    handleKeyEvent(e)
  })
  video.addEventListener("pointerleave", (e) => {
    e.preventDefault()
    e.stopPropagation()
    // sendTouch(AndroidMotionEventAction.HoverExit, e)
    sendTouch(AndroidMotionEventAction.Up, e)
  })
  video.addEventListener("wheel", (e) => {
    e.preventDefault()
    e.stopPropagation()
    sendScroll(e)
  })
})

const sendScroll = (e) => {
  if (!ws) return
  const { x, y, width, height } = clientPositionToDevicePosition(e.clientX, e.clientY)
  ws.send(
    JSON.stringify({
      command: "SCRCPY_SCROLL",
      data: {
        x,
        y,
        width,
        height,
        scrollX: scrollValue(-e.deltaX / 100),
        scrollY: scrollValue(-e.deltaY / 100),
        buttons: 0
      }
    })
  )
}

const sendTouch = (action, e) => {
  if (!ws) return
  const { x, y, width, height } = clientPositionToDevicePosition(e.clientX, e.clientY)
  ws.send(
    JSON.stringify({
      command: "SCRCPY_TOUCH",
      data: {
        action,
        pointerId: e.pointerType == "mouse" ? ScrcpyPointerId.Finger : e.pointerId,
        x,
        y,
        width,
        height,
        pressure: e.pressure,
        buttons: e.buttons
      }
    })
  )
}

const handleKeyEvent = (e) => {
  e.preventDefault()
  e.stopPropagation()

  const { type, code } = e
  const androidKeyCode = AndroidKeyCode[code as keyof typeof AndroidKeyCode]
  if (androidKeyCode) {
    sendKeycode(
      type === "keydown" ? AndroidKeyEventAction.Down : AndroidKeyEventAction.Up,
      androidKeyCode,
      0,
      (e.ctrlKey ? AndroidKeyEventMeta.CtrlOn : 0) |
        (e.shiftKey ? AndroidKeyEventMeta.ShiftOn : 0) |
        (e.altKey ? AndroidKeyEventMeta.AltOn : 0) |
        (e.metaKey ? AndroidKeyEventMeta.MetaOn : 0)
    )
  }
}

const sendKeycode = (action, code, repeat = 0, metaState = 0) => {
  if (ws) {
    ws.send(
      JSON.stringify({
        command: "SCRCPY_KEY",
        data: {
          action,
          code,
          repeat,
          metaState
        }
      })
    )
  }
}

const clientPositionToDevicePosition = (clientX: number, clientY: number) => {
  const rect = videoRef.value.getBoundingClientRect()

  const screenOrientationChanged =
    (rect.width / rect.height < 1 && scrcpyWidth / scrcpyHeight > 1) ||
    (rect.width / rect.height > 1 && scrcpyWidth / scrcpyHeight < 1)
  if (screenOrientationChanged) {
    // 横竖屏切换了，交换宽高
    const width = scrcpyWidth
    scrcpyWidth = scrcpyHeight
    scrcpyHeight = width
  }

  const x = ((clientX - rect.x) / rect.width) * scrcpyWidth
  const y = ((clientY - rect.y) / rect.height) * scrcpyHeight

  return { x, y, width: scrcpyWidth, height: scrcpyHeight }
}

const scrollValue = (value) => {
  value = clamp(value, -1, 1)
  return value === 1 ? 0x7fff : value * 0x8000
}

const clamp = (value: number, min: number, max: number): number => {
  return value < min ? min : value > max ? max : value
}

const screenshotFromVideo = (download: boolean) => {
  const video = videoRef.value
  const canvas = document.createElement("canvas")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext("2d").drawImage(video, 0, 0)
  const imgBase64 = canvas.toDataURL("image/png")

  if (download) {
    const link = document.createElement("a")
    link.href = imgBase64
    link.download = "screenshot.png"
    link.click()
  }

  return imgBase64
}

emitter.on("androidTakeScreenshot", () => {
  const imgBase64 = screenshotFromVideo(false)
  emitter.emit("androidScreenshot", imgBase64)
})

onUnmounted(() => {
  console.log("android screen copy onUnmounted")
  emitter.off("androidTakeScreenshot")
  disconnect()
})
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1 overflow-auto flex justify-center items-center">
      <!-- tabindex: key事件生效 -->
      <video ref="videoRef" tabindex="0" autoplay class="max-h-100% max-w-100%" />
    </div>
    <div class="w-8 flex flex-col justify-center items-center">
      <div>
        <el-button
          text
          :icon="SwitchButton"
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.Power)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.Power)"
        />
      </div>
      <div>
        <el-button
          text
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.VolumeMute)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.VolumeMute)"
        >
          <svg-icon name="volume-mute" />
        </el-button>
      </div>
      <div>
        <el-button
          text
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.VolumeUp)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.VolumeUp)"
        >
          <svg-icon name="volume-up" />
        </el-button>
      </div>
      <div>
        <el-button
          text
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.VolumeDown)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.VolumeDown)"
        >
          <svg-icon name="volume-down" />
        </el-button>
      </div>
      <div>
        <el-popover trigger="click" :hide-after="0" placement="right" width="50%" popper-style="height: 80%">
          <!-- 考虑到这个组件后续可能会迁移到别的地方，所以不用父子组件通信方式传递数据 -->
          <Inspector :is-android="true" />
          <template #reference>
            <el-button text :icon="Search" />
          </template>
        </el-popover>
      </div>
      <div>
        <el-popover trigger="click" :hide-after="0" placement="right" width="50%" popper-style="height: 80%">
          <BrowserList />
          <template #reference>
            <el-button text :icon="ChromeFilled" />
          </template>
        </el-popover>
      </div>
      <div>
        <el-popover trigger="click" :hide-after="0" placement="right" width="50%" popper-style="height: 80%">
          <ImageViewer />
          <template #reference>
            <el-button text :icon="Picture" />
          </template>
        </el-popover>
      </div>
      <div>
        <el-button text :icon="Scissor" @click="screenshotFromVideo(true)" />
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
        <el-button
          text
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.AndroidBack)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.AndroidBack)"
        >
          <svg-icon name="play" />
        </el-button>
      </div>
      <div>
        <el-button
          text
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.AndroidHome)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.AndroidHome)"
        >
          <svg-icon name="circle" />
        </el-button>
      </div>
      <div>
        <el-button
          text
          @mousedown="sendKeycode(AndroidKeyEventAction.Down, AndroidKeyCode.AndroidAppSwitch)"
          @mouseup="sendKeycode(AndroidKeyEventAction.Up, AndroidKeyCode.AndroidAppSwitch)"
        >
          <svg-icon name="stop" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
