<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { getPagingUsers, deleteUser, changeUserStatus } from "@/api/auth/user"
import { ElMessageBox } from "element-plus"
import { CirclePlus } from "@element-plus/icons-vue"
import SaveUser from "./components/SaveUser.vue"
import ResetUserPassword from "./components/ResetUserPassword.vue"
import SaveUserRole from "./components/SaveUserRole.vue"
import SaveUserProject from "./components/SaveUserProject.vue"
import { userStatusList, UserStatus } from "@/data/console-data"
import { formatDateTime } from "@/utils/date"

const saveUserRef = ref()
const resetUserPasswordRef = ref()
const saveUserRoleRef = ref()
const saveUserProjectRef = ref()

const loading = ref<boolean>(false)
const tableData = reactive({
  records: [],
  total: 0
})

const searchFormRef = ref()
const searchParam = reactive({
  keyword: "",
  status: undefined,
  pageNumb: 1,
  pageSize: 10
})

const handleCreate = () => {
  saveUserRef.value.open(true)
}

const handleUpdate = (row) => {
  saveUserRef.value.open(false, row)
}

const handleResetPassword = (row) => {
  resetUserPasswordRef.value.open(row)
}

const handleUserRole = (row) => {
  saveUserRoleRef.value.open(row)
}

const handleUserProject = (row) => {
  saveUserProjectRef.value.open(row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除${row.username}`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    await deleteUser(row.id)
    getTableData()
  })
}

const getTableData = async () => {
  loading.value = true
  const res = await getPagingUsers(searchParam).finally(() => {
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

const beforeSwitchChange = async (row) => {
  try {
    await changeUserStatus(row.id, row.status === UserStatus.Enabled ? UserStatus.Disabled : UserStatus.Enabled)
    return true
  } catch (err) {
    return false
  }
}

onMounted(() => {
  getTableData()
})
</script>

<template>
  <div class="h-full p-5 flex flex-col" v-loading="loading">
    <div>
      <el-form ref="searchFormRef" :inline="true" :model="searchParam" @keyup.enter="handleSearch">
        <el-form-item prop="keyword" label="">
          <el-input
            v-model="searchParam.keyword"
            placeholder="用户id/用户名/昵称 模糊查询"
            style="width: 400px"
            clearable
          />
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-select v-model="searchParam.status" clearable>
            <el-option
              v-for="status in userStatusList"
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
    <div class="mb-1">
      <el-button type="primary" :icon="CirclePlus" @click="handleCreate">新增用户</el-button>
    </div>
    <div class="flex-1 overflow-hidden">
      <el-table height="100%" :data="tableData.records">
        <el-table-column prop="id" label="id" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" show-overflow-tooltip />
        <el-table-column prop="email" label="email" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="UserStatus.Enabled"
              :inactive-value="UserStatus.Disabled"
              :before-change="() => beforeSwitchChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="400">
          <template #default="{ row }">
            <el-button type="primary" text bg size="small" @click="handleUpdate(row)">编辑</el-button>
            <el-button type="primary" text bg size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button type="primary" text bg size="small" @click="handleUserRole(row)">配置角色</el-button>
            <el-button type="primary" text bg size="small" @click="handleUserProject(row)">参与项目</el-button>
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
    <save-user ref="saveUserRef" @ok="getTableData" />
    <reset-user-password ref="resetUserPasswordRef" />
    <save-user-role ref="saveUserRoleRef" />
    <save-user-project ref="saveUserProjectRef" />
  </div>
</template>
