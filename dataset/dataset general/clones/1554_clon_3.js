// This JavaScript code provides an updated and restructured implementation
// for interacting with the Web Gamepad API.
// It aims to replicate the core functionality of a previous version
// (originally written by Ted Mielczarek in 2013), but with extensive
// modifications in variable naming, code structure, DOM manipulation,
// and overall design.
//
// The original work was dedicated to the public domain (CC0), and this
// derivative work acknowledges that dedication.

// --- Global Configuration and Application State ---

// Determines if the browser supports the GamepadEvent interface for connection/disconnection notifications.
const hasGamepadEventSupport = 'GamepadEvent' in window;

// A Map to store currently connected gamepad devices, indexed by their gamepad.index.
// Using a Map provides better iteration and key management than a plain object.
const connectedGadgetRegistry = new Map();

// Holds the ID returned by requestAnimationFrame, allowing the animation loop to be controlled.
let animationLoopIdentifier = null;

// --- DOM Element Creation Utility ---

/**
 * A helper function to create a DOM element more concisely.
 * It sets attributes and appends children in a single call.
 * @param {string} tagName - The HTML tag name (e.g., 'div', 'span').
 * @param {Object} [attributes={}] - Key-value pairs for element attributes (e.g., { id: 'my-id', class: 'some-class' }).
 * @param {(Node|string)[]} [childElements=[]] - An array of child Nodes or strings to append.
 * @returns {HTMLElement} The newly created and configured HTML element.
 */
function constructDomElement(tagName, attributes = {}, childElements = []) {
  const elementNode = document.createElement(tagName);
  for (const attrKey in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, attrKey)) {
      elementNode.setAttribute(attrKey, attributes[attrKey]);
    }
  }
  childElements.forEach(child => {
    if (typeof child === 'string') {
      elementNode.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      elementNode.appendChild(child);
    }
  });
  return elementNode;
}

// --- Event Handlers for Gamepad Lifecycle ---

/**
 * Callback for 'gamepadconnected' events. Integrates the new gamepad into the UI and registry.
 * @param {GamepadEvent} connectionNotification - The event object containing gamepad data.
 */
function onDeviceConnected(connectionNotification) {
  // Basic validation for the incoming event data.
  if (!connectionNotification || !connectionNotification.gamepad) {
    console.warn("Received a gamepad connection event with missing data.");
    return;
  }
  integrateDeviceDisplay(connectionNotification.gamepad);
  console.info(`🎮 Device connected: ${connectionNotification.gamepad.id} (Index: ${connectionNotification.gamepad.index})`);
}

/**
 * Callback for 'gamepaddisconnected' events. Removes the gamepad's UI and registry entry.
 * @param {GamepadEvent} disconnectionNotification - The event object containing gamepad data.
 */
function onDeviceDisconnected(disconnectionNotification) {
  // Basic validation for the incoming event data.
  if (!disconnectionNotification || !disconnectionNotification.gamepad) {
    console.warn("Received a gamepad disconnection event with missing data.");
    return;
  }
  removeDeviceDisplay(disconnectionNotification.gamepad);
  console.info(`🔌 Device disconnected: ${disconnectionNotification.gamepad.id} (Index: ${disconnectionNotification.gamepad.index})`);
}

// --- UI Management for Gamepad Displays ---

/**
 * Creates and appends a visual representation for a given gamepad to the document body.
 * It also registers the gamepad in the global registry.
 * @param {Gamepad} gamepadObject - The Gamepad object to display.
 */
