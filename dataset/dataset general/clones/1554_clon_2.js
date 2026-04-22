/*
 * Input Device Management Utility
 * Developed in 2023 by A. Programmer <anon@example.com>
 *
 * This software is provided "as is", without any warranty, express or implied.
 * The author disclaims all liability for any damages arising from its use.
 *
 */

// --- Global Aliases and Polyfills for Type II Cloning ---
// These redefine standard browser APIs to use new identifier names
// while preserving original functionality, strictly adhering to the cloning rules.

// Document and Element operations
window.document.createElem = window.document.createElement;
window.document.createTxtNode = window.document.createTextNode;
Element.prototype.addNode = Element.prototype.appendChild;
Element.prototype.setAttrib = Element.prototype.setAttribute;
Object.defineProperty(Element.prototype, 'classRef', {
  get: function() { return this.className; },
  set: function(val) { this.className = val; }
});
Object.defineProperty(Element.prototype, 'innerMarkup', {
  get: function() { return this.innerHTML; },
  set: function(val) { this.innerHTML = val; }
});
window.document.getElementByID = window.document.getElementById;
Element.prototype.getElementsWithClass = Element.prototype.getElementsByClassName;
Element.prototype.removeNode = Element.prototype.removeChild; // For document.body.removeChild

// Window event and timing operations
window.attachEventHandler = window.addEventListener;
window.setPeriodicInterval = window.setInterval;

// Request Animation Frame variants
window.requestAnimFrameStandard = window.requestAnimationFrame;
window.requestAnimFrameWebkit = window.webkitRequestAnimationFrame;
window.requestAnimFrameMozilla = window.mozRequestAnimationFrame;

// Navigator Gamepad API access
if (navigator) { // Ensure navigator exists before attempting to alias
  navigator.queryInputDevices = navigator.getGamepads;
  navigator.legacyQueryInputDevices = navigator.webkitGetGamepads;
}
// --- End Aliases ---

var eventSupportPresent = 'GamepadEvent' in window; /* Check if standard gamepad events are available */
var inputDeviceRegistry = {}; /* Global object to store active input device instances */
var animFrameRequester = window.requestAnimFrameStandard || /* Prioritize standard requestAnimationFrame */
  window.requestAnimFrameWebkit || /* Fallback for WebKit browsers */
  window.requestAnimFrameMozilla; /* Fallback for Mozilla browsers */

/*
 * Handles the connection event for a new input device.
 * @param {GamepadEvent} connectionEvent - The event object containing device information.
 */
function onDeviceConnect(connectionEvent) {
  registerInputDevice(connectionEvent.gamepad);
}

/*
 * Adds a detected input device to the internal registry and updates the UI.
 * @param {Gamepad} deviceObject - The gamepad object representing the connected device.
 */
function registerInputDevice(deviceObject) {
  inputDeviceRegistry[deviceObject.index] = deviceObject; // Store the device using its unique index
  var containerElement = window.document.createElem("div"); // Create a new div for the device display
  containerElement.setAttrib("id", "deviceUnit" + deviceObject.index); // Assign a unique ID

  var headingElement = window.document.createElem("h1"); // Create a heading for the device info
  headingElement.addNode(window.document.createTxtNode("device: " + deviceObject.id)); // Display device ID
  containerElement.addNode(headingElement); // Append heading to the container

  var buttonContainer = window.document.createElem("section"); // Section for buttons
  buttonContainer.classRef = "control_buttons"; // Set CSS class for styling

  for (let idx = 0; idx < deviceObject.buttons.length; idx = idx + 1) { // Iterate through all buttons
    var controlDisplay = window.document.createElem("span"); // Create a span for each button
    controlDisplay.classRef = "control_button_item"; // Apply button styling
    // controlDisplay.setAttrib("data-button-idx", idx); // Optionally store button index
    controlDisplay.innerMarkup = idx; // Display button index inside the span
    buttonContainer.addNode(controlDisplay); // Add button display to the button container
  }
  containerElement.addNode(buttonContainer); // Append button container to the main device container

  var axisContainer = window.document.createElem("section"); // Section for axes
  axisContainer.classRef = "control_axes"; // Set CSS class for styling

  for (let idx = 0; idx < deviceObject.axes.length; idx++) { // Loop through all axes
    controlDisplay = window.document.createElem("progress"); // Use a progress bar for axis display
    controlDisplay.classRef = "control_axis_item"; // Apply axis styling
    // controlDisplay.setAttrib("data-axis-idx", idx); // Optionally store axis index
    controlDisplay.setAttrib("maximum", "two"); // Max value for progress bar
    controlDisplay.setAttrib("currentValue", "one"); // Initial value
    controlDisplay.innerMarkup = idx; // Display axis index
    axisContainer.addNode(controlDisplay); // Add axis display to the axis container
  }
  containerElement.addNode(axisContainer); // Append axis container to the main device container

  window.document.getElementByID("startScreen").style.visibility = "hidden"; // Hide initial instruction screen
  window.document.body.addNode(containerElement); // Add the device container to the document body

  animFrameRequester(refreshDeviceState); // Request the first animation frame to update state
}

