<script lang="ts" setup>
import { ref } from "vue"
import { ElDialog } from "element-plus"
import { createPlanDoc, deletePlanDoc, listPlanDocByDocId } from "@/api/console/planDoc"
import { listPlanByProjectId } from "@/api/console/plan"
import { useProjectStore } from "@/store/modules/project"

const projectStore = useProjectStore()

const visible = ref(false)
const allPlans = ref([])
const doc = ref({})

const open = async (data) => {
  doc.value = data
  visible.value = true
  allPlans.value = await listPlanByProjectId(projectStore.projectId)
  const checkedPlanIds = (await listPlanDocByDocId(data.id)).map((planDoc) => planDoc.planId)
  allPlans.value.forEach((plan) => {
    plan.checked = checkedPlanIds.includes(plan.id)
  })
}

const onChange = async (checked, plan) => {
  try {
    if (checked) {
      await createPlanDoc({
        docId: doc.value.id,
        planId: plan.id
      })
    } else {
      await deletePlanDoc({
        docId: doc.value.id,
        planId: plan.id
      })
    }
  } catch (err) {
    plan.checked = !plan.checked
  }
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" :title="`【计划】${doc?.name}`" :close-on-click-modal="false" width="600px">
    <el-checkbox
      v-for="plan in allPlans"
      :key="plan.id"
      v-model="plan.checked"
      @change="(checked) => onChange(checked, plan)"
    >
      {{ plan.name }}
    </el-checkbox>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
