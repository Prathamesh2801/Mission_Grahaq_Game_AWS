import musicUrl from '../../../assets/audio/music.mp3'
import correctUrl from '../../../assets/audio/correct.mp3'
import wrongUrl from '../../../assets/audio/wrong.mp3'

// Browsers only allow audio after a user gesture; the TAP TO PLAY tap covers that.
const music = new Audio(musicUrl)
music.loop = true
const sfx = { correct: new Audio(correctUrl), wrong: new Audio(wrongUrl) }

const ignore = () => {}

export function startMusic() {
  music.currentTime = 0
  music.play().catch(ignore)
}

// Fresh copy per play so quick successive taps overlap instead of cutting each other off.
export function playSfx(name) {
  sfx[name].cloneNode().play().catch(ignore)
}

// The screensaver silences the stand; the next TAP TO PLAY starts it again from the top.
export function stopMusic() {
  music.pause()
}
