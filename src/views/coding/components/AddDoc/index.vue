<script lang="ts" setup>
import { ref, watch } from "vue"
import { ElDialog } from "element-plus"
import { createDoc } from "@/api/console/doc"
import { docKindList, DocKind, docFlowList, DocFlow } from "@/data/console-data"

const emit = defineEmits(["ok"])

const saveBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const doc = ref({})

watch(
  () => doc.value.kind,
  (val) => {
    if (DocKind.JshInit === val) {
      doc.value.flow = DocFlow.StopRunningNextIfError
    } else if (DocKind.JshAction === val) {
      doc.value.flow = DocFlow.KeepRunningNextIfError
    }
  }
)

const open = (data) => {
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  doc.value = {
    projectId: data.projectId,
    pkgId: data.pkgId,
    kind: data.kind,
    flow: data.flow,
    name: "",
    description: ""
  }
  visible.value = true
}

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
}

const saveDoc = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    const newDoc = await createDoc(doc.value).finally(() => (saveBtnLoading.value = false))
    emit("ok", newDoc)
    visible.value = false
  })
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" title="新建Doc" :close-on-click-modal="false" width="600px">
    <el-form
      ref="formRef"
      :model="doc"
      :rules="formRules"
      label-width="60px"
      label-position="right"
      @keyup.enter="saveDoc"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item prop="kind" label="类型">
            <el-select v-model="doc.kind">
              <template #prefix>
                <svg-icon :name="docKindList.find((kind) => kind.value === doc.kind)?.icon" />
              </template>
              <el-option v-for="kind in docKindList" :key="kind.value" :label="kind.label" :value="kind.value">
                <svg-icon :name="kind.icon" />
                {{ kind.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="flow" label="流程">
            <el-select v-model="doc.flow">
              <template #prefix>
                <svg-icon :name="docFlowList.find((flow) => flow.value === doc.flow)?.icon" />
              </template>
              <el-option v-for="flow in docFlowList" :key="flow.value" :label="flow.label" :value="flow.value">
                <svg-icon :name="flow.icon" />
                {{ flow.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item prop="name" label="名称">
        <el-input v-model="doc.name" />
      </el-form-item>
      <el-form-item prop="description" label="描述">
        <el-input v-model="doc.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveDoc" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
