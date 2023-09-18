<script lang="ts" setup>
import { ref, watch, onMounted, computed, nextTick } from "vue"
import {
  deletePlanDocById,
  listPlanDocByPlanId,
  movePlanDoc,
  updatePlanDoc,
  createPlanDocs
} from "@/api/console/planDoc.js"
import { Delete, Search } from "@element-plus/icons-vue"
import { usePkgTreeStore } from "@/store/modules/pkgTree"
import { DocKind, DocStatus, TreeNodeType } from "@/data/console-data"
import { ElMessage, ElSwitch } from "element-plus"
import DocText from "@/views/components/DocText.vue"
import PkgText from "@/views/components/PkgText.vue"
import Sortable from "sortablejs"

const pkgTreeStore = usePkgTreeStore()

let planId
const planDocs = ref([])

const fetchPlanDocs = async () => {
  planDocs.value = await listPlanDocByPlanId(planId)
}

const initData = (_planId) => {
  planId = _planId
  filterText.value = ""
  fetchPlanDocs()
}

defineExpose({ initData })

onMounted(async () => {
  pkgTreeStore.fetchDocTree()
  nextTick(() => initTableSortable())
})

const sortableTableRef = ref()

const initTableSortable = () => {
  const tbody = sortableTableRef.value.$el.querySelector(".el-table__body-wrapper tbody")
  Sortable.create(tbody, {
    animation: 150,
    onEnd(e) {
      handleDocMove(e.oldIndex, e.newIndex)
    }
  })
}

const handleDocMove = async (oldIdx, newIdx) => {
  if (oldIdx == newIdx) return
  const planDocList = planDocs.value
  const from = planDocList[oldIdx].id
  const to = planDocList[newIdx].id
  // newIdx > oldIdx ? 往下拖动 : 往上拖动
  const type = newIdx > oldIdx ? "AFTER" : "BEFORE"
  await movePlanDoc({ from, to, type })

  const oldRow = planDocList.splice(oldIdx, 1)[0]
  planDocList.splice(newIdx, 0, oldRow)
}

const handleDelete = async (idx, row) => {
  await deletePlanDocById(row.id)
  planDocs.value.splice(idx, 1)
}

const docTreeRef = ref()
const saveBtnLoading = ref(false)

const checkableDocTreeData = computed(() => {
  return filterDocTree(pkgTreeStore.docTreeData, (node) => {
    return (
      node.type === TreeNodeType.Pkg ||
      (node.type === TreeNodeType.Doc &&
        node.data.kind === DocKind.JshAction &&
        (node.data.status === DocStatus.Deprecated || node.data.status === DocStatus.Released) &&
        !planDocs.value.some((planDoc) => planDoc.docId === node.id))
    )
  })
})

const filterDocTree = (tree, predicate, res = []) => {
  if (!tree || !tree.length) return []
  tree.forEach((item) => {
    if (predicate(item)) {
      const node = { ...item, children: [] }
      res.push(node)
      if (item.children?.length) {
        filterDocTree(item.children, predicate, node.children)
      }
    }
  })
  return res
}

const checkedDocs = computed(() => {
  return docTreeRef.value.getCheckedNodes().filter((node) => node.type === TreeNodeType.Doc)
})

const addDocs = async () => {
  const checkedDocList = checkedDocs.value.map((node) => {
    return {
      planId,
      docId: node.id
    }
  })
  if (!checkedDocList.length) {
    ElMessage.error("请勾选Doc")
    return
  }
  saveBtnLoading.value = true
  await createPlanDocs(checkedDocList).finally(() => (saveBtnLoading.value = false))
  fetchPlanDocs()
}

const updateDoc = async (row) => {
  await updatePlanDoc(row.id, {
    docId: row.docId,
    enabled: row.enabled
  })
}

// 树过滤
const filterText = ref("")
watch(filterText, (val) => {
  docTreeRef.value!.filter(val)
})
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}
</script>
<template>
  <div class="h-full flex">
    <div class="flex-1 flex flex-col">
      <div class="flex">
        <div class="flex-1">
          <el-input size="small" v-model="filterText" :prefix-icon="Search" clearable />
        </div>
        <div v-if="docTreeRef" class="ml-2">
          <span class="text-xs">已勾选{{ checkedDocs.length }}个Action</span>
        </div>
        <div>
          <el-button size="small" text type="primary" @click="addDocs" :loading="saveBtnLoading"> 添加 </el-button>
        </div>
      </div>
      <div class="flex-1 overflow-auto">
        <el-tree
          ref="docTreeRef"
          :data="checkableDocTreeData"
          :props="{ label: 'name' }"
          :filter-node-method="filterNode"
          show-checkbox
          default-expand-all
        >
          <template #default="{ node, data }">
            <PkgText v-if="data.type === TreeNodeType.Pkg" :pkg="data.data" />
            <DocText v-else :doc="data.data" />
          </template>
        </el-tree>
      </div>
    </div>
    <div class="flex-1">
      <el-table ref="sortableTableRef" height="100%" size="small" :data="planDocs" row-key="id">
        <el-table-column type="index" width="55" />
        <el-table-column>
          <template #header> 已添加{{ planDocs.length }}个Action </template>
          <template #default="{ row }">
            <DocText :doc="pkgTreeStore.docMap[row.docId]" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="scope">
            <el-switch
              size="small"
              v-model="scope.row.enabled"
              :active-value="1"
              :inactive-value="0"
              @change="updateDoc(scope.row)"
            />
            <el-button-group>
              <el-button
                text
                size="small"
                type="primary"
                :disabled="scope.$index === 0"
                @click="handleDocMove(scope.$index, 0)"
              >
                置顶
              </el-button>
              <el-button
                text
                size="small"
                type="primary"
                :disabled="scope.$index === planDocs.length - 1"
                @click="handleDocMove(scope.$index, planDocs.length - 1)"
              >
                置底
              </el-button>
              <el-button text size="small" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
