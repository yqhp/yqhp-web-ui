<script lang="ts" setup>
import { ref } from "vue"
import { ElDialog } from "element-plus"
import { createUserProject, deleteUserProject, listUserProjectByUserId } from "@/api/console/userProject"
import { getAllProjects } from "@/api/console/project"

const visible = ref(false)
const allProjects = ref([])
const user = ref({})

const open = async (data) => {
  user.value = data
  visible.value = true
  allProjects.value = await getAllProjects()
  const checkedProjectIds = (await listUserProjectByUserId(data.id)).map((userProject) => userProject.projectId)
  allProjects.value.forEach((project) => {
    project.checked = checkedProjectIds.includes(project.id)
  })
}

const onChange = async (checked, project) => {
  try {
    if (checked) {
      await createUserProject({
        userId: user.value.id,
        projectId: project.id
      })
    } else {
      await deleteUserProject({
        userId: user.value.id,
        projectId: project.id
      })
    }
  } catch (err) {
    project.checked = !project.checked
  }
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" :title="`【项目】${user?.username}`" :close-on-click-modal="false" width="600px">
    <el-checkbox
      v-for="project in allProjects"
      :key="project.id"
      v-model="project.checked"
      @change="(checked) => onChange(checked, project)"
    >
      {{ project.name }}
    </el-checkbox>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
