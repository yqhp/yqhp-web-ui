<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { useProjectStore } from "@/store/modules/project"
import { usePkgTreeStore } from "@/store/modules/pkgTree"
import { deletePkgById, movePkg } from "@/api/console/pkg"
import { deleteDocById, moveDoc, copyDoc } from "@/api/console/doc"
import SavePkg from "../SavePkg/index.vue"
import AddDoc from "../AddDoc/index.vue"
import SavePlanDoc from "../SavePlanDoc/index.vue"
import { ElMessageBox } from "element-plus"
import { Plus, More, Search } from "@element-plus/icons-vue"
import { TreeNodeType, PkgType, DocKind, DocFlow } from "@/data/console-data"
import DocText from "@/views/components/DocText.vue"
import PkgText from "@/views/components/PkgText.vue"

const projectStore = useProjectStore()
const pkgTreeStore = usePkgTreeStore()

const savePkgRef = ref()
const addDocRef = ref()
const savePlanDocRef = ref()

const treeRef = ref()
const expandedKeys = ref([]) // 由于每次刷新treeData，会触发重新渲染tree，node的展开/收起状态会被重置，需要保存node的展开状态

const nodeExpand = (data, node, _) => {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id)
  }
}

const nodeCollapse = (data, node, _) => {
  const idx = expandedKeys.value.indexOf(data.id)
  if (idx !== -1) {
    expandedKeys.value.splice(idx, 1)
  }
}

const filterText = ref("")
watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}

const fetchTreeData = async () => {
  await pkgTreeStore.fetchDocTree()
}

const handleAddDoc = (pkg) => {
  addDocRef.value.open({
    projectId: projectStore.projectId,
    pkgId: pkg?.id,
    kind: DocKind.JshInit,
    flow: DocFlow.StopRunningNextIfError
  })
}

const handleSavePlanDoc = (doc) => {
  savePlanDocRef.value.open(doc)
}

const handleCopyDoc = async (doc) => {
  const newDoc = await copyDoc(doc.id)
  onDocAdded(newDoc)
}

const handleAddPkg = (pkg) => {
  savePkgRef.value.open(true, {
    projectId: projectStore.projectId,
    parentId: pkg?.id,
    type: PkgType.Doc
  })
}

const handleUpdatePkg = (pkg) => {
  savePkgRef.value.open(false, pkg)
}

const handleDelete = (data) => {
  ElMessageBox.confirm(`确认删除${data.name}`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    if (isPkgNode(data)) {
      await deletePkgById(data.id)
    } else {
      await deleteDocById(data.id)
    }
    fetchTreeData()
  })
}

const allowDrop = (draggingNode, dropNode, type) => {
  const from = draggingNode.data
  const to = dropNode.data

  if (type === "inner") {
    if (isPkgNode(from) && isDocNode(to)) {
      return false
    }
    if (isDocNode(from) && isDocNode(to)) {
      return false
    }
  } else {
    // prev or next
    if (from.type !== to.type) {
      return false
    }
  }

  return true
}

const handleDrop = async (draggingNode, dropNode, dropType) => {
  const from = draggingNode.data.id
  const to = dropNode.data.id
  const type = dropType.toUpperCase()
  try {
    if (isPkgNode(draggingNode.data)) {
      await movePkg({ from, to, type })
    } else {
      await moveDoc({ from, to, type })
    }
  } finally {
    await fetchTreeData()
  }
}

const onDocAdded = async (doc) => {
  await fetchTreeData()
  nodeClick({
    id: doc.id,
    type: TreeNodeType.Doc
  })
}

const emit = defineEmits(["clickItem"])
const nodeClick = (node) => {
  if (!isPkgNode(node)) {
    emit("clickItem", {
      id: node.id,
      type: node.type
    })
  }
}

const isPkgNode = (data) => {
  return data.type === TreeNodeType.Pkg
}

const isDocNode = (data) => {
  return data.type === TreeNodeType.Doc
}

const isActionNode = (data) => {
  return data.data.kind === DocKind.JshAction
}

onMounted(() => {
  fetchTreeData()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex">
      <el-input v-model="filterText" :prefix-icon="Search" clearable />
      <el-dropdown>
        <el-button :icon="Plus" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleAddPkg">新建目录</el-dropdown-item>
            <el-dropdown-item @click="handleAddDoc"> 新建Doc </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="flex-1 overflow-auto">
      <el-tree
        class="min-w-max"
        ref="treeRef"
        node-key="id"
        :default-expanded-keys="expandedKeys"
        @node-expand="nodeExpand"
        @node-collapse="nodeCollapse"
        :data="pkgTreeStore.docTreeData"
        :props="{ label: 'name' }"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        :allow-drop="allowDrop"
        @node-drop="handleDrop"
        draggable
      >
        <template #default="{ node, data }">
          <div class="w-full flex justify-between tree-row">
            <div class="flex items-center">
              <PkgText v-if="isPkgNode(data)" :pkg="data.data" />
              <DocText v-else :doc="data.data" />
            </div>
            <div class="more">
              <el-icon v-if="isPkgNode(data)" @click.stop="handleAddDoc(data.data)"><Plus /></el-icon>
              <el-icon v-if="isActionNode(data)" @click.stop="handleSavePlanDoc(data.data)"><Plus /></el-icon>
              <el-dropdown>
                <el-icon class="mx-2"><More /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <template v-if="isPkgNode(data)">
                      <el-dropdown-item @click="handleAddPkg(data.data)"> 新建目录 </el-dropdown-item>
                      <el-dropdown-item @click="handleUpdatePkg(data.data)"> 编辑目录 </el-dropdown-item>
                    </template>
                    <template v-else>
                      <el-dropdown-item @click="handleCopyDoc(data)"> 复制 </el-dropdown-item>
                    </template>
                    <el-dropdown-item @click="handleDelete(data)" divided> 删除 </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
  </div>

  <save-pkg ref="savePkgRef" @ok="fetchTreeData" />
  <add-doc ref="addDocRef" @ok="onDocAdded" />
  <save-plan-doc ref="savePlanDocRef" />
</template>

<style lang="scss" scoped>
.more {
  visibility: hidden;
  transition: visibility 0.5s ease; /* 添加渐变效果 */
}
.tree-row:hover .more {
  visibility: visible;
}
</style>
