<template>
    <div @click="goTo('/oneToOne')">
        一对一网络视频
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter()
const goTo = (path: string) => {
    console.log(path)
    router.push(path)
}
</script>
