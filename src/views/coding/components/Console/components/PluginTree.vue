<script lang="ts" setup>
import { onMounted } from "vue"
import { useProjectPluginStore } from "@/store/modules/projectPlugin"
import PluginText from "@/views/components/PluginText.vue"
import PluginFileText from "@/views/components/PluginFileText.vue"

const projectPluginStore = useProjectPluginStore()

onMounted(() => {
  projectPluginStore.fetchProjectPlugins()
})
</script>

<template>
  <div class="h-full overflow-auto">
    <el-tree class="min-w-max" :props="{ label: 'name', children: 'files' }" :data="projectPluginStore.plugins">
      <template #default="{ node, data }">
        <PluginFileText v-if="data.pluginId" :name="data.name" />
        <PluginText v-else :name="data.name" />
      </template>
    </el-tree>
  </div>
</template>
