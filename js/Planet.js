import { DomHelper } from "./DomHelper.js"
import { fillArc, rndFloat } from "./Util.js"
import { Vector } from "./Vector.js"

export class Planet {
	constructor(data) {
		this.rad = data.rad
		this.getSprite()
		this.pos = new Vector(0, 0)
		this.mot = new Vector(0, 0)
		this.placed = false
		this.rot = 0
		this.rotationalSpeed = rndFloat(-0.1, 0.1)
	}
	place(velocity) {
		DomHelper.hideDiv(this.div, true)
		this.mot = velocity
		this.placed = true
	}
	reset() {
		this.placed = false
		this.burning = false
		DomHelper.showDiv(this.div)
	}
	getSprite() {
		if (!this.img) {
			this.img = DomHelper.createCanvas(this.rad * 2, this.rad * 2)
			let c = this.img.getContext("2d")
			c.fillStyle = "grey"
			fillArc(c, this.rad, this.rad, this.rad)
			c.clip()

			let colors = [
				"rgba(30,30,30,1)",
				"rgba(0,85,0,1)",
				"rgba(0,0,85,1)",
				"rgba(85,25,85)"
			].filter(() => Math.random() < 0.5)

			for (let i = 0; i < 150; i++) {
				let ang = Math.random() * Math.PI * 2
				let dis = Math.random() * this.rad
				let pos = new Vector(this.rad, this.rad).addVec(
					Vector.fromAngDis(ang, dis)
				)
				// c.globalCompositeOperation = "lighter"
				c.shadowBlur = 3
				c.filter = "blur(1px)"
				c.shadowColor = colors[Math.round(Math.random() * (colors.length - 1))]
				c.fillStyle = colors[Math.round(Math.random() * (colors.length - 1))]

				c.globalAlpha = Math.random()
				fillArc(c, pos.x, pos.y, 1 + Math.random() * 5)
				c.filter = "blur(2px)"
				c.stroke()
				c.globalAlpha = 1
			}

			// noise.seed(Math.random())

			// for (var x = 0; x < this.rad * 2; x++) {
			// 	for (var y = 0; y < this.rad * 2; y++) {
			// 		let value = noise.simplex2(x / 6, y / 6)
			// 		console.log(value)
			// 		let color =
			// 			value < 0.1
			// 				? colors[0]
			// 				: value < 0.4
			// 				? colors[1]
			// 				: value < 0.6
			// 				? colors[2]
			// 				: colors[3]
			// 		c.fillStyle = color
			// 		c.globalAlpha = 0.3
			// 		fillArc(c, x, y, Math.random() * 5)
			// 		c.globalAlpha = 1
			// 	}
			// }
		}
		return this.img
	}
	render(c) {
		c.save()
		c.globalCompositeOperation = "source-over"
		c.fillStyle = "rgba(255,255,255,0.5)"
		c.shadowBlur = 15
		c.shadowColor = "rgba(255,255,255,1)"
		fillArc(c, this.pos.x, this.pos.y, this.rad)
		c.restore()

		c.save()
		c.translate(this.pos.x, this.pos.y)
		c.rotate(this.rot)
		c.drawImage(
			this.getSprite(),
			-this.rad,
			-this.rad,
			this.rad * 2,
			this.rad * 2
		)
		c.restore()

		if (this.burning) {
			c.save()
			c.globalCompositeOperation = "lighter"
			c.shadowBlur = 10 // Math.round(this.rad * 1.5)
			c.shadowColor = "rgba(200,0,0,1)"
			c.strokeStyle = "rgba(255,255,255,1)"
			c.fillStyle = "rgba(255,255,0,0.4)"
			c.lineWidth = 2
			c.beginPath()
			c.arc(this.pos.x, this.pos.y, this.rad + 5, 0, Math.PI * 2)
			c.fill()
			// c.stroke()

			c.closePath()
			c.restore()
		}
	}
	update() {
		this.pos.addVec(this.mot)
		this.rot += this.rotationalSpeed
	}
}
