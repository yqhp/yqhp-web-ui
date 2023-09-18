<script lang="ts" setup>
import { executionStatusList } from "@/data/console-data"

defineProps({
  status: Number
})
</script>

<template>
  <el-tag :type="executionStatusList.find((_status) => _status.value === status)?.type">
    {{ executionStatusList.find((_status) => _status.value === status)?.label }}
  </el-tag>
</template>

<style lang="scss" scoped></style>
