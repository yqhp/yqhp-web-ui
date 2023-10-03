<script lang="ts" setup>
import { formatTime } from "@/utils/date"
import { formatBytes } from "@/utils/fileSize"

defineProps({
  data: Array,
  default: () => []
})

const getLogType = (tag) => (tag === "warn" ? "warning" : tag === "error" ? "danger" : "info")
</script>

<template>
  <div class="h-full w-full overflow-auto">
    <div class="flex" v-for="(log, idx) in data" :key="idx">
      <div class="ws-pre">
        <el-text size="small" type="info">{{ formatTime(log.timestamp) }}</el-text>
      </div>
      <div class="mx-1 ws-pre">
        <el-text size="small" :type="getLogType(log.tag)">[{{ log.tag }}]</el-text>
      </div>
      <div v-if="log.tag === 'screenshot'">
        <el-text size="small" type="info" class="block ws-pre">
          {{ JSON.parse(log.value).info }} {{ formatBytes(JSON.parse(log.value).file.size) }}
        </el-text>
        <el-image
          class="w-60"
          :src="JSON.parse(log.value).file.url"
          :preview-src-list="[JSON.parse(log.value).file.url]"
        />
      </div>
      <div v-else-if="log.tag === 'video'">
        <el-text size="small" type="info" class="block ws-pre">
          {{ JSON.parse(log.value).info }} {{ formatBytes(JSON.parse(log.value).file.size) }}
        </el-text>
        <video class="w-60" controls :src="JSON.parse(log.value).file.url" />
      </div>
      <div v-else>
        <el-text size="small" :type="getLogType(log.tag)" class="ws-pre">{{ log.value }}</el-text>
      </div>
    </div>
  </div>
</template>
