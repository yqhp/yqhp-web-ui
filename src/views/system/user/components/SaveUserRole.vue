<script lang="ts" setup>
import { ref } from "vue"
import { ElDialog } from "element-plus"
import { createUserRole, deleteUserRole, listUserRoleByUserId } from "@/api/auth/userRole"
import { getAllRoles } from "@/api/auth/role"

const visible = ref(false)
const allRoles = ref([])
const user = ref({})

const open = async (data) => {
  user.value = data
  visible.value = true
  allRoles.value = await getAllRoles()
  const checkedRoleIds = (await listUserRoleByUserId(data.id)).map((userRole) => userRole.roleId)
  allRoles.value.forEach((role) => {
    role.checked = checkedRoleIds.includes(role.id)
  })
}

const onChange = async (checked, role) => {
  try {
    if (checked) {
      await createUserRole({
        userId: user.value.id,
        roleId: role.id
      })
    } else {
      await deleteUserRole({
        userId: user.value.id,
        roleId: role.id
      })
    }
  } catch (err) {
    role.checked = !role.checked
  }
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="visible" :title="`【角色】${user?.username}`" :close-on-click-modal="false" width="600px">
    <el-checkbox
      v-for="role in allRoles"
      :key="role.id"
      v-model="role.checked"
      @change="(checked) => onChange(checked, role)"
    >
      {{ role.name }}
    </el-checkbox>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
