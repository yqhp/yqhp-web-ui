<script lang="ts" setup>
import { ref } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import { installApp } from "@/api/agent/device"
import { ElMessage } from "element-plus"

const deviceStore = useDeviceStore()

const upload = ref()
const fileList = ref([])
const loading = ref(false)

const handleInstallApp = async () => {
  const file = fileList.value[0]
  loading.value = true
  await installApp(file.raw, deviceStore.device.token, deviceStore.device.location).finally(
    () => (loading.value = false)
  )
  ElMessage.success(`安装${file.name}成功`)
}

// 超出数量限制，替换app
const hanldeExceed = (files) => {
  upload.value!.clearFiles()
  const file = files[0]
  upload.value!.handleStart(file)
}
</script>

<template>
  <div>
    <el-upload ref="upload" v-model:file-list="fileList" :limit="1" :auto-upload="false" drag :on-exceed="hanldeExceed">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖拽文件到此处或<em>点击选择</em></div>
    </el-upload>
    <el-button type="primary" @click="handleInstallApp" :disabled="fileList.length == 0" :loading="loading">
      安装app
    </el-button>
  </div>
</template>

<style lang="scss" scoped></style>
