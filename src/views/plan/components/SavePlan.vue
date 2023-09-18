<script lang="ts" setup>
import { ref, computed } from "vue"
import { createPlan, updatePlan } from "@/api/console/plan"
import { planRunModeList } from "@/data/console-data"

const emit = defineEmits(["ok", "created"])

const saveBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const plan = ref({})

const isAdd = ref(false)

const open = (isCreate, data) => {
  isAdd.value = isCreate
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  if (isCreate) {
    plan.value = {
      projectId: data.projectId,
      name: "",
      description: "",
      runMode: undefined
    }
  } else {
    plan.value = {
      id: data.id,
      name: data.name,
      description: data.description,
      runMode: data.runMode
    }
  }
  visible.value = true
}

const dialogTitle = computed(() => (isAdd.value ? "新增计划" : "编辑计划"))

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  runMode: [{ required: true, message: "请选择运行模式", trigger: "change" }]
}

const savePlan = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    if (isAdd.value) {
      const newPlan = await createPlan(plan.value).finally(() => (saveBtnLoading.value = false))
      emit("created", newPlan)
    } else {
      await updatePlan(plan.value.id, plan.value).finally(() => (saveBtnLoading.value = false))
    }
    emit("ok")
    visible.value = false
  })
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="dialogTitle" width="800px">
    <el-form
      ref="formRef"
      :model="plan"
      :rules="formRules"
      label-width="80px"
      label-position="right"
      @keyup.enter="savePlan"
    >
      <el-form-item prop="name" label="名称">
        <el-input v-model="plan.name" />
      </el-form-item>
      <el-form-item prop="description" label="描述">
        <el-input v-model="plan.description" />
      </el-form-item>
      <el-form-item prop="runMode" label="运行模式">
        <el-radio-group v-model="plan.runMode">
          <el-radio v-for="runMode in planRunModeList" :key="runMode.value" :label="runMode.value">
            {{ runMode.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="savePlan" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
