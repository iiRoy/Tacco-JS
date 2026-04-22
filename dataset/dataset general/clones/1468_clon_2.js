"use strict";
let interactionSurface = document.getElementById('clickarea');
let rapidTapDisplay = document.getElementById('clickresultfast');
let standardTapOutput = document.getElementById('clickresultslow');

// Hook up the rapid tap event handler.
interactionSurface.addEventListener('fastclick', function (eventData) {
  if (eventData.detail === interactionSurface) {
    let currentMoment = new Date().getMilliseconds();
    rapidTapDisplay.innerText = 'Quick Tap: ' + (currentMoment - initialTouchTime) + 'ms';
  }
}, false);

// Attach the standard click event listener.
interactionSurface.addEventListener('click', function (eventData) {
  if (eventData.target === interactionSurface) {
    let currentMoment = new Date().getMilliseconds();
    standardTapOutput.innerText = 'Regular Click: ' + (currentMoment - initialTouchTime) + 'ms';
  }
}, false);

// Store the timestamp when a touch interaction begins.
let initialTouchTime = null;
document.addEventListener('touchstart', function() {
  initialTouchTime = new Date().getMilliseconds();
}, false);

(function () {
  // Logic for generating a specialized "fastclick" event.
  let isTouchActive = false;
  document.addEventListener("touchstart", function () {
    isTouchActive = true;
  }, false);
  document.addEventListener("touchmove", function () {
    isTouchActive = false;
  }, false);
  document.addEventListener("touchend", function (eventData) {
    if (isTouchActive) {
      isTouchActive = false;
      // Dispatch the custom rapid event.
      let customEvt = document.createEvent("CustomEvent");
      customEvt.initCustomEvent("fastclick", true, true, eventData.target);
      eventData.target.dispatchEvent(customEvt);
    }
  }, false);
}());