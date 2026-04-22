///////////////////////////////////////////////////////////////////////////////
// Advanced Mathematical Operations Suite
// This section provides enhanced utilities for common mathematical calculations.
///////////////////////////////////////////////////////////////////////////////

// Determines if a given 'testLocation' point falls within a circular region
// defined by a 'centerPoint' and a 'circleRadius'.
Math.checkProximity = function (centerPoint, testLocation, circleRadius) {
    // Parameter validation: Ensure the radius is a non-negative number.
    // If a negative radius is supplied, it's treated as zero, meaning only the exact center is considered "in".
    if (typeof circleRadius !== 'number' || isNaN(circleRadius) || circleRadius < 0) {
        console.warn("Invalid or negative radius provided to checkProximity. Defaulting to 0.");
        circleRadius = 0;
    }

    // Calculate the difference in X and Y coordinates.
    const horizontalDistance = testLocation.x - centerPoint.x;
    const verticalDistance = testLocation.y - centerPoint.y;

    // Compute the square of the Euclidean distance to avoid computationally expensive square root.
    const actualDistanceSquared = (horizontalDistance * horizontalDistance) + (verticalDistance * verticalDistance);
    const allowedRadiusSquared = circleRadius * circleRadius;

    // Return true if the squared distance is less than the squared radius, indicating proximity.
    return actualDistanceSquared < allowedRadiusSquared;
};

// Adjusts the position of 'currentObjectPosition' to move it towards 'destinationCoordinates'
// at a specified 'movementVelocity'.
// Returns a boolean indicating if the object is now very close to the target (within Manhattan distance of 2).
Math.approachTarget = function (currentObjectPosition, destinationCoordinates, movementVelocity) {
    // Input validation: Ensure movement velocity is a positive number.
    // If velocity is zero or negative, no movement occurs, and proximity is checked immediately.
    if (typeof movementVelocity !== 'number' || isNaN(movementVelocity) || movementVelocity <= 0) {
        // If no movement, check if the object is already within a small radius of the destination.
        return Math.checkProximity(currentObjectPosition, destinationCoordinates, 1);
    }

    // Calculate the vector components required to reach the destination.
    const deltaXComponent = destinationCoordinates.x - currentObjectPosition.x;
    const deltaYComponent = destinationCoordinates.y - currentObjectPosition.y;

    // Determine the angle of movement using arctangent.
    const travelAngleRadians = Math.atan2(deltaYComponent, deltaXComponent);

    // Calculate the actual displacement for this step based on velocity and angle.
    const stepDisplacementX = movementVelocity * Math.cos(travelAngleRadians);
    const stepDisplacementY = movementVelocity * Math.sin(travelAngleRadians);

    // Update the object's current position.
    currentObjectPosition.x += stepDisplacementX;
    currentObjectPosition.y += stepDisplacementY;

    // Post-movement check: Determine if the object is now "close enough" to the target.
    // This uses a Manhattan distance check with a threshold of 2, mirroring original logic.
    const finalDistanceX = Math.abs(destinationCoordinates.x - currentObjectPosition.x);
    const finalDistanceY = Math.abs(destinationCoordinates.y - currentObjectPosition.y);

    return (finalDistanceX + finalDistanceY) < 2;
};

// Generates a random integer between 0 (inclusive) and 'upperBound' (inclusive).
Math.generateRandomInteger = function (upperBound) {
    // Robust validation for the upperBound parameter.
    if (typeof upperBound !== 'number' || isNaN(upperBound) || upperBound < 0 || !Number.isInteger(upperBound)) {
        console.error("Invalid 'upperBound' provided to generateRandomInteger. Must be a non-negative integer.");
        return 0; // Return a default value or consider throwing an error for invalid input.
    }
    // The expression Math.floor(Math.random() * (N + 1)) correctly produces integers from 0 to N.
    return Math.floor(Math.random() * (upperBound + 1));
};


///////////////////////////////////////////////////////////////////////////////
// DOM Element Access and Application User Interface Management
// This section handles direct DOM manipulation and application-wide UI state.
///////////////////////////////////////////////////////////////////////////////

// A utility function to retrieve a single DOM element by its ID.
// Provides basic validation for the ID string.
const getDomElementById = function (elementIdString) {
    if (typeof elementIdString !== 'string' || elementIdString.trim() === '') {
        console.error("Attempted to retrieve DOM element with an invalid or empty ID string.");
        return null; // Return null for invalid input.
    }
    const targetElement = document.getElementById(elementIdString);
    // Optional: Add a warning if element is not found, useful for debugging.
    // if (!targetElement) { console.warn(`DOM element with ID '${elementIdString}' not found.`); }
    return targetElement;
};

