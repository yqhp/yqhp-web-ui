<script lang="ts" setup>
import { ref, computed } from "vue"
import { ElDialog } from "element-plus"
import { createPlugin, updatePlugin } from "@/api/console/plugin"

const emit = defineEmits(["ok", "created"])

const saveBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const plugin = ref({})

const isAdd = ref(false)

const open = (isCreate, data) => {
  isAdd.value = isCreate
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  if (isCreate) {
    plugin.value = {
      name: "",
      description: ""
    }
  } else {
    plugin.value = {
      id: data.id,
      name: data.name,
      description: data.description
    }
  }
  visible.value = true
}

const dialogTitle = computed(() => (isAdd.value ? "新增插件" : "编辑插件"))

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
}

const savePlugin = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }

    saveBtnLoading.value = true
    if (isAdd.value) {
      const newPlugin = await createPlugin(plugin.value).finally(() => (saveBtnLoading.value = false))
      emit("created", newPlugin)
    } else {
      await updatePlugin(plugin.value.id, plugin.value).finally(() => (saveBtnLoading.value = false))
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
      :model="plugin"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      @keyup.enter="savePlugin"
    >
      <el-form-item prop="name" label="名称">
        <el-input v-model="plugin.name" />
      </el-form-item>
      <el-form-item prop="description" label="描述">
        <el-input v-model="plugin.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="savePlugin" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
