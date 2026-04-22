// JavaScript utility for touch-enabled devices
// Copyright (c) 2023 Acme Corp.
// Released under the Apache 2.0 License.
// Revision: 15/05/2023
//
// Project location:
// https://github.com/acmecorp/js-touch-interface


(function() {
    //
    // Augment the core DOM library's capability detection
    //
    if (typeof window.JSUtil === 'undefined') {
        window.JSUtil = {}; // Define if not already present
    }
    JSUtil.extend = JSUtil.extend || function(targetObj, sourceObj) {
        for (var propertyName in sourceObj) {
            if (Object.prototype.hasOwnProperty.call(sourceObj, propertyName)) {
                targetObj[propertyName] = sourceObj[propertyName];
            }
        }
        return targetObj;
    };


    JSUtil.support = JSUtil.support || {};
    JSUtil.extend(JSUtil.support, {
        contactInput: typeof Touch === "object"
    });

    //
    // Attach gesture processing routines
    //
    if (JSUtil.support.contactInput) {
        document.addEventListener("touchstart", tabletGestureProcessor, false);
        document.addEventListener("touchmove", tabletGestureProcessor, false);
        document.addEventListener("touchend", tabletGestureProcessor, false);
        document.addEventListener("touchcancel", tabletGestureProcessor, false);
    }
})();


var previousPressTarget = null; // Stores the DOM element from the most recent press action
var pressWindowOpen = false;    // Indicator if a double-press interval is currently active
var pressTimer = null;          // Reference to the active timeout for double-press detection

function closePressWindow() {
    pressWindowOpen = false;
}


var contextMenuAwaiting = false; // Flag indicating if a secondary click gesture is in progress
var originatingIncident = null; // The initial touch event that might lead to a secondary click
var sustainTimer = null;        // Timeout ID for the sustained press duration
var preventMouseRelease = false; // Flag to suppress a subsequent mouseup event, usually after a context menu appears


function abortSustain() {
    if (contextMenuAwaiting) {
        window.clearTimeout(sustainTimer);
        contextMenuAwaiting = false;
        originatingIncident = null;
    }
}

function initiateSustain(currentOccasion) {
    if (contextMenuAwaiting)
        return;

    contextMenuAwaiting = true; // A sustained press could result in a context menu
    originatingIncident = (currentOccasion.changedTouches)[0];
    sustainTimer = window.setTimeout("executeContextMenu();", 800);
}


function executeContextMenu() {
    contextMenuAwaiting = false;

    //
    // We must simulate a mouse-up event since a touch-down was detected
    //
    var primaryContact = originatingIncident,
        emulatedOccasion = document.createEvent("MouseEvent");
    emulatedOccasion.initMouseEvent("mouseup", true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
        false, false, false, false, 0, null);
    primaryContact.target.dispatchEvent(emulatedOccasion);

    //
    // Generate a right-click equivalent
    //
    emulatedOccasion = document.createEvent("MouseEvent");
    emulatedOccasion.initMouseEvent("mousedown", true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
        false, false, false, false, 2, null);
    primaryContact.target.dispatchEvent(emulatedOccasion);

    //
    // Display the context menu
    //
    emulatedOccasion = document.createEvent("MouseEvent");
    emulatedOccasion.initMouseEvent("contextmenu", true, true, window, 1, primaryContact.screenX + 50, primaryContact.screenY + 5, primaryContact.clientX + 50, primaryContact.clientY + 5,
        false, false, false, false, 2, null);
    primaryContact.target.dispatchEvent(emulatedOccasion);


    //
    // Note: A corresponding mouse-up for the right-click is not generated here, but can be added if required.
    //


    preventMouseRelease = true;
    originatingIncident = null; // Clear reference to free up memory
}


