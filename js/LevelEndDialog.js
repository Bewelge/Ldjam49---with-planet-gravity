import { playSound, SOUND_IDS } from "./Audio.js"
import { DomHelper } from "./DomHelper.js"
import { getMenu } from "./main.js"
import { appendBody, removeBody } from "./Util.js"

export class LevelEndDialog {
	constructor(onSpeedChange, onContinue, onClear, isLast) {
		this.dialog = DomHelper.createDivWithClass("dialog flexCont flexCol")
		this.title = DomHelper.createDivWithClass("subtitle")
		this.title.innerHTML = isLast
			? "Congratulations! </br> You've completed all levels!"
			: "Level Complete!"
		this.dialog.appendChild(this.title)
		if (isLast) {
			let title2 = DomHelper.createDivWithClass("subtitle")
			title2.innerHTML = "Thank you for playing!"
			this.dialog.appendChild(title2)

			let title3 = DomHelper.createDivWithClass("subsubTitle")
			title3.innerHTML = "You can continue playing randomly generated levels."
			this.dialog.appendChild(title3)
		}
		this.dialog.appendChild(this.getSpeedInput(onSpeedChange))
		this.dialog.appendChild(this.getButtonCont(onClear, onContinue, isLast))

		appendBody(this.dialog)
	}
	getButtonCont(onClear, onContinue) {
		if (!this.buttonCont) {
			this.buttonCont = DomHelper.createDivWithClass("buttonCont")
			this.buttonCont.appendChild(this.getMainMenuBut(onClear))
			this.buttonCont.appendChild(this.getLevelSelectBut(onClear))

			this.buttonCont.appendChild(this.getContinueBut(onContinue))
		}
		return this.buttonCont
	}
	getSpeedInput(onSpeedChange) {
		if (!this.speedInput) {
			this.speedInput = DomHelper.createSliderWithLabel(
				"1",
				"Speed Up",
				1,
				1,
				100,
				1,
				ev => onSpeedChange(ev.target.value)
			).container
		}
		return this.speedInput
	}
	getContinueBut(onContinue) {
		if (!this.continueBut) {
			this.continueBut = DomHelper.createTextButton("2", " ", () => {
				playSound(SOUND_IDS.CLICK)
				onContinue()
				this.clear()
			})

			this.continueBut.classList.add("btnEndLvl")
			this.continueBut.style.backgroundImage = "url(./images/Next.png)"
		}
		return this.continueBut
	}
	getMainMenuBut(onClear) {
		if (!this.mainMenuBut) {
			this.mainMenuBut = DomHelper.createTextButton("3", " ", () => {
				playSound(SOUND_IDS.CLICK)
				onClear()
				this.clear()
				getMenu().showMain()
			})
			this.mainMenuBut.classList.add("btnEndLvl")

			this.mainMenuBut.style.backgroundImage = "url(./images/Home.png)"
		}
		return this.mainMenuBut
	}
	getLevelSelectBut(onClear) {
		if (!this.lvlSelectBut) {
			this.lvlSelectBut = DomHelper.createTextButton("4", "", () => {
				playSound(SOUND_IDS.CLICK)
				onClear()
				this.clear()

				getMenu().showLevelSelect()
			})

			this.lvlSelectBut.classList.add("btnEndLvl")
			this.lvlSelectBut.style.backgroundImage = "url(./images/Levels.png)"
		}
		return this.lvlSelectBut
	}
	clear() {
		removeBody(this.dialog)
		this.dialog = null

		this.continueBut = null
		this.mainMenuBut = null
		this.lvlSelectBut = null
	}
}
