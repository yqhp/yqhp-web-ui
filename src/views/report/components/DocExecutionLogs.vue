<script lang="ts" setup>
import { formatTime } from "@/utils/date"
import { formatBytes } from "@/utils/fileSize"

defineProps({
  data: Array,
  default: () => []
})

const getType = (tag) => (tag === "warn" ? "warning" : tag === "error" ? "danger" : "info")
</script>

<template>
  <div class="h-full w-full overflow-auto">
    <div class="flex" v-for="(log, idx) in data" :key="idx">
      <div class="ws-pre">
        <el-text size="small" type="info">{{ formatTime(log.timestamp) }}</el-text>
      </div>
      <div class="mx-1 ws-pre">
        <el-text size="small" :type="getType(log.tag)">[{{ log.tag }}]</el-text>
      </div>
      <div v-if="log.tag === 'screenshot'" class="ws-pre">
        <el-text size="small" type="info" class="block">
          {{ JSON.parse(log.value).info }} {{ formatBytes(JSON.parse(log.value).file.size) }}
        </el-text>
        <el-image
          class="w-60"
          :src="JSON.parse(log.value).file.url"
          :preview-src-list="[JSON.parse(log.value).file.url]"
        />
      </div>
      <div v-else class="ws-pre">
        <el-text size="small" :type="getType(log.tag)">{{ log.value }}</el-text>
      </div>
    </div>
  </div>
</template>
