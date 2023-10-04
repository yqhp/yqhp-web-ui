<script lang="ts" setup>
import { ref } from "vue"
import { ElDialog, ElMessage } from "element-plus"
import { listPluginFileByPluginId, deletePluginFileById, createPluginFile } from "@/api/console/pluginFile"
import { uploadUrl, authHeader } from "@/api/oss/file"
import { formatBytes } from "@/utils/fileSize"
import { formatDateTime } from "@/utils/date"

const visible = ref(false)
const pluginFiles = ref([])
const plugin = ref({})

const open = (data) => {
  plugin.value = data
  visible.value = true
  getTableData()
}

const getTableData = async () => {
  pluginFiles.value = await listPluginFileByPluginId(plugin.value.id)
}

const beforeUpload = (rawFile) => {
  const uploadFilename: string = rawFile.name
  const valid = uploadFilename && (uploadFilename.endsWith(".jar") || uploadFilename.endsWith(".class"))
  // 检查文件后缀
  if (!valid) {
    ElMessage.error(`${uploadFilename}不合法`)
    return false
  }

  // 检查文件名是否已存在
  const filenameExists = pluginFiles.value.some((file) => file.name === uploadFilename)
  if (filenameExists) {
    ElMessage.error(`${uploadFilename}已存在`)
    return false
  }

  return true
}

const onUploadSuccess = async (response) => {
  await createPluginFile({
    pluginId: plugin.value.id,
    name: response.name,
    url: response.url,
    size: response.size
  })
  await getTableData()
}

const handleDelete = async (row) => {
  await deletePluginFileById(row.id)
  getTableData()
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" :title="`【文件管理】${plugin?.name}`" :close-on-click-modal="false" width="80%">
    <el-row :gutter="5">
      <el-col :span="6">
        <el-upload
          :show-file-list="false"
          :before-upload="beforeUpload"
          :headers="authHeader"
          :action="uploadUrl"
          :on-success="onUploadSuccess"
          drag
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持.jar .class文件</div>
          </template>
        </el-upload>
      </el-col>
      <el-col :span="18">
        <el-table :data="pluginFiles">
          <el-table-column prop="name" label="文件名" show-overflow-tooltip />
          <el-table-column prop="url" label="url" show-overflow-tooltip />
          <el-table-column prop="size" label="文件大小" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatBytes(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" text bg size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
