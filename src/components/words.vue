<template>
    <timer />
    <div class="wordsConteiner">
        <div v-for="word of state.currentWords" class="words">
            <div class="toggleWord">
                <div class="reportContainer">
                    <div class="reported" v-if="word.reported">
                        !
                    </div>
                    <div class="reportWord" v-if="!word.reported && state.phase !== 2">
                        !
                    </div>
                    <div class="sendReport" v-if="state.phase !== 2">
                        <div class="buttonZ" @click="sendEasyReport(word.word)">
                            {{ getKnopkaName('easy') }}
                        </div>
                        <div class="buttonZ" v-if="state.level !== 1" @click="sendNormalReport(word.word)">
                            {{ getKnopkaName('normal') }}
                        </div>
                        <div class="buttonZ" v-if="state.level !== 2" @click="sendHardReport(word.word)">
                            {{ getKnopkaName('hard') }}
                        </div>
                        <div class="buttonZ" v-if="state.level !== 3" @click="sendInsaneReport(word.word)">
                            {{ getKnopkaName('insane') }}
                        </div>
                        <div class="buttonZ" @click="sendRemoveReport(word.word)">
                            {{ getKnopkaName('delete') }}
                        </div>
                    </div>
                </div>
                <div class="word">
                    {{ hyphenate(word.word) }}
                </div>
                <div class="pointsContainer">
                    <div class="points" v-if="state.phase !== 2">
                        {{ word.points }}
                    </div>
                    <div class="buttonContainer">
                        <div class="buttonV" v-if="state.phase !== 2" @click="addPoint(word as any)">
                            {{ '+ ' }}
                        </div>
                        <div class="buttonV" v-if="state.phase !== 2" @click="minusPoint(word as any)">
                            {{ '-' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="newWord && state.phase === 2" class="word new">
            {{ hyphenate(newWord.word) }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { hyphenate, newWord, useAliasService, useAliasState } from '../service';
import timer from './timer.vue';
import { getKnopkaName } from '../log';

// const result = await (await fetch('/bg/alias/moderation/list')).json()
// console.log(result)
const service = useAliasService()
const state = useAliasState()

function addPoint(word: { points: number, reported: boolean, word: string }) {
    setPoints(word, word.points + 1 > 1 ? 1 : word.points + 1)
}

function minusPoint(word: { points: number, reported: boolean, word: string }) {
    setPoints(word, word.points - 1 < -1 ? -1 : word.points - 1)
}

function setPoints(word: { points?: number; word: string; reported: boolean }, points: number) {
    let newPoints = state.value.currentWords.map((w) => {
        if (w.word === word.word) {
            w.points = points ? points : 0
        }
        return w
    })
    service.setWordPoints(newPoints as any)
}

function sendEasyReport(word: string) {
    sendReport(word, 0)
}

function sendNormalReport(word: string) {
    sendReport(word, 1)
}

function sendHardReport(word: string) {
    sendReport(word, 2)
}

function sendInsaneReport(word: string) {
    sendReport(word, 3)
}

function sendRemoveReport(word: string) {
    sendReport(word, 4)
}

function sendReport(word: string, lvl: number) {
    service.reportWord(word, lvl)
}

</script>

<style scoped>
.buttonV {
    margin: 0px;
    padding: 0px;
    cursor: pointer;
    font-size: 15px;
    width: 16px;
    height: 16px;
}

.points {
    width: 28px;
    height: 28px;
    background-color: gray;
    align-items: center;
    display: flex;
    justify-content: center;
}

.buttonV:first-child {
    background-color: green;
}

.buttonV:last-child {
    background-color: red;
}

.toggleWord:hover .buttonContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0px;
}

.buttonContainer {
    display: none;
    flex-flow: column;
    justify-content: center;
    padding-left: 2px;
}

.wordsConteiner {
    display: flex;
    width: 300px;
    background: var(--item-color);
    padding: 3px 0;
    justify-content: center;
    flex-flow: column;
    box-shadow: 0 1px 15px rgba(0, 0, 0, 0.4);
}

.reportContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: row;
    width: 17%;
}

.reportWord {
    display: none;
}

.toggleWord:hover .reportWord {
    display: block;
    position: relative;
    background-color: red;
    width: 70%;
    height: 70%;
}

.reported {
    background-color: red;
}

.buttonZ {
    cursor: pointer;
    display: none;
    flex-flow: column;
}

.reportContainer .buttonZ:hover {
    color: grey;
    left: -100px;
    display: absolute;
    height: auto;
    width: auto;
}

.sendreport {
    background-color: var(--buttonColor);
    left: -50px;
    position: absolute;
    font-size: 22px;
    width: 109px;
    max-width: 109px
}

.reportContainer:hover .buttonZ {
    display: block;
}

.words {
    border-bottom: 1px solid gainsboro;
    justify-content: center;
    align-items: center;
    display: flex;
    color: var(--shrift_color);
    flex-flow: row;
}

.word {
    flex-flow: row;
    font-size: 30px;
    margin-top: 5px;
    width: 70%;
    margin-bottom: 3px
}

.toggleWord {
    display: flex;
    justify-content: center;
    align-items: space-between;
    flex-flow: row;
    font-size: 30px;
    width: 110%;
}

.pointsContainer {
    width: 17%;
    font-size: 30px;
    margin-top: 5px;
    display: flex;
    flex-flow: row;
    user-select: none
}

.reportContainer:hover .sendreport {
    width: 15%;
    font-size: 30px;
    display: flex;
    position: absolute;
    flex-flow: column;
}

.word.new {
    width: 100%;
}
</style>
