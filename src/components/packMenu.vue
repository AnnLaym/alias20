<template>
    <Dialog v-model:visible="aliasClientState.puckBrowser.menuOpened" header="Alias custom packs"
        :style="{ width: '63rem', overflow: 'hidden' }">
        <div class="totalPacks">
            <div class="togglepacks" :class="{ 'alreadySelected': aliasClientState.puckBrowser.currentPack }">
                <div v-for="pack in aliasClientState.puckBrowser.packList" :key="pack._id" class="pack"
                    @click="packClick(pack._id)"
                    :class="{ 'selected': aliasClientState.puckBrowser.currentPack === pack._id }">
                    <div class="packNew">
                        <div class="title">{{ pack.title }}</div>
                        <div class="secordContainer">
                            <div class="owner">
                                {{ getPackKnopkaName('owner') }}
                                {{ pack.owner ? pack.owner : 'unknown' }}
                            </div>
                            <div class="length">
                                {{ getPackKnopkaName('слов') }}
                                {{ pack.length }}
                            </div>
                        </div>
                    </div>
                    <div class="packOld">
                        <div class="description"> {{ getPackKnopkaName('o pake') }} {{ hyphenate(pack.description) }}
                        </div>
                    </div>
                    <div class="bottomPack">
                        <div class="date">
                            {{ getPackKnopkaName('CreateDate') }}
                            {{ pack.createTime }}
                        </div>
                        <div class="date">
                            {{ getPackKnopkaName('updateDate') }}
                            {{ pack.updateTime }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="second part" v-if="aliasClientState.puckBrowser.currentPack !== undefined">
                <div class="toggleSelectedPack">
                    <div class="title">{{ aliasClientState.puckBrowser.packList?.find(pack => pack._id ===
        aliasClientState.puckBrowser.currentPack)?.title }}</div>
                    <div class="secordContainer">
                        <div class="owner">
                            {{ getPackKnopkaName('owner') }}
                            {{ aliasClientState.puckBrowser.packList?.find(pack => pack._id ===
        aliasClientState.puckBrowser.currentPack)?.owner ?
        aliasClientState.puckBrowser.packList?.find(pack => pack._id ===
            aliasClientState.puckBrowser.currentPack)?.owner : 'unknown' }}
                        </div>
                        <div class="length">
                            {{ getPackKnopkaName('слов') }}
                            {{ aliasClientState.puckBrowser.packList?.find(pack => pack._id ===
        aliasClientState.puckBrowser.currentPack)?.length }}
                        </div>
                    </div>
                    <div class="packOld">
                        <div class="description"> {{ getPackKnopkaName('o pake') }}
                            {{ aliasClientState.puckBrowser.packList?.find(pack => pack._id ===
        aliasClientState.puckBrowser.currentPack)?.description }}
                        </div>
                    </div>
                    <div class="words">
                        <div v-for="word in aliasClientState.puckBrowser.currentPackWords" :key="word">
                            {{ word }}
                        </div>
                    </div>
                </div>
                <div class="buttons">
                    <div class="playButton" @click="setPack()">
                        {{ getPackKnopkaName('playPack') }}
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { getKnopkaName, getPackKnopkaName } from '../log';
import { aliasClientState, reactCommonRoom, useAliasService, useAliasState, aliasRestService, hyphenate } from '../service';
import Dialog from 'primevue/dialog';
import { PackData } from '../../server/types';
import { PackListItem } from '../../server/types';
watch(() => aliasClientState.value.puckBrowser.menuOpened, async (value) => {
    if (value) {
        aliasClientState.value.puckBrowser.packList = await aliasRestService.getPackList();
    }
});
function packClick(pack: string) {
    aliasClientState.value.puckBrowser.currentPack = aliasClientState.value.puckBrowser.currentPack === pack ? undefined : pack
}

function setPack(){
    aliasClientState.value.puckBrowser.menuOpened = false
    service.selectWordSet('custom')
}

watch(() => aliasClientState.value.puckBrowser.currentPack, (value) => {
    if (value) {
        aliasClientState.value.puckBrowser.currentPack = value
    }
});
watch(() => aliasClientState.value.puckBrowser.currentPack, async (value) => {
    if (value) {
        aliasClientState.value.puckBrowser.currentPackWords = await aliasRestService.getPackWords(value);
    }
});

const service = useAliasService()
const state = useAliasState()
</script>

<style scoped>
.playButton {
    background-color: green;
    width: 100px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.buttons {
    width: 100%;
    margin-top: 5px;
    align-items: end;
    cursor: pointer;
}

.togglepacks {
    display: flex;
    flex-flow: row;
    gap: 8px;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    cursor: pointer;
}

.secordContainer {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
}

.pack {
    border: 1px;
    background-color: gray;
    width: 300px;
    height: 230px;
    border-radius: 20px;
    overflow: hidden;
}

.title {
    font-size: 30px;
    align-items: center;
    display: flex;
    justify-content: center;
    background-color: #373131;
    padding-top: 3px;
    padding-bottom: 2px;
}

.packNew {
    display: flex;
    justify-content: center;
    display: flex;
    flex-flow: column;
}

.owner {
    padding-top: 5px;
    padding-left: 5px;
}

.length {
    padding-top: 5px;
    padding-left: 5px;
    text-align: end;
}

.description {
    background-color: #443f3f;
    padding-top: 5px;
    padding-left: 5px;
    height: 100px;
    overflow: hidden;
}

.totalPack {
    display: flex;
    flex-flow: row;
    height: 680px;
}

.bottomPack {
    font-size: 15px;
}

.alreadySelected {
    max-width: 530px;
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    align-content: flex-start;
    height: 652px;
    overflow: auto;
    gap: 10px;
}

.alreadySelected .pack {
    width: 240px;
}

.totalPacks {
    display: flex;
    flex-flow: row;
    gap: 10px;
}

.toggleSelectedPack {
    background-color: grey;
    width: 422px;
    display: flex;
    flex-flow: column;
    height: 653px;
}

.words {
    font-size: 16px;
    overflow: auto;
    padding-left: 5px;
    margin-bottom: 5px;
}

.selected {
    box-shadow: 0px 0px 5px rgb(179, 228, 142);
}
</style>
./teams.vue