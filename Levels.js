import { getWindowHeight, getWindowWidth } from "./js/dims.js"
import { rndFloat, rndInt } from "./js/Util.js"
import { Vector } from "./js/Vector.js"

export const levels = [
	{
		suns: [{ rad: 20, pos: [0.5, 0.5] }],
		planets: [{ rad: 10 }],
		unlocked: true
	},
	{
		suns: [{ rad: 50, pos: [0.5, 0.5] }],
		planets: [{ rad: 5 }, { rad: 12 }, { rad: 17 }]
	},
	{
		suns: [{ rad: 20, pos: [0.5, 0.5] }],
		planets: [{ rad: 5 }, { rad: 12 }, { rad: 17 }]
	},
	{
		suns: [
			{ rad: 15, pos: [0.3, 0.5] },
			{ rad: 15, pos: [0.7, 0.5] }
		],
		planets: [{ rad: 10 }, { rad: 15 }]
	},
	{
		suns: [
			{ rad: 10, pos: [0.1, 0.1] },
			{ rad: 10, pos: [0.9, 0.1] },
			{ rad: 10, pos: [0.9, 0.9] },
			{ rad: 10, pos: [0.1, 0.9] },
			{ rad: 15, pos: [0.5, 0.5] }
		],
		planets: [{ rad: 5 }, { rad: 10 }, { rad: 5 }, { rad: 10 }]
	},
	{
		suns: [
			{ rad: 10, pos: [0.1, 0.1] },
			{ rad: 10, pos: [0.9, 0.9] },
			{ rad: 15, pos: [0.5, 0.5] }
		],
		planets: [{ rad: 10 }, { rad: 10 }, { rad: 10 }]
	},
	{
		suns: [
			{ rad: 20, pos: [0.1, 0.5] },
			{ rad: 20, pos: [0.9, 0.5] },
			{ rad: 10, pos: [0.5, 0.5] }
		],
		planets: [{ rad: 15 }]
	},
	{
		suns: [
			{ rad: 20, pos: [0.1, 0.5] },
			{ rad: 20, pos: [0.9, 0.5] },
			{ rad: 10, pos: [0.5, 0.5] }
		],
		planets: [{ rad: 15 }, { rad: 10 }, { rad: 7 }]
	},
	{
		suns: [{ rad: 50, pos: [0.5, 0.5] }],
		planets: [
			{ rad: 5 },
			{ rad: 12 },
			{ rad: 17 },
			{ rad: 5 },
			{ rad: 12 },
			{ rad: 17 }
		]
	},
	{
		suns: [
			{ rad: 15, pos: [0.5, 0.3] },
			{ rad: 15, pos: [0.3, 0.6] },
			{ rad: 15, pos: [0.6, 0.6] }
		],
		planets: [{ rad: 14 }]
	},
	{
		suns: [
			{ rad: 30, pos: [0.7, 0.3] },
			{ rad: 20, pos: [0.4, 0.6] },
			{ rad: 30, pos: [0.6, 0.6] }
		],
		planets: [{ rad: 14 }]
	},
	{
		suns: [
			{ rad: 10, pos: [0.6, 0.7] },
			{ rad: 20, pos: [0.2, 0.4] },
			{ rad: 30, pos: [0.6, 0.6] }
		],
		planets: [{ rad: 14 }, { rad: 5 }]
	},
	{
		suns: [
			// { rad: 30, pos: [0.5, 0] },
			{ rad: 20, pos: [0.6, 0.2] },
			{ rad: 20, pos: [0.4, 0.4] },
			{ rad: 20, pos: [0.6, 0.6] },
			{ rad: 20, pos: [0.4, 0.8] }
			// { rad: 30, pos: [0.5, 1] }
		],
		planets: [{ rad: 5 }]
	}
]

export const getRandomLevelData = () => {
	let obj = {
		suns: [],
		planets: []
	}

	for (let i = 0; i < rndInt(1, 5); i++) {
		let w = getWindowWidth()
		let h = getWindowHeight()
		let x = w / 2 + rndInt(-w / 3, w / 3)
		let y = h / 2 + rndInt(-h / 3, h / 3)

		let rad = rndInt(10, 30)

		while (
			obj.suns.filter(sun => {
				let sx = sun.pos[0] * getWindowWidth()
				let sy = sun.pos[1] * getWindowHeight()
				if (new Vector(sx, sy).disTo(x, y) < rad + sun.rad) {
					return true
				}
				return false
			}).length > 0
		) {
			x = w / 2 + rndInt(-w / 3, w / 3)
			y = h / 2 + rndInt(-h / 3, h / 3)
			rad = rndInt(10, 30)
		}

		obj.suns.push({ rad, pos: [x / getWindowWidth(), y / getWindowHeight()] })
	}

	for (let i = 0; i < rndInt(1, 5); i++) {
		obj.planets.push({ rad: rndInt(5, 17) })
	}

	return obj
}
