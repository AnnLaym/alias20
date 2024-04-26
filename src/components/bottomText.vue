<template>
    <div class="nadpis" v-if="state.hostID !== state.userID && state.phase === 0">
        {{ getKnopkaName('waitingforHost') }}
    </div>
    <div class="nadpis" v-if="state.hostID == state.userID && state.phase === 0 && Object.keys(state.teams).length > 0">
        {{ getKnopkaName('hostStartGame') }}
    </div>
    <div class="nadpis" v-if="state.phase === 1 && state.currentTeam
        && state.teams[state.currentTeam].players.has(state.userID)
        && state.readyPlayers.size !== state.teams[state.currentTeam].players.size">
        {{ getKnopkaName('waitingforTeam') }}
    </div>
    <div class="nadpis" v-if="state.phase === 1 && state.currentTeam
        && state.teams[state.currentTeam].players.has(state.userID)
        && state.userID === state.currentPlayer
        && state.readyPlayers.size === state.teams[state.currentTeam].players.size">
        {{ getKnopkaName('Prepare to explain') }}
    </div>
    <div class="nadpis" v-if="state.phase === 0 && state.userID === state.currentPlayer">
        {{ getKnopkaName('U can start') }}
    </div>
    <div class="nadpis" v-if="state.phase === 2 && state.userID === state.currentPlayer">
        {{ getKnopkaName('explain words') }}
    </div>
    <div class="nadpis"
        v-if="state.phase === 2 && state.teams[state.currentTeam!].players.has(state.userID) && state.userID !== state.currentPlayer">
        {{ getKnopkaName('guess words') }}
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
.nadpis {
    max-height: 40px;
    color: var(--shrift_color);
}
</style>
