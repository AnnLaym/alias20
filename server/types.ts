import { Application, static as static_ } from 'express'

export interface RoomState {
	room: any
	state: any
	lastInteraction: Date
}

export type UserID = string
export type TeamID = string
export type RoomID = string

export interface WSServer {
	app: Application
	static: typeof static_
	users: {
		config: {
			appDir: string
		}
		achievements: Record<string, { id: string }>
		games: Record<string, { id: string }>
		roomManagers: Map<string, { rooms: Map<string, { room: { onlinePlayers: Set<UserID> } }> }>
		authUsers: {
			processAchievement(
				userData: { user: UserID; room: CommonRoom },
				achievements: string,
				achievementData?: { game: string },
			): Promise<void>
		}
		handleAppPage(
			path: string,
			filePath: string,
			viteManifestPath?: string,
			viteStaticPath?: string,
		): void
		send(target: Set<UserID> | UserID, event: string, data: object): void
		log(message: string): void
		createRoomManager(path: string, gameState: any): void
		RoomState: {
			new (
				hostID: UserID,
				hostData: object,
				userRegistry: WSServer['users'],
				gameID: string,
				path: string,
			): RoomState
			room: CommonRoom
		}
	}
}
export interface CommonRoom {
	voiceEnabled: boolean
	userVoice: Record<UserID, boolean>
}
export interface AliasPublicState extends CommonRoom {
	inited: true
	hostID: UserID
	phase: 0 | 1 | 2
	spectators: Set<UserID>
	playerNames: Record<UserID, string>
	//playerScores: {},
	//playerWordPoints: {},
	readyPlayers: Set<UserID>
	onlinePlayers: Set<UserID>
	roundTime: number
	//currentBet: Infinity, smeshno
	currentWords: { points?: number; word: string; reported: boolean }[]
	teams: Record<
		TeamID,
		{ score: number; players: Set<UserID>; currentPlayer?: UserID; wordPoints?: number }
	>
	//wordIndex: 0
	wordsEnded: boolean
	level: number
	//drawMode: false XDDDD
	//drawCommitOnly: false
	soloMode: boolean
	// soloModeRound: 0
	packName: null | string
	customWordsLimit: number
	managedVoice: boolean
	//rankedUsers: {} udolit
	ranked: boolean
	rankedResultsSaved: boolean
	rankedScoreDiffs: Record<UserID, number>
	deafMode: boolean
	mode: 'team' | 'solo' | 'deaf'
	timer: null | number
	currentTeam: TeamID | null
	currentPlayer: UserID | null
	currentAssistant: UserID | null
	soloModeRound: number | null
	soloModeGoal: number | null
	playerScores: Record<UserID, number> | null
	goalCircles: number | null
	goal: number | null
	wordSkippedCoolDown: boolean
	currentWord: { word: string; reported: boolean } | null
}
export interface AliasService {
	teamJoin(id: TeamID): void
	spectatorsJoin(): void
	setScore(data: Record<TeamID, string>): void
	setPlayerScore(data: Record<UserID, string>): void
	stopGame(): void
	setWordPoints(value: { points: number; word: string; reported: boolean }[]): void
	removePlayer(playerId: UserID): void
	shufflePlayers(): void
	restartGame(): void
	setRoundTime(time: number): void
	setGoal(goal: number): void
	selectWordSet(wordSet: string): void
	giveHost(playerId: UserID): void
	setAssistant(playerId: UserID): void
	setMode(mode: 'team' | 'solo' | 'deaf'): void
	toggleRanked(): void
	toggleTheme(): void
	allowReport(): void
	setGoalCircles(goal: number): void
	setGoalSoloMode(goal: number): void
	action():void
	setTurn(playerId: UserID): void
	setupWordsPreset(packName: string): void
	reportWord(word: string, toLevel: number): void
}
export class JSONSet extends Set {
	constructor(iterable?: any) {
		super(iterable)
	}

	toJSON() {
		return [...this]
	}
}

export type WordID = string
export type ReportID = string
export type PackID = string

export interface WordData {
	word: string
	level: number
	_id: WordID
}

export interface WordReport {
	userID: UserID,
	wordID: WordID,
	_id: ReportID,
	resolved: boolean,
	moder?: UserID,
	createTime: Date,
	fromLevel: number,
	targetLevel: number,
	aprooved?: boolean
}

export interface PackData extends PackListItem{
	words: string[]
}

export type DateString = string

export interface PackListItem {
	title: string
	_id: PackID
	owner?: UserID
	description: string
	createTime: DateString
	updateTime: DateString
	categories: string[]
	length: number
}

export interface PackBrowserState {
	packList?: PackListItem[],
	currentPack?: PackID,
	currentPackWords?: string[],
	menuOpened: boolean,
}

export interface ReportBrowserState {
	reportList?: WordReport[],
	menuOpened: boolean,
}

export interface AliasClientState {
	puckBrowser: PackBrowserState,
	reportBrowser: ReportBrowserState
}