<script lang="ts" setup>
import { ref } from "vue"
import { ElDialog } from "element-plus"
import { createProjectPlugin, deleteProjectPlugin, listProjectPluginByProjectId } from "@/api/console/projectPlugin"
import { getAllPlugins } from "@/api/console/plugin"

const visible = ref(false)
const allPlugins = ref([])
const project = ref({})

const open = async (data) => {
  project.value = data
  visible.value = true
  allPlugins.value = await getAllPlugins()
  const checkedPluginIds = (await listProjectPluginByProjectId(data.id)).map((projectPlugin) => projectPlugin.pluginId)
  allPlugins.value.forEach((plugin) => {
    plugin.checked = checkedPluginIds.includes(plugin.id)
  })
}

const onChange = async (checked, plugin) => {
  try {
    if (checked) {
      await createProjectPlugin({
        projectId: project.value.id,
        pluginId: plugin.id
      })
    } else {
      await deleteProjectPlugin({
        projectId: project.value.id,
        pluginId: plugin.id
      })
    }
  } catch (err) {
    plugin.checked = !plugin.checked
  }
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" :title="`${project?.name}插件`" :close-on-click-modal="false" width="600px">
    <el-checkbox
      v-for="plugin in allPlugins"
      :key="plugin.id"
      v-model="plugin.checked"
      @change="(checked) => onChange(checked, plugin)"
    >
      {{ plugin.name }}
    </el-checkbox>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
