<script lang="ts" setup>
import { ref } from "vue"
import DeviceText from "@/views/components/DeviceText.vue"
import AndroidScreenCopy from "./components/AndroidScreenCopy/index.vue"
import IosScreenCopy from "./components/IosScreenCopy/index.vue"
import { lockDevice } from "@/api/agent/device"
import { register } from "@/api/agent/agent"
import { DevicePlatform } from "@/data/console-data"
import { ElMessageBox } from "element-plus"
import { Close } from "@element-plus/icons-vue"
import { useDeviceStore } from "@/store/modules/device"
import { useAgentStore } from "@/store/modules/agent"
import DeviceList from "./components/DeviceList/index.vue"
import AgentList from "./components/AgentList/index.vue"

const deviceStore = useDeviceStore()
const agentStore = useAgentStore()

const agentVisible = ref(false)

const androidScreenRef = ref()
const androidScreenVisible = ref(false)
const iosScreenRef = ref()
const iosScreenVisible = ref(false)
let closeBtnClicked = false

const closeScreen = () => {
  closeBtnClicked = true
  if (androidScreenVisible.value) {
    androidScreenRef.value.disconnect()
  } else if (iosScreenVisible.value) {
    iosScreenRef.value.disconnect()
  }
}

const onScreenClosed = () => {
  if (!closeBtnClicked) {
    // 非主动关闭，弹窗提示连接断开
    ElMessageBox.alert("设备连接中断", "提示")
  }
  deviceStore.setDevice(undefined)
  if (androidScreenVisible.value) {
    androidScreenVisible.value = false
  } else if (iosScreenVisible.value) {
    iosScreenVisible.value = false
  }
  closeBtnClicked = false
}

const devicePlay = async (row) => {
  const token = await lockDevice(row.id, row.location)
  deviceListRef.value.close()
  deviceStore.setDevice({
    ...row,
    token
  })
  if (row.platform === DevicePlatform.Android) {
    androidScreenVisible.value = true
    androidScreenRef.value.connect()
  } else if (row.platform === DevicePlatform.iOS) {
    iosScreenVisible.value = true
    iosScreenRef.value.connect()
  }
}

const deviceListRef = ref()
const openDeviceList = () => {
  deviceListRef.value.open()
}

const agentDebug = async (row) => {
  const token = await register(row.location, row.runMode)
  agentListRef.value.close()
  agentStore.setAgent({
    ...row,
    token
  })
  agentVisible.value = true
}

const closeAgentDebug = () => {
  agentStore.setAgent(undefined)
  agentVisible.value = false
}

const agentListRef = ref()
const openAgentList = () => {
  agentListRef.value.open()
}
</script>

<template>
  <div class="h-full">
    <div
      v-show="!(androidScreenVisible || iosScreenVisible || agentVisible)"
      class="h-full flex items-center justify-center"
    >
      <el-button @click="openDeviceList" type="primary">设备调试</el-button>
      <el-button @click="openAgentList" type="primary">Agent调试</el-button>
    </div>
    <div v-show="androidScreenVisible || iosScreenVisible" class="h-full flex flex-col">
      <div class="flex justify-between items-center h-9 px-1">
        <div class="text-12px max-w-80%">
          <device-text :device="deviceStore.device" :show-status="false" />
        </div>
        <div>
          <el-button :icon="Close" circle size="small" @click="closeScreen" />
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <android-screen-copy v-show="androidScreenVisible" ref="androidScreenRef" @closed="onScreenClosed" />
        <ios-screen-copy v-show="iosScreenVisible" ref="iosScreenRef" @closed="onScreenClosed" />
      </div>
    </div>
    <div v-show="agentVisible" class="h-full flex items-center justify-center">
      <el-button type="danger" @click="closeAgentDebug">关闭调试</el-button>
    </div>
  </div>
  <device-list ref="deviceListRef" @play="devicePlay" />
  <agent-list ref="agentListRef" @debug="agentDebug" />
</template>

<style lang="scss" scoped></style>
