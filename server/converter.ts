import fs from 'fs'
import { getWordsDB, getPacksDB } from './db.js'

const hui = JSON.parse(fs.readFileSync(`./alias20/server/words.json`, 'utf8'))
const pizda = JSON.parse(fs.readFileSync(`./alias20/server/Dota.json`, 'utf8'))
const pizda2 = JSON.parse(fs.readFileSync(`./alias20/server/Dota(eng).json`, 'utf8'))
const db = getWordsDB('./alias20/server')
const db2 = getPacksDB('./alias20/server')

// default words
// export async function convert(): Promise<void> {
// 	for (let i = 0; i < hui[2].length; i++) {
// 		const element = hui[2][i]
// 		console.log(element)
// 		await db.addWord(element, 2)
// 	}
// }

// packs
export async function convert(): Promise<void> {
	console.log(1)
	await db2.addPack({
		words: pizda.wordList,
		categories: [],
		createTime: new Date().toISOString(),
		description: 'КТо пишет описание так длинное разве можно так але гагагагагага',
		title: pizda.packName,
		updateTime: new Date().toISOString(),
		_id: new Date().getTime().toString(),
		length: pizda.wordList.length,
	})
	console.log(4)
}
console.log(5)