// Global object for managing the application's display and user interaction logic.
window.applicationDisplay = {
    // Direct references to commonly accessed UI display elements.
    gameClockDisplay: getDomElementById("control-timer"),
    playerCurrencyCounter: getDomElementById("control-cash"),
    playerHealthIndicator: getDomElementById("control-lives"),
    currentWaveProgress: getDomElementById("control-wave"),
    performanceMonitor: getDomElementById("control-fps"),

    // A stack-like array to maintain the history of displayed pages, allowing for back navigation.
    pageNavigationStack: ["start"],
    // An object intended to store dynamic event handlers or action mappings.
    registeredActions: {},

    /**
     * Attaches an event listener function to one or more specified DOM elements.
     * Ensures robust handling of various input types for elements.
     * @param {string} eventType - The name of the DOM event (e.g., 'click', 'mouseover').
     * @param {NodeList|HTMLElement[]|HTMLElement} elementsToAttach - A single element, an array of elements, or a NodeList.
     * @param {Function} eventHandlerCallback - The function to execute when the event fires.
     */
    addEventListeners: function (eventType, elementsToAttach, eventHandlerCallback) {
        // Validate inputs for event type and callback function.
        if (typeof eventType !== 'string' || eventType.trim() === '') {
            console.error("Invalid event type provided for addEventListeners.");
            return;
        }
        if (typeof eventHandlerCallback !== 'function') {
            console.error("Invalid event handler callback function provided for addEventListeners.");
            return;
        }

        // Normalize 'elementsToAttach' into an iterable array.
        let targetElementsArray;
        if (elementsToAttach instanceof HTMLElement) {
            targetElementsArray = [elementsToAttach];
        } else if (elementsToAttach instanceof NodeList) {
            targetElementsArray = Array.from(elementsToAttach);
        } else if (Array.isArray(elementsToAttach)) {
            targetElementsArray = elementsToAttach;
        } else {
            console.warn("No valid elements provided for event listener attachment.");
            return;
        }

        // Iterate through the elements and attach the listener.
        for (const domElement of targetElementsArray) {
            if (domElement && typeof domElement.addEventListener === 'function') {
                domElement.addEventListener(eventType, eventHandlerCallback, false); // 'false' for event bubbling phase
            } else {
                console.warn("Skipping invalid or non-DOM element during event listener attachment:", domElement);
            }
        }
    },

    /**
     * Controls which application page is currently visible to the user.
     * If a 'pageIdentifier' is provided, navigates to that page and adds it to history.
     * If no 'pageIdentifier' is given, it attempts to navigate back to the previous page in history.
     * @param {string} [pageIdentifier] - The unique identifier string of the page to display.
     */
    displayApplicationPage: function (pageIdentifier) {
        const primaryPagesContainer = getDomElementById("pages");
        if (!primaryPagesContainer) {
            console.error("Critical error: Main 'pages' container element not found. UI navigation impossible.");
            return;
        }

        let pageToActivate = pageIdentifier;

        // Logic for handling back navigation versus new page navigation.
        if (!pageToActivate) {
            // No specific page requested, attempt to go back in history.
            if (this.pageNavigationStack.length > 1) {
                this.pageNavigationStack.shift(); // Remove the current page from the top of the stack.
                pageToActivate = this.pageNavigationStack[0]; // The new current page is now the previous one.
                console.log(`Navigating back to page: ${pageToActivate}`);
            } else {
                console.info("Cannot navigate back; already on the initial page.");
                return; // Prevent further execution if no back navigation is possible.
            }
        } else {
            // A new page is requested; update the navigation history.
            // Avoid pushing the same page consecutively onto the stack.
            if (this.pageNavigationStack[0] !== pageToActivate) {
                this.pageNavigationStack.unshift(pageToActivate); // Add the new page to the top of the stack.
                console.log(`Navigating to new page: ${pageToActivate}`);
            } else {
                console.info(`Page '${pageToActivate}' is already active. No change needed.`);
                return; // Exit if the requested page is already the current one.
            }
        }

        // Hide all children of the primary pages container, except for a potential overlay.
        Array.from(primaryPagesContainer.children).forEach(function (childPageElement) {
            if (childPageElement.id !== "pages-overlay") { // Keep overlay visible if present.
                childPageElement.style.display = "none";
            }
        });

        // Display the target page.
        const targetPageDomElement = getDomElementById("pages-" + pageToActivate);
        if (targetPageDomElement) {
            targetPageDomElement.style.display = "block";
            // Original analytics tracking (_gaq.push) removed for Type III.
            // A placeholder could be inserted here for a new analytics system.
            // applicationAnalytics.trackPageView('/' + pageToActivate);
        } else {
            console.error(`Error: Target page element 'pages-${pageToActivate}' not found in the DOM.`);
            // If the target page doesn't exist, revert the navigation history change.
            if (this.pageNavigationStack[0] === pageToActivate) {
                this.pageNavigationStack.shift();
            }
        }
    },

    /**
     * Activates a specific panel within the 'control-left' section of the UI.
     * All other panels in that section will be hidden.
     * @param {string} panelKey - The identifier for the panel to be shown (e.g., "inventory", "settings").
     */
    activateControlPanel: function (panelKey) {
        const leftControlPanelContainer = getDomElementById("control-left");
        if (!leftControlPanelContainer) {
            console.error("Critical error: 'control-left' container element not found. Panel activation impossible.");
            return;
        }

        // First, hide all child panels within the control container.
        for (const panelChildElement of leftControlPanelContainer.children) {
            panelChildElement.style.display = "none";
        }

        // Then, display the specific panel requested.
        const desiredPanelElement = getDomElementById("control-" + panelKey);
        if (desiredPanelElement) {
            desiredPanelElement.style.display = "block";
        } else {
            console.warn(`Warning: Control panel element 'control-${panelKey}' not found in the DOM.`);
        }
    }
};