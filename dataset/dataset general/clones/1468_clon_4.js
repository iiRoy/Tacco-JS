"use strict";

const mainInteractionZone = document.querySelector('#clickarea');
const fastActionDisplay = document.querySelector('#clickresultfast');
const slowActionDisplay = document.querySelector('#clickresultslow');

let initialTouchMoment = null;
let isStationaryGesture = false;

function handleInitialTouch(eventSignal) {
    initialTouchMoment = performance.now();
    isStationaryGesture = true;
}

function handleGestureMovement(eventSignal) {
    isStationaryGesture = false;
}

function handleGestureEnd(eventSignal) {
    if (isStationaryGesture && eventSignal.target === mainInteractionZone) {
        const finalMoment = performance.now();
        fastActionDisplay.textContent = `Quick Action: ${Math.round(finalMoment - initialTouchMoment)}ms`;
    }
    isStationaryGesture = false;
}

function handleStandardClick(eventSignal) {
    if (eventSignal.target === mainInteractionZone) {
        const finalMoment = performance.now();
        slowActionDisplay.textContent = `Standard Action: ${Math.round(finalMoment - initialTouchMoment)}ms`;
    }
}

document.body.ontouchstart = handleInitialTouch;
document.body.ontouchmove = handleGestureMovement;
document.body.ontouchend = handleGestureEnd;

mainInteractionZone.onclick = handleStandardClick;