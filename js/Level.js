import {
	createProgression,
	doNewRythm,
	loopSound,
	playSound,
	playSuccess,
	setMusicSpeed,
	SOUND_IDS,
	startChordLoop
} from "./Audio.js"
import { getWindowHeight, getWindowWidth } from "./dims.js"
import { DomHelper } from "./DomHelper.js"
import { getCurrentLevel } from "./LevelControl.js"
import { LevelUI } from "./LevelUI.js"
import { Planet } from "./Planet.js"
import { Sun } from "./Sun.js"
import { anglePoints, distPoints, setFont, strokeLine } from "./Util.js"
import { Vector } from "./Vector.js"

export class Level {
	constructor(levelData, endGame) {
		this.data = levelData
		this.endGame = endGame
		this.placingPlanet = null
		this.speed = 1
		this.levelUi = new LevelUI(this.getPlanets(), planet => {
			// setMusicSpeed(this.getActivePlanets().length / this.getPlanets().length)
			this.placingPlanet = planet
			playSound(SOUND_IDS.CLICK)
		})
		this.addMouseListener()
		this.update()
		this.countdownTickerLimit = 500
		this.lastPlayed = 0

		doNewRythm(this.getActivePlanets().length)
		setMusicSpeed(0.2)
		startChordLoop(
			() => this.countdownTicker >= this.countdownTickerLimit || this.ended
		)
	}
	clearUI() {
		this.levelUi.clear()
	}
	addMouseListener() {
		this.getCtx().canvas.addEventListener("mousedown", ev => {
			if (this.placingPlanet) {
				if (this.placedPlanetPos) {
					playSound(SOUND_IDS.CRASH3)
					this.placingPlanet.place(this.getVelocityFromMousePos())

					let pl = this.placingPlanet
					createProgression(
						Math.floor(7 - this.placingPlanet.rad / 4),
						() => this.ended || !pl.placed
					)
					this.placingPlanet = null
					this.placedPlanetPos = null
					setMusicSpeed(
						this.getActivePlanets().length / this.getPlanets().length
					)
					// doNewRythm(this.getActivePlanets().length)
				} else {
					let rect = this.levelUi.getCanvas().getBoundingClientRect()
					this.placedPlanetPos = new Vector(
						ev.clientX - rect.left,
						ev.clientY - rect.top
					)
				}
			}
		})
		this.getCtx().canvas.addEventListener("mousemove", ev => {
			let rect = this.levelUi.getCanvas().getBoundingClientRect()
			this.mouse = new Vector(ev.clientX - rect.left, ev.clientY - rect.top)
		})
	}
	getCtx() {
		return this.levelUi.getCanvas().getContext("2d")
	}
	getCanvasWidth() {
		return this.getCtx().canvas.width
	}
	getCanvasHeight() {
		return this.getCtx().canvas.height
	}
	getActivePlanets() {
		return this.getPlanets().filter(planet => planet.placed)
	}
	getPlanets() {
		if (!this.planets) {
			this.planets = []
			for (let p in this.data.planets) {
				this.planets.push(new Planet(this.data.planets[p]))
			}
		}
		return this.planets
	}
	getSuns() {
		if (!this.suns) {
			this.suns = []
			this.data.suns.forEach(sun =>
				this.suns.push(
					new Sun(
						new Vector(
							getWindowWidth() * sun.pos[0],
							getWindowHeight() * sun.pos[1]
						),
						sun.rad
					)
				)
			)
		}
		return this.suns
	}
	update() {
		if (this.placingPlanet) {
			if (this.placedPlanetPos) {
				this.placingPlanet.pos = this.placedPlanetPos.copy()
			} else {
				this.placingPlanet.pos = this.mouse.copy()
			}
		}

		for (let i = 0; i < this.speed; i++) {
			this.updatePlanets()

			if (
				!this.stopTime &&
				this.getPlanets().filter(planet => !planet.placed).length == 0
			) {
				if (!this.countdown) {
					this.countdown = true
					this.countdownTicker = 0
					loopSound(SOUND_IDS.TICKTOCK2, () => this.ended || !this.countdown)
				}
				this.countdownTicker++
				if (this.countdownTicker >= this.countdownTickerLimit && !this.ended) {
					// playSound(SOUND_IDS.JINGLE)

					playSuccess()
					this.endGame()
				}
			} else if (!this.stopTime) {
				this.countdown = false
				this.countdownTicker = 0
			}
		}

		this.render()
		if (!this.stopped) {
			window.requestAnimationFrame(this.update.bind(this))
		}
	}
	updatePlanets() {
		this.getActivePlanets().forEach(planet => {
			this.getActivePlanets()
				.filter(aPlanet => aPlanet != planet)
				.forEach(aPlanet => {
					planet.mot.addVec(
						this.getGravitationalInfluence(
							planet.pos,
							planet.rad,
							aPlanet.pos,
							aPlanet.rad * 0.2
						)
					)
				})
			this.getSuns().forEach(sun =>
				planet.mot.addVec(
					this.getGravitationalInfluence(
						planet.pos,
						planet.rad,
						sun.pos,
						sun.rad
					)
				)
			)
		})

		//check collisions with suns
		this.getActivePlanets().forEach(planet =>
			this.getSuns().forEach(sun => {
				let dis = planet.pos.disTo(sun.pos)
				if (dis < planet.rad + sun.rad) {
					let ang = sun.pos.angTo(planet.pos)

					planet.mot = Vector.fromAngDis(ang, 25)
					playSound(SOUND_IDS.CRASH2)
					planet.burning = true
				}
			})
		)

		let pairsDone = {}
		//check collisions between planets
		this.getActivePlanets().forEach((planet, i) =>
			this.getActivePlanets().forEach((planet2, i2) => {
				if (planet != planet2) {
					let dis = planet.pos.disTo(planet2.pos)
					if (
						dis < planet.rad + planet2.rad &&
						!(pairsDone[i2] && pairsDone[i2].hasOwnProperty(i))
					) {
						if (!pairsDone.hasOwnProperty(i)) {
							pairsDone[i] = {}
						}
						pairsDone[i][i2] = true

						let tangentVec = new Vector(
							planet2.pos.y - planet.pos.y,
							-(planet2.pos.x - planet.pos.x)
						).normalize()
						let relativeVel = new Vector(
							planet.mot.x - planet2.mot.x,
							planet.mot.y - planet2.mot.y
						)
						let length = relativeVel.dotProduct(tangentVec)

						let velOnTarget = tangentVec.multNum(length)
						let velocityComponentPerpendicularToTangent = relativeVel.addVec(
							velOnTarget.multNum(-1)
						)

						planet.mot.x -= velocityComponentPerpendicularToTangent.x
						planet.mot.y -= velocityComponentPerpendicularToTangent.y
						planet2.mot.x += velocityComponentPerpendicularToTangent.x
						planet2.mot.y += velocityComponentPerpendicularToTangent.y

						if (window.performance.now() - this.lastPlayed > 300) {
							this.lastPlayed = window.performance.now()
							playSound(SOUND_IDS.CRASH1)
						}
					}
				}
			})
		)

		this.getActivePlanets().forEach(planet => {
			if (
				planet.pos.x + planet.rad < 0 ||
				planet.pos.x - planet.rad > this.getCanvasWidth() ||
				planet.pos.y + planet.rad < 0 ||
				planet.pos.y - planet.rad > this.getCanvasHeight()
			) {
				planet.reset()
				setMusicSpeed(this.getActivePlanets().length / this.getPlanets().length)
				// doNewRythm(this.getActivePlanets().length)
				playSound(SOUND_IDS.SWOOSH)
				if (this.ended) {
					this.stopTime = true
				}
			}
		})

		this.getActivePlanets().forEach(planet => planet.update())
	}
	render() {
		let c = this.getCtx()
		c.clearRect(0, 0, getWindowWidth(), getWindowHeight())
		// c.fillStyle = "rgba(0,0,0,0.5)"
		// c.fillRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight())
		c.save()
		this.getSuns().forEach(sun => sun.render(c))

		this.renderPlacing(c)
		this.getActivePlanets().forEach(planet => planet.render(c))

		c.restore()

		this.getSuns().forEach(sun => {
			let planets = this.getActivePlanets().sort(
				(plan0, plan1) => plan0.pos.disTo(sun.pos) - plan1.pos.disTo(sun.pos)
			)
			c.save()
			c.globalCompositeOperation = "lighter"
			c.shadowColor = "rgba(255,255,201,1)"
			c.filter = "blur(2px)"
			c.shadowBlur = 25
			planets.forEach(planet => {
				c.save()
				c.beginPath()
				c.moveTo(planet.pos.x, planet.pos.y)
				c.arc(planet.pos.x, planet.pos.y, planet.rad, 0, Math.PI * 2, 0)
				c.closePath()
				c.clip()
				c.beginPath()
				let dis = planet.pos.disTo(sun.pos)
				c.fillStyle = "rgba(255,255,201," + 0.4 * (1 - dis / 700) + ")"
				let ang = planet.pos.angTo(sun.pos)
				let offsetPos = planet.pos
					.copy()
					.addVec(Vector.fromAngDis(ang, planet.rad * 2))
				c.moveTo(offsetPos.x, offsetPos.y)
				c.arc(offsetPos.x, offsetPos.y, planet.rad * 2, 0, Math.PI * 2, 0)
				c.fill()
				c.closePath()
				c.restore()
			})
			// c.shadowBlur = 20
			// planets.forEach((planet, index) => {
			// 	let ang = planet.pos.angTo(sun.pos)
			// 	let dis = planet.pos.disTo(sun.pos)

			// 	let sunP1 = sun.pos
			// 		.copy()
			// 		.addVec(Vector.fromAngDis(ang + Math.PI * 0.5, sun.rad))
			// 	let sunP2 = sun.pos
			// 		.copy()
			// 		.addVec(Vector.fromAngDis(ang - Math.PI * 0.5, sun.rad))
			// 	let planetP1 = planet.pos
			// 		.copy()
			// 		.addVec(Vector.fromAngDis(ang + Math.PI * 0.5, planet.rad))
			// 	let planetP2 = planet.pos
			// 		.copy()
			// 		.addVec(Vector.fromAngDis(ang - Math.PI * 0.5, planet.rad))
			// 	let ang1 = sunP1.angTo(planetP1)
			// 	let ang2 = sunP2.angTo(planetP2)

			// 	c.beginPath()
			// 	c.fillStyle = "white"
			// 	c.lineWidth = 2
			// 	c.moveTo(planetP1.x, planetP1.y)
			// 	c.lineTo(
			// 		planetP1.x + Math.cos(ang1) * 1000,
			// 		planetP1.y + Math.sin(ang1) * 1000
			// 	)
			// 	c.lineTo(
			// 		planetP2.x + Math.cos(ang2) * 1000,
			// 		planetP2.y + Math.sin(ang2) * 1000
			// 	)

			// 	c.lineTo(planetP2.x, planetP2.y)
			// 	c.lineTo(planetP1.x, planetP1.y)
			// 	c.fill()
			// 	c.closePath()

			// 	let vec1 = sunP1.addVec(planetP1.multNum(-1))
			// 	let vec2 = sunP2.addVec(planetP2.multNum(-1))

			// 	// for (let i = index + 1;i<)
			// })
			c.restore()
		})

		this.renderText(c)
	}
	renderText(c) {
		c.fillStyle = "rgba(235,235,235,1)"
		c.textBaseline = "top"
		let tx = ""

		setFont(c, 40)
		if (this.countdown) {
			if (this.countdownTicker < this.countdownTickerLimit) {
				let str =
					"" +
					Math.max(
						0,
						Math.floor(
							(10 * (this.countdownTickerLimit - this.countdownTicker)) / 100
						) / 10
					)
				if (str.indexOf(".") == -1) {
					str += ".0"
				}
				let tx2 = str + " years"
				let wd2 = c.measureText(tx2).width
				c.fillText(tx2, this.getCanvasWidth() / 2 - wd2 / 2, 75)

				tx = "All planets in orbit"
			} else {
				tx = "Stable orbit for "
				let str = "" + Math.floor((10 * this.countdownTicker) / 100) / 10
				if (str.indexOf(".") == -1) {
					str += ".0"
				}
				let tx2 = str + " years"
				let wd2 = c.measureText(tx2).width
				c.fillText(tx2, this.getCanvasWidth() / 2 - wd2 / 2, 75)
			}
		} else {
			tx = "Select Planets on the left and place them in orbit"
		}
		setFont(c, 24.7)
		let wd = c.measureText(tx).width / 2

		c.fillText(tx, this.getCanvasWidth() / 2 - wd, 33)
	}

