<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from "vue"
import {
  listPlanDeviceByPlanId,
  movePlanDevice,
  deletePlanDeviceById,
  createPlanDevices,
  updatePlanDevice
} from "@/api/console/planDevice"
import DeviceText from "@/views/components/DeviceText.vue"
import { Delete } from "@element-plus/icons-vue"
import { ElMessage, ElSwitch } from "element-plus"
import Sortable from "sortablejs"
import DeviceList from "@/views/coding/components/Debugger/components/DeviceList/index.vue"

let planId
const planDevices = ref([])

const fetchPlanDevices = async () => {
  planDevices.value = await listPlanDeviceByPlanId(planId)
}

const initData = async (_planId) => {
  planId = _planId
  fetchPlanDevices()
}

defineExpose({
  initData
})

onMounted(async () => {
  nextTick(() => initTableSortable())
})

const sortableTableRef = ref()

const initTableSortable = () => {
  const tbody = sortableTableRef.value.$el.querySelector(".el-table__body-wrapper tbody")
  Sortable.create(tbody, {
    animation: 150,
    onEnd(e) {
      handleDeviceMove(e.oldIndex, e.newIndex)
    }
  })
}

const handleDeviceMove = async (oldIdx, newIdx) => {
  if (oldIdx == newIdx) return
  const planDeviceList = planDevices.value
  const from = planDeviceList[oldIdx].id
  const to = planDeviceList[newIdx].id
  // newIdx > oldIdx ? 往下拖动 : 往上拖动
  const type = newIdx > oldIdx ? "AFTER" : "BEFORE"
  await movePlanDevice({ from, to, type })

  const oldRow = planDeviceList.splice(oldIdx, 1)[0]
  planDeviceList.splice(newIdx, 0, oldRow)
}

const handleDelete = async (idx, row) => {
  await deletePlanDeviceById(row.id)
  planDevices.value.splice(idx, 1)
}

const unselectableDeviceIds = computed(() => planDevices.value.map((item) => item.deviceId))

const addDevices = async (devices) => {
  const deviceIds = devices.map((row) => row.id)
  await createPlanDevices({
    planId,
    deviceIds
  })
  ElMessage.success("添加成功")
  fetchPlanDevices()
}

const updateDevice = async (row) => {
  await updatePlanDevice(row.id, {
    deviceId: row.deviceId,
    enabled: row.enabled
  })
}

const deviceListRef = ref()
const openDeviceList = () => {
  deviceListRef.value.open()
}
</script>

<template>
  <div class="h-full">
    <el-table ref="sortableTableRef" height="100%" size="small" :data="planDevices" row-key="id">
      <el-table-column type="index" width="55" />
      <el-table-column label="设备">
        <template #header>
          <el-button type="primary" size="small" @click="openDeviceList">添加设备</el-button>
          已添加{{ planDevices.length }}个设备
        </template>
        <template #default="{ row }">
          <device-text :device="row.device" />
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="80">
        <template #default="scope">
          <el-switch
            size="small"
            v-model="scope.row.enabled"
            :active-value="1"
            :inactive-value="0"
            @change="updateDevice(scope.row)"
          />
          <el-button text size="small" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
  <device-list
    ref="deviceListRef"
    selectable
    :show-action-col="false"
    :unselectable-ids="unselectableDeviceIds"
    @add-selected="addDevices"
  />
</template>

<style lang="scss" scoped></style>
