<template>
    <div class="section">
        <div class="speki" v-if="state.phase !== 0 && state.spectators.size">
            <span class="spek"> {{ getKnopkaName('spektators') }} </span>
            <span v-for="chel in state.spectators" class="spek">
                <player :playerID="chel" :spectator="true" />
            </span>
        </div>
        <div class="speki" v-if="state.phase === 0" @click="service.spectatorsJoin()">
            <span class="spek"> {{ getKnopkaName('spektators') }} </span>
            <span v-for="chel in state.spectators" class="spek">
                <player :playerID="chel" :spectator="true" />
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { getKnopkaName } from '../log';
import { reactCommonRoom, useAliasService, useAliasState } from '../service';
import player from './player.vue';


const service = useAliasService()
const state = useAliasState()
watch(state, () => { console.log(state.value) })
</script>

<style scoped>
.speki {
    display: inline-block;
    height: 28px;
    padding: 4px 6px;
    cursor: pointer;
    justify-content: center;
    background: #363739;
    user-select: none;
    white-space: nowrap;
    font-size: 16px;
    box-shadow: none;
    background-color: var(--surface-card) !important;
    display: flex;
}

.section {
    text-align: center;
    position: fixed;
    right: 0;
    top: 0;
    gap: 10px;
}

.spek{
    color: var(--shrift_color)
}
</style>
./teams.vue