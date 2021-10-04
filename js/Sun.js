import { DomHelper } from "./DomHelper.js"
import { fillArc, rndFloat, rndInt } from "./Util.js"

export class Sun {
	constructor(pos, rad) {
		this.pos = pos
		this.rad = rad
		this.img = this.getSprite()
		this.renderTicker = 0
	}
	getSprite() {
		if (!this.img) {
			this.img = DomHelper.createCanvas(this.rad * 2, this.rad * 2)
			let c = this.img.getContext("2d")
			c.fillStyle = "rgba(255,255,0,0.4)"
			fillArc(c, this.rad, this.rad, this.rad)
		}
		return this.img
	}
	render(c) {
		this.renderTicker += 1
		c.save()
		for (let i = 1; i < 5; i++) {
			c.globalCompositeOperation = "source-over"

			let rad2 = this.rad

			c.fillStyle = "rgba(255,155,0," + 1 + ")"
			c.shadowColor = "rgba(255,155,0,1)"
			c.shadowBlur =
				20 + Math.abs(noise.perlin2(i / 2, this.renderTicker / 150)) * 50
			c.beginPath()
			c.arc(this.pos.x, this.pos.y, Math.max(5, rad2), 0, Math.PI * 2)
			c.fill()
			c.closePath()
		}

		c.globalCompositeOperation = "source-over"
		c.fillStyle = "rgba(0,0,0,0)"
		fillArc(c, this.pos.x, this.pos.y, this.rad)

		c.clip()
		c.shadowBlur = 0

		c.globalCompositeOperation = "lighter"
		c.fillStyle = "rgba(240,255,0,0.1)"
		// c.filter = "blur(1px)"
		for (let i = 0; i < this.rad * 2; i += 5) {
			for (let j = 0; j < this.rad * 2; j += 5) {
				let val = Math.abs(noise.perlin3(i / 2, j / 2, this.renderTicker / 80))
				fillArc(
					c,
					this.pos.x - this.rad + i,
					this.pos.y - this.rad + j,
					val * 14
				)
			}
		}
		// c.filter = "none"
		c.restore()
	}
}
