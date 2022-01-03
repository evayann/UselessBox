/**
 * Utilities
 */

/**
 * Wait time in ms
 * @param {*} time number of ms to wait 
 * @returns 
 */
const wait = async (time) => new Promise((resolve) => setTimeout(resolve, time));
async function transformByTime(object, transform, time) {
  object.style.transition = `transform ${time}ms`;
  object.style.transform = transform;
  await wait(time);
}

/**
 * Rotation
 */

let rx = 40;
let ry = -20;

const box = document.querySelector(".box-faces");

const rotate = (dx, dy) => {
  rx += dx;
  ry += dy;
  box.style.setProperty("--rot-x", rx + "deg");
  box.style.setProperty("--rot-y", ry + "deg");
};

// Init Rotation
rotate(0, 0);

/**
 * Perspective
 */

const wrapper = document.querySelectorAll(".wrapper"); 

function togglePerspective() {
  wrapper.forEach(w => w.classList.toggle("perspective"));
}

/**
 * Button
 */

const button = document.getElementById("normal");
let currentState = true;
button.checked = currentState; // Init button to false
function updateButton() {
  currentState = button.checked = !button.checked;
}

/**
 * Action
 */

let busy = false;

const boxTop = document.querySelector(".box-tops");

async function open(time, prct = 1) {
  await transformByTime(boxTop, `rotateX(${90 * prct}deg)`, time);
}

async function close(time, prct = 1) {
  open(time, 1 - prct);
}

async function halfOpen() {
  open(500, 0.5);
  await wait(4000);
  close(500);
}

async function fullOpen(waitTime = 4000) {
  open(500);
  await wait(waitTime);
  close(500);
}

async function quickOpen() {
  open(250);
  await wait(1000);
  close(250);
}

async function threeTryOpen() {
  const o = async () => {
    await open(500, 0.25 + Math.random() * .15);
    await close(500, 0.975 + Math.random() * .025);
  };

  // Min time pass in loop 3.75s
  for (let i = 0; i < 3; i++) {
    await o();
    await wait(250 + Math.random() * 250);    
  }
  
  await open(500);
  await wait(3500);
  await close(500);
}

const base = document.querySelector(".base");
const arm = document.querySelector(".arm");
const tilter = document.querySelector(".tilter");

async function closerBase(time, prct = 1) {
  await transformByTime(base, `translateX(92px) scaleY(${prct})`, time);
}

async function closerArm(time, prct = 1) {
  await transformByTime(arm, `translateX(92px) translateY(-192px) translateZ(32px) scaleZ(${prct})`, time);
}

async function closerTilter(time, prct = 1) {
  await transformByTime(tilter, `translateX(92px) translateY(-208px) translateZ(64px) scaleY(${prct})`, time);
}

/**
 * Default total time : 3.5s
 * @param {*} bo 
 * @param {*} ao 
 * @param {*} to 
 * @param {*} w 
 * @param {*} tc 
 * @param {*} ac 
 * @param {*} bc 
 */
async function generalCloser(bo = 500, ao = 500, to = 500, w = 500, tc = 500, ac = 500, bc = 500) {
  await closerBase(bo);
  await closerArm(ao);
  await closerTilter(to);
  updateButton();

  await wait(w);
  
  await closerTilter(tc, 0);
  await closerArm(ac, 0);
  await closerBase(bc, 0);
}

async function linearCloser() {
  await wait(500);
  await generalCloser();
}

async function quickCloser() {
  await wait(250);
  await generalCloser(130, 130, 130, 20, 130, 130, 130);
}

async function threeTypeCloser() {
  let nbMoveLeft = 5;
  
  await closerBase(500);
  
  for (let i = 0; i < Math.floor(Math.random() * nbMoveLeft); i++) {
    let rdm = Math.random() * 1000;
    await closerArm(rdm);
    await closerArm(1000 - rdm, 0);
    nbMoveLeft--;
  }
  await closerArm(500);
  for (let i = 0; i < nbMoveLeft; i++) {
    let rdm = Math.random() * 1000;
    await closerTilter(rdm, 0.5 + Math.random() * 0.25);
    await closerTilter(1000 - rdm, Math.random() * 0.35);
  }
  await closerTilter(500);
  
  updateButton();

  await closerTilter(500, 0);
  await closerArm(500, 0);
  await closerBase(500, 0);
}

function getMove() {
  const rdm = [
    [halfOpen, linearCloser],
    [fullOpen, linearCloser],
    [quickOpen, quickCloser],
    [threeTryOpen, async () => { await wait(3350); linearCloser(); }],
    [async () => fullOpen(8000), threeTypeCloser]
  ];
  return rdm[Math.floor(Math.random() * rdm.length)];
}

async function animate() {
  console.log("Animation start");
  busy = true;
  const [top, closer] = getMove();
  await Promise.all([top(), closer()]);
  busy = false;
  console.log("Animation end");
}

/**
 * If click on button, check if we have animation, if the case, revert state before click
 */
function click() {
  if (busy) {
    button.checked = currentState;
    return;
  }
  currentState = false; // Need to update state to match click on button
  animate();
}

/**
 * If a key is press, toggle button and start animation
 */
function toggle() {
  if (busy) return;

  updateButton();
  animate();
}

/**
 * Event Handler
 */

function go(event) {
  console.log(event, event.code);
  switch (event.key) {
    case "ArrowLeft":
      rotate(1, 0);
      break;
    case "ArrowRight":
      rotate(-1, 0);
      break;
    case "ArrowUp":
      rotate(0, 1);
      break;
    case "ArrowDown":
      rotate(0, -1);
      break;
    case "p":
      togglePerspective();
      break;
    case undefined:
      click();
      break;
    default:
      toggle();
      break;
  }
};

let move = false;
let xPrev;
let yPrev;

function setRotation(event) {
  xPrev = event.x;
  yPrev = event.y;
  move = true;
}

function rotation(event) {
  if (move) {
    console.log("Move : x=", event.x - xPrev, "deg, y=", yPrev - event.y, "deg.");
    rotate(event.x - xPrev, yPrev - event.y);
    setRotation(event);
  }  
}

// Add Handler
document.addEventListener("keydown", go);
button.onclick = button.onmousedown = button.ontouchstart = go;

document.onmouseup = () => move = false;
document.onmousedown = event => {
  move = true;
  setRotation(event);
};
document.onmousemove = event => rotation(event);
