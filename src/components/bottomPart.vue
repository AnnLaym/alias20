<template>
    <div class="bottomPart">
        <words />
        <start />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import words from './words.vue';
import start from './start.vue';
</script>

<style scoped>
.bottomPart {
    flex-flow: column;
    display: flex;
    position: fixed;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
}
</style>
