export const IMAGE_IDS = {
	HOME: "Home",
	NEXT: "Next",
	LEVELS: "Levels"
}
var images = {}
Object.values(IMAGE_IDS).forEach(id => {
	let img = new Image()
	img.src = "./images/" + id + ".png"
	images[id] = img
})
export const getImage = id => {
	return images[id]
}
