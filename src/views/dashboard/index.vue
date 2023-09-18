<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"

const userStore = useUserStore()
</script>

<template>
  <div class="w-full h-full flex justify-center items-center">你好，{{ userStore.nickname }}</div>
</template>
