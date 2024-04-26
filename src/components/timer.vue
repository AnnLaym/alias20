<template>
    <div class="realTimer" v-if="state.phase === 2">
        {{ timerText }}
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAliasService, useAliasState, stopTimer } from '../service';

const service = useAliasService()
const state = useAliasState()

const timerText = computed(() => {
    const time = state.value.timer! - timePassed.value
    return new Date(time).toUTCString().match(/(\d\d:\d\d )/)![0].trim()
})
const timePassed = ref(0)
let interval: number
watch(state, () => {
    window.clearInterval(interval);
    timePassed.value = 0
    if (state.value.timer) {
        interval = window.setInterval(() => {
            timePassed.value += 500
        }, 500)
    }
})
</script>

<style scoped>
.realTimer {
    display: table;
    padding: 0 10px;
    font-size: 39px;
    margin: auto;
    margin-bottom: 4px;
    text-align: center;
    color: var(--shrift_color)
}
</style>
