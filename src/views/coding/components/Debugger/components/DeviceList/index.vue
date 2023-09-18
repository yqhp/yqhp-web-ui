<script lang="ts" setup>
import { ref, reactive } from "vue"
import { DeviceStatus, devicePlatformList, deviceStatusList, deviceTypeList, DevicePlatform } from "@/data/console-data"
import { getPagingDevices, deleteDeviceById } from "@/api/console/device"
import { ElMessage, ElMessageBox } from "element-plus"
import { CaretRight, More, Plus } from "@element-plus/icons-vue"
import DeviceText from "@/views/components/DeviceText.vue"
import SaveDevice from "../SaveDevice/index.vue"

const props = defineProps({
  // 是否可勾选
  selectable: {
    type: Boolean,
    default: false
  },
  // 不能勾选的设备ID
  unselectableIds: {
    type: Array,
    default: () => []
  },
  // 是否展示操作列
  showActionCol: {
    type: Boolean,
    default: true
  }
})

const visible = ref(false)
const searchFormRef = ref()
const searchParam = reactive({
  keyword: "",
  status: undefined,
  type: undefined,
  platform: undefined,
  pageNumb: 1,
  pageSize: 10
})

const loading = ref<boolean>(false)
const tableRef = ref()
const tableData = reactive({
  records: [],
  total: 0
})

const getTableData = async () => {
  loading.value = true
  const res = await getPagingDevices(searchParam).finally(() => {
    loading.value = false
  })
  tableData.records = res.records
  tableData.total = res.total
}

const emit = defineEmits(["play", "addSelected"])

const handleAndroidPlay = (row, bps) => {
  row.extra = row.extra || {}
  row.extra.scrcpyOptions = row.extra.scrcpyOptions || {}
  row.extra.scrcpyOptions.bitRate = bps
  emit("play", row)
}

const handleIosPlay = (row) => {
  emit("play", row)
}

const saveDeviceInfoRef = ref()

const handeUpdateDeviceInfo = (row) => {
  saveDeviceInfoRef.value.open(row)
}

const handleDeleteDevice = (row) => {
  ElMessageBox.confirm(`确认删除${row.id}`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    await deleteDeviceById(row.id)
    getTableData()
  })
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

const tableSelected = ref([])

const handleSelectionChange = (val) => {
  tableSelected.value = val
}

const addSelected = () => {
  if (!tableSelected.value.length) {
    ElMessage.warning("请勾选设备")
    return
  }
  emit("addSelected", tableSelected.value)
  tableRef.value.clearSelection() // 清除勾选
}

const rowSelectable = (row) => !props.unselectableIds.includes(row.id)

const open = () => {
  getTableData()
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({ open, close })
</script>

<template>
  <el-drawer v-model="visible" :with-header="false" size="60%">
    <div class="h-full flex flex-col" v-loading="loading">
      <div>
        <el-form ref="searchFormRef" :model="searchParam" :inline="true" @keyup.enter="handleSearch">
          <el-form-item prop="platform" label="平台">
            <el-select v-model="searchParam.platform" clearable>
              <el-option
                v-for="platform in devicePlatformList"
                :key="platform.value"
                :label="platform.label"
                :value="platform.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="type" label="类型">
            <el-select v-model="searchParam.type" clearable>
              <el-option v-for="type in deviceTypeList" :key="type.value" :label="type.label" :value="type.value" />
            </el-select>
          </el-form-item>
          <el-form-item prop="status" label="状态">
            <el-select v-model="searchParam.status" clearable>
              <el-option
                v-for="status in deviceStatusList"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="keyword">
            <el-input
              v-model="searchParam.keyword"
              placeholder="id/生产商/品牌/型号/系统版本 模糊查询"
              style="width: 300px"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button @click="getTableData">刷新</el-button>
            <el-button v-if="selectable" :icon="Plus" type="success" @click="addSelected">
              勾选{{ tableSelected.length }}个设备
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="flex-1 overflow-hidden">
        <el-table ref="tableRef" height="100%" :data="tableData.records" @selection-change="handleSelectionChange">
          <el-table-column v-if="selectable" type="selection" :selectable="rowSelectable" width="55" />
          <el-table-column label="设备">
            <template #default="{ row }">
              <device-text :device="row" />
            </template>
          </el-table-column>
          <el-table-column v-if="showActionCol" fixed="right" label="操作" width="120">
            <template #default="{ row }">
              <!-- android -->
              <el-dropdown v-if="row.platform === DevicePlatform.Android">
                <el-button :icon="CaretRight" circle :disabled="DeviceStatus.Idle !== row.status" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleAndroidPlay(row, 8_000_000)"> 超清(8Mbps) </el-dropdown-item>
                    <el-dropdown-item @click="handleAndroidPlay(row, 4_000_000)"> 高清(4Mbps) </el-dropdown-item>
                    <el-dropdown-item @click="handleAndroidPlay(row, 1_000_000)"> 普清(1Mbps) </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <!-- ios -->
              <el-button
                v-else
                :icon="CaretRight"
                circle
                :disabled="DeviceStatus.Idle !== row.status"
                @click="handleIosPlay(row)"
              />
              <!-- more -->
              <el-dropdown v-permission="['admin']">
                <el-button text :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handeUpdateDeviceInfo(row)"> 编辑 </el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteDevice(row)"> 删除 </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
  </el-drawer>
  <save-device ref="saveDeviceInfoRef" @ok="getTableData" />
</template>
<style lang="scss" scoped></style>
