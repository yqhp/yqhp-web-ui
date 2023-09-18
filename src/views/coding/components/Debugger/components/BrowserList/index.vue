<script lang="ts" setup>
import { ref } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import { listBrowser, getDevtoolsWsUrl } from "@/api/agent/device"
import { Refresh } from "@element-plus/icons-vue"

const deviceStore = useDeviceStore()

const loading = ref(false)
const browsers = ref([])

const fetchBrowsers = async () => {
  const { token, location } = deviceStore.device
  loading.value = true
  browsers.value = await listBrowser(token, location).finally(() => (loading.value = false))
}

const openDebugUrl = (socketName, page) => {
  const { token, location } = deviceStore.device
  const devtoolsWsUrl = getDevtoolsWsUrl(token, location, socketName, page.id)
  console.log(devtoolsWsUrl)
  const url = "http://139.9.5.56/inspector.html?" + devtoolsWsUrl.replace("://", "=")
  window.open(url, "", "popup, height=600, width=900")
}
</script>

<template>
  <div class="absolute bottom-5 right-5 z-1">
    <el-button type="primary" :icon="Refresh" circle @click="fetchBrowsers" :loading="loading" />
  </div>
  <div class="h-full overflow-auto">
    <el-tabs>
      <el-tab-pane v-for="(browser, index) in browsers" :key="index" :label="browser.version['Android-Package']">
        <div class="mb-2">
          <div>
            browser: <span class="font-black">{{ browser.version.Browser }}</span>
          </div>
          <div>
            socket: <span class="font-black">{{ browser.socketName }}</span>
          </div>
        </div>
        <el-table :data="browser.pages || []">
          <el-table-column label="id" prop="id" show-overflow-tooltip />
          <el-table-column label="标题" prop="title" show-overflow-tooltip />
          <el-table-column label="链接" prop="url" show-overflow-tooltip />
          <el-table-column fixed="right" label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" text bg size="small" @click="openDebugUrl(browser.socketName, row)">
                调试
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
