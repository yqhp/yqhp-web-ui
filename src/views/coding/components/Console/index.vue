<script lang="ts" setup>
import { ref } from "vue"
import JShellExecutionLog from "./components/JShellExecutionLog.vue"
import AppiumLog from "./components/AppiumLog.vue"
import PluginTree from "./components/PluginTree.vue"
import { useDeviceStore } from "@/store/modules/device"

const deviceStore = useDeviceStore()
const activeName = ref("jshell")
</script>
<template>
  <el-tabs v-model="activeName" class="h-full flex flex-col">
    <el-tab-pane label="JShell" name="jshell">
      <JShellExecutionLog />
    </el-tab-pane>
    <el-tab-pane label="Plugin" name="plugin">
      <PluginTree />
    </el-tab-pane>
    <el-tab-pane label="Appium Log" name="appium" v-if="deviceStore.device">
      <AppiumLog />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__header) {
  margin: 0 0 2px;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  .el-tab-pane {
    height: 100%;
  }
}
</style>
