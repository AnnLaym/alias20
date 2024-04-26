let defaultWords: { [key: number]: Promise<string[]> } = {
	1: Promise.resolve([]),
	2: Promise.resolve([]),
	3: Promise.resolve([]),
	4: Promise.resolve([]),
}
import {
	AliasService,
	AliasPublicState,
	WSServer,
	UserID,
	TeamID,
	JSONSet,
	WordData,
	WordReport,
} from './types.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { getPacksDB, getReportsDB, getWordsDB } from './db.js'
import { convert } from './converter.js'
convert()
console.log(3)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export default function (wsServer: WSServer, path: string, moderKey: string) {
	const db = {
		words: getWordsDB(`${wsServer.users.config.appDir}/alias-words.db`),
		reports: getReportsDB(`${wsServer.users.config.appDir}/alias-reports.db`),
		packs: getPacksDB(`${wsServer.users.config.appDir}/alias-packs.db`),
	}
	wsServer.app.use('/alias', wsServer.static(resolve(`${__dirname}/../../dist`)))
	wsServer.users.handleAppPage(
		path,
		resolve(`${__dirname}/../../dist/index.html`),
		resolve(`${__dirname}/../../dist/manifest.json`),
		'/alias/',
	)
	wsServer.app.get('/bg/alias/pack-list', async (req, res) => {
		res.send(await db.packs.getPacks())
	})
	wsServer.app.get('/bg/alias/alias-reports', async (req, res) => {
		res.send(await db.reports.getReports())
	})
	wsServer.app.get('/bg/alias/pack-list/:packId', async (req, res) => {
		res.send(await db.packs.getWords(req.params.packId))
	})
	class AliasRoom extends wsServer.users.RoomState {
		public wordSkippedCoolDown: boolean = false
		public lastInteraction = new Date()
		public room: AliasPublicState
		private timer?: NodeJS.Timeout
		public state: {
			activeWord: null | string
			roomWordsList: null | string[]
			winProcessed: boolean
		} = {
			activeWord: null,
			roomWordsList: null,
			winProcessed: false,
		}
		leaveTeams(user: UserID, exceptId?: any) {
			if (this.room.currentPlayer === user) this.rotatePlayers()
			if (
				this.room.currentTeam &&
				this.room.teams[this.room.currentTeam] &&
				this.room.teams[this.room.currentTeam].players.size === 1
			)
				this.rotateTeams()
			Object.keys(this.room.teams).forEach((teamId) => {
				if (
					teamId !== exceptId &&
					this.room.teams[teamId].players.delete(user) &&
					this.room.teams[teamId].players.size === 0
				)
					delete this.room.teams[teamId]
			})
			if (this.room.currentPlayer === user) this.room.currentPlayer = null
			if (!this.room.teams[this.room.currentTeam!]) this.room.currentTeam = null
			this.room.readyPlayers.delete(user)
			if (this.room.currentAssistant === user) this.room.currentAssistant = null
		}
		rotatePlayers(teamId?: TeamID) {
			if (this.room.currentTeam) {
				const currentTeam = this.room.teams[teamId || this.room.currentTeam],
					currentPlayer = currentTeam.currentPlayer,
					currentPlayerKeys = [...currentTeam.players],
					indexOfCurrentPlayer = currentPlayerKeys.indexOf(
						currentTeam.currentPlayer!,
					)
				if (this.room.soloMode) {
					const indexOfCurrentAssistant = currentPlayerKeys.indexOf(
						this.room.currentAssistant!,
					)
					if (indexOfCurrentAssistant === currentTeam.players.size - 1)
						this.room.currentAssistant = currentPlayerKeys[0]
					else
						this.room.currentAssistant =
							currentPlayerKeys[indexOfCurrentAssistant + 1]
				}
				if (
					!this.room.soloMode ||
					this.room.currentAssistant === this.room.currentPlayer
				) {
					if (indexOfCurrentPlayer === currentTeam.players.size - 1) {
						currentTeam.currentPlayer = currentPlayerKeys[0]
						if (this.room.soloMode && this.room.soloModeRound !== null) {
							this.room.soloModeRound++
							this.room.currentAssistant = currentPlayerKeys[1]
						}
					} else {
						currentTeam.currentPlayer =
							currentPlayerKeys[indexOfCurrentPlayer + 1]
						if (this.room.soloMode) {
							if (indexOfCurrentPlayer + 1 === currentTeam.players.size - 1)
								this.room.currentAssistant = currentPlayerKeys[0]
							else
								this.room.currentAssistant =
									currentPlayerKeys[indexOfCurrentPlayer + 2]
						}
					}
					if (this.room.currentPlayer === currentPlayer)
						this.room.currentPlayer = currentTeam.currentPlayer
				}
			}
		}
		rotateTeams() {
			if (this.room.currentTeam && !this.room.soloMode) {
				const teamKeys = Object.keys(this.room.teams),
					indexOfCurrentTeam = teamKeys.indexOf(this.room.currentTeam)
				if (indexOfCurrentTeam === teamKeys.length - 1)
					this.room.currentTeam = teamKeys[0]
				else this.room.currentTeam = teamKeys[indexOfCurrentTeam + 1]
				if (!this.room.teams[this.room.currentTeam].currentPlayer)
					this.room.teams[this.room.currentTeam].currentPlayer = [
						...this.room.teams[this.room.currentTeam].players,
					][0]
				this.room.currentPlayer =
					this.room.teams[this.room.currentTeam].currentPlayer || null
			}
			this.room.readyPlayers.clear()
		}
		userEvent(user: UserID, event: keyof AliasEventHandler, data: any) {
			this.lastInteraction = new Date()
			try {
				const eventHandler = new AliasEventHandler(this, user)
				if (typeof eventHandler[event] === 'function') {
					;(eventHandler[event] as Function)(...data)
				} else {
					//TODO: сказать что юзер пидорас
				}
			} catch (error: any) {
				console.error(error)
				wsServer.users.log(error.message)
			}
		}
		update() {
			if (this.room.voiceEnabled) this.processUserVoice()
			this.send(this.room.onlinePlayers, 'state', this.room)
		}
		stopTimer() {
			this.room.timer = null
			clearInterval(this.timer)
		}
		processUserVoice() {
			this.room.userVoice = {}
			this.room.onlinePlayers.forEach((user) => {
				if (
					!this.room.managedVoice ||
					this.room.phase === 0 ||
					this.room.phase === 1
				)
					this.room.userVoice[user] = true
				else {
					if (
						!this.room.soloMode &&
						this.room.currentTeam &&
						this.room.teams[this.room.currentTeam].players.has(user)
					)
						this.room.userVoice[user] = true
					else if (
						this.room.soloMode &&
						(this.room.currentPlayer === user ||
							this.room.currentAssistant === user)
					)
						this.room.userVoice[user] = true
				}
			})
		}
		startTimer() {
			this.room.timer = this.room.roundTime * 1000
			let time = new Date()
			this.timer = setInterval(() => {
				this.room.timer = this.room.timer ?? 0
				this.room.timer -= +new Date() - +time
				time = new Date()
				if (this.room.timer <= 0) {
					this.endRound()
					this.send(this.room.onlinePlayers, 'timer-end')
					this.update()
				}
			}, 100)
		}
		endRound() {
			if (this.state.activeWord)
				this.room.currentWords.push({
					points: 1,
					word: this.state.activeWord,
					reported: false,
					//reportedWords.includes(this.state.activeWord)
				})
			this.send(this.room.onlinePlayers, 'active-word', null)
			this.state.activeWord = null
			this.calcWordPoints()
			if (this.room.phase !== 1) {
				this.rotatePlayers()
				this.rotateTeams()
			}
			this.stopTimer()
			this.room.phase = 1
		}
		calcWordPoints() {
			let wordPoints = 0
			this.room.currentWords.forEach((word) => (wordPoints += word.points!))
			if (!this.room.soloMode)
				Object.keys(this.room.teams).forEach((teamId) => {
					if (this.room.teams[teamId].wordPoints !== undefined)
						this.room.teams[teamId].wordPoints =
							wordPoints < 0 ? 0 : wordPoints
				})
			else {
				// Object.keys(room.playerWordPoints).forEach((playerId) => {
				// 	if (room.playerWordPoints[playerId] !== undefined)
				// 		room.playerWordPoints[playerId] = wordPoints < 0 ? 0 : wordPoints
				// })
			}
		}
		selectWordSet(wordSet: string, user: UserID) {
			if (!isNaN(parseFloat(wordSet))) {
				this.room.currentWords = []
				this.room.packName = null
				const difficulty = parseFloat(wordSet)
				if (![1, 2, 3, 4].includes(difficulty)) {
					if (user) this.send(user, 'message', 'You did something wrong')
				} else {
					this.room.level = difficulty
					this.room.wordsEnded = false
				}
				this.update()
			}
		}
		setTurn(playerId: UserID) {
			Object.keys(this.room.teams).forEach((teamId) => {
				const team = this.room.teams[teamId]
				;[...team.players].forEach((teamPlayerId) => {
					if (teamPlayerId === playerId) {
						team.currentPlayer = playerId
						this.room.currentPlayer = playerId
						this.room.currentTeam = teamId
						this.room.readyPlayers.clear()
					}
				})
			})
		}
		setAssistant(playerId: UserID) {
			this.room.currentAssistant = playerId
			this.room.readyPlayers.clear()
		}
		restartGame() {
			this.checkWin()
			this.state.winProcessed = false
			this.addWordPoints()
			this.room.phase = 0
			this.room.currentWords = []
			this.room.readyPlayers.clear()
			//room.wordIndex = 0;
			this.room.wordsEnded = false
			this.room.soloModeRound = 0
			this.room.rankedResultsSaved = false
			this.room.rankedScoreDiffs = {}
			Object.keys(this.room.teams).forEach((teamId) => {
				const team = this.room.teams[teamId]
				delete team.wordPoints
				team.score = 0
			})
			//TODO SOLO ALIAS
			// Object.keys(room.playerScores).forEach((playerId) => {
			// 	delete room.playerScores![playerId]
			// 	delete room.playerWordPoints[playerId]
			// })
			this.resetOrder()
		}
		resetOrder() {
			// TODO: solomode tut
			Object.keys(this.room.teams).forEach((teamId) => {
				const team = this.room.teams[teamId]
				team.currentPlayer = [...team.players][0]
			})
			this.room.currentTeam = Object.keys(this.room.teams)[0]
			this.room.currentPlayer =
				this.room.teams[this.room.currentTeam]?.currentPlayer ?? null
			if (this.room.soloMode && this.room.teams[this.room.currentTeam])
				this.setAssistant([...this.room.teams[this.room.currentTeam].players][1])
		}
		addWordPoints() {
			if (!this.room.soloMode)
				Object.keys(this.room.teams).forEach((teamId) => {
					const team = this.room.teams[teamId]
					if (team.wordPoints !== undefined) {
						team.score += team.wordPoints
						delete team.wordPoints
					}
				})
			// else
			// TODO: SOLOMODE
			// 	Object.keys(room.playerWordPoints).forEach((playerId) => {
			// 		if (room.playerWordPoints[playerId] != null) {
			// 			room.playerScores[playerId] = room.playerScores[playerId] || 0
			// 			room.playerScores[playerId] += room.playerWordPoints[playerId]
			// 			delete room.playerWordPoints[playerId]
			// 		}
			// 	})
		}
		toggleSoloMode(state: boolean) {
			this.room.soloMode = state
			if (this.room.soloMode) {
				const firstTeam = Object.keys(this.room.teams)[0]
				Object.keys(this.room.teams).forEach((teamId) => {
					if (firstTeam !== teamId && firstTeam) {
						this.room.teams[teamId].players.forEach((playerId) =>
							this.room.teams[firstTeam].players.add(playerId),
						)
						delete this.room.teams[teamId]
					}
				})
			} else this.room.currentAssistant = null
			this.restartGame()
		}
		checkWin = () => {
			let winners: UserID[] = []
			if (!this.room.soloMode) {
				// if (Object.keys(this.room.teams).indexOf(this.room.currentTeam!) === 0) {
				// 	let mostPoints = 0,
				// 		mostPointsTeam: TeamID,
				// 		teamsReachedGoal = Object.keys(this.room.teams).filter(
				// 			(teamId) => {
				// 				const team = this.room.teams[teamId],
				// 					points = team.score + (team.wordPoints || 0)
				// 				if (points > mostPoints) {
				// 					mostPoints = points
				// 					mostPointsTeam = teamId
				// 				}
				// 				return points >= this.room.goal! || this.room.goalCircles
				// 			},
				// 		),
				// 		teamsReachedGoalScores = teamsReachedGoal
				// 			.map(
				// 				(teamId) =>
				// 					this.room.teams[teamId].score +
				// 					(this.room.teams[teamId].wordPoints || 0),
				// 			)
				// 			.sort((a, b) => b - a)
				// 	if (
				// 		teamsReachedGoal.length > 0 &&
				// 		(teamsReachedGoal.length === 1 ||
				// 			teamsReachedGoalScores[0] !== teamsReachedGoalScores[1])
				// 	) {
				// 		winners = [...this.room.teams[mostPointsTeam!].players]
				// 	}
				// }
			} else if (this.room.soloModeRound! >= this.room.soloModeGoal!) {
				// TODO SOLOMODE
				// const playerWin = Object.keys(room.playerScores!).sort(
				// 	(idA, idB) =>
				// 		room.playerScores![idB] +
				// 		(room.playerWordPoints[idB] || 0) -
				// 		(room.playerScores![idA] + (room.playerWordPoints[idA] || 0)),
				// )[0]
				// winners = [playerWin]
			}
			if (
				!this.state.winProcessed &&
				winners.length > 0 &&
				(this.room.soloMode
					? this.room.onlinePlayers.size >= 3
					: this.room.onlinePlayers.size >= 4)
			) {
				this.state.winProcessed = true
				for (const user of winners) {
					const userData = { user, room: this.room }
					wsServer.users.authUsers.processAchievement(
						userData,
						wsServer.users.achievements.win100Alias.id,
					)
					wsServer.users.authUsers.processAchievement(
						userData,
						wsServer.users.achievements.win1000Alias.id,
					)
					wsServer.users.authUsers.processAchievement(
						userData,
						wsServer.users.achievements.winGames.id,
						{
							game: wsServer.users.games.alias.id,
						},
					)
					if (this.room.goal! >= 100)
						wsServer.users.authUsers.processAchievement(
							userData,
							wsServer.users.achievements.aliasMarathon.id,
						)
					if (this.room.ranked)
						wsServer.users.authUsers.processAchievement(
							userData,
							wsServer.users.achievements.rankedAliasWin.id,
						)
				}
			}
		}
		removePlayer(playerId: UserID) {
			Object.keys(this.room.teams).forEach((teamId) => {
				const team = this.room.teams[teamId]
				if (team.players.delete(playerId)) {
					if (team.players.size === 0) {
						if (this.room.currentTeam === teamId) this.rotateTeams()
						delete this.room.teams[teamId]
					} else if (team.currentPlayer === playerId) this.rotatePlayers(teamId)
				}
			})
			this.room.readyPlayers.delete(playerId)
			if (
				this.room.spectators.has(playerId) ||
				!this.room.onlinePlayers.has(playerId)
			) {
				this.room.spectators.delete(playerId)
				delete this.room.playerNames[playerId]
				//delete room.rankedUsers[playerId];
				//this.emit("user-kicked", playerId); TODO EMIT?
			} else this.room.spectators.add(playerId)
		}
		send(target: Set<UserID> | UserID, event: string, data?: any) {
			this.userRegistry.send(target, event, data)
		}
		userJoin(data: any) {
			const user = data.userId
			if (!this.room.playerNames[user]) this.room.spectators.add(user)
			this.room.onlinePlayers.add(user)
			this.room.playerNames[user] =
				data.userName.substr && data.userName.substr(0, 60)
			// if (rankedUserByToken[user]) {
			// 	removeDuplicateUserRanked(user);
			// 	room.rankedUsers[user] = rankedUserByToken[user];
			// }
			if (!this.state.roomWordsList) this.selectWordSet('2', user)
			if (this.room.currentPlayer === user && this.state.activeWord)
				this.send(new Set(user), 'active-word', {
					word: this.state.activeWord,
					reported: false,
					//!!~reportedWords.indexOf(this.state.activeWord) TODO
				})
			this.update()
		}
		userLeft = (user: UserID) => {
			this.room.onlinePlayers.delete(user)
			if (this.room.spectators.has(user)) {
				delete this.room.playerNames[user]
				// delete room.rankedUsers[user];
			}
			this.room.spectators.delete(user)
			this.room.readyPlayers.delete(user)
			if (this.room.onlinePlayers.size === 0) this.stopTimer()
			this.update()
		}
		getPlayerCount() {
			return Object.keys(this.room.playerNames).length
		}
		getActivePlayerCount() {
			return this.room.onlinePlayers.size
		}
		getLastInteraction() {
			return this.lastInteraction
		}
		getSnapshot() {
			// return {
			//     room: this.room,
			//     state: {
			//         activeWord: this.state.activeWord,
			//         roomWordsList: null
			//     }
			// };
		}
		setSnapshot(snapshot: any) {
			//TODO: cringe
			// Object.assign(this.room, snapshot.room);
			// this.state = snapshot.state;
			// Object.keys(this.room.rankedUsers).forEach((user) => {
			//     rankedUserByToken[user] = rankedUsers[this.room.rankedUsers[user].id];
			//     this.room.rankedUsers[user] = rankedUsers[this.room.rankedUsers[user].id];
			// })
			// if (this.room.level === 0)
			//     this.room.level = 2;
			// this.state.roomWordsList = shuffleArray([...defaultWords[this.room.level === 'ranked' ? 2 : this.room.level]]);
			// this.room.phase = 0;
			// this.room.currentBet = Infinity;
			// this.room.timer = null;
			// this.room.onlinePlayers = new JSONSet();
			// this.room.spectators = new JSONSet();
			// this.room.readyPlayers = new JSONSet(this.room.readyPlayers);
			// Object.keys(this.room.teams).forEach((teamId) => {
			//     this.room.teams[teamId].players = new JSONSet(this.room.teams[teamId].players);
			// });
			// this.room.onlinePlayers.clear();
		}
		private userRegistry: any
		constructor(hostID: UserID, hostData: object, userRegistry: any) {
			super(hostID, hostData, userRegistry, wsServer.users.games.alias.id, path)
			this.userRegistry = userRegistry
			this.room = {
				...this!.room,
				inited: true,
				hostID: hostID,
				phase: 0,
				spectators: new JSONSet(),
				playerNames: {},
				//playerScores: {},
				//playerWordPoints: {},
				readyPlayers: new JSONSet(),
				onlinePlayers: new JSONSet(),
				roundTime: 60,
				//currentBet: Infinity,
				goal: 20,
				goalCircles: 1,
				currentWords: [],
				teams: {},
				//wordIndex: 0,
				wordsEnded: false,
				level: 2,
				//drawMode: false,
				//drawCommitOnly: false,
				soloMode: false,
				//soloModeRound: 0,
				packName: null,
				customWordsLimit: 1500,
				managedVoice: true,
				//rankedUsers: {},
				ranked: false,
				rankedResultsSaved: false,
				rankedScoreDiffs: {},
				deafMode: false,
				mode: 'team',
				timer: null,
				currentTeam: null,
				currentAssistant: null,
				currentPlayer: null,
				soloModeRound: null,
				soloModeGoal: null,
				playerScores: null,
			}
		}
	}
	class AliasEventHandler implements AliasService {
		constructor(private game: AliasRoom, private user: UserID) {
			//prettier pidr
		}
		get room() {
			return this.game.room
		}
		teamJoin(id: TeamID) {
			if (
				!this.game.room.ranked ||
				((id === 'new' || this.room.teams[id]) &&
					(!this.room.teams[id] || this.room.teams[id].players.size < 4))
			) {
				if (
					id === 'new' &&
					(!this.room.soloMode || !Object.keys(this.room.teams).length)
				) {
					id = makeId()
					this.room.teams[id] = { score: 0, players: new JSONSet() }
				}
				if (this.room.teams[id] && !this.room.teams[id].players.has(this.user)) {
					this.game.leaveTeams(this.user, id)
					this.room.spectators.delete(this.user)
					this.room.teams[id].players.add(this.user)
					this.game.update()
				}
			}
		}
		spectatorsJoin() {
			this.game.leaveTeams(this.user)
			this.room.spectators.add(this.user)
			this.game.update()
		}
		setScore(data: Record<TeamID, string>) {
			const hui = Object.keys(data)[0],
				pidr = Object.values(data)[0]
			if (this.room.hostID === this.user && this.room.teams[hui]) {
				const team = this.room.teams[hui]
				if (team && !isNaN(parseInt(pidr))) team.score = parseInt(pidr)
				this.game.update()
			}
		}
		setPlayerScore(data: Record<UserID, string>) {
			if (
				this.room.hostID === this.user &&
				this.room.playerNames[data.playerId] &&
				!isNaN(parseInt(data.score))
			) {
				this.room.playerScores![data.playerId] = parseInt(data.score)
				this.game.update()
			}
		}
		stopGame() {
			if (this.room.hostID === this.user) {
				this.game.endRound()
				this.room.phase = 0
				this.game.checkWin()
				this.game.update()
			}
		}
		setWordPoints(value: { points: number; word: string; reported: boolean }[]) {
			if (
				this.room.hostID === this.user ||
				Object.keys(this.room.teams).some((teamId) =>
					this.room.teams[teamId].players.has(this.user),
				)
			) {
				this.room.currentWords = value
				this.room.readyPlayers.delete(this.room.currentPlayer!)
				this.game.calcWordPoints()
				this.game.update()
				this.game.send(this.room.onlinePlayers, 'highlight-user', this.user)
			}
		}
		removePlayer(playerId: UserID) {
			if (
				this.room.hostID === this.user &&
				playerId &&
				(!this.room.ranked || this.room.phase === 0)
			) {
				this.game.removePlayer(playerId)
			}
			this.game.update()
		}
		setMode(mode: 'team' | 'solo' | 'deaf') {
			if (
				!this.room.ranked &&
				this.room.phase === 0 &&
				this.room.hostID === this.user &&
				['team', 'solo', 'deaf'].includes(mode) &&
				mode !== this.room.mode
			) {
				this.room.mode = mode
				this.room.deafMode = false
				if (mode === 'team') this.game.toggleSoloMode(false)
				else if (mode === 'solo') this.game.toggleSoloMode(true)
				else if (mode === 'deaf') {
					this.room.deafMode = true
					this.game.toggleSoloMode(false)
				}
			}
			this.game.update()
		}
		toggleRanked() {
			if (this.room.phase === 0 && this.room.hostID === this.user)
				// TODO RANKED  && room.rankedUsers[user]?.moderator
				//toggleRanked(!room.ranked);
				this.game.update()
		}
		toggleTheme() {
			wsServer.users.authUsers.processAchievement(
				{ user: this.user, room: this.room },
				wsServer.users.achievements.aliasDarkTheme.id,
			)
		}
		allowReport() {
			wsServer.users.authUsers.processAchievement(
				{ user: this.user, room: this.room },
				wsServer.users.achievements.allowReportsAlias.id,
			)
		}
		shufflePlayers() {
			if (this.room.hostID === this.user) {
				let currentPlayers: UserID[] | [] = []
				Object.keys(this.room.teams).forEach((teamId) => {
					const team = this.room.teams[teamId]
					//currentPlayers = currentPlayers.concat([...team.players]);TODO POCHINIT
					team.players = new JSONSet()
				})
				shuffleArray(currentPlayers)
				while (currentPlayers.length > 0) {
					Object.keys(this.room.teams).forEach((teamId) => {
						// if (currentPlayers.length > 0)
						//     room.teams[teamId].players.add(currentPlayers.pop());
						// TODO POCHINIT
					})
				}
				this.game.resetOrder()
				this.game.update()
			}
		}
		restartGame() {
			if (this.room.hostID === this.user) this.game.restartGame()
			this.game.update()
		}
		setRoundTime(time: number) {
			if (!this.room.ranked && this.room.hostID === this.user && !isNaN(time))
				this.room.roundTime = time || 0
			this.game.update()
		}
		setGoal(goal: number) {
			if (
				!this.room.ranked &&
				this.room.hostID === this.user &&
				!isNaN(goal) &&
				goal > 0
			) {
				if (!this.room.soloMode) {
					this.room.goal = goal
					this.room.soloModeGoal = null
					this.room.goalCircles = null
				}
				this.game.update()
			}
		}
		setGoalCircles(goal: number) {
			if (
				!this.room.ranked &&
				this.room.hostID === this.user &&
				!isNaN(goal) &&
				goal > 0
			) {
				if (!this.room.soloMode) {
					this.room.goal = null
					this.room.soloModeGoal = null
					this.room.goalCircles = goal
				}
			}
			this.game.update()
		}
		setGoalSoloMode(goal: number) {
			if (
				!this.room.ranked &&
				this.room.hostID === this.user &&
				!isNaN(goal) &&
				goal > 0
			) {
				if (!this.room.soloMode) {
					this.room.goal = null
					this.room.soloModeGoal = goal
					this.room.goalCircles = null
				}
			}
			this.game.update()
		}
		selectWordSet(wordSet: string) {
			if (
				!this.room.ranked &&
				this.room.phase === 0 &&
				this.room.hostID === this.user
			)
				this.game.selectWordSet(wordSet, this.user)
		}
		setupWordsPreset(packName: string) {
			if (this.room.hostID === this.user) {
				this.room.packName = packName
			}
		}
		giveHost(playerId: UserID) {
			if (this.room.hostID === this.user && playerId) {
				// (!room.ranked || rankedUserByToken[playerId]?.moderator) RANKED HUETA
				this.room.hostID = playerId
				//this.emit("host-changed", user, playerId); // TODO EMIT WTF
			}
			this.game.update()
		}
		setTurn(playerId: UserID) {
			if (this.room.hostID === this.user && playerId) this.game.setTurn(playerId)
			this.game.update()
		}
		setAssistant(playerId: UserID) {
			if (this.room.hostID === this.user && playerId)
				this.game.setAssistant(playerId)
			this.game.update()
		}
		reportWord(word: string, toLevel: number) {
			let currentLevel = this.room.level
			currentLevel = 2
			db.reports.addReport(word, this.user, currentLevel, toLevel)
		}
		async action() {
			// if (!this.room.rankedResultsSaved && this.room.ranked && this.room.phase === 1 && this.room.soloModeRound === this.room.soloModeGoal)
			// this.game.saveRankedResults(this.user);
			// else
			if (
				this.room.phase === 0 &&
				this.room.hostID === this.user &&
				Object.keys(this.room.teams).length > 0 &&
				(!this.room.soloMode ||
					this.room.teams[Object.keys(this.room.teams)[0]].players.size > 1) &&
				(!this.room.ranked ||
					this.room.teams[this.room.currentTeam!].players.size === 4)
			) {
				this.room.phase = 1
				this.room.currentTeam =
					this.room.currentTeam || Object.keys(this.room.teams)[0]
				const currentTeam = this.room.teams[this.room.currentTeam]
				currentTeam.currentPlayer =
					currentTeam.currentPlayer || [...currentTeam.players][0]
				this.room.currentPlayer = currentTeam.currentPlayer
				if (this.room.soloMode)
					// TODO ALIAS FIXME
					this.room.currentAssistant =
						this.room.currentAssistant || [...currentTeam.players][1]
			} else if (
				this.room.phase === 1 &&
				(!this.room.soloMode
					? this.room.teams[this.room.currentTeam!].players.has(this.user)
					: this.room.currentPlayer === this.user ||
					  this.room.currentAssistant === this.user)
			) {
				if (
					this.room.currentPlayer !== this.user ||
					(!this.room.soloMode //SOLO MODE TODO:
						? this.room.readyPlayers.size !==
						  this.room.teams[this.room.currentTeam!].players.size
						: this.room.readyPlayers.size !== 2)
				)
					if (this.room.readyPlayers.has(this.user))
						this.room.readyPlayers.delete(this.user)
					else this.room.readyPlayers.add(this.user)
				else {
					this.room.phase = 2
					//this.game.send(this.room.onlinePlayers, 'draw-clear')
					this.room.readyPlayers.clear()
					this.game.addWordPoints()
					this.room.currentWords = []
					if (!this.room.soloMode)
						this.room.teams[this.room.currentTeam!].wordPoints = 0
					else {
						// this.room.playerWordPoints[this.room.currentPlayer] = 0 // SOLO ALIAS  TODO
						// this.room.playerWordPoints[this.room.currentAssistant] = 0
					}
					this.game.startTimer()
				}
			}
			if (
				this.room.phase === 2 &&
				(!this.room.deafMode
					? this.room.currentPlayer === this.user
					: this.room.teams[this.room.currentTeam!].players.has(this.user) &&
					  !this.room.wordSkippedCoolDown)
			) {
				if (this.room.currentWords.length > 99) {
					this.game.endRound()
				}
				let randomWord = await db.words.getRandomWord(this.room.level)
				if (this.game.state.activeWord)
					this.room.currentWords.push({
						points: 1,
						word: this.game.state.activeWord,
						reported: false,
						//!!~reportedWords.indexOf(this.state.activeWord)
					})
				this.game.state.activeWord = randomWord.word
				this.game.send(new JSONSet([this.room.currentPlayer!]), 'active-word', {
					word: this.game.state.activeWord,
					reported: false,
					//!!~reportedWords.indexOf(this.state.activeWord)
				})
				if (this.room.deafMode) {
					this.room.wordSkippedCoolDown = true
					setTimeout(() => {
						this.room.wordSkippedCoolDown = false
					}, 1000)
				}
			}
			this.game.update()
		}
	}
	wsServer.users.createRoomManager(path, AliasRoom)
}

function makeId() {
	let text = ''
	const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'

	for (let i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	return text
}

function shuffleArray(array: any) {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1
		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}
	return array
}
