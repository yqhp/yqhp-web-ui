<script lang="ts" setup>
import { ref, computed } from "vue"
import { ElDialog } from "element-plus"
import { createProject, updateProject } from "@/api/console/project"

const emit = defineEmits(["ok"])

const saveBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const project = ref({})

const isAdd = ref(false)

const open = (isCreate, data) => {
  isAdd.value = isCreate
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  if (isCreate) {
    project.value = {
      name: "",
      description: "",
      extra: {}
    }
  } else {
    project.value = {
      id: data.id,
      name: data.name,
      description: data.description,
      extra: data.extra
    }
  }
  visible.value = true
}

const dialogTitle = computed(() => (isAdd.value ? "新增项目" : "编辑项目"))

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
}

const saveProject = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    if (isAdd.value) {
      await createProject(project.value).finally(() => (saveBtnLoading.value = false))
    } else {
      await updateProject(project.value.id, project.value).finally(() => (saveBtnLoading.value = false))
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
  <el-dialog v-model="visible" :title="dialogTitle" :close-on-click-modal="false" width="600px">
    <el-form
      ref="formRef"
      :model="project"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      @keyup.enter="saveProject"
    >
      <el-form-item prop="name" label="名称">
        <el-input v-model="project.name" />
      </el-form-item>
      <el-form-item prop="description" label="描述">
        <el-input v-model="project.description" />
      </el-form-item>
      <!-- TODO extra json -->
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveProject" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
