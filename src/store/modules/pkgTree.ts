import { defineStore } from "pinia"
import { ref } from "vue"
import { useProjectStore } from "@/store/modules/project"
import { PkgType, rootPid, TreeNodeType } from "@/data/console-data"
import { getPkgTree } from "@/api/console/pkg"

export const usePkgTreeStore = defineStore("pkgTree", () => {
  const projectStore = useProjectStore()

  const docMap = ref({})
  const docTreeData = ref([])

  const fetchDocTree = async () => {
    const treeData = await getPkgTree({
      projectId: projectStore.projectId,
      type: PkgType.Doc,
      parentId: rootPid,
      listItem: true
    })
    const map = {}
    dfs(treeData, TreeNodeType.Doc, map)
    docMap.value = map
    docTreeData.value = treeData
  }

  const dfs = (tree, type, map) => {
    if (tree?.length) {
      tree.forEach((node) => {
        if (node.type === type) {
          map[node.id] = node.data
        }
        dfs(node.children, type, map)
      })
    }
  }

  return { docTreeData, docMap, fetchDocTree }
})
