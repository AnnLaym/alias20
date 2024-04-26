<template>
    <div class="teams" v-if="state.mode === 'team' || state.mode === 'deaf'">
        {{ getKnopkaName('teams') }}
    </div>
    <div v-if="state.mode === 'solo'">
        {{ getKnopkaName('players') }}
    </div>
    <div class="allTeams" v-if="state.mode === 'team' || state.mode === 'deaf'">
        <div v-for="(t, i) of state.teams">
            <div class="team" @click="service.teamJoin(i)">
                <div class="scoreTeam">
                    <div class="host-controlls" @click="service.setScore({ [i]: '10' })">
                        <i className="material-icons settings-button">edit</i>
                    </div>
                    {{ getKnopkaName('score') }}
                    {{ state.teams[i].score }}
                </div>
                <div v-for="p of t.players" class="playerOfPlayer">
                    <player :playerID="p" :teamID="i" />
                </div>
            </div>
        </div>
        <div v-if="state.phase === 0" @click="service.teamJoin('new')" class="team">
            +
        </div>
    </div>
    <div v-if="state.mode === 'solo' && state.soloMode && Object.keys(state.teams).length > 0" class="soloPlayers">
        <div class="team" @click="service.teamJoin(Object.keys(state.teams)[0])"
            v-for="player of state.teams[Object.keys(state.teams)[0]].players">
            <player :playerID="player" :teamID="Object.keys(state.teams)[0]" :solo="true" />
        </div>
    </div>
    <div v-if="state.mode === 'solo' && state.soloMode && Object.keys(state.teams).length === 0" class="soloPlayers">
        <div v-if="state.phase === 0" @click="service.teamJoin('new')" class="team">
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { aliasClientState, useAliasService, useAliasState } from '../service';
import { getKnopkaName } from '../log';
import player from './player.vue';
import { TeamID } from '../../server/types';

const service = useAliasService()
const state = useAliasState()
</script>

<style scoped>
.team {
    width: 150px;
    height: 150px;
    margin: 10px;
    padding: 10px;
    text-align: left;
    align-items: center;
    display: flex;
    background: var(--item-color);
    flex-flow: column;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    color: var(--shrift_color);
}

.soloPlayers .team {
    width: 200px;
    height: 180px;
}

.teams {
    margin-bottom: 5px;
    color: var(--shrift_color);
}

.allTeams {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.scoreTeam {
    text-align: end;
    width: 100%;
    margin-top: 0px;
    flex-flow: row;
    justify-content: space-around;
    color: var(--shrift_color);
}

.host-controlls {
    display: none;
}

.scoreTeam:hover .host-controlls {
    display: flex;
    position: fixed;
    gap: 5px;
}

.playerOfPlayer {
    width: 100%;
}
</style>
