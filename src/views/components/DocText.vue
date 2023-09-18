<script lang="ts" setup>
import { docKindList, docStatusList } from "@/data/console-data"

defineProps({
  doc: Object
})
</script>

<template>
  <template v-if="doc">
    <svg-icon
      :color="docStatusList.find((status) => status.value === doc.status)?.color"
      :name="docStatusList.find((status) => status.value === doc.status)?.icon"
    />
    <svg-icon :name="docKindList.find((kind) => kind.value === doc.kind)?.icon" />
    {{ doc.name }}
  </template>
  <el-text v-else tag="del">Unknown Doc</el-text>
</template>

<style lang="scss" scoped></style>
