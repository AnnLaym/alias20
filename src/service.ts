import { Ref, ref, watch } from 'vue'
import {
	processWrappedRequest,
	ReactAppWindow,
	requestWrap,
	SocketWrappedRequestResult,
} from './react-common'
import {
	AliasClientState,
	AliasPublicState,
	AliasService,
	JSONSet,
	PackID,
	PackListItem,
	TeamID,
	UserID,
} from '../server/types'
import {} from '../server/module'
import { Alias } from 'vite'

const GAME_CHANNEL = '/bg/alias'
export type User = string
declare const window: ReactAppWindow<AliasPublicStateClient>

export const reactCommonRoom = () => window.commonRoom
export function useAliasService() {
	if (!aliasService) aliasService = createAliasService()
	return aliasService
}
export type UserLang = 'ua' | 'ru' | 'en'
export type currentTheme = string

export const userLang: Ref<UserLang> = ref(localStorage.userLang || 'ua')
export const currentTheme: Ref<currentTheme> = ref(localStorage.userTheme || 'n1')

export const hyphenate = ((window as any).createHyphenator as any)(
	(window as any).hyphenationPatternsRu as any,
) as (text: string) => string
export const hyphenateEn = ((window as any).createHyphenator as any)(
	(window as any).hyphenationPatternsEnUs as any,
) as (text: string) => string
export function toggleLanguage1() {
	switch (userLang.value) {
		case 'ua':
			userLang.value = 'ru'
			break
		case 'ru':
			userLang.value = 'en'
			break
		case 'en':
			userLang.value = 'ua'
			break
		default:
			break
	}
	localStorage.userLang = userLang.value
}
export function createAliasService() {
	const socket = window.socket.of(GAME_CHANNEL)
	return new Proxy(
		{},
		{
			get(_target, prop: string) {
				return (...args: any[]) => {
					socket.emit(prop, ...args)
				}
			},
		},
	) as any as AliasService
}

interface AliasPublicStateClient extends AliasPublicState {
	userID: UserID
}
let aliasState = ref(window.gameState || { inited: false })
let stateMaintained = false
let aliasService: ReturnType<typeof createAliasService> | undefined
// let aliasState = ref<AliasPublicStateClient>({
// 	inited: true,
// 	hostID: 'hui',
// 	phase: 0,
// 	spectators: new JSONSet(),
// 	playerNames: { hui: 'hui', hui123: 'hui123' },
// 	//playerScores: {},
// 	//playerWordPoints: {},
// 	readyPlayers: new Set(['hui123', 'hui123']),
// 	onlinePlayers: new Set(['hui', 'hui2']),
// 	roundTime: 60,
// 	//currentBet: Infinity,
// 	goal: 20,
// 	goalCircles: 1,
// 	currentWords: [
// 		{
// 			points: 0,
// 			word: 'прибыл',
// 			reported: false,
// 		},
// 		{
// 			points: 0,
// 			word: 'Годжу',
// 			reported: false,
// 		},
// 		{
// 			points: 0,
// 			word: 'Саторо',
// 			reported: false,
// 		},
// 	],
// 	teams: {
// 		fbzye: { score: 4, players: new Set(['hui', 'hui2']), currentPlayer: 'hui' },
// 		fbzye11: { score: 3, players: new Set(['hui', 'hui2']), currentPlayer: 'hui' },
// 		fbzye111: {
// 			score: 2,
// 			players: new Set(['hui123', 'hui2']),
// 			currentPlayer: 'hui123',
// 		},
// 	},
// 	//wordIndex: 0,
// 	wordsEnded: false,
// 	level: 2,
// 	//drawMode: false,
// 	//drawCommitOnly: false,
// 	soloMode: false,
// 	//soloModeRound: 0,
// 	packName: null,
// 	customWordsLimit: 1500,
// 	managedVoice: true,
// 	//rankedUsers: {},
// 	ranked: false,
// 	rankedResultsSaved: false,
// 	rankedScoreDiffs: {},
// 	deafMode: false,
// 	mode: 'team',
// 	timer: null,
// 	currentTeam: '0',
// 	currentAssistant: null,
// 	currentPlayer: null,
// 	soloModeRound: null,
// 	soloModeGoal: null,
// 	playerScores: null,
// 	voiceEnabled: false,
// 	userVoice: {},
// 	userID: 'hui123',
// })
export const highlightedUser = ref('')
export const newWord: { word: string; reported: boolean } = { word: '', reported: false }
export const stopTimer = ref(false)
function maintainState() {
	if (!stateMaintained) {
		stateMaintained = true
		window.socket.of(GAME_CHANNEL).on('state', (state: AliasPublicState) => {
			state.readyPlayers = new Set(state.readyPlayers)
			state.onlinePlayers = new Set(state.onlinePlayers)
			Object.keys(state.teams).forEach((it) => {
				state.teams[it].players = new Set(state.teams[it].players)
			})
			aliasState.value = {
				...aliasState.value,
				...state,
				userID: window.gameApp.userId,
			}
		})
		window.socket
			.of(GAME_CHANNEL)
			.on('active-word', (data: { word: string; reported: boolean }) => {
				aliasState.value = {
					...aliasState.value,
					userID: window.gameApp.userId,
				}
				newWord.word = data.word
				newWord.reported = data.reported
			})
		window.socket.of(GAME_CHANNEL).on('timer-end', () => {
			stopTimer.value = true
			setTimeout(() => {
				stopTimer.value = false
			}, 1000)
		})
		window.socket.of(GAME_CHANNEL).on('highlight-user', (data: UserID) => {
			setTimeout(() => {
				highlightedUser.value = ''
			}, 3000)
			highlightedUser.value = data
		})
	}
}

