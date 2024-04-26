import nedb from 'nedb-promises'
import { PackData, WordData, WordID, WordReport } from './types.js'

export function getWordsDB(appDir: string) {
	const db = nedb.create(`${appDir}`) as nedb<WordData>
	return {
		async getWords(level: number) {
			return (await db.find({ level })).map((x) => x.word)
		},
		async addWord(word: string, level: number) {
			return db.insert({ word, level })
		},
		async changeLevel(_id: WordID, level: number) {
			return db.update({ _id }, { $set: { level } })
		},
		async removeWord(_id: WordID) {
			return db.remove({ _id }, {})
		},
		async getRandomWord(level: number) {
			const words = await db.find({ level })
			return words[Math.floor(Math.random() * words.length)]
		},
	}
}

export function getReportsDB(appDir: string) {
	const db = nedb.create(`${appDir}`) as nedb<WordReport>
	return {
		async getReports() {
			return db.find({})
		},
		async addReport(word: string, userID: string, fromLevel: number, toLevel: number) {
			return db.insert({
				userID: userID,
				wordID: word,
				_id: new Date().getTime().toString(),
				resolved: false,
				createTime: new Date().toISOString(),
				fromLevel: fromLevel,
				targetLevel: toLevel,
			})
		},
	}
}

export function getPacksDB(appDir: string) {
	const db = nedb.create(`${appDir}`) as nedb<PackData>
	return {
		async getPacks() {
			return db.find({}, { words: 0 })
		},
		async addPack(pack: PackData) {
			console.log(2)
			return db.insert(pack)
		},
		async removePack(_id: string) {
			return db.remove({ _id }, {})
		},
		async getWords(_id: string) {
			return db.findOne({ _id }).then((x) => x?.words)
		},
		async getRandomWord(_id: string) {
			const words = await db.find({})
			return words[Math.floor(Math.random() * words.length)]
		},
	}
}