function integrateDeviceDisplay(gamepadObject) {
  // Guard clause: Ensure the gamepad object is valid before proceeding.
  if (!gamepadObject || typeof gamepadObject.index === 'undefined') {
    console.error("Attempted to integrate an invalid gamepad object; skipping.");
    return;
  }

  const deviceIdString = `gamepad-unit-${gamepadObject.index}`;

  // If the device is already in the registry, just update its reference (gamepad objects change on poll).
  if (connectedGadgetRegistry.has(gamepadObject.index)) {
    connectedGadgetRegistry.set(gamepadObject.index, gamepadObject);
    // No need to re-create UI, just ensure it's in the registry.
    return;
  }

  // Add the new gamepad to our registry.
  connectedGadgetRegistry.set(gamepadObject.index, gamepadObject);

  // Construct the main container for this gamepad's display.
  const mainDisplaySection = constructDomElement("section", {
    id: deviceIdString,
    class: "gamepad-interface-unit"
  }, [
    constructDomElement("h2", { class: "device-name" }, [`🎮 ${gamepadObject.id}`])
  ]);

  // Create the buttons display panel.
  const buttonGrid = constructDomElement("div", { class: "button-grid" });
  // Iterate through the buttons array to create individual button indicators.
  gamepadObject.buttons.forEach((_, btnIdx) => {
    buttonGrid.appendChild(constructDomElement("span", {
      class: "control-button",
      "data-button-id": btnIdx, // Custom data attribute for easier lookup
      role: "button",
      tabindex: "0" // Make it focusable for accessibility if needed
    }, [`${btnIdx}`]));
  });
  mainDisplaySection.appendChild(buttonGrid);

  // Create the axes display panel.
  const axisGrid = constructDomElement("div", { class: "axis-grid" });
  // Iterate through the axes array to create individual axis meters.
  gamepadObject.axes.forEach((_, axisIdx) => {
    axisGrid.appendChild(constructDomElement("meter", {
      class: "control-axis",
      min: "-1", // Gamepad axes typically range from -1.0 to 1.0
      max: "1",
      value: "0", // Default value
      "data-axis-id": axisIdx, // Custom data attribute
      title: `Axis ${axisIdx} Value` // Tooltip
    }, [`Axis ${axisIdx}`])); // Fallback content for meter
  });
  mainDisplaySection.appendChild(axisGrid);

  // Hide the initial "connect your gamepad" message if it's visible.
  const initialPrompt = document.getElementById("initial-message");
  if (initialPrompt) {
    initialPrompt.style.display = "none";
  }

  // Append the new gamepad's UI to the document body.
  document.body.appendChild(mainDisplaySection);

  // If the animation loop isn't running, start it now.
  if (!animationLoopIdentifier) {
    animationLoopIdentifier = window.requestAnimationFrame(updateAllGamepadDisplays);
  }
}

/**
 * Removes the visual representation of a gamepad from the DOM and its registry entry.
 * @param {Gamepad} targetGamepad - The Gamepad object to remove.
 */
function removeDeviceDisplay(targetGamepad) {
  // Guard clause: Ensure the gamepad object is valid.
  if (!targetGamepad || typeof targetGamepad.index === 'undefined') {
    console.error("Attempted to remove an invalid gamepad object; skipping.");
    return;
  }

  const targetElementId = `gamepad-unit-${targetGamepad.index}`;
  const elementToRemove = document.getElementById(targetElementId);

  if (elementToRemove) {
    document.body.removeChild(elementToRemove);
  } else {
    console.warn(`No UI element found for gamepad index ${targetGamepad.index}; it might have been removed already.`);
  }

  // Remove the gamepad from our registry.
  connectedGadgetRegistry.delete(targetGamepad.index);

  // If no gamepads are left, stop the animation frame loop.
  if (connectedGadgetRegistry.size === 0 && animationLoopIdentifier) {
    window.cancelAnimationFrame(animationLoopIdentifier);
    animationLoopIdentifier = null;
    // Optionally, show the initial "connect your gamepad" message again.
    const initialPrompt = document.getElementById("initial-message");
    if (initialPrompt) {
      initialPrompt.style.display = ""; // Reset to default display style
    }
  }
}

// --- Gamepad State Polling and UI Refresh ---

/**
 * Scans for all currently connected gamepads using navigator.getGamepads().
 * It updates the internal registry with the latest gamepad objects and manages
 * the addition/removal of their UI elements.
 */
