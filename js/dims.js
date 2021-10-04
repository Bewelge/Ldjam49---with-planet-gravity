class Dims {
	constructor() {
		this.width = 960 //window.innerWidth
		this.height = 640 //window.innerHeight
	}
}

var dims = new Dims()
export const getWindowWidth = () => {
	return dims.width
}
export const getWindowHeight = () => {
	return dims.height
}
