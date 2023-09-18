<script lang="ts" setup>
import { ref, computed } from "vue"
import { ElDialog } from "element-plus"
import { createUser, updateUser } from "@/api/auth/user"
import { UserStatus } from "@/data/console-data"

const emit = defineEmits(["ok"])

const saveBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const user = ref({})

const isAdd = ref(false)

const open = (isCreate, data) => {
  isAdd.value = isCreate
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  if (isCreate) {
    user.value = {
      username: "",
      password: "",
      status: UserStatus.Enabled,
      nickname: "",
      avatar: "",
      email: ""
    }
  } else {
    user.value = {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      avatar: data.avatar,
      email: data.email
    }
  }
  visible.value = true
}

const dialogTitle = computed(() => (isAdd.value ? "新增用户" : "编辑用户"))

const formRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  email: [{ required: true, message: "请输入email", trigger: "blur" }]
}

const saveUser = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    if (isAdd.value) {
      await createUser(user.value).finally(() => (saveBtnLoading.value = false))
    } else {
      await updateUser(user.value.id, user.value).finally(() => (saveBtnLoading.value = false))
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
      :model="user"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      @keyup.enter="saveUser"
    >
      <el-form-item prop="username" label="用户名">
        <el-input :disabled="!isAdd" v-model="user.username" />
      </el-form-item>
      <el-form-item v-if="isAdd" prop="password" label="密码">
        <el-input v-model="user.password" show-password />
      </el-form-item>
      <el-form-item prop="nickname" label="昵称">
        <el-input v-model="user.nickname" />
      </el-form-item>
      <el-form-item prop="email" label="email">
        <el-input v-model="user.email" />
      </el-form-item>
      <el-form-item v-if="isAdd" prop="status" label="状态">
        <el-switch v-model="user.status" :active-value="UserStatus.Enabled" :inactive-value="UserStatus.Disabled" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveUser" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
