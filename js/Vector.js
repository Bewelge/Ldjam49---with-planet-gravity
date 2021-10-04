import { anglePoints, distPoints } from "./Util.js"

export class Vector {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	addNum(num) {
		this.x += num
		this.y += num
		return this
	}
	addVec(vector2) {
		this.x += vector2.x
		this.y += vector2.y
		return this
	}
	multNum(num) {
		this.x *= num
		this.y *= num
		return this
	}
	multVec(vector2) {
		this.x *= vector2.x
		this.y *= vector2.y
		return this
	}
	disTo(vec) {
		return distPoints(this, vec)
	}
	angTo(vec) {
		return anglePoints(this, vec)
	}
	copy() {
		return new Vector(this.x, this.y)
	}
	dotProduct(vec) {
		return this.x * vec.x + this.y * vec.y
	}
	normalize() {
		return this.multNum(1 / this.magnitude())
	}
	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}
	static fromAngDis(ang, dis) {
		return new Vector(Math.cos(ang) * dis, Math.sin(ang) * dis)
	}
}
