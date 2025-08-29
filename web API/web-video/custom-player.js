// video ended timeupdate
// Function--->play、pause、stop
// params ====> currentTime、duration

const media = document.querySelector('video');
const controls = document.querySelector('.controls');

const play = document.querySelector('.play');
const stop = document.querySelector('.stop');
const rwd = document.querySelector('.rwd');
const fwd = document.querySelector('.fwd');

const timerWrapper = document.querySelector('.timer');
const timer = document.querySelector('.timer span');
const timerBar = document.querySelector('.timer div');

function playPauseMedia() {
  if (media.paused) {
    play.setAttribute("data-icon", "u");
    media.play();
  } else {
    play.setAttribute("data-icon", "P");
    media.pause();
  }
}

function stopMedia() {
    media.pause();
    media.currentTime = 0;
    play.setAttribute("data-icon", "P");
}

function mediaBackward() {
    if (media.currentTime >= 10) {
        media.currentTime -= 10;
    } else {
        media.currentTime = 0;
    }
}

function mediaForward() {
    if (media.currentTime <= media.duration - 10) {
        media.currentTime += 10;
    } else {
        media.currentTime = media.duration;
    }
}
function setTime() {
  const minutes = Math.floor(media.currentTime / 60);
  const seconds = Math.floor(media.currentTime - minutes * 60);

  const minuteValue = minutes.toString().padStart(2, "0");
  const secondValue = seconds.toString().padStart(2, "0");

  const mediaTime = `${minuteValue}:${secondValue}`;
  timer.textContent = mediaTime;

  const barLength = timerWrapper.clientWidth * (media.currentTime / media.duration);
  timerBar.style.width = `${barLength}px`;
}
play.addEventListener('click', playPauseMedia)
stop.addEventListener('click', stopMedia)
media.addEventListener('ended', stopMedia)
rwd.addEventListener('click', mediaBackward)
fwd.addEventListener('click', mediaForward)
media.addEventListener("timeupdate", setTime);

