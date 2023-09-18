<script lang="ts" setup>
import { ref, computed } from "vue"
import { ElDialog } from "element-plus"
import { createPkg, updatePkg } from "@/api/console/pkg"

const emit = defineEmits(["ok"])

const saveBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const pkg = ref({})

const isAdd = ref(false)

const open = (isCreate, data) => {
  isAdd.value = isCreate
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  if (isCreate) {
    pkg.value = {
      projectId: data.projectId,
      type: data.type,
      parentId: data.parentId,
      name: "",
      description: ""
    }
  } else {
    pkg.value = {
      id: data.id,
      name: data.name,
      description: data.description
    }
  }
  visible.value = true
}

const dialogTitle = computed(() => (isAdd.value ? "新建目录" : "编辑目录"))

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
}

const savePkg = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    if (isAdd.value) {
      await createPkg(pkg.value).finally(() => (saveBtnLoading.value = false))
    } else {
      await updatePkg(pkg.value.id, pkg.value).finally(() => (saveBtnLoading.value = false))
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
      :model="pkg"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      @keyup.enter="savePkg"
    >
      <el-form-item prop="name" label="名称">
        <el-input v-model="pkg.name" />
      </el-form-item>
      <el-form-item prop="description" label="描述">
        <el-input v-model="pkg.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="savePkg" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
