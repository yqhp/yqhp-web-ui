<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { getPagingExecutionRecord, deleteExecutionRecord } from "@/api/console/executionRecord"
import { listPlanByProjectId } from "@/api/console/plan"
import { useProjectStore } from "@/store/modules/project"
import { executionStatusList } from "@/data/console-data"
import { formatDateTime } from "@/utils/date"
import { useRouter } from "vue-router"
import ExecutionStatusText from "@/views/components/ExecutionStatusText.vue"
import DurationText from "@/views/components/DurationText.vue"

defineOptions({
  name: "ExecutionRecord"
})

const router = useRouter()
const projectStore = useProjectStore()

const loading = ref<boolean>(false)
const tableData = reactive({
  records: [],
  total: 0
})

const searchFormRef = ref()
const searchParam = reactive({
  projectId: projectStore.projectId,
  planIds: [],
  startSince: undefined,
  endUntil: undefined,
  status: undefined,
  pageNumb: 1,
  pageSize: 10
})

const getTableData = async () => {
  loading.value = true
  if (searchParam.status === "") searchParam.status = undefined
  const res = await getPagingExecutionRecord(searchParam).finally(() => {
    loading.value = false
  })
  tableData.records = res.records
  tableData.total = res.total
}

const handleSearch = () => {
  searchParam.pageNumb = 1
  getTableData()
}

const resetSearch = () => {
  searchFormRef.value.resetFields()
  searchParam.pageNumb = 1
  getTableData()
}

const onPageSizeChange = (val: number) => {
  searchParam.pageSize = val
  getTableData()
}

const onCurrentPageChange = (val: number) => {
  searchParam.pageNumb = val
  getTableData()
}

const plans = ref([])

const fetchPlans = async () => {
  plans.value = await listPlanByProjectId(searchParam.projectId)
}

const openReport = (row) => {
  const url = router.resolve({
    path: `/report/${row.id}`
  })
  window.open(url.href, "_blank")
}

const handleDelete = async (row) => {
  await deleteExecutionRecord(row.id)
  getTableData()
}

onMounted(() => {
  fetchPlans()
  getTableData()
})
</script>

<template>
  <div class="h-full p-5 flex flex-col" v-loading="loading">
    <div>
      <el-form ref="searchFormRef" :inline="true" :model="searchParam">
        <el-form-item prop="planIds" label="计划">
          <el-select multiple v-model="searchParam.planIds" clearable>
            <el-option v-for="plan in plans" :key="plan.id" :label="plan.name" :value="plan.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-select v-model="searchParam.status" clearable>
            <el-option
              v-for="status in executionStatusList"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="flex-1 overflow-hidden">
      <el-table height="100%" :data="tableData.records">
        <el-table-column label="计划" show-overflow-tooltip>
          <template #default="{ row }">
            <ExecutionStatusText :status="row.status" />
            <el-text v-if="plans.some((plan) => plan.id === row.planId)">{{ row.plan.name }}</el-text>
            <el-text v-else tag="del">{{ row.plan.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" show-overflow-tooltip>
          <template #default="{ row }">
            <DurationText :duration="[row.startTime, row.endTime]" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" text bg size="small" @click="openReport(row)">详情</el-button>
            <el-popconfirm title="确认删除" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" bg text size="small"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="h-16 flex justify-end">
      <el-pagination
        background
        @size-change="onPageSizeChange"
        @current-change="onCurrentPageChange"
        :total="tableData.total"
        :page-sizes="[10, 20, 50]"
        :current-page="searchParam.pageNumb"
        :page-size="searchParam.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>