function pollForConnectedDevices() {
  // Retrieve the latest list of gamepads.
  const currentGamepadList = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

  // Use Array.from to ensure consistent iteration across browser implementations.
  const activeDeviceIndices = new Set();

  Array.from(currentGamepadList).forEach(detectedDevice => {
    // Only process valid and connected devices.
    if (detectedDevice && detectedDevice.connected) {
      integrateDeviceDisplay(detectedDevice); // Adds or updates the device in the registry and UI.
      activeDeviceIndices.add(detectedDevice.index);
    }
  });

  // Identify and remove devices that are no longer detected but are still in our registry.
  for (const [registeredIndex, registeredDevice] of connectedGadgetRegistry.entries()) {
    if (!activeDeviceIndices.has(registeredIndex)) {
      console.log(`Lost track of gamepad ${registeredDevice.id} (Index: ${registeredIndex}). Removing.`);
      removeDeviceDisplay(registeredDevice);
    }
  }
}

/**
 * The main update loop, called repeatedly by requestAnimationFrame.
 * It refreshes the UI for all registered gamepads with their latest input states.
 */
function updateAllGamepadDisplays() {
  // Always poll for the latest gamepad objects, as their state changes frame-to-frame.
  pollForConnectedDevices();

  // Iterate over each gamepad currently in our registry.
  for (const [deviceIndex, currentGamepad] of connectedGadgetRegistry.entries()) {
    const gamepadDisplayRoot = document.getElementById(`gamepad-unit-${deviceIndex}`);

    // If the UI element is somehow missing, clean up the registry entry.
    if (!gamepadDisplayRoot) {
      console.warn(`UI element for device ${deviceIndex} not found; removing from registry.`);
      connectedGadgetRegistry.delete(deviceIndex);
      continue;
    }

    // --- Update Buttons ---
    const buttonElements = gamepadDisplayRoot.querySelectorAll(".control-button");
    currentGamepad.buttons.forEach((buttonState, btnIdx) => {
      const targetButton = buttonElements[btnIdx];
      if (!targetButton) return; // Guard against missing button elements.

      // Gamepad button state can be a number (0 or 1) or an object ({value, pressed}).
      const currentButtonValue = typeof buttonState === 'object' ? buttonState.value : buttonState;
      const isButtonCurrentlyPressed = typeof buttonState === 'object' ? buttonState.pressed : (buttonState === 1.0);

      // Visual feedback: dynamically adjust background size for analog buttons.
      const fillPercentage = Math.round(currentButtonValue * 100) + "%";
      targetButton.style.backgroundSize = `${fillPercentage} ${fillPercentage}`; // X and Y percentage

      // Apply/remove a CSS class for visual pressed state.
      if (isButtonCurrentlyPressed) {
        targetButton.classList.add("activated");
      } else {
        targetButton.classList.remove("activated");
      }
      targetButton.title = `Value: ${currentButtonValue.toFixed(2)}`; // Update tooltip with current value.
    });

    // --- Update Axes ---
    const axisElements = gamepadDisplayRoot.querySelectorAll(".control-axis");
    currentGamepad.axes.forEach((axisValue, axisIdx) => {
      const targetAxis = axisElements[axisIdx];
      if (!targetAxis) return; // Guard against missing axis elements.

      // For <meter> elements, simply setting 'value' updates the visual fill.
      targetAxis.value = axisValue;
      targetAxis.textContent = `Axis ${axisIdx}: ${axisValue.toFixed(4)}`; // Update text content.
      targetAxis.title = `Value: ${axisValue.toFixed(4)}`; // Update tooltip.
    });
  }

  // Schedule the next update only if there are still active gamepads.
  if (connectedGadgetRegistry.size > 0) {
    animationLoopIdentifier = window.requestAnimationFrame(updateAllGamepadDisplays);
  } else {
    // If no gamepads are connected, ensure the animation loop is stopped.
    if (animationLoopIdentifier) {
      window.cancelAnimationFrame(animationLoopIdentifier);
      animationLoopIdentifier = null;
    }
  }
}

// --- System Initialization ---

/**
 * Initializes the gamepad detection system. It sets up either event listeners
 * or a polling mechanism based on browser support.
 */
