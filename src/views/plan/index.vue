<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { getPagingPlans, deletePlanById, execPlanById } from "@/api/console/plan"
import { ElMessage, ElMessageBox, ElLoading } from "element-plus"
import { CirclePlus, CaretRight, Delete, Edit, Suitcase } from "@element-plus/icons-vue"
import SavePlan from "./components/SavePlan.vue"
import DeviceAndDoc from "./components/DeviceAndDoc.vue"
import { useProjectStore } from "@/store/modules/project"
import { planRunModeList } from "@/data/console-data"
import { formatDateTime } from "@/utils/date"
import { useRouter } from "vue-router"

const router = useRouter()

defineOptions({
  name: "Plan"
})

const projectStore = useProjectStore()

const savePlanRef = ref()
const deviceAndDocRef = ref()
const loading = ref<boolean>(false)
const tableData = reactive({
  records: [],
  total: 0
})

const searchFormRef = ref()
const searchParam = reactive({
  projectId: projectStore.projectId,
  runMode: undefined,
  keyword: "",
  pageNumb: 1,
  pageSize: 10
})

const handleUpdate = (row) => {
  savePlanRef.value.open(false, row)
}

const handleCreate = () => {
  savePlanRef.value.open(true, {
    projectId: projectStore.projectId
  })
}

const openDeviceAndDoc = (row) => {
  deviceAndDocRef.value.open(row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除${row.name}`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    await deletePlanById(row.id)
    getTableData()
  })
}

const getTableData = async () => {
  loading.value = true
  const res = await getPagingPlans(searchParam).finally(() => {
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

const execPlan = async (row) => {
  const submitLoading = ElLoading.service({
    lock: true,
    text: "提交中...",
    background: "rgba(0, 0, 0, 0.7)"
  })
  await execPlanById(row.id).finally(() => submitLoading.close())
  ElMessage.success("提交成功")
  router.push({ name: "ExecutionRecord" })
}

onMounted(() => {
  getTableData()
})
</script>

<template>
  <div class="h-full p-5 flex flex-col" v-loading="loading">
    <div>
      <el-form ref="searchFormRef" :inline="true" :model="searchParam" @keyup.enter="handleSearch">
        <el-form-item prop="keyword">
          <el-input v-model="searchParam.keyword" placeholder="id/名称 模糊查询" style="width: 400px" clearable />
        </el-form-item>
        <el-form-item prop="runMode" label="运行模式">
          <el-select v-model="searchParam.runMode" clearable>
            <el-option
              v-for="runMode in planRunModeList"
              :key="runMode.value"
              :label="runMode.label"
              :value="runMode.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="mb-1">
      <el-button type="primary" :icon="CirclePlus" @click="handleCreate">新增计划</el-button>
    </div>
    <div class="flex-1 overflow-hidden">
      <el-table height="100%" :data="tableData.records">
        <el-table-column prop="id" label="id" show-overflow-tooltip />
        <el-table-column prop="name" label="名称" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="runMode" label="运行模式" show-overflow-tooltip>
          <template #default="{ row }">
            {{ planRunModeList.find((mode) => mode.value === row.runMode)?.label }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="{ row }">
            <el-tooltip effect="dark" content="提交执行" placement="top">
              <el-button size="small" @click="execPlan(row)" :icon="CaretRight" circle />
            </el-tooltip>
            <el-button size="small" @click="handleUpdate(row)" :icon="Edit" circle />
            <el-button size="small" @click="openDeviceAndDoc(row)" :icon="Suitcase" circle />
            <el-button size="small" @click="handleDelete(row)" :icon="Delete" circle />
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

    <save-plan ref="savePlanRef" @ok="getTableData" @created="openDeviceAndDoc" />
    <device-and-doc ref="deviceAndDocRef" />
  </div>
</template>
