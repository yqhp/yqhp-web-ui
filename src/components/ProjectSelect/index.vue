<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useProjectStore } from "@/store/modules/project"
import { listJoinedProjects } from "@/api/console/project"

const projectStore = useProjectStore()
const joinedProjects = ref([])

const fetchJoinedProjects = async () => {
  joinedProjects.value = await listJoinedProjects()
}

const onVisibleChange = (val) => {
  if (val) {
    fetchJoinedProjects()
  }
}

const onChange = (val) => {
  projectStore.setProjectId(val)
  window.location.reload()
}

onMounted(async () => {
  await fetchJoinedProjects()
  const joined = joinedProjects.value
  const curr = projectStore.projectId
  if (joined.length) {
    // 当前未选择项目 或 选择的项目不在参与的项目中，默认选择第一个
    if (!curr || !joined.some((project) => project.id === curr)) {
      projectStore.setProjectId(joined[0].id)
    }
  } else {
    projectStore.setProjectId("0")
  }
})
</script>

<template>
  <el-select
    v-model="projectStore.projectId"
    @visible-change="onVisibleChange"
    @change="onChange"
    placeholder="选择项目"
  >
    <template #prefix> 当前项目 </template>
    <el-option v-for="project in joinedProjects" :key="project.id" :label="project.name" :value="project.id" />
  </el-select>
</template>

<style lang="scss" scoped></style>
