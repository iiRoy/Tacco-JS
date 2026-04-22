// This is a simple JavaScript DOM Explorer, version 1.0.0
//
// It highlights elements on hover with a 2px blue border. Upon clicking an element,
// it passes that element to a user-defined callback function for further processing.
//
// By default, the explorer outputs a jQuery-like CSS path for the selected element
// to the console.
//
// The CSS path generation logic traverses up the DOM tree from the selected element
// to its ancestors, creating an optimized selector string. It stops at the first parent
// with an explicit ID. Alternatively, it can generate an ultra-specific, full CSS path
// starting from the 'html' tag.
//
// There's an option to include ":nth-child()" pseudo-selectors in the CSS path. This is
// useful when parts of the path might match multiple elements, or when an element in the path
// lacks an ID or class. For example: "html body #main-content p img:nth-child(1)".
//
// Press the 'Escape' key to deactivate the explorer.
//
// Note: XPath functionality was previously included but removed due to instability.
// It would require a complete rewrite.
//
// Initial support for older IE browsers was considered, but full compatibility is not yet
// achieved. Currently tested in modern browsers like Firefox, Chrome, Safari, and Edge.
//
// This tool is provided without any guarantees; it's unlikely to cause system issues.
// Contributions and mentions are welcome!
//
// - Alex

