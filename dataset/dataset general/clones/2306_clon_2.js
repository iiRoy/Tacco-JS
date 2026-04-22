// This section provides a collection of mathematical and geometrical helper routines.
// These functions assist with calculations related to positions, distances, and random values.
var CoordinateCalculations = {};

CoordinateCalculations.isWithinRange = function (destinationCoordinates, currentObjectPosition, distanceRadius) {
    // Computes if a given object's position is within a specified circular range of a target.
    // It avoids square root for performance by comparing squared distances.
    let dx = currentObjectPosition.x - destinationCoordinates.x;
    let dy = currentObjectPosition.y - destinationCoordinates.y;
    return (dx * dx) + (dy * dy) < (distanceRadius * distanceRadius);
};

CoordinateCalculations.progressTowardTarget = function (currentObjectPosition, destinationCoordinates, travelSpeed) {
    // Moves an object a step closer to its target destination based on a given speed.
    // Returns true if the object is very close to the target after the movement.
    var xDifference = destinationCoordinates.x - currentObjectPosition.x;
    var yDifference = destinationCoordinates.y - currentObjectPosition.y;

    const movementAngle = Math.atan2(yDifference, xDifference);

    currentObjectPosition.x += travelSpeed * Math.cos(movementAngle);
    currentObjectPosition.y += travelSpeed * Math.sin(movementAngle);

    // Checks proximity using a Manhattan distance approximation.
    return (xDifference < 0 ? -xDifference : xDifference) + (yDifference < 0 ? -yDifference : yDifference) < 2.0;
};

CoordinateCalculations.getRandomInteger = function (maximumValue) {
    // Generates a random integer between 0 and the specified maximum value, inclusive.
    return Math.floor(Math.random() * (maximumValue + 1.0));
};


// This block is dedicated to managing user interface elements and their interactions.
// It provides a global object for accessing common DOM elements and controlling page/panel visibility.
var retrieveElement = function (elementIdentifier) {
    // A utility function to fetch a DOM element by its ID.
    return document.getElementById(elementIdentifier);
};


window.interfaceControl = {
    // References to various display elements for game status.
    gameClockDisplay: retrieveElement("control-timer"),
    playerCurrency: retrieveElement("control-cash"),
    remainingAttempts: retrieveElement("control-lives"),
    currentLevelIndicator: retrieveElement("control-wave"),
    frameRateCounter: retrieveElement("control-fps"),

    // A stack to manage navigation history for pages.
    historyStack: ["initial_screen"],

    // An object to store various event handlers for different actions.
    eventMapping: {},

    attachEventListeners: function (eventTypeString, targetElementsCollection, eventHandlerFunction) {
        // Attaches a specified event listener to each element within a provided collection.
        Array.prototype.slice.call(targetElementsCollection).forEach(function (singleElement) {
            singleElement.addEventListener(eventTypeString, eventHandlerFunction, false);
        });
    },

    navigatePage: function (pageIdentifier) {
        // Controls the visibility of different application pages.
        // If a page identifier is provided, it pushes it to the history stack.
        // If no identifier, it navigates back to the previous page in history.
        if (pageIdentifier) {
            this.historyStack.unshift(pageIdentifier);
        } else {
            this.navigatePage(this.historyStack[1]);
            return;
        }

        // Hides all pages except for the persistent overlay.
        Array.prototype.slice.call(retrieveElement("pages").children).forEach(function (singleElement) {
            if (singleElement.id !== "pages-overlay") {
                singleElement.style.display = "none";
            }
        });

        // Makes the requested page visible.
        retrieveElement("pages-" + pageIdentifier).style.display = "block";

        // Records the page view for analytics purposes.
        window.analyticsService.sendData(["_trackPageView", "/" + pageIdentifier]);
    },

    displaySubPanel: function (panelIdentifier) {
        // Manages the visibility of sub-panels within a control area.
        // Hides all sub-panels in the left control area, then shows the specified one.
        Array.prototype.slice.call(retrieveElement("control-left").children).forEach(function (singleElement) {
            singleElement.style.display = "none";
        });

        retrieveElement("control-" + panelIdentifier).style.display = "block";
    }
};

// Global analytics tracking object (simulating an external library).
window.analyticsService = {
    sendData: function(dataArray) {
        console.log("Analytics data sent:", dataArray); // Placeholder for actual analytics.
    }
};