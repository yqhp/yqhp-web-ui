<script lang="ts" setup>
import { emitter } from "@/utils/mitt"
import { ref, nextTick, onUnmounted } from "vue"
import { formatTime, formatMillis } from "@/utils/date"
import { Delete, Bottom, Top } from "@element-plus/icons-vue"
import { formatBytes } from "@/utils/fileSize"

const logs = ref([])
const autoScrollToEnd = ref(true)
const logRef = ref()

emitter.on("JSHELL_EXECUTION", (data) => {
  const logList = logs.value
  logList.push(data)
  if (logList.length > 500) {
    logList.splice(0, 1)
  }
  nextTick(() => {
    if (autoScrollToEnd.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  })
})

const clearLogs = () => {
  logs.value = []
}

const getLogType = (tag) => (tag === "warn" ? "warning" : tag === "error" ? "danger" : "info")

onUnmounted(() => {
  console.log("jshell execution log onUnmounted")
  emitter.off("JSHELL_EXECUTION")
})
</script>
<template>
  <div class="h-full flex">
    <div ref="logRef" class="flex-1 overflow-auto text-12px">
      <template v-for="(log, index) in logs" :key="index">
        <!-- 请求 -->
        <div v-if="log.type === 'req'" class="flex">
          <div class="ws-pre">{{ formatTime(log.timestamp) }}</div>
          <div class="mx-1">
            <el-icon><Top /></el-icon>
          </div>
          <div class="mr-1 ws-pre">[{{ log.uid }}]</div>
          <div class="ws-pre">
            {{ log.command === "JSHELL_EVAL" ? log.data : "loading" }}
          </div>
        </div>
        <!-- 响应 -->
        <div v-else class="flex">
          <!-- 异常error -->
          <template v-if="log.status === 'ERROR'">
            <div class="ws-pre">{{ formatTime(log.timestamp) }}</div>
            <div class="mx-1">
              <el-icon color="red"><Bottom /></el-icon>
            </div>
            <div class="mr-1 ws-pre">[{{ log.uid }}]</div>
            <div class="ws-pre text-red">{{ log.message || "未知错误" }}</div>
          </template>
          <!-- 代码执行 -->
          <template v-else-if="log.command === 'JSHELL_EVAL'">
            <div class="ws-pre">{{ formatTime(log.data.evalEnd) }}</div>
            <div class="mx-1">
              <el-icon :color="log.data.failed ? 'red' : 'green'"><Bottom /></el-icon>
            </div>
            <div class="ws-pre">[{{ log.uid }}]</div>
            <div class="mx-1 ws-pre">{{ formatMillis(log.data.evalEnd - log.data.evalStart) }}</div>
            <div v-if="log.data.snippetRecords?.length">
              <div v-for="(snippet, idx) in log.data.snippetRecords" :key="idx" class="flex">
                <div class="ws-pre">[{{ `#${snippet.id}-${snippet.status.toLowerCase()}` }}]</div>
                <div class="mx-1 ws-pre">
                  {{ snippet.source }}
                </div>
                <div v-if="snippet.value" class="ws-pre">==> {{ snippet.value.replace(/\\n/g, "\n") }}</div>
                <!-- 异常信息 -->
                <div v-if="snippet.exceptionMessage" class="text-red ws-pre">
                  {{ snippet.exceptionMessage }}
                </div>
                <!-- 诊断信息 设置了font-mono才能保证诊断^^不偏移 -->
                <div v-if="snippet.diagnostics?.length" class="text-red ws-pre font-mono">
                  {{ snippet.diagnostics.join("\n") }}
                </div>
              </div>
            </div>
          </template>
          <!-- 插件加载 v-if已处理error -->
          <template v-else-if="log.command === 'JSHELL_LOAD_PLUGIN'">
            <div class="ws-pre">{{ formatTime(log.timestamp) }}</div>
            <div class="mx-1">
              <el-icon color="green"><Bottom /></el-icon>
            </div>
            <div class="mr-1 ws-pre">[{{ log.uid }}]</div>
            <div class="ws-pre">{{ log.message }}</div>
          </template>
          <!-- log.info log.warn log.error... -->
          <template v-else>
            <div class="ws-pre">{{ formatTime(log.timestamp) }}</div>
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
          </template>
        </div>
      </template>
    </div>
    <div class="w-5 flex flex-col">
      <div class="text-center" title="清除日志">
        <el-icon class="cursor-pointer" @click="clearLogs"><Delete /></el-icon>
      </div>
      <div class="text-center" :title="autoScrollToEnd ? '取消自动滚动到底部' : '自动滚动到底部'">
        <el-icon
          @click="autoScrollToEnd = !autoScrollToEnd"
          class="cursor-pointer"
          :class="autoScrollToEnd ? 'bg-blue-300' : ''"
        >
          <Bottom />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
