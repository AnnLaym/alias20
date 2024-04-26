<template>
    <div v-if="state.inited" :style="{
        '--background-color': themes[currentTheme as keyof typeof themes].background,
        '--shrift_color': themes[currentTheme as keyof typeof themes].shriftColor,
        '--item-color': themes[currentTheme as keyof typeof themes].itemColor,
        '--buttonColor': themes[currentTheme as keyof typeof themes].buttonColor,
    }">
        <spectators />
        <teams />
        <div class="anime" v-if="currentTheme === 'anime'">
            <img src="../components/img/anime1.webp" alt="anime" />
        </div>
        <bottomPart />
        <DashMenu :bottom-buttons="bottomButtons" :number-settings="numberSettings" />
        <packMenu />
        <reports />
    </div>
</template>

<script setup lang="ts">
import DashMenu from '../components/common/DashMenu.vue';
import { DashMenuButton, DashMenuNumberSetting } from '../components/common/dash-menu';
import { computed, ref } from 'vue';
import { useAliasService, useAliasState, toggleLanguage1, themes, currentTheme, toggleTheme, aliasClientState } from '../service';
import spectators from '../components/spectators.vue';
import teams from '../components/teams.vue';
import bottomPart from '../components/bottomPart.vue';
import packMenu from '../components/packMenu.vue';
import reports from '../components/reports.vue';
defineProps();

const state = useAliasState();
const service = useAliasService();

const bottomButtons = computed<DashMenuButton[]>(() => {
    return [{
        icon: 'store',
        onClick: () => {
            //service.setRoomMode();
        },
    },
    {
        icon: 'language',
        onClick: () => {
            toggleLanguage1();
        },
    },
    {
        icon: 'contrast',
        onClick: () => {
            toggleTheme();
        },
    },
    {
        icon: 'person',
        onClick: () => {
            service.setMode('solo');
        },
    },
    {
        icon: 'person',
        onClick: () => {
            service.setMode('team');
        },
    },
    {
        icon: state.value.phase ? 'lock_outline' : 'lock_open',
        onClick: async () => {
            state.value.phase ? service.stopGame() : service.action()
        },
    },
    {
        icon: 'wb_sunny',
        onClick: async () => {
            aliasClientState.value.puckBrowser.menuOpened = true
        },
    },
    {
        icon: 'chrome_reader_mode',
        onClick: async () => {
            aliasClientState.value.reportBrowser.menuOpened = true
        },
    },

    ];
});

const numberSettings: DashMenuNumberSetting[] = [
    {
        icon: 'wb_sunny',
        originalValue: 1,
        onChange: (v) => {
            console.log('wb_sunny', v);
        },
    },
];

</script>

<style>
body.dark-theme {
    color: var(--text-color);
    padding-top: 10px;
    place-items: start;
    background-size: contain;
    background-repeat: repeat;
}

.anime {
    position: absolute;
    right: 0px;
}
</style>
../components/spectators.vue