<script lang="ts" setup>
import { ref, watch } from "vue"
import PkgTree from "./components/PkgTree/index.vue"
import UpdateDoc from "./components/UpdateDoc/index.vue"
import Debugger from "./components/Debugger/index.vue"
import Console from "./components/Console/index.vue"
import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import { usePkgTreeStore } from "@/store/modules/pkgTree"
import DocText from "@/views/components/DocText.vue"
import CodeEditor from "./components/CodeEditor/index.vue"

defineOptions({
  name: "Coding"
})

const pkgTreeStore = usePkgTreeStore()

const debuggerPaneSize = ref(20)
const treePaneSize = ref(20)
const consolePaneSize = ref(30)
const tabs = ref([])
const activeTab = ref("")
const editorRef = ref()

watch(
  () => activeTab.value,
  (val) => {
    editorRef.value.setModel(val)
  }
)

const clickTreeItem = (data) => {
  if (!tabs.value.some((tab) => tab.id === data.id)) {
    tabs.value.push(data)
  }
  activeTab.value = data.id
}

const removeTab = (id) => {
  editorRef.value.removeModel(id)
  const tabList = tabs.value
  const toRemoveIdx = tabList.findIndex((tab) => tab.id === id)
  if (activeTab.value === id) {
    // 移除的是当前激活的tab，找到下一个要激活的tab
    const nextTab = tabList[toRemoveIdx + 1] || tabList[toRemoveIdx - 1]
    // 找不到next，意味着全部关闭了
    activeTab.value = nextTab ? nextTab.id : ""
  }
  tabList.splice(toRemoveIdx, 1)
}
</script>

<template>
  <div class="h-full border-white border-solid border-2px">
    <Splitpanes>
      <Pane :size="debuggerPaneSize">
        <Debugger />
      </Pane>
      <Pane :size="100 - debuggerPaneSize">
        <Splitpanes horizontal>
          <Pane :size="100 - consolePaneSize">
            <Splitpanes>
              <Pane :size="100 - treePaneSize" class="flex flex-col">
                <div v-if="activeTab">
                  <el-tabs type="card" closable @tab-remove="removeTab" v-model="activeTab">
                    <el-tab-pane v-for="tab in tabs" :key="tab.id" :name="tab.id">
                      <template #label>
                        <DocText :doc="pkgTreeStore.docMap[tab.id]" />
                      </template>
                      <update-doc :data="pkgTreeStore.docMap[tab.id]" />
                    </el-tab-pane>
                  </el-tabs>
                </div>
                <div v-else class="flex flex-col items-center justify-center w-full h-full font-black">
                  <div>F1: 执行当前选中的代码 或 光标所在行的代码</div>
                  <div class="mt-2">Ctrl + Space: 代码提示</div>
                </div>
                <div class="flex-1">
                  <CodeEditor ref="editorRef" v-show="activeTab" />
                </div>
              </Pane>
              <Pane :size="treePaneSize">
                <PkgTree @clickItem="clickTreeItem" />
              </Pane>
            </Splitpanes>
          </Pane>
          <Pane :size="consolePaneSize">
            <Console />
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__header) {
  margin: 0 0 2px;
}

:deep(.splitpanes__splitter) {
  border: 1px solid white;
}
</style>
