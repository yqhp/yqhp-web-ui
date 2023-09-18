<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { getPagingPlugins, deletePlugin } from "@/api/console/plugin"
import { ElMessageBox } from "element-plus"
import { CirclePlus } from "@element-plus/icons-vue"
import SavePlugin from "./components/SavePlugin.vue"
import SavePluginFile from "./components/SavePluginFile.vue"
import { formatDateTime } from "@/utils/date"

const savePluginRef = ref()
const savePluginFileRef = ref()

const loading = ref<boolean>(false)
const tableData = reactive({
  records: [],
  total: 0
})

const searchFormRef = ref()
const searchParam = reactive({
  keyword: "",
  pageNumb: 1,
  pageSize: 10
})

const handlePluginFile = (row) => {
  savePluginFileRef.value.open(row)
}

const handleUpdate = (row) => {
  savePluginRef.value.open(false, row)
}

const handleCreate = () => {
  savePluginRef.value.open(true)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除${row.name}`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    await deletePlugin(row.id)
    getTableData()
  })
}

const getTableData = async () => {
  loading.value = true
  const res = await getPagingPlugins(searchParam).finally(() => {
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

const onPluginCreated = (plugin) => {
  handlePluginFile(plugin)
}

onMounted(() => {
  getTableData()
})
</script>

<template>
  <div class="h-full p-5 flex flex-col" v-loading="loading">
    <div>
      <!-- 当只有一个input时，需要加上@submit.prevent，否则回车会刷新页面 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchParam" @keyup.enter="handleSearch" @submit.prevent>
        <el-form-item prop="keyword" label="">
          <el-input v-model="searchParam.keyword" placeholder="id/名称/描述 模糊查询" style="width: 400px" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="mb-1">
      <el-button type="primary" :icon="CirclePlus" @click="handleCreate">新增插件</el-button>
    </div>
    <div class="flex-1 overflow-hidden">
      <el-table height="100%" :data="tableData.records">
        <el-table-column prop="id" label="id" show-overflow-tooltip />
        <el-table-column prop="name" label="名称" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" text bg size="small" @click="handleUpdate(row)">编辑</el-button>
            <el-button type="primary" text bg size="small" @click="handlePluginFile(row)">文件管理</el-button>
            <el-button type="danger" text bg size="small" @click="handleDelete(row)">删除</el-button>
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
    <save-plugin ref="savePluginRef" @ok="getTableData" @created="onPluginCreated" />
    <save-plugin-file ref="savePluginFileRef" />
  </div>
</template>
