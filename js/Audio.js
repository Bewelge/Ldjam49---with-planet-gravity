import {
	appendBody,
	getBase64Buffer,
	replaceAllString,
	rndFloat,
	rndInt
} from "./Util.js"

export const SOUND_IDS = {
	CLICK: "click",
	CRASH0: "crash0",
	CRASH1: "crash1",
	CRASH2: "crash2",
	CRASH3: "crash3",
	JINGLE: "jingle",
	SLING: "sling",
	TICKTOCK: "tickTock",
	TICKTOCK2: "tickTock2",
	WHISTLE: "whistle",
	DIE: "die",
	SWOOSH: "swoosh"
}

var freqs = {
	A: 440,
	C: 523.3,
	E: 659.3,
	G: 392,
	B: 439.9,
	D: 587.3,
	F: 349.2
}
let chords = [
	["C", "E", "G"],
	["G", "B", "D"],
	["A", "C", "E"],
	["F", "A", "C"]
]
var durs = [0.25, 0.5, 1, 2, 4]
var rythmdurs = [0.5, 1, 2]
var muted = false
export class Music {
	constructor() {
		this.curChord = 0
		this.nextChordAt = 0
		this.nextNoteAt = 0
		this.nextBeatAt = 0
		this.chordLength = 1.5
		this.rythm = [0.25, 0.25, 0.25]
		this.breaks = 0.97
		this.queue = {}
		this.muted = false
		this.ctx = new AudioContext()
		this.sounds = {}
		this.bufferSources = {}
		this.noteBuffers = {}
		this.loops = {}
		this.loadSounds()
		this.noteProgressions = []
		this.speed = 0.2
	}
	newRythm(amount) {
		let arr = []
		amount = Math.max(1, amount)
		for (let i = 0; i < amount; i++) {
			arr.push(rythmdurs[Math.floor(Math.random() * rythmdurs.length - 0.1)])
		}
		return arr
	}
	loadSounds() {
		Object.values(SOUND_IDS).forEach(soundId => {
			fetch("./Audio/" + soundId + ".mp3")
				.then(response => {
					if (response.ok) {
						return response.arrayBuffer()
					}
					throw Error(response.statusText)
				})
				.then(data => {
					this.ctx.decodeAudioData(data).then(decodedData => {
						this.sounds[soundId] = decodedData
						this.bufferSources[soundId] = this.ctx.createBufferSource()
						this.bufferSources[soundId].buffer = decodedData
					})
				})
				.catch(function (error) {
					console.error("Error fetching soundfont: \n", error)
				})
		})

		fetch("./Audio/acoustic_grand_piano-mp3.js")
			.then(response => {
				if (response.ok) {
					return response.text()
				}
				throw Error(response.statusText)
			})
			.then(data => {
				let scr = document.createElement("script")
				scr.language = "javascript"
				scr.type = "text/javascript"
				scr.text = data
				appendBody(scr)
			})
			.then(() => {
				Object.keys(MIDI.Soundfont.acoustic_grand_piano).forEach(note => {
					let base64 = getBase64Buffer(
						MIDI.Soundfont.acoustic_grand_piano[note]
					)
					this.ctx.decodeAudioData(base64).then(decodedData => {
						this.noteBuffers[note] = decodedData
					})
				})
			})
	}
	init(muted) {
		this.muted = muted
	}
	mute() {
		this.muted = !this.muted
	}
	noteProgression() {
		this.noteProgressions.forEach(prog => {
			if (prog.nextNoteAt - this.time < 0.1) {
				let dur = durs[rndInt(0, durs.length - 1)]
				let note =
					chords[this.curChord][Math.floor(rndFloat(0, 3))] + prog.height
				this.playNote(
					this.ctx,
					note,
					rndFloat(0.1, 0.5),
					this.time,
					prog.nextNoteAt - this.time,
					dur
				)
				prog.nextNoteAt = this.time + dur
			}
		})
		for (let i = this.noteProgressions.length - 1; i >= 0; i--) {
			if (this.noteProgressions[i].isEnded()) {
				this.noteProgressions.splice(i, 1)
			}
		}
	}
	createProgression(height, isEnded) {
		this.noteProgressions.push({
			height: height,
			isEnded: isEnded,
			nextNoteAt: 0
		})
	}
	playRandomNote() {
		let dur = durs[Math.floor(rndFloat(0, durs.length))]
		let note = chords[this.curChord][Math.floor(rndFloat(0, 3))]
		this.playNote(
			this.ctx,
			note,
			rndFloat(0.1, 0.5),
			this.time,
			this.nextNoteAt - this.time,
			dur * this.breaks
		)
		this.nextNoteAt +=
			dur + Math.random() < 0.5
				? 0
				: durs[Math.floor(Math.random() * durs.length - 0.1)]
	}
	chordLoop(isEnded) {
		if (!this.muted) {
			this.time = this.ctx.currentTime
			if (this.nextChordAt - this.time < 0.1) {
				this.curChord++
				this.curChord = this.curChord % chords.length
				let durCounter = 0
				this.rythm.forEach((ryth, i) => {
					this.playChord(
						this.ctx,
						chords[this.curChord],
						this.nextChordAt - this.time + durCounter,
						(ryth * this.breaks) / this.speed
					)
					durCounter += ryth / this.speed
				})

				this.nextChordAt += durCounter
			}
			this.noteProgression()
			// if (this.nextNoteAt - this.time < 1) {
			// 	this.playRandomNote()
			// }
		}
		if (!isEnded()) {
			window.requestAnimationFrame(() => this.chordLoop(isEnded))
		}
	}
	playChord(c, arr, delay, dur) {
		let gain = 0.5 / arr.length
		let time = c.currentTime
		arr.forEach(note => {
			this.playNote(c, note + 3, gain, time, delay, dur)
		})
	}
	playSuccessSound() {
		let notes = "CDEFGAB"
		let height = 2
		let complDur = 5.6
		let time = this.ctx.currentTime
		for (let i = 1; i < 5; i++) {
			notes.split("").forEach((c, j) => {
				let note = c + (i + height)
				this.playNote(
					this.ctx,
					note,
					0.4,
					time,
					i * j * 0.2,
					complDur - i * j * 0.2
				)
			})
		}
	}