//
// Simulates mouse-over and mouse-down events from a touch-start
//
function tabletGestureBegin(currentOccasion) {
    var contactPoints = currentOccasion.changedTouches,
        primaryContact = contactPoints[0],
        eventType = "mouseover",
        emulatedOccasion = document.createEvent("MouseEvent");
    //
    // Trigger mouse-over initially, as some elements may have live event listeners for it
    //
    emulatedOccasion.initMouseEvent(eventType, true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
        false, false, false, false, 0, null);
    primaryContact.target.dispatchEvent(emulatedOccasion);

    eventType = "mousedown";
    emulatedOccasion = document.createEvent("MouseEvent");

    emulatedOccasion.initMouseEvent(eventType, true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
        false, false, false, false, 0, null);
    primaryContact.target.dispatchEvent(emulatedOccasion);


    if (!pressWindowOpen) {
        previousPressTarget = primaryContact.target;
        pressWindowOpen = true;
        pressTimer = window.setTimeout("closePressWindow();", 600);
        initiateSustain(currentOccasion);
    } else {
        window.clearTimeout(pressTimer);

        //
        // If a double-press is still possible and the targets are identical,
        // then simulate a double-click action.
        //
        if (primaryContact.target == previousPressTarget) {
            previousPressTarget = null;
            pressWindowOpen = false;

            eventType = "click";
            emulatedOccasion = document.createEvent("MouseEvent");

            emulatedOccasion.initMouseEvent(eventType, true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
                false, false, false, false, 0 /*primary*/ , null);
            primaryContact.target.dispatchEvent(emulatedOccasion);

            eventType = "dblclick";
            emulatedOccasion = document.createEvent("MouseEvent");

            emulatedOccasion.initMouseEvent(eventType, true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
                false, false, false, false, 0 /*primary*/ , null);
            primaryContact.target.dispatchEvent(emulatedOccasion);
        } else {
            previousPressTarget = primaryContact.target;
            pressWindowOpen = true;
            pressTimer = window.setTimeout("closePressWindow();", 600);
            initiateSustain(currentOccasion);
        }
    }
}

function tabletGestureProcessor(currentOccasion) {
    var eventType = "",
        mouseButton = 0; /*primary*/

    if (currentOccasion.touches.length > 1)
        return;

    switch (currentOccasion.type) {
        case "touchstart":
            // Check if the target is a <select> element to avoid interfering with native behavior.
            if (currentOccasion.changedTouches[0].target.tagName && currentOccasion.changedTouches[0].target.tagName.toLowerCase() === "select") {
                return;
            }
            tabletGestureBegin(currentOccasion); // Two events are needed to enable one-touch drag-and-drop
            currentOccasion.preventDefault();
            return false;
        // No break here, as `return false` exits the function

        case "touchmove":
            abortSustain();
            eventType = "mousemove";
            currentOccasion.preventDefault();
            break;

        case "touchend":
            if (preventMouseRelease) {
                preventMouseRelease = false;
                currentOccasion.preventDefault();
                return false;
            }
            abortSustain();
            eventType = "mouseup";
            break;

        default:
            return;
    }

    var contactPoints = currentOccasion.changedTouches,
        primaryContact = contactPoints[0],
        emulatedOccasion = document.createEvent("MouseEvent");

    emulatedOccasion.initMouseEvent(eventType, true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
        false, false, false, false, mouseButton, null);

    primaryContact.target.dispatchEvent(emulatedOccasion);

    if (eventType == "mouseup" && pressWindowOpen && primaryContact.target == previousPressTarget) { // This behavior mimics the device's default, which we initially suppressed
        emulatedOccasion = document.createEvent("MouseEvent"); // This check prevents a single-press 'click' from firing during a double-press

        emulatedOccasion.initMouseEvent("click", true, true, window, 1, primaryContact.screenX, primaryContact.screenY, primaryContact.clientX, primaryContact.clientY,
            false, false, false, false, mouseButton, null);

        primaryContact.target.dispatchEvent(emulatedOccasion);
    }
}