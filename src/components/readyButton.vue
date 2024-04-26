<template>
    <div class="knopka" v-if="!state.soloMode
        && state.currentPlayer === state.userID && state.readyPlayers.has(state.userID)
        && (state.currentTeam && state.teams[state.currentTeam]?.players?.has(state.userID))">
        {{ getKnopkaName('start') }}
    </div>
    <div class="knopka" v-if="!state.readyPlayers.has(state.userID)
        && (state.currentTeam && state.teams[state.currentTeam].players.has(state.userID))
        && state.phase === 1">
        {{ getKnopkaName('ready') }}
    </div>
    <div class="knopka" v-if="state.hostID == state.userID && state.phase === 0">
        {{ getKnopkaName('zapustit') }}
    </div>
    <div class="knopka" v-if="state.phase === 2
        && state.userID === state.teams[state.currentTeam!].currentPlayer">
        {{ getKnopkaName('next') }}
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useAliasService, useAliasState } from '../service';
import timer from './timer.vue';
import { getKnopkaName } from '../log';

const service = useAliasService()
const state = useAliasState()

</script>

<style scoped>
.knopka {
    font-size: 30px;
    color: var(--shrift_color);
}
</style>
