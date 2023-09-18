<script lang="ts" setup>
defineProps({
  name: {
    type: String,
    required: true
  }
})
</script>

<template>
  <svg-icon :name="name.endsWith('.class') ? 'class' : name.endsWith('.jar') ? 'jar' : ''" class="mr-1" />
  {{ name }}
</template>

<style lang="scss" scoped></style>
