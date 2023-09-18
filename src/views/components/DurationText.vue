<script lang="ts" setup>
import { formatDateTime, formatMillis } from "@/utils/date"
defineProps({
  duration: Array // [start, end]
})
</script>

<template v-if="duration?.length === 2">
  {{ formatDateTime(duration[0]) }}
  <el-tag type="info">{{ formatMillis(duration[1] - duration[0]) }}</el-tag>
</template>

<style lang="scss" scoped></style>
