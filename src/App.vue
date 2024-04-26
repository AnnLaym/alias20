<template>
    <Alias />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { currentTheme, themes, useAliasService, useAliasState } from './service';
import Alias from './views/Alias.vue';
const service = useAliasService()
const state = useAliasState()

watch(currentTheme, () => {
    document.body.style.backgroundColor = themes[currentTheme.value as keyof typeof themes]!.background;
}, {immediate : true})
</script>

<style>
@import './style/prime.scss';
@import './style/common.scss';
@import './style/nechto.css';
</style>./views/Alias.vue
