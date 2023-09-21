<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue"
import { useRoute } from "vue-router"
import { getReportById, deleteDeviceExecutionRecord } from "@/api/console/executionRecord"
import { formatDateTime } from "@/utils/date"
import DurationText from "@/views/components/DurationText.vue"
import DeviceText from "@/views/components/DeviceText.vue"
import ExecutionStatusText from "@/views/components/ExecutionStatusText.vue"
import ActionPassRateText from "@/views/components/ActionPassRateText.vue"
import ExecutionDetails from "./components/ExecutionDetails.vue"
import { PlanRunMode } from "@/data/console-data"

const route = useRoute()
const executionRecordId = route.params.id

const summary = reactive({
  projectName: "",
  planName: "",
  creator: "",
  createTime: "",
  startTime: 0,
  endTime: 0,
  actionTotalCount: 0,
  actionPassCount: 0,
  actionFailureCount: 0,
  actionSkipCount: 0,
  actionPassRate: "",
  status: 0
})
const isDeviceMode = ref(false)
const report = ref({})
const fetchReport = async () => {
  const _report = await getReportById(executionRecordId)
  report.value = _report
  const deviceMode = _report.plan.runMode === PlanRunMode.Efficient || _report.plan.runMode === PlanRunMode.Compatible
  isDeviceMode.value = deviceMode

  summary.projectName = _report.project.name
  summary.planName = _report.plan.name
  summary.creator = _report.creator
  summary.createTime = _report.createTime
  summary.startTime = deviceMode ? _report.devicesResult.startTime : _report.result.startTime
  summary.endTime = deviceMode ? _report.devicesResult.endTime : _report.result.endTime
  summary.actionTotalCount = deviceMode
    ? _report.devicesResult.totalCount
    : _report.result.docExecutionResult.totalCount
  summary.actionPassCount = deviceMode ? _report.devicesResult.passCount : _report.result.docExecutionResult.passCount
  summary.actionFailureCount = deviceMode
    ? _report.devicesResult.failureCount
    : _report.result.docExecutionResult.failureCount
  summary.actionSkipCount = deviceMode ? _report.devicesResult.skipCount : _report.result.docExecutionResult.skipCount
  summary.actionPassRate = deviceMode ? _report.devicesResult.passRate : _report.result.docExecutionResult.passRate
  summary.status = deviceMode ? _report.devicesResult.status : _report.result.status
}

onMounted(() => {
  fetchReport()
})

const deviceExecutionDetailsVisible = ref(false)
const deviceExecutionResult = ref({})

const showDeviceExecutionDetails = (row) => {
  deviceExecutionResult.value = row
  deviceExecutionDetailsVisible.value = true
}

const handleDeleteDeviceRecord = async (row) => {
  await deleteDeviceExecutionRecord(executionRecordId, row.deviceId)
  fetchReport()
}
</script>

<template>
  <div class="app-container">
    <div>
      <el-card header="概况">
        <el-descriptions :column="5" size="small">
          <el-descriptions-item label="项目">{{ summary.projectName }}</el-descriptions-item>
          <el-descriptions-item label="计划">{{ summary.planName }}</el-descriptions-item>
          <el-descriptions-item label="执行人">{{ summary.creator }}</el-descriptions-item>
          <el-descriptions-item label="执行时间">
            <DurationText :duration="[summary.startTime, summary.endTime]" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(summary.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="Action通过数">
            <el-text type="success">{{ summary.actionPassCount }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="Action失败数">
            <el-text type="danger">{{ summary.actionFailureCount }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="Action跳过数">
            <el-text type="warning">{{ summary.actionSkipCount }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="Action通过率">
            <ActionPassRateText :pass-rate="summary.actionPassRate" />
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <ExecutionStatusText :status="summary.status" />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    <div class="mt-2" v-if="!isDeviceMode">
      <ExecutionDetails :data="report.result || {}" />
    </div>
    <div class="mt-2" v-else>
      <el-card header="设备执行记录">
        <el-table :data="report.devicesResult?.deviceExecutionResults || []" size="small">
          <el-table-column label="设备">
            <template #default="{ row }">
              <DeviceText :device="report.devices[row.deviceId]" :show-status="false" />
            </template>
          </el-table-column>
          <el-table-column label="执行时间">
            <template #default="{ row }">
              <DurationText :duration="[row.startTime, row.endTime]" />
            </template>
          </el-table-column>
          <el-table-column label="Action通过数" width="100">
            <template #default="{ row }">
              <el-text type="success">{{ row.docExecutionResult.passCount }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="Action失败数" width="100">
            <template #default="{ row }">
              <el-text type="danger">{{ row.docExecutionResult.failureCount }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="Action跳过数" width="100">
            <template #default="{ row }">
              <el-text type="warning">{{ row.docExecutionResult.skipCount }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="Action通过率" width="100">
            <template #default="{ row }">
              <ActionPassRateText :pass-rate="row.docExecutionResult.passRate" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <ExecutionStatusText :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" bg text size="small" @click="showDeviceExecutionDetails(row)">详情</el-button>
              <el-popconfirm title="确认删除" @confirm="handleDeleteDeviceRecord(row)">
                <template #reference>
                  <el-button type="primary" bg text size="small"> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
  <el-drawer v-if="isDeviceMode" v-model="deviceExecutionDetailsVisible" size="80%" :with-header="false">
    <ExecutionDetails :data="deviceExecutionResult" />
  </el-drawer>
</template>

<style lang="scss" scoped></style>
