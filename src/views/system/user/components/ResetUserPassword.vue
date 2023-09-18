<script lang="ts" setup>
import { ref, reactive } from "vue"
import { ElDialog } from "element-plus"
import { resetPassword } from "@/api/auth/user"

const formRef = ref()
const visible = ref(false)
const saveBtnLoading = ref(false)
const user = ref({})

const formData = reactive({
  password: ""
})

const formRules = {
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
}

const open = (data) => {
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  user.value = data
  formData.password = ""
  visible.value = true
}

const handleSave = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    await resetPassword(user.value.id, formData.password).finally(() => (saveBtnLoading.value = false))
    visible.value = false
  })
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" title="重置密码" :close-on-click-modal="false" width="600px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      @keyup.enter="handleSave"
    >
      <el-form-item prop="username" label="用户名">
        <el-input :disabled="true" v-model="user.username" />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input v-model="formData.password" type="password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
