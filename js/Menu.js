import { initMusic, playSound, SOUND_IDS } from "./Audio.js"
import { DomHelper } from "./DomHelper.js"
import { startNewLevel, startRandomLevel } from "./LevelControl.js"
import { levels } from "./Levels.js"
import { loadProgress } from "./LocalStorageHandler.js"
import { appendBody, removeBody } from "./Util.js"
export class Menu {
	constructor() {
		this.showMain()
	}
	getContainer() {
		if (!this.cont) {
			this.cont = DomHelper.createDivWithClass("fullscreen flexCont flexCol")

			let titleDiv = DomHelper.createDivWithClass("title")
			titleDiv.innerHTML = "Orbital Turbulence"
			let subtitleDiv = DomHelper.createDivWithClass("subtitle")
			subtitleDiv.innerHTML = "A game by Bewelge"
			let subsubtitleDiv = DomHelper.createDivWithClass("subTitle")
			subtitleDiv.appendChild(subsubtitleDiv)
			subsubtitleDiv.innerHTML =
				"In this version, planets attract each other and the game become unplayable ¯\\_(ツ)_/¯"
			let subsubtitleDiv2 = DomHelper.createDivWithClass("subTitle")
			subtitleDiv.appendChild(subsubtitleDiv2)
			subsubtitleDiv2.innerHTML =
				"<a href='https://github.com/Bewelge/Orbital-Turbulence-LDJam-49'>Click here for the real version of the game</a>"

			this.cont.appendChild(titleDiv)
			this.cont.appendChild(subtitleDiv)
			// this.cont.appendChild(subsubtitleDiv)
			this.cont.appendChild(this.getButtons())
		}
		return this.cont
	}
	getButtons() {
		if (!this.buttonsDiv) {
			this.buttonsDiv = DomHelper.createDivWithClass("buttonCont")
			this.buttonsDiv.appendChild(this.getLevelSelectButton())
			this.buttonsDiv.appendChild(this.getStartButton())
		}
		return this.buttonsDiv
	}
	getStartButton() {
		if (!this.startButton) {
			this.startButton = DomHelper.createTextButton(
				"startBtn",
				"Start game",
				() => {
					initMusic()
					playSound(SOUND_IDS.CLICK)
					removeBody(this.getContainer())
					startNewLevel(0)
				}
			)
		}
		return this.startButton
	}
	getLevelSelect() {
		this.levelSelectDiv = DomHelper.createDivWithClass(
			"fullscreen levelSelect flexCont"
		)

		let title = DomHelper.createDivWithClass("title")
		title.innerHTML = "Level Select"
		this.levelSelectDiv.appendChild(title)

		let progress = loadProgress()

		levels.forEach((level, index) => {
			let lvlDiv = DomHelper.createTextButton(Math.random(), index + 1, () => {
				if (levels[index].unlocked || index <= loadProgress()) {
					playSound(SOUND_IDS.CLICK)
					removeBody(this.levelSelectDiv)
					startNewLevel(index)
				}
			})
			lvlDiv.classList.add("lvlDiv")
			// lvlDiv.innerHTML = index + 1
			if (levels[index].unlocked || index <= progress) {
				lvlDiv.classList.add("unlocked")
			}
			this.levelSelectDiv.appendChild(lvlDiv)
		})

		let rndLvlBtn = DomHelper.createTextButton("rndBtn", "Random Level", () => {
			playSound(SOUND_IDS.CLICK)
			removeBody(this.levelSelectDiv)
			startRandomLevel()
		})
		this.levelSelectDiv.appendChild(rndLvlBtn)

		return this.levelSelectDiv
	}
	getLevelSelectButton() {
		if (!this.lvlSelectButton) {
			this.lvlSelectButton = DomHelper.createTextButton(
				"a",
				"Level Select",
				() => {
					playSound(SOUND_IDS.CLICK)
					removeBody(this.getContainer())
					appendBody(this.getLevelSelect())
				}
			)
		}
		return this.lvlSelectButton
	}
	showLevelSelect() {
		appendBody(this.getLevelSelect())
	}
	showMain() {
		appendBody(this.getContainer())
	}
}
