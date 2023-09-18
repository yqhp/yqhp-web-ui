<script lang="ts" setup>
import { ref } from "vue"
import { listAgentInfo } from "@/api/console/agent"
import { PlanRunMode } from "@/data/console-data"
import { CaretRight } from "@element-plus/icons-vue"

const visible = ref(false)
const loading = ref(false)
const agents = ref([])

const getAgents = async () => {
  loading.value = true
  agents.value = await listAgentInfo().finally(() => {
    loading.value = false
  })
}

const emit = defineEmits(["debug"])

const handleDebug = (row, runMode) => {
  emit("debug", { ...row, runMode })
}

const open = () => {
  getAgents()
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({ open, close })
</script>

<template>
  <el-drawer v-model="visible" :with-header="false" size="60%">
    <div class="h-full" v-loading="loading">
      <el-table height="100%" :data="agents">
        <el-table-column label="操作系统" show-overflow-tooltip>
          <template #default="{ row }">
            {{ `${row.osName} ${row.osVersion} (${row.osArch})` }}
          </template>
        </el-table-column>
        <el-table-column label="Java" prop="javaVersion" show-overflow-tooltip />
        <el-table-column label="版本" prop="version" show-overflow-tooltip />
        <el-table-column label="描述" prop="description" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="100">
          <template #default="{ row }">
            <el-dropdown>
              <el-button :icon="CaretRight" circle />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleDebug(row, PlanRunMode.Selenium)"> Selenium </el-dropdown-item>
                  <el-dropdown-item @click="handleDebug(row, PlanRunMode.Agent)"> Agent </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>
