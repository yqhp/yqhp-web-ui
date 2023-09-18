<script lang="ts" setup>
import { ref, nextTick, onUnmounted } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import { SwitchButton, Delete, Bottom } from "@element-plus/icons-vue"
import { getAppiumLogWsUrl } from "@/api/agent/device"
import { ElMessage } from "element-plus"

const deviceStore = useDeviceStore()

const logRef = ref()
const logs = ref([])
const autoScrollToEnd = ref(true)
let ws
const wsOpened = ref(false)

const handleReceiveLog = () => {
  if (!deviceStore.device) {
    ElMessage.warning("设备未连接")
    return
  }
  if (wsOpened.value) {
    ws.close()
  } else {
    ws = new WebSocket(getAppiumLogWsUrl(deviceStore.device.token, deviceStore.device.location))
    ws.onopen = () => {
      console.log("appium log ws onopen")
      wsOpened.value = true
    }
    ws.onclose = () => {
      console.log("appium log ws onclose")
      wsOpened.value = false
    }
    ws.onmessage = (event) => {
      const data = event.data
      if (data === "pong") {
        return
      }
      const logList = logs.value
      logList.push(data)
      if (logList.length > 1000) {
        logList.splice(0, 1)
      }
      nextTick(() => {
        if (autoScrollToEnd.value) {
          logRef.value.scrollTop = logRef.value.scrollHeight
        }
      })
    }
  }
}

const clearLogs = () => {
  logs.value = []
}

onUnmounted(() => {
  console.log("appium log onUnmounted")
  if (wsOpened.value) {
    ws.close()
  }
})
</script>
<template>
  <div class="h-full flex">
    <div ref="logRef" class="flex-1 overflow-auto text-12px">
      <div v-for="(log, index) in logs" :key="index" class="ws-pre">
        {{ log }}
      </div>
    </div>
    <div class="w-5 flex flex-col">
      <div class="text-center" title="清除日志">
        <el-icon class="cursor-pointer" @click="clearLogs"><Delete /></el-icon>
      </div>
      <div class="text-center" :title="autoScrollToEnd ? '取消自动滚动到底部' : '自动滚动到底部'">
        <el-icon
          @click="autoScrollToEnd = !autoScrollToEnd"
          class="cursor-pointer"
          :class="autoScrollToEnd ? 'bg-blue-300' : ''"
        >
          <Bottom />
        </el-icon>
      </div>
      <div class="text-center" :title="wsOpened ? '关闭日志' : '打开日志'">
        <el-icon :color="wsOpened ? 'red' : ''" @click="handleReceiveLog" class="cursor-pointer">
          <SwitchButton />
        </el-icon>
      </div>
    </div>
  </div>
</template>
