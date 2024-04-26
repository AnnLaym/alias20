<template>
    <Dialog v-model:visible="aliasClientState.reportBrowser.menuOpened" modal header="word reports"
        :style="{ width: '63rem' }">
        <div class="reportWindow">
            <div class="top">
            </div>
            <table class="reports">
                <tr class="report" v-for="(report, index) in aliasClientState.reportBrowser.reportList" :key="index">
                    <td class="reportTime">{{ report.createTime }}</td>
                    <td class="reportUser"> {{ report.userID }}</td>
                    <td class="reportedWord"> {{ report.wordID }}</td>
                    <td class="fromLVL"> {{ getLevelname(report.fromLevel) }}</td>
                    <td class="aroow">-></td>
                    <td class="toLVL"> {{ getLevelname(report.targetLevel) }}</td>
                    <td class="approve"> {{ report.resolved }}</td>
                    <td class="moderator"> {{ report.moder}}</td>
                </tr>
            </table>
        </div>
    </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { aliasClientState, aliasRestService, highlightedUser, reactCommonRoom, useAliasService, useAliasState } from '../service';
import { getKnopkaName } from '../log';
import { TeamID, UserID } from '../../server/types';
import Dialog from 'primevue/dialog';

const service = useAliasService()
const state = useAliasState()
watch(() => aliasClientState.value.reportBrowser.menuOpened, async (value) => {
    if (value) {
        aliasClientState.value.reportBrowser.reportList = await aliasRestService.getReports()
    }
});

function getLevelname(lvl: number) {
    switch (lvl) {
        case 0:
            return 'easy'
        case 1:
            return 'normal'
        case 2:
            return 'hard'
        case 3:
            return 'insane'
    }

}


</script>

<style scoped>
.top {
    width: 100px;
}

.reports {
    background-color: rebeccapurple;
    display: flex;
    flex-flow: column;

}

.report {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    background-color: #363739;
    color: white;
    margin: 5px;
    overflow: hidden;
}
</style>