	playNote(c, note, gain, time, delay, dur) {
		try {
			let buffer = c.createBufferSource()
			buffer.buffer = this.noteBuffers[note]
			var g = c.createGain()
			g.gain.value = 0
			g.gain.setValueAtTime(0, time + delay)
			g.gain.linearRampToValueAtTime(gain, time + delay + 0.05)
			g.gain.setValueAtTime(gain, time + delay + dur)
			g.gain.exponentialRampToValueAtTime(0.00001, time + delay + dur + 3)

			buffer.connect(g)

			buffer.start(time + delay)
			buffer.stop(time + delay + dur + 5)
			g.connect(c.destination)
			window.setTimeout(() => {
				g.disconnect()
				buffer.disconnect()
			}, (delay + dur + 5) * 1000)
		} catch (e) {
			//we
			console.log(e)
		}
	}
	getBufferSource(soundId) {
		let buffer = this.ctx.createBufferSource()
		buffer.buffer = this.sounds[soundId]
		return buffer
	}
	loopSound(soundId, isEnded) {
		let dur = this.sounds[soundId].duration
		if (!this.loops[soundId]) {
			this.playSound(soundId)
			this.loops[soundId] = this.ctx.currentTime
		}
		let timeTilNext = dur - (this.ctx.currentTime - this.loops[soundId])
		if (timeTilNext < 0.1) {
			this.playSound(soundId, 1, timeTilNext)
			this.loops[soundId] = this.ctx.currentTime
		}
		if (!isEnded()) {
			window.requestAnimationFrame(() => this.loopSound(soundId, isEnded))
		}
	}
	playSound(soundId, dur = 1, delay = 0) {
		if (this.muted) return
		let sound = this.sounds[soundId]

		dur *= sound.duration
		if (!this.queue.hasOwnProperty(soundId)) {
			this.queue[soundId] = []
		}
		let queue = this.queue[soundId]
		if (queue.length > sound.max) return
		let c = this.ctx
		let time = c.currentTime + delay

		let g = c.createGain()
		g.gain.value = 0
		g.gain.setValueAtTime(0, time)
		g.gain.linearRampToValueAtTime(0.4, time + 0.05)
		g.gain.linearRampToValueAtTime(0.4, time + dur - 0.05)
		g.gain.linearRampToValueAtTime(0.01, time + dur)

		let buffer = this.getBufferSource(soundId)
		buffer.connect(g)
		buffer.start(time)
		buffer.stop(time + dur + 0.5)
		g.connect(c.destination)
		queue.push(buffer)
		window.setTimeout(() => {
			g.disconnect()
			buffer.disconnect()
			queue.splice(queue.indexOf(buffer), 1)
		}, (dur + 0.1) * 1000)
	}
}
const music = new Music(false)

export const initMusic = muted => {
	music.init(muted)
}
export const createProgression = (height, isEnded) =>
	music.createProgression(height, isEnded)
export const doNewRythm = amnt => (music.rythm = music.newRythm(amnt))
export const loopSound = (soundName, dur) => music.loopSound(soundName, dur)
export const endSound = (soundName, dur) => music.endSound(soundName, dur)
export const playSound = (soundName, dur) => music.playSound(soundName, dur)
export const muteAll = () => music.mute()
export const playSuccess = () => music.playSuccessSound()
export const setMusicSpeed = speed => (music.speed = Math.max(0.25, speed))
export const startChordLoop = isEnded => {
	music.nextChordAt = music.ctx.currentTime
	music.chordLoop(isEnded)
}
