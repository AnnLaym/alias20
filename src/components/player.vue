<template>
    <div class="player" :class="{
        'highlighted': highlightedUser === playerID,
        'ready': state.readyPlayers.has(playerID),
    }">
        <span class="material-icons settings-button" v-if="!spectator && state.teams[teamID!].currentPlayer === state.currentPlayer
        && playerID === state.currentPlayer">
            east
        </span>
        <span class="nick">
            {{ state.playerNames[playerID] }}
        </span>
        <span class="material-symbols-outlined" v-if="state.currentAssistant === playerID">
            keyboard_backspace
        </span>
        <div class="hostButton" v-if="state.hostID === state.userID">
            <span @click="service.setTurn(playerID)" class="button" v-if="!spectator">
                <i className="material-icons host-button " title="Remove"> u_turn_left</i>
            </span>
            <span @click="service.removePlayer(playerID)" class="button" v-if="state.userID !== playerID">
                <i className="material-icons host-button " title="Remove"> delete_forever</i>
            </span>
            <span class="button" @click="service.giveHost(playerID)" v-if="state.userID !== playerID">
                <i className="material-icons host-button " title="Remove"> key</i>
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { highlightedUser, reactCommonRoom, useAliasService, useAliasState } from '../service';
import { getKnopkaName } from '../log';
import { TeamID, UserID } from '../../server/types';

const service = useAliasService()
const state = useAliasState()

defineProps<{
    playerID: UserID
    isCurrent?: boolean
    teamID?: TeamID
    solo?: true
    spectator?: boolean
}>()

</script>

<style scoped>
.player {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 8px;
    font-size: 20px;
    color: var(--shrift-color);
    transition: margin-left 0.2s ease-out;
}

.player:hover .button {
    display: block;
    color: grey;
    font-size: 20px;
}

.button {
    cursor: pointer;
    display: none;
}

.hostButton {
    width: 20px;
    height: 20px;
    display: flex;
    flex-flow: row;
}

.spek .nick {
    font-size: 16px !important;
    display: flex;
    margin-top: 0px;
}

.spek .player {
    margin-top: 0px;
    padding-left: 5px;
}

.nick {
    color: var(--shrift-color);
}

.highlighted {
    margin-left: 3px;
    transition: none;
}

.ready {
    background-color: var(--buttonColor);
}
</style>
