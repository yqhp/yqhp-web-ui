import { ref } from "vue"
import { defineStore } from "pinia"

export const useAgentStore = defineStore("agent", () => {
  const agent = ref()

  const setAgent = (val) => {
    agent.value = val
  }

  return { agent, setAgent }
})
