<script lang="ts" setup>
import { ref, computed } from "vue"
import SaveDevice from "./SaveDevice.vue"
import SaveDoc from "./SaveDoc.vue"
import { PlanRunMode } from "@/data/console-data"

const visible = ref(false)
const plan = ref({})
const saveDeviceRef = ref()
const saveDocRef = ref()

const isDeviceMode = computed(
  () => plan.value.runMode === PlanRunMode.Efficient || plan.value.runMode === PlanRunMode.Compatible
)

const open = (data) => {
  plan.value = data
  visible.value = true
}

const onOpen = () => {
  if (isDeviceMode.value) {
    saveDeviceRef.value.initData(plan.value.id)
  }
  saveDocRef.value.initData(plan.value.id)
}

defineExpose({
  open
})
</script>

<template>
  <el-drawer v-model="visible" size="90%" :title="plan?.name" @open="onOpen">
    <div class="h-full flex">
      <div class="w-120 mr-2" v-show="isDeviceMode">
        <save-device ref="saveDeviceRef" />
      </div>
      <div class="flex-1">
        <save-doc ref="saveDocRef" />
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped></style>
