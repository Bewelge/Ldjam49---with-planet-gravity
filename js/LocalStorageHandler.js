const SAVE_PATH_ROOT = "OrbitalChaosLdJam49/Progress"
export const getGlobalSavedSettings = () => {
	let obj = {}
	if (window.localStorage) {
		let storedObj = window.localStorage.getItem(SAVE_PATH_ROOT)
		if (storedObj) {
			obj = JSON.parse(storedObj)
		}
	}
	return obj
}

// export const saveCurrentSettings = () => {
// 	if (window.localStorage) {
// 		let saveObj = getSettingObject()
// 		window.localStorage.setItem(SAVE_PATH_ROOT, JSON.stringify(saveObj))
// 	}
// }

export const saveProgress = levelName => {
	if (loadProgress() < levelName) {
		let obj = { progress: levelName }
		window.localStorage.setItem(SAVE_PATH_ROOT, JSON.stringify(obj))
	}
}
export const loadProgress = () => {
	let obj = {}
	if (window.localStorage) {
		let storedObj = window.localStorage.getItem(SAVE_PATH_ROOT)
		if (storedObj) {
			obj = JSON.parse(storedObj)
		}
	}
	return obj.progress || 0
}
