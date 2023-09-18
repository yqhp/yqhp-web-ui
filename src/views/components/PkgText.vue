<script lang="ts" setup>
defineProps({
  pkg: Object
})
</script>

<template>
  <el-icon class="mr-1"><Folder /></el-icon>
  {{ pkg?.name }}
</template>

<style lang="scss" scoped></style>
