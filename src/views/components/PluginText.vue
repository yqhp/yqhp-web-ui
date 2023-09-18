<script lang="ts" setup>
defineProps({
  name: {
    type: String,
    required: true
  }
})
</script>

<template>
  <svg-icon name="plugin" class="mr-1" />
  {{ name }}
</template>

<style lang="scss" scoped></style>
