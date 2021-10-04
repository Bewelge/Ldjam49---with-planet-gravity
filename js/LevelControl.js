import { getRandomLevelData } from "../Levels.js"
import { DomHelper } from "./DomHelper.js"
import { Level } from "./Level.js"
import { LevelEndDialog } from "./LevelEndDialog.js"
import { levels } from "./Levels.js"
import { saveProgress } from "./LocalStorageHandler.js"

class LevelControl {
	constructor() {
		this.level = 0
		this.currentLevel = null
		this.random = false
	}
	startNew(levelName) {
		this.level = levelName
		this.random = false
		this.currentLevel = new Level(levels[this.level], this.endLevel.bind(this))
	}
	startRandom() {
		this.random = true
		this.currentLevel = new Level(
			getRandomLevelData(),
			this.endLevel.bind(this)
		)
	}
	endLevel() {
		if (!this.random) {
			this.level++
			saveProgress(this.level)
		}
		this.currentLevel.ended = true
		if (levels[this.level]) {
			levels[this.level].unlocked = true
		}
		new LevelEndDialog(
			spd => (this.currentLevel.speed = spd),
			() => {
				this.currentLevel.stopped = true
				this.currentLevel.clearUI()
				if (this.random || !levels.hasOwnProperty(this.level)) {
					this.startRandom()
				} else {
					this.startNew(this.level)
				}
			},
			() => this.currentLevel.clearUI(),
			!levels.hasOwnProperty(this.level)
		)
	}
}

const levelControl = new LevelControl()
export const startNewLevel = levelName => {
	levelControl.startNew(levelName)
}
export const startRandomLevel = () => {
	levelControl.startRandom()
}
export const getCurrentLevel = () => {
	return levelControl.currentLevel
}
