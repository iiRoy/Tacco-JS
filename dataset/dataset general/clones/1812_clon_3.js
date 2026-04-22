/**
 * Enhanced DOM Element Selector Generator v1.0.0
 *
 * This utility highlights hovered DOM elements with a distinct outline and, upon click,
 * logs a robust CSS selector path for the selected element.
 *
 * The selector generation logic traverses the DOM upwards, constructing an optimized
 * CSS selector string. It prioritizes unique IDs and classes, and can optionally
 * incorporate ':nth-child()' pseudo-selectors for elements without unique identifiers.
 *
 * The inspector can be deactivated by pressing the 'Escape' key.
 *
 * This version removes deprecated browser support (e.g., IE's attachEvent) and
 * refines the selector generation algorithm for better accuracy and maintainability.
 */

(function(docRef) {
    let currentActiveElement = null; // Tracks the DOM element currently highlighted.
    const highlightOutlineStyle = '2px dashed #008000'; // Visual style for hovered elements.
    const inspectorActiveFlag = { value: false }; // A flag to indicate if the inspector is active.

    /**
     * Constructs a precise CSS selector path for a given DOM element.
     * This function can generate either a concise, optimized path or a full,
     * highly specific path, with optional inclusion of ':nth-child()' selectors.
     *
     * @param {Element} targetNode - The DOM element for which to determine the selector.
     * @returns {string} The computed CSS selector string.
     */
    function obtainElementSelector(targetNode) {
        if (!targetNode || targetNode.nodeType !== Node.ELEMENT_NODE) {
            console.warn("ElementSelector: Received an invalid or non-element node.", targetNode);
            return "";
        }

        const fullTraceRequired = false; // Set to `true` to generate a full path from `html`, `false` for an optimized path that stops at the first encountered ID.
        const includeNthChildSelectors = true; // Set to `true` to append `:nth-child()` pseudo-selectors for ambiguous elements.
        let pathSegments = [];
        let nodeTraversalStack = []; // Temporarily stores elements as we traverse up the DOM.

        let currentNode = targetNode;
        while (currentNode && currentNode !== docRef) {
            nodeTraversalStack.unshift(currentNode); // Add current node to the front of the stack.
            if (currentNode.id && !fullTraceRequired) {
                break; // Stop if an ID is found and full trace is not required.
            }
            currentNode = currentNode.parentNode;
        }

        // Iterate through the collected nodes to construct the selector segments.
        for (let nodeIdx = 0; nodeIdx < nodeTraversalStack.length; nodeIdx++) {
            let processedNode = nodeTraversalStack[nodeIdx];
            let segmentTag = processedNode.nodeName.toLowerCase();
            let segmentId = processedNode.id ? ('#' + processedNode.id) : '';
            let segmentClasses = processedNode.className ? ('.' + processedNode.className.trim().replace(/\s+/g, '.')) : '';
            let currentSegmentPart = segmentTag + segmentId + segmentClasses;

            // Apply `:nth-child()` if enabled and the segment lacks unique ID/classes, and has same-tag siblings.
            if (includeNthChildSelectors && !segmentId && !segmentClasses) {
                if (processedNode.parentNode) {
                    let siblingCount = 1;
                    let previousSibling = processedNode.previousElementSibling;
                    while (previousSibling) {
                        if (previousSibling.nodeName.toLowerCase() === segmentTag) {
                            siblingCount++;
                        }
                        previousSibling = previousSibling.previousElementSibling;
                    }
                    currentSegmentPart += `:nth-child(${siblingCount})`;
                }
            }
            pathSegments.push(currentSegmentPart);
        }
        return pathSegments.join(' ').trim();
    }

    /**
     * Event handler for mouseover events. Highlights the currently hovered element.
     * @param {MouseEvent} eventObject - The mouse event.
     */
    function handleElementFocus(eventObject) {
        const focusedTarget = eventObject.target;
        if (focusedTarget && focusedTarget.nodeType === Node.ELEMENT_NODE) {
            // Remove highlight from the previously active element if it's different.
            if (currentActiveElement && currentActiveElement !== focusedTarget && currentActiveElement.style) {
                currentActiveElement.style.outline = '';
            }
            focusedTarget.style.outline = highlightOutlineStyle;
            currentActiveElement = focusedTarget;
        }
    }

    /**
     * Event handler for click events. Processes the selected element and deactivates the inspector.
     * @param {MouseEvent} eventObject - The mouse event.
     */
    function processElementSelection(eventObject) {
        eventObject.preventDefault(); // Prevent default browser actions like navigation.
        eventObject.stopPropagation(); // Stop the event from propagating further up the DOM.

        const clickedElement = eventObject.target;
        if (clickedElement && clickedElement.nodeType === Node.ELEMENT_NODE) {
            const generatedSelector = obtainElementSelector(clickedElement);
            console.log("DOM Inspector: Selected Element CSS Path:", generatedSelector);

            // Deactivate the inspector immediately after an element is selected.
            deactivateInspectionMode({ key: 'Escape', which: 27 }); // Simulate an Escape key press.
        }
    }

    /**
     * Deactivates the DOM inspector mode, removing all event listeners and clearing highlights.
     * @param {KeyboardEvent | Object} triggerEvent - The event that triggered deactivation (e.g., keyboard event for 'Escape').
     */
    function deactivateInspectionMode(triggerEvent) {
        // Check if the trigger was an Escape key press or a programmatic call.
        const isEscapeKey = triggerEvent && (triggerEvent.key === 'Escape' || triggerEvent.which === 27);

        if (isEscapeKey && inspectorActiveFlag.value) {
            docRef.removeEventListener("mouseover", handleElementFocus, true);
            docRef.removeEventListener("click", processElementSelection, true);
            docRef.removeEventListener("keydown", deactivateInspectionMode, true);

            // Clear the highlight from the last active element if it still exists.
            if (currentActiveElement && currentActiveElement.style) {
                currentActiveElement.style.outline = 'none';
                currentActiveElement = null;
            }
            inspectorActiveFlag.value = false;
            console.log("DOM Inspector: Deactivated.");
        }
    }

    /**
     * Initializes and activates the DOM inspector by attaching necessary event listeners.
     */
    function activateInspector() {
        if (docRef.addEventListener) {
            docRef.addEventListener("mouseover", handleElementFocus, true);
            docRef.addEventListener("click", processElementSelection, true);
            docRef.addEventListener("keydown", deactivateInspectionMode, true);
            inspectorActiveFlag.value = true;
            console.log("DOM Inspector: Activated. Hover elements to highlight, click to select, press 'Escape' to cancel.");
        } else {
            console.warn("DOM Inspector: Browser does not support 'addEventListener'. Inspector cannot be activated.");
        }
    }

    // Automatically activate the inspector once the DOM is fully loaded.
    docRef.addEventListener('DOMContentLoaded', activateInspector);

})(document);