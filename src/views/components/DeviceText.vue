<script lang="ts" setup>
import { devicePlatformList, deviceTypeList, deviceStatusList } from "@/data/console-data"
defineProps({
  device: Object,
  showStatus: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <template v-if="device">
    <!-- ws-nowrap overflow-hidden text-ellipsis 超出一行，超出部分显示... -->
    <div class="font-bold ws-nowrap overflow-hidden text-ellipsis">
      <svg-icon
        :color="deviceTypeList.find((type) => type.value === device.type)?.color"
        :name="devicePlatformList.find((platform) => platform.value === device.platform)?.icon"
      />
      <span class="mx-1"> {{ device.brand }} </span>
      <span> {{ device.model }} </span>
      <span> ({{ device.id }}) </span>
    </div>
    <div>
      <span> {{ devicePlatformList.find((platform) => platform.value === device.platform)?.label }} </span>
      <span> {{ device.systemVersion }} </span>
      <span class="mx-1"> {{ `${device.screenHeight}x${device.screenWidth}` }} </span>
      <el-tag
        v-if="showStatus"
        size="small"
        :type="deviceStatusList.find((status) => status.value === device.status)?.type"
      >
        {{ deviceStatusList.find((status) => status.value === device.status)?.label }}
      </el-tag>
    </div>
  </template>
</template>

<style lang="scss" scoped></style>
