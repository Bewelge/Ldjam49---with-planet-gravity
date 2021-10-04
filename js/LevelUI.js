import { muteAll, playSound, playSuccess, SOUND_IDS } from "./Audio.js"
import { getWindowHeight, getWindowWidth } from "./dims.js"
import { DomHelper } from "./DomHelper.js"
import { getCurrentLevel } from "./LevelControl.js"
import { getMenu } from "./main.js"
import {
	appendBody,
	fillArc,
	removeBody,
	rndFloat,
	rndInt,
	star
} from "./Util.js"

export class LevelUI {
	constructor(planets, planetClickCallback) {
		appendBody(this.getPlanetCont(planets, planetClickCallback))
		appendBody(this.getBgCanvas())
		appendBody(this.getCanvas())
		appendBody(this.getMuteButton())
		appendBody(this.getLevelSelectBut())
	}
	getPlanetCont(planets, planetClickCallback) {
		if (!this.planetCont) {
			this.planetCont = DomHelper.createDivWithClass("planetCont ")
			planets.forEach(planet =>
				this.planetCont.appendChild(
					this.getPlanetDiv(planet, planetClickCallback)
				)
			)
		}
		return this.planetCont
	}
	getPlanetDiv(planet, planetClickCallback) {
		if (!planet.div) {
			planet.div = DomHelper.createDivWithClass("planet flexCont")
			planet.div.onclick = () => planetClickCallback(planet)
			planet.div.appendChild(planet.getSprite())
		}
		planet
		return planet.div
	}
	getBgCanvas() {
		if (!this.bgCanvas) {
			this.bgCanvas = DomHelper.createCanvas(
				getWindowWidth(),
				getWindowHeight()
			)
			this.bgCanvas.classList.add("planetCanvas")
			let c = this.bgCanvas.getContext("2d")

			c.filter = "blur(0px)"
			for (let i = 0; i < 500; i++) {
				if (i == 250) c.filter = "none"
				let rnd = 0.5 + 0.5 * Math.random()
				let rgb = [
					Math.floor(255 * rnd),
					Math.floor(255 * rnd),
					Math.floor(255 * rnd)
				]
				c.fillStyle =
					"rgba(" +
					Math.floor(rgb[0]) +
					"," +
					Math.floor(rgb[1]) +
					"," +
					255 +
					"," +
					(0 + 1 * Math.random() * 1) +
					")"

				star(
					c,
					rndInt(0, getWindowWidth()) + 0.5,
					rndInt(0, getWindowHeight()) + 0.5,
					rndFloat(0.5, 1)
				)
				fillArc(
					c,
					rndInt(0, getWindowWidth()) + 0.5,
					rndInt(0, getWindowHeight()) + 0.5,
					rndFloat(0.5, 1)
				)
			}
		}
		return this.bgCanvas
	}
	getMuteButton() {
		if (!this.muteBtn) {
			this.muteBtn = DomHelper.createTextButton("muteBtn", "Mute", () => {
				playSound(SOUND_IDS.CLICK)
				muteAll()
			})
		}
		this.muteBtn.classList.add("muteBtn")
		return this.muteBtn
	}
	getLevelSelectBut(onClear) {
		if (!this.lvlSelectBut) {
			this.lvlSelectBut = DomHelper.createTextButton(
				"ingameLvlSelect",
				"",
				() => {
					playSound(SOUND_IDS.CLICK)
					getCurrentLevel().ended = true
					getCurrentLevel().stopped = true
					getCurrentLevel().clearUI()
					getMenu().showLevelSelect()
				}
			)
		}
		return this.lvlSelectBut
	}
	getCanvas() {
		if (!this.canvas) {
			this.canvas = DomHelper.createCanvas(getWindowWidth(), getWindowHeight())
			this.canvas.classList.add("planetCanvas")
		}
		return this.canvas
	}
	clear() {
		removeBody(this.getPlanetCont())
		removeBody(this.getBgCanvas())
		removeBody(this.getCanvas())
		removeBody(this.getMuteButton())
		removeBody(this.getLevelSelectBut())
		this.lvlSelectBut = null
		this.planetCont = null
		this.canvas = null
		this.bgCanvas = null
		this.muteBtn = null
	}
}