export const themes = {
	n1: {
		shriftColor: '#DDC5A2',
		background: '#301B28',
		itemColor: '#523634',
		buttonColor: '#B6452C',
	},
	n2: {
		shriftColor: '#F9F9FF',
		background: '#D55448',
		itemColor: '#FFA557',
		buttonColor: '#896E69',
	},
	greenDark: {
		shriftColor: '#C9D1C8',
		background: '#04202C',
		itemColor: '#304040',
		buttonColor: '#5B7065',
	},
	defaultDark: {
		shriftColor: 'white',
		background: '#202020',
		itemColor: '#40403f',
		buttonColor: '#4f6d6d',
	},
	defaultLight: {
		shriftColor: 'black',
		background: 'white',
		itemColor: 'white',
		buttonColor: '#9CCC65',
	},
	anime: {
		shriftColor: 'black',
		background: 'white',
		itemColor: 'white',
		buttonColor: '#9CCC65',
	},
	n3: {
		shriftColor: '#f4f2e5',
		background: '#2b2821',
		itemColor: '#72614d',
		buttonColor: '#cc777e',
	},
}

export function toggleTheme() {
	switch (currentTheme.value) {
		case 'n1':
			currentTheme.value = 'n2'
			break
		case 'n2':
			currentTheme.value = 'greenDark'
			break
		case 'greenDark':
			currentTheme.value = 'defaultDark'
			break
		case 'defaultDark':
			currentTheme.value = 'defaultLight'
			break
		case 'defaultLight':
			currentTheme.value = 'anime'
			break
		case 'anime':
			currentTheme.value = 'n3'
			break
		case 'n3':
			currentTheme.value = 'n1'
			break
		default:
			break
	}
	localStorage.userTheme = currentTheme.value
}

export const aliasClientState = ref<AliasClientState>({
	puckBrowser: {
		menuOpened: false,
	},
	reportBrowser: {
		menuOpened: false,
	},
})

export const aliasRestService = {
	getPackList: async (): Promise<PackListItem[]> => {
		const res = await fetch('/bg/alias/pack-list')
		return await res.json()
	},
	getPackWords: async (packId: PackID): Promise<string[]> => {
		const res = await fetch(`/bg/alias/pack-list/${packId}`)
		return await res.json()
	},
	getReports: async () => {
		const res = await fetch('/bg/alias/alias-reports')
		return await res.json()
	}
}

export function useAliasState() {
	maintainState()
	return aliasState
}
