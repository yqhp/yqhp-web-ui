import { ref } from "vue"
import { defineStore } from "pinia"

export const useProjectStore = defineStore("project", () => {
  const localStorageKey = "projectId"

  const projectId = ref(localStorage.getItem(localStorageKey))

  const setProjectId = (val: string) => {
    projectId.value = val
    localStorage.setItem(localStorageKey, val)
  }

  return { projectId, setProjectId }
})
