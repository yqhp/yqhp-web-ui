<script lang="ts" setup>
import { docKindList, docStatusList } from "@/data/console-data"

defineProps({
  doc: Object
})
</script>

<template>
  <el-text v-if="doc" truncated>
    <svg-icon
      :color="docStatusList.find((status) => status.value === doc.status)?.color"
      :name="docStatusList.find((status) => status.value === doc.status)?.icon"
    />
    <svg-icon :name="docKindList.find((kind) => kind.value === doc.kind)?.icon" />
    {{ doc.name }}
  </el-text>
  <el-text v-else tag="del">Doc Deleted</el-text>
</template>

<style lang="scss" scoped></style>
