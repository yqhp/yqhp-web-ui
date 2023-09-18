<script lang="ts" setup>
import { ref } from "vue"
import { ElDialog } from "element-plus"
import { updateDevice } from "@/api/console/device"
import { getDeviceInfo } from "@/api/agent/device"

const emit = defineEmits(["ok"])

const saveBtnLoading = ref(false)
const getDeviceInfoBtnLoading = ref(false)
const visible = ref(false)
const formRef = ref()
const device = ref({})

const location = ref("")

const open = (data) => {
  formRef.value?.clearValidate() // 清除上次的表单校验信息
  location.value = data.location
  device.value = {
    id: data.id,
    manufacturer: data.manufacturer,
    brand: data.brand,
    model: data.model,
    cpu: data.cpu,
    memSize: data.memSize,
    imgUrl: data.imgUrl,
    systemVersion: data.systemVersion,
    screenWidth: data.screenWidth,
    screenHeight: data.screenHeight,
    description: data.description,
    extra: data.extra
  }
  visible.value = true
}

const formRules = {}

const saveDevice = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    saveBtnLoading.value = true
    await updateDevice(device.value.id, device.value).finally(() => (saveBtnLoading.value = false))
    emit("ok")
    visible.value = false
  })
}

const fetchDeviceInfo = async () => {
  getDeviceInfoBtnLoading.value = true
  const info = await getDeviceInfo(device.value.id, location.value).finally(
    () => (getDeviceInfoBtnLoading.value = false)
  )
  device.value = { ...device.value, ...info }
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" title="编辑设备信息" :close-on-click-modal="false" width="800px">
    <el-form
      ref="formRef"
      :model="device"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      @keyup.enter="saveDevice"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item prop="id" label="id">
            <el-input v-model="device.id" disabled />
          </el-form-item>
          <el-form-item prop="manufacturer" label="生产商">
            <el-input v-model="device.manufacturer" />
          </el-form-item>
          <el-form-item prop="brand" label="品牌">
            <el-input v-model="device.brand" />
          </el-form-item>
          <el-form-item prop="model" label="型号">
            <el-input v-model="device.model" />
          </el-form-item>
          <el-form-item prop="description" label="描述">
            <el-input v-model="device.description" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="cpu" label="cpu">
            <el-input v-model="device.cpu" />
          </el-form-item>
          <el-form-item prop="memSize" label="内存大小">
            <el-input v-model="device.memSize" />
          </el-form-item>
          <el-form-item prop="systemVersion" label="系统版本">
            <el-input v-model="device.systemVersion" />
          </el-form-item>
          <el-form-item prop="screenWidth" label="屏幕宽">
            <el-input v-model="device.screenWidth" />
          </el-form-item>
          <el-form-item prop="screenHeight" label="屏幕高">
            <el-input v-model="device.screenHeight" />
          </el-form-item>
          <!-- TODO extra json -->
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="location" @click="fetchDeviceInfo" :loading="getDeviceInfoBtnLoading">获取设备信息</el-button>
      <el-button type="primary" @click="saveDevice" :loading="saveBtnLoading">保存</el-button>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped></style>
