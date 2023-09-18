<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from "vue"
import { useDeviceStore } from "@/store/modules/device"
import { useAgentStore } from "@/store/modules/agent"
import { useProjectStore } from "@/store/modules/project"
import { useProjectPluginStore } from "@/store/modules/projectPlugin"
import * as monaco from "monaco-editor"
import { getDocById, updateDocContent, listInitDocByProjectId } from "@/api/console/doc"
import { getDeviceJShellExecutionWsUrl, getDeviceJShellSuggestionsWsUrl } from "@/api/agent/device"
import { getJShellExecutionWsUrl, getJShellSuggestionsWsUrl } from "@/api/agent/agent"
import { uploadFile } from "@/api/oss/file"
import { debounce } from "perfect-debounce"
import { emitter } from "@/utils/mitt"

const editorContainerRef = ref()
let editor: monaco.editor.IStandaloneCodeEditor
let currDocId
const docModelCache = {}
const docViewStateCache = {}

const deviceStore = useDeviceStore()
const agentStore = useAgentStore()
const projectStore = useProjectStore()
const projectPluginStore = useProjectPluginStore()
let requestUid = 1
let jshellExecutionWs
let jshellSuggestionsWs

const jshellEval = (data, uid) => {
  if (jshellExecutionWs && data) {
    const req = {
      uid,
      command: "JSHELL_EVAL",
      data,
      timestamp: new Date().getTime()
    }
    emitter.emit("JSHELL_EXECUTION", { type: "req", ...req })
    jshellExecutionWs.send(JSON.stringify(req))
  }
}

const jshellLoadPlugin = () => {
  if (jshellExecutionWs && projectPluginStore.plugins.length) {
    projectPluginStore.plugins.forEach((plugin) => {
      const req = {
        uid: plugin.name,
        command: "JSHELL_LOAD_PLUGIN",
        data: plugin,
        timestamp: new Date().getTime()
      }
      emitter.emit("JSHELL_EXECUTION", { type: "req", ...req })
      jshellExecutionWs.send(JSON.stringify(req))
    })
  }
}

const debouncedJshellSuggestions = debounce(() => {
  jshellSuggestions()
}, 100)

const jshellSuggestions = () => {
  // 光标所在行文本
  const lineContent = editor.getModel().getLineContent(editor.getPosition().lineNumber)
  if (jshellSuggestionsWs && lineContent) {
    jshellSuggestionsWs.send(
      JSON.stringify({
        command: "JSHELL_SUGGESTIONS",
        data: {
          input: lineContent,
          cursor: editor.getPosition().column - 1
        }
      })
    )
  }
}

const init = async () => {
  // 加载插件
  jshellLoadPlugin()
  // 执行初始化doc
  const initDocs = await listInitDocByProjectId(projectStore.projectId)
  initDocs.forEach((doc) => {
    jshellEval(doc.content, doc.name)
  })
}

onMounted(() => {
  // 初始化编辑器
  editor = monaco.editor.create(editorContainerRef.value, {
    language: "java",
    automaticLayout: true,
    quickSuggestions: false, // 关闭默认提示
    minimap: {
      enabled: false // 是否启用代码预览图
    }
  })

  // 编辑器内粘贴
  editor.onDidPaste(async (e) => {
    // 由于浏览器的安全策略，localhost 或 https下用户授权允许，可以read clipboard
    const clipboardItems = await navigator.clipboard.read()
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith("image/")) {
          const img = await clipboardItem.getType(type)
          const newImg = new File([img], "img." + img.type.split("/")[1], { type: img.type })
          const { url } = await uploadFile(newImg).catch(() => {
            editor.executeEdits("", [
              {
                range: e.range,
                text: "图片上传失败"
              }
            ])
          })
          editor.executeEdits("", [
            {
              range: e.range,
              text: url
            }
          ])
        }
      }
    }
  })

  // 编辑器model内容变化
  editor.onDidChangeModelContent(async () => {
    debouncedUpdateDocContent(currDocId, editor.getValue())
    debouncedJshellSuggestions()
  })

  editor.addCommand(monaco.KeyCode.F1, () => {
    // 优先发送选中的文本，否则发送当前光标所在行的文本
    const code = editor.getSelection().isEmpty()
      ? editor.getModel().getLineContent(editor.getPosition().lineNumber)
      : editor.getModel().getValueInRange(editor.getSelection())
    if (code) {
      jshellEval(code, requestUid++)
    }
  })

  editor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.Space, () => {
    jshellSuggestions()
  })
})

