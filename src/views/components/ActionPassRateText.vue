<script lang="ts" setup>
defineProps({
  passRate: String
})
</script>

<template>
  <el-text v-if="passRate" :type="passRate === '100%' ? 'success' : 'danger'">
    {{ passRate }}
  </el-text>
</template>

<style lang="scss" scoped></style>
