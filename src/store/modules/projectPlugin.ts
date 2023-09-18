import { ref } from "vue"
import { defineStore } from "pinia"
import { useProjectStore } from "@/store/modules/project"
import { listPluginDTOByProjectId } from "@/api/console/plugin"

export const useProjectPluginStore = defineStore("projectPlugin", () => {
  const projectStore = useProjectStore()

  const plugins = ref([])
  const fetchProjectPlugins = async () => {
    plugins.value = await listPluginDTOByProjectId(projectStore.projectId)
  }

  return { plugins, fetchProjectPlugins }
})
