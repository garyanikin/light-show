// const FPS = 3;
// const FPS = 8.7;
const FPS = 60;
let TIME = 0;
const LEDS = createLeds(Number(location.search.substring(1)) || 5);
const LEDS_LENGTH = LEDS.length;

renderLeds(LEDS);
setInterval(function loop() {
  // controls
  const is_inverted = get("invert");
  const duration = Number(get("transition-duration"));
  set("transition-duration-val", duration);
  const trail_length = Number(get("trail-size"));
  const trail = get("trail");
  const trail_inverted = get("invert-trail");
  const trail_overflow = get("trail-overflow");
  //   const gradient = get("gradient");
  //   const gradient_size = Number(get("gradient-size"));

  updateLeds({
    is_inverted,
    duration,
    trail_length: trail ? trail_length : 0,
    trail_overflow,
    trail_inverted,
    // gradient_size: gradient ? gradient_size : 0,
  });
  renderLeds(LEDS);
  TIME++;
}, 1000 / FPS);

function renderLeds(LEDS) {
  const $ = document.getElementById("tonnels");
  $.innerHTML = getHtml(LEDS);
}

function createLeds(count) {
  return Array(count).fill("rgb(0,0,0)");
}

function getHtml(leds) {
  return leds.reduce(function renderHtml(str, led) {
    return `${str}<div class="t" style="background: ${led};"></div>`;
  }, "");
}

function updateLeds({
  duration,
  trail_length,
  trail_overflow,
  is_inverted,
  gradient_size,
  trail_inverted,
} = {}) {
  // const getX = () => Math.floor(TIME / FPS / 0.145)
  // const getX = () => Math.floor(TIME / (FPS / LEDS_LENGTH)); // 1 second
  const transitionDuration = (duration) =>
    Math.floor(TIME / ((FPS * duration) / LEDS_LENGTH));

  const newLeds = moveLine(
    transitionDuration(duration || 1),
    trail_length,
    trail_overflow,
    is_inverted,
    gradient_size,
    trail_inverted
  );
  for (let i = 0; i < LEDS.length; i++) {
    LEDS[i] = newLeds[i];
  }
}

function moveLine(
  time,
  trailLength = 0,
  trail_overflow,
  is_inverted = false,
  gradient_size = 0,
  trail_inverted = false
) {
  const addForAlpha = 1;

  const linePos = time % LEDS_LENGTH;
  const newLeds = Array(LEDS_LENGTH).fill("rgb(0,0,0)");
  newLeds[linePos] = "rgb(255, 0, 0)";

  // render trail
  for (let i = 1; i <= trailLength || gradient_size; i++) {
    const isGradient = Boolean(gradient_size);
    let pos = linePos - i;
    let gradientPos = linePos + 1;

    if (trail_overflow) {
      pos = overflowLeds(pos);
      gradientPos = overflowLeds(gradientPos);
    }

    if (pos >= 0) {
      if (trail_inverted) {
        pos = LEDS_LENGTH - pos;
      }

      // render trail
      newLeds[pos] = `rgba(255, 0, 0, ${
        1 - (1 / (trailLength + addForAlpha)) * i
      })`;

      // render gradient
      if (isGradient) {
        newLeds[gradientPos] = `rgba(255, 0, 0, ${
          1 - (1 / (trailLength + addForAlpha)) * i
        })`;
      }
    }
  }

  return is_inverted ? newLeds.reverse() : newLeds;

  function overflowLeds(pos) {
    if (pos < 0) {
      return pos + LEDS_LENGTH;
    }
    if (pos > LEDS_LENGTH - 1) {
      return pos - LEDS_LENGTH;
    }
  }
}

function get(id) {
  const value = document.getElementById(id).value;
  return value === "on" ? document.getElementById(id).checked : value;
}

function set(id, value) {
  document.getElementById(id).innerHTML = value;
}
