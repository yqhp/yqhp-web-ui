<script lang="ts" setup>
import { ref, reactive } from "vue"
import { updateDoc } from "@/api/console/doc"
import { docStatusList, docKindList, docFlowList } from "@/data/console-data"
import { usePkgTreeStore } from "@/store/modules/pkgTree"
import { debounce } from "perfect-debounce"

const props = defineProps({
  data: Object
})

const pkgTreeStore = usePkgTreeStore()

const formRef = ref()
const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
}

const doc = reactive({
  id: props.data?.id,
  kind: props.data?.kind,
  flow: props.data?.flow,
  name: props.data?.name,
  description: props.data?.description,
  status: props.data?.status
})

const saveDoc = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    await updateDoc(doc.id, doc)
    pkgTreeStore.fetchDocTree()
  })
}

const debouncedSaveDoc = debounce(() => {
  saveDoc()
}, 1000)
</script>

<template>
  <div class="pt-5px px-5px">
    <el-form ref="formRef" :model="doc" :rules="formRules" :inline-message="true" label-width="auto">
      <div class="flex flex-col">
        <div class="flex">
          <el-form-item prop="name" label="名称" class="flex-1">
            <el-input v-model="doc.name" @input="debouncedSaveDoc" />
          </el-form-item>
          <el-form-item prop="kind">
            <el-select v-model="doc.kind" @change="saveDoc" class="w-30">
              <template #prefix>
                <svg-icon :name="docKindList.find((kind) => kind.value === doc.kind)?.icon" />
              </template>
              <el-option v-for="kind in docKindList" :key="kind.value" :label="kind.label" :value="kind.value">
                <svg-icon :name="kind.icon" />
                {{ kind.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="flow">
            <el-select v-model="doc.flow" @change="saveDoc" class="w-35">
              <template #prefix>
                <svg-icon :name="docFlowList.find((flow) => flow.value === doc.flow)?.icon" />
              </template>
              <el-option v-for="flow in docFlowList" :key="flow.value" :label="flow.label" :value="flow.value">
                <svg-icon :name="flow.icon" />
                {{ flow.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="doc.status" @change="saveDoc" class="w-30">
              <template #prefix>
                <svg-icon
                  :color="docStatusList.find((status) => status.value === doc.status)?.color"
                  :name="docStatusList.find((status) => status.value === doc.status)?.icon"
                />
              </template>
              <el-option
                v-for="status in docStatusList"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              >
                <svg-icon :color="status.color" :name="status.icon" />
                {{ status.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div>
          <el-form-item prop="description" label="描述" class="w-full">
            <el-input type="textarea" :rows="1" v-model="doc.description" @input="debouncedSaveDoc" />
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item) {
  margin-bottom: 5px;
}
</style>
