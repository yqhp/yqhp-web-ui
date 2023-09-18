import { ref } from "vue"
import { defineStore } from "pinia"

export const useDeviceStore = defineStore("device", () => {
  const device = ref()

  const setDevice = (val) => {
    device.value = val
  }

  return { device, setDevice }
})
