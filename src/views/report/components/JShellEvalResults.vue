<script lang="ts" setup>
import { formatTime, formatMillis } from "@/utils/date"
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue"

defineProps({
  data: Array,
  default: () => []
})
</script>

<template>
  <div class="h-full w-full overflow-auto">
    <div class="flex" v-for="(result, idx) in data" :key="idx">
      <div>
        <el-icon v-if="result.failed" color="red" size="small"><CircleCloseFilled /></el-icon>
        <el-icon v-else color="green" size="small"><SuccessFilled /></el-icon>
      </div>
      <div class="mx-1 ws-pre">
        <el-text size="small">{{ formatTime(result.evalStart) }}</el-text>
      </div>
      <div class="ws-pre">
        <el-text size="small">{{ formatMillis(result.evalEnd - result.evalStart) }}</el-text>
      </div>
      <div class="ml-1" v-if="result.snippetRecords?.length">
        <div v-for="(snippet, idx) in result.snippetRecords" :key="idx" class="flex">
          <div class="ws-pre">
            <el-text size="small"> [{{ `#${snippet.id}-${snippet.status.toLowerCase()}` }}] </el-text>
          </div>
          <div class="mx-1 ws-pre">
            <el-text size="small">{{ snippet.source }}</el-text>
          </div>
          <div v-if="snippet.value" class="ws-pre">
            <el-text size="small"> ==> {{ snippet.value.replace(/\\n/g, "\n") }}</el-text>
          </div>
          <!-- 异常信息 -->
          <div v-if="snippet.exceptionMessage" class="ws-pre">
            <el-text size="small" type="danger">{{ snippet.exceptionMessage }}</el-text>
          </div>
          <!-- 诊断信息 设置了font-mono才能保证诊断^^不偏移 -->
          <div v-if="snippet.diagnostics?.length" class="ws-pre font-mono">
            <el-text size="small" type="danger">{{ snippet.diagnostics.join("\n") }}</el-text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