	renderPlacing(c) {
		c.fillStyle = "white"
		if (this.placingPlanet) {
			c.globalAlpha = 0.5
			if (this.placedPlanetPos) {
				c.globalAlpha = 1
				c.lineWidth = 5
				strokeLine(
					c,
					this.placedPlanetPos,
					this.mouse,
					3,
					"rgba(255,255,255,0.5)"
				)

				c.globalCompositeOperation = "lighter"
				c.strokeStyle = "rgba(155,155,0,0.5)"
				c.lineWidth = 2
				c.shadowBlur = 5
				c.shadowColor = "white"

				c.beginPath()
				c.moveTo(this.placingPlanet.pos.x, this.placingPlanet.pos.y)
				let futurePositions = this.getPlanetPosIn(
					this.placingPlanet,
					this.getVelocityFromMousePos(),
					250
				)
				for (let i = 0; i < futurePositions.length; i++) {
					let vec = futurePositions[i]
					if (
						this.getSuns().filter(
							sun => sun.pos.disTo(vec) < sun.rad + this.placingPlanet.rad
						).length
					) {
						break
					}

					c.lineTo(vec.x, vec.y)
					c.stroke()
					c.closePath()
					c.beginPath()
					c.moveTo(vec.x, vec.y)
				}
				c.stroke()
				c.closePath()

				c.shadowBlur = 0
				c.globalCompositeOperation = "source-over"
			}
			this.placingPlanet.render(c)
			c.globalAlpha = 1
		}
	}
	getVelocityFromMousePos() {
		let mouseAng = anglePoints(this.mouse, this.placingPlanet.pos)
		let mouseDis = distPoints(this.placingPlanet.pos, this.mouse) * 0.05
		return Vector.fromAngDis(mouseAng, mouseDis)
	}
	getPlanetPosIn(planet, vel, time) {
		let points = []
		let planetPos = planet.pos.copy()

		for (let i = 0; i < time; i++) {
			this.getSuns().forEach(sun => {
				vel.addVec(
					this.getGravitationalInfluence(
						planetPos,
						planet.rad,
						sun.pos,
						sun.rad
					)
				)
			})
			planetPos.addVec(vel)
			points.push(planetPos.copy())
		}
		return points
	}
	getGravitationalInfluence(planetPos, planetRad, sunPos, sunRad) {
		let force =
			(10 * (planetRad * sunRad)) / Math.pow(distPoints(planetPos, sunPos), 2)
		let ang = anglePoints(planetPos, sunPos)
		return new Vector(Math.cos(ang) * force, Math.sin(ang) * force)
	}
}