const setModel = async (newDocId) => {
  if (!newDocId) {
    return
  }

  const oldDocId = currDocId
  currDocId = newDocId

  if (oldDocId) {
    // 保存切换前的视图状态
    docViewStateCache[oldDocId] = editor.saveViewState()
  }

  if (!docModelCache[currDocId]) {
    // 没打开过
    const { content } = await getDocById(currDocId)
    // 创建新model
    const model = monaco.editor.createModel(content, "java")
    docModelCache[currDocId] = model
  }
  // 切换model
  editor.setModel(docModelCache[currDocId])
  editor.focus()

  // 恢复视图状态
  if (docViewStateCache[currDocId]) {
    editor.restoreViewState(docViewStateCache[currDocId])
  }
}

const removeModel = (docId) => {
  const viewState = docViewStateCache[docId]
  if (viewState) {
    delete docViewStateCache[docId]
  }
  const model = docModelCache[docId]
  if (model) {
    model.dispose()
    delete docModelCache[docId]
  }
}

defineExpose({ setModel, removeModel })

// 限流保存
const debouncedUpdateDocContent = debounce((docId, content) => {
  updateDocContent(docId, content)
}, 1000)

let receivedSuggestions = []

// 监听设备锁定
watch(
  () => deviceStore.device,
  (device) => {
    if (device) {
      initWs(
        getDeviceJShellExecutionWsUrl(device.token, device.location),
        getDeviceJShellSuggestionsWsUrl(device.token, device.location)
      )
    } else {
      closeWs()
    }
  }
)

// 监听agent调试
watch(
  () => agentStore.agent,
  (agent) => {
    if (agent) {
      initWs(
        getJShellExecutionWsUrl(agent.token, agent.location),
        getJShellSuggestionsWsUrl(agent.token, agent.location)
      )
    } else {
      closeWs()
    }
  }
)

const initWs = (jshellExecutionWsUrl, jshellSuggestionsWsUrl) => {
  jshellExecutionWs = new WebSocket(jshellExecutionWsUrl)
  jshellExecutionWs.onopen = () => {
    console.log("jshell execution ws onopen")
    requestUid = 1
    init()
  }
  jshellExecutionWs.onclose = () => {
    console.log("jshell execution ws onclose")
    jshellExecutionWs = undefined
  }
  jshellExecutionWs.onmessage = (event) => {
    const data = event.data
    if (data === "pong") {
      return
    }
    emitter.emit("JSHELL_EXECUTION", { type: "resp", ...JSON.parse(data) })
  }

  jshellSuggestionsWs = new WebSocket(jshellSuggestionsWsUrl)
  jshellSuggestionsWs.onopen = () => {
    console.log("jshell suggestions ws onopen")
  }
  jshellSuggestionsWs.onclose = () => {
    console.log("jshell suggestions ws onclose")
    jshellSuggestionsWs = undefined
  }
  jshellSuggestionsWs.onmessage = (event) => {
    const data = event.data
    if (data === "pong") {
      return
    }
    editor.trigger(null, "hideSuggestWidget", null)
    const response = JSON.parse(data)
    receivedSuggestions = response.data
    if (receivedSuggestions?.length) {
      // 主动触发提示，回调provideCompletionItems
      editor.trigger(null, "editor.action.triggerSuggest", null)
    }
  }
}

const closeWs = () => {
  if (jshellExecutionWs?.readyState === WebSocket.OPEN) {
    jshellExecutionWs.close()
  }
  if (jshellSuggestionsWs?.readyState === WebSocket.OPEN) {
    jshellSuggestionsWs.close()
  }
}

// 代码提示
monaco.languages.registerCompletionItemProvider("java", {
  provideCompletionItems: () => {
    return {
      suggestions: receivedSuggestions.map((item) => {
        return {
          label: item.label, // 展示的提示
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: item.insertText // 选择后插入的
        }
      })
    }
  }
})

onUnmounted(() => {
  console.log("code editor onUnmounted")
  closeWs()
})
</script>

<template>
  <div ref="editorContainerRef" class="w-full h-full" />
</template>