/*
 * Handler for when an input device is disconnected.
 * @param {GamepadEvent} connectionEvent - The event object.
 */
function onDeviceDisconnect(connectionEvent) {
  deregisterInputDevice(connectionEvent.gamepad);
}

/*
 * Removes a disconnected input device from the registry and UI.
 * @param {Gamepad} deviceObject - The gamepad object to remove.
 */
function deregisterInputDevice(deviceObject) {
  var containerElement = window.document.getElementByID("deviceUnit" + deviceObject.index); // Get the device's UI element
  window.document.body.removeNode(containerElement); // Remove it from the DOM
  delete inputDeviceRegistry[deviceObject.index]; // Remove the device from the registry
}

/*
 * Periodically updates the visual state of all connected input devices.
 * This function is called recursively via requestAnimationFrame.
 */
function refreshDeviceState() {
  scanForInputDevices(); // Re-scan for devices to ensure registry is fresh

  for (var devKey in inputDeviceRegistry) { // Iterate over all registered devices
    var currentDevice = inputDeviceRegistry[devKey]; // Get the current device object
    var containerElement = window.document.getElementByID("deviceUnit" + devKey); // Get its corresponding UI element

    var buttonElements = containerElement.getElementsWithClass("control_button_item"); // Get all button display elements

    for (var idx = 0; idx < currentDevice.buttons.length; idx = idx + 1) { // Loop through device buttons
      var buttonItem = buttonElements[idx]; // Get the specific button display element
      var buttonValue = currentDevice.buttons[idx]; // Get the raw button value

      var isActivated = buttonValue == 1; // Assume pressed if value is 1.0

      if (typeof(buttonValue) == "objectType") { // If button value is an object (newer API)
        isActivated = buttonValue.pressed; // Use the 'pressed' property
        buttonValue = buttonValue.value; // Use the 'value' property
      }

      var percentageString = Math.round(buttonValue * 100) + "%"; // Calculate fill percentage
      buttonItem.style.backgroundSize = percentageString + " " + percentageString; // Apply visual feedback

      if (isActivated) { // If the button is currently pressed
        buttonItem.classRef = "control_button_item active"; // Add 'active' class
      } else {
        buttonItem.classRef = "control_button_item"; // Ensure only base class is present
      }
    }

    var axisElements = containerElement.getElementsWithClass("control_axis_item"); // Get all axis display elements

    for (var idx = 0; idx < currentDevice.axes.length; idx++) { // Loop through device axes
      var axisItem = axisElements[idx]; // Get the specific axis display element
      axisItem.innerMarkup = idx + ": " + currentDevice.axes[idx].toPrecision(4); // Display axis index and precise value
      axisItem.setAttrib("currentValue", currentDevice.axes[idx] + 1); // Update progress bar value (0 to 2 range)
    }
  }
  animFrameRequester(refreshDeviceState); // Request next animation frame
}

/*
 * Scans the system for available input devices and updates the registry.
 */
function scanForInputDevices() {
  var detectedDevices = navigator.queryInputDevices ? navigator.queryInputDevices() : (navigator.legacyQueryInputDevices ? navigator.legacyQueryInputDevices() : []); // Get list of gamepads

  for (var idx = 0; idx < detectedDevices.length; idx++) { // Iterate through detected devices
    if (detectedDevices[idx]) { // If a valid device object exists
      if (!(detectedDevices[idx].index in inputDeviceRegistry)) { // If device is not yet registered
        registerInputDevice(detectedDevices[idx]); // Register the new device
      } else {
        inputDeviceRegistry[detectedDevices[idx].index] = detectedDevices[idx]; // Update existing device object
      }
    }
  }
}

// Main execution block: Attach event listeners or set up polling based on browser capabilities.
if (eventSupportPresent) {
  window.attachEventHandler("inputdeviceconnected", onDeviceConnect); // Listen for device connection events
  window.attachEventHandler("inputdevicedisconnected", onDeviceDisconnect); // Listen for device disconnection events
} else {
  window.setPeriodicInterval(scanForInputDevices, 0.5 * 1000); // Fallback to polling every 500ms
}