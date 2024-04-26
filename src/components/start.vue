<template>
    <div class="bottomContainer" v-if="!state.soloMode">
        <div class="bigButton">
            <bottomText />
            <div class="smallButton" :style="{
        'background-image': currentTheme === 'anime' ? 'url(/alias/img/animeButton.png)' : 'none'
    }" v-if="state.phase === 0 || state.phase === 1 || state.phase === 2" @click="service.action()">
                <readyButton />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { getKnopkaName } from '../log';
import { currentTheme, useAliasService, useAliasState } from '../service';
import bottomText from './bottomText.vue';
import readyButton from './readyButton.vue';

const service = useAliasService()
const state = useAliasState()

</script>

<style scoped>
.smallButton {
    height: 88px;
    border: 1px;
    background-color: var(--buttonColor);
    padding: 15px;
    width: 230px;
    cursor: pointer;
    margin: 8px;
    user-select: none;
    justify-content: center;
    align-items: center;
    display: flex;
}

.bigButton {
    background: rgb(64, 64, 63);
    background: var(--item-color);
    width: 300px;
    height: 145px;
    align-items: center;
    flex-flow: column;
    padding: 10px;
    justify-content: center;
    display: flex;
    color: var(--shrift_color);
    box-shadow: 0 1px 15px rgba(0, 0, 0, 0.4);
}

.bottomContainer {
    justify-content: center;
    display: flex;
    align-items: center;
}
</style>