function initializeGamepadDetection() {
  if (hasGamepadEventSupport) {
    // Modern browsers use 'gamepadconnected' and 'gamepaddisconnected' events.
    window.addEventListener("gamepadconnected", onDeviceConnected);
    window.addEventListener("gamepaddisconnected", onDeviceDisconnected);
    console.info("Gamepad API events are supported. Using event-driven device detection.");
  } else {
    // Fallback for older browsers: poll for gamepad changes at a regular interval.
    const POLLING_SCAN_INTERVAL_MS = 750; // Slightly increased interval compared to original.
    setInterval(pollForConnectedDevices, POLLING_SCAN_INTERVAL_MS);
    console.warn(`Gamepad API events not supported. Falling back to polling every ${POLLING_SCAN_INTERVAL_MS}ms.`);
  }

  // Perform an initial scan immediately to detect any gamepads already connected on page load.
  pollForConnectedDevices();

  // If any gamepads were found during the initial scan, start the continuous update loop.
  if (connectedGadgetRegistry.size > 0) {
    animationLoopIdentifier = window.requestAnimationFrame(updateAllGamepadDisplays);
  }
}

// Attach the initialization function to the DOMContentLoaded event to ensure the DOM is ready.
document.addEventListener("DOMContentLoaded", initializeGamepadDetection);

// --- Basic Dynamic Styling for Visual Clarity (Added for Type III visual changes) ---
// This CSS provides some default styling for the generated elements, making the output immediately visible.
const dynamicStylesheet = document.createElement("style");
dynamicStylesheet.textContent = `
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1a1a1a;
    color: #e0e0e0;
    margin: 25px;
    line-height: 1.6;
  }
  h1, h2 {
    color: #4CAF50;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
    margin-bottom: 15px;
  }
  .gamepad-interface-unit {
    border: 1px solid #3a3a3a;
    background-color: #2a2a2a;
    padding: 20px;
    margin-bottom: 25px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  .device-name {
    color: #8BC34A;
    margin-top: 0;
    font-size: 1.5em;
  }
  .button-grid, .axis-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 15px;
    border-top: 1px dashed #444;
    padding-top: 15px;
  }
  .control-button {
    width: 45px;
    height: 45px;
    border: 2px solid #555;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #444;
    background-image: linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%);
    background-repeat: no-repeat;
    background-position: bottom;
    color: #fff;
    font-size: 0.9em;
    font-weight: bold;
    cursor: default;
    transition: background-color 0.1s ease, transform 0.1s ease, box-shadow 0.1s ease;
  }
  .control-button.activated {
    background-color: #4CAF50;
    transform: scale(1.15);
    box-shadow: 0 0 12px #4CAF50;
    border-color: #8BC34A;
  }
  .control-axis {
    width: 180px;
    height: 25px;
    background-color: #333;
    border: 1px solid #666;
    border-radius: 5px;
    appearance: none; /* Remove default browser styling */
    -webkit-appearance: none;
    -moz-appearance: none;
    overflow: hidden;
    font-size: 0.85em;
    line-height: 25px;
    text-align: center;
    color: #eee;
    padding: 0 5px;
    box-sizing: border-box;
  }
  .control-axis::-webkit-meter-bar {
    background: #333;
  }
  .control-axis::-webkit-meter-optimum,
  .control-axis::-webkit-meter-suboptimum,
  .control-axis::-webkit-meter-even-less-good {
    background: linear-gradient(to right, #e74c3c, #f1c40f, #2ecc71); /* Red to Yellow to Green */
  }
  .control-axis::-moz-meter-bar {
    background: #333;
  }
  .control-axis::-moz-meter-optimum,
  .control-axis::-moz-meter-suboptimum,
  .control-axis::-moz-meter-even-less-good {
    background: linear-gradient(to right, #e74c3c, #f1c40f, #2ecc71);
  }
  #initial-message {
    color: #aaa;
    font-style: italic;
    margin-top: 30px;
    text-align: center;
    padding: 20px;
    border: 1px dashed #555;
    background-color: #222;
    border-radius: 8px;
  }
`;
document.head.appendChild(dynamicStylesheet);