(function(domObj) {
    let previousHighlightedElement; // Stores the last element that was highlighted.

    /**
     * Constructs a complete CSS selector for any given DOM element.
     *
     * Produces a selector string akin to jQuery, incorporating IDs, classes,
     * and optional ':nth-child' pseudo-selectors.
     *
     * Can generate either a verbose full CSS path (from 'html' down to ':nth-child()'),
     * or a more concise, optimized path that terminates at the nearest ancestor with an ID,
     * e.g., "#main-section .header div" instead of "html body #page-wrapper #main-section .header div:nth-child(2)".
     *
     * @param {HTMLElement} targetNode The DOM element for which to generate the selector.
     * @returns {string} The generated CSS selector string.
     */
    function domSelectorGenerator(targetNode) {
        const completePathFlag = false; // Set to true for a full, ultra-specific CSS path, or false for an optimized one.
        const includeNthChildSelectors = false; // Set to true to append ":nth-child()" pseudo-selectors.

        let selectorString = '';
        let tempPathCheck = ''; // This variable is not used in the original logic, keeping for structural consistency.
        const ancestorNodes = []; // This array is not used in the original logic, keeping for structural consistency.
        const segmentSelectors = []; // Array to store parts of the CSS selector.

        let nodeKind;
        let elementIdSelector;
        let elementClassSelector;
        let currentSegmentSelector;
        let genericMatchIndicator;
        let siblingCount;
        let idx;
        let childNode;

        // Traverse upwards through parent nodes to build individual selectors for each:
        while (targetNode) {
            genericMatchIndicator = false;

            // Retrieve the HTML tag name of the node in lowercase:
            nodeKind = targetNode.nodeName.toLowerCase();

            // Obtain the node's ID attribute, prefixed with a '#':
            elementIdSelector = (targetNode.id) ? ('#' + targetNode.id) : false;

            // Get the node's CSS classes, replacing spaces with '.':
            elementClassSelector = (targetNode.className) ? ('.' + targetNode.className.split(/\s+/).filter(Boolean).join('.')) : '';

            // Formulate a distinct selector for this particular ancestor node:
            if (elementIdSelector) {
                // Matched primarily by ID:
                currentSegmentSelector = nodeKind + elementIdSelector + elementClassSelector;
            } else if (elementClassSelector) {
                // Matched by class (will be further validated for uniqueness later):
                currentSegmentSelector = nodeKind + elementClassSelector;
            } else {
                // No ID or class available, resort to ":nth-child()" selection:
                genericMatchIndicator = true;
                currentSegmentSelector = nodeKind;
            }

            // Prepend this complete tag selector to the collection of segment selectors:
            segmentSelectors.unshift(currentSegmentSelector);

            // If generating optimized CSS paths and the current element has an ID, terminate traversal:
            if (elementIdSelector && !completePathFlag) {
                break;
            }

            // Move to the immediate parent node:
            targetNode = targetNode.parentNode !== domObj ? targetNode.parentNode : false;
        } // End of while loop

        // Assemble the complete CSS path string from the collected segment selectors:
        for (idx = 0; idx < segmentSelectors.length; idx++) {
            selectorString += ' ' + segmentSelectors[idx];

            // If ":nth-child()" selectors are enabled AND the current segment lacks an ID
            // AND it's not the 'html' or 'body' tag:
            if (includeNthChildSelectors && !segmentSelectors[idx].includes('#') && !segmentSelectors[idx].match(/^(html|body)$/)) {

                // If no CSS class is present, or if the current partial CSS selector matches multiple elements:
                if (!segmentSelectors[idx].includes('.') || domObj.querySelectorAll(selectorString).length > 1) {

                    // Calculate the element's position among its siblings for ":nth-child" pseudo-selector:
                    for (siblingCount = 1, childNode = targetNode; childNode && childNode.previousElementSibling; childNode = childNode.previousElementSibling, siblingCount++);

                    // Append ":nth-child()" to the CSS path:
                    selectorString += ":nth-child(" + siblingCount + ")";
                }
            }
        }

        // Return the final CSS path, with leading/trailing whitespace removed:
        return selectorString.trim();
    }


    /**
     * Event handler for mouseover events on all page elements.
     * Applies a visual highlight to the hovered element.
     *
     * @param {MouseEvent} eventObj The mouse event object.
     */
    function highlightHandler(eventObj) {
        // Note: Direct `event.target` access might behave differently in older IE.
        const currentElement = eventObj.target;

        // Apply a distinct blue outline style:
        currentElement.style.outline = '2px solid #00f';

        // Keep a reference to the currently highlighted element for later deselection.
        previousHighlightedElement = currentElement;
    }


    /**
     * Event handler for mouseout events.
     * Removes the visual highlight from the element.
     *
     * @param {MouseEvent} eventObj The mouse event object.
     */
    function unhighlightHandler(eventObj) {
        // Clear the outline from the element:
        eventObj.target.style.outline = '';
    }


    /**
     * Event handler for click actions on a highlighted element.
     * Prevents default click behavior and processes the selected element.
     *
     * @param {MouseEvent} eventObj The mouse event object.
     */
    function selectionHandler(eventObj) {
        eventObj.preventDefault(); // Stop the default click action.

        // These are the default operations; they could be customized to perform
        // any desired action with the selected element.
        console.info(domSelectorGenerator(eventObj.target));
        /* console.warn( getDomPath(eventObj.target).join('/') ); // Example of other potential output */

        return false; // Prevent further event propagation.
    }


    /**
     * Function to terminate the DOM explorer.
     * Removes all attached event listeners and clears the last highlight.
     *
     * @param {KeyboardEvent} eventObj The keyboard event object.
     */
    function terminationHandler(eventObj) {
        // Detach explorer mouse and click event listeners:
        if (eventObj === null && window.event && window.event.keyCode === 27) { // For older IE (might still need adjustments):
            domObj.detachEvent("onmouseover", highlightHandler);
            domObj.detachEvent("onmouseout", unhighlightHandler);
            domObj.detachEvent("onclick", selectionHandler);
            domObj.detachEvent("onkeydown", terminationHandler);
            if (previousHighlightedElement) {
                previousHighlightedElement.style.outlineStyle = 'none';
            }
        } else if (eventObj && eventObj.which === 27) { // For modern browsers (Escape key pressed):
            domObj.removeEventListener("mouseover", highlightHandler, true);
            domObj.removeEventListener("mouseout", unhighlightHandler, true);
            domObj.removeEventListener("click", selectionHandler, true);
            domObj.removeEventListener("keydown", terminationHandler, true);

            // Remove the outline from the last highlighted element:
            if (previousHighlightedElement) {
                previousHighlightedElement.style.outline = 'none';
            }
        }
    }


    /**
     * Initialize event listeners for the DOM exploration features.
     */
    if (domObj.addEventListener) {
        domObj.addEventListener("mouseover", highlightHandler, true);
        domObj.addEventListener("mouseout", unhighlightHandler, true);
        domObj.addEventListener("click", selectionHandler, true);
        domObj.addEventListener("keydown", terminationHandler, true);
    } else if (domObj.attachEvent) { // Fallback for older IE versions
        domObj.attachEvent("onmouseover", highlightHandler);
        domObj.attachEvent("onmouseout", unhighlightHandler);
        domObj.attachEvent("onclick", selectionHandler);
        domObj.attachEvent("onkeydown", terminationHandler);
    }

})(document);