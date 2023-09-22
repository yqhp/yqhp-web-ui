<script lang="ts" setup>
import { ref } from "vue"
import DurationText from "@/views/components/DurationText.vue"
import PluginText from "@/views/components/PluginText.vue"
import ExecutionStatusText from "@/views/components/ExecutionStatusText.vue"
import DocText from "@/views/components/DocText.vue"
import JShellEvalResults from "./JShellEvalResults.vue"
import DocExecutionLogs from "./DocExecutionLogs.vue"

defineProps({
  data: Object,
  default: () => {}
})

const detailsVisible = ref(false)
const results = ref([])
const logs = ref([])

const showDetails = (row) => {
  results.value = row.results
  logs.value = row.logs
  detailsVisible.value = true
}
</script>

<template>
  <el-card v-if="data.pluginExecutionResult?.records?.length" header="插件执行记录">
    <el-table :data="data.pluginExecutionResult.records">
      <el-table-column label="插件">
        <template #default="{ row }">
          <PluginText :name="row.plugin.name" />
        </template>
      </el-table-column>
      <el-table-column label="执行时间">
        <template #default="{ row }">
          <DurationText :duration="[row.startTime, row.endTime]" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <ExecutionStatusText :status="row.status" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-card v-if="data.docExecutionResult?.records" header="Doc执行记录" class="mt-2">
    <el-table :data="data.docExecutionResult.records">
      <el-table-column label="Doc">
        <template #default="{ row }">
          <DocText :doc="row.doc" />
        </template>
      </el-table-column>
      <el-table-column label="执行时间">
        <template #default="{ row }">
          <DurationText :duration="[row.startTime, row.endTime]" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <ExecutionStatusText :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="primary" bg text size="small" @click="showDetails(row)"> 详情 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-drawer v-model="detailsVisible" size="90%" :with-header="false">
    <div class="h-full w-full flex">
      <JShellEvalResults v-if="results?.length" :data="results" />
      <DocExecutionLogs v-if="logs?.length" :data="logs" />
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped></style>
