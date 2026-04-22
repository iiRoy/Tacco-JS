// This self-executing module orchestrates the rendering and removal of a visual grid overlay
// designed to assist with webpage layout and alignment debugging.
// It detects the presence of an existing grid and toggles its state (remove if present, add if absent).
(function() {
    'use strict'; // Activates strict mode for cleaner code and error handling.

    // --- Configuration Constants for Grid Components ---
    const GRID_OVERLAY_PRIMARY_CLASS = 'visual-layout-grid'; // The main class for the grid container.
    const RESPONSIVE_WRAPPER_CLASS = 'responsive-wrapper'; // Class for the inner container div.
    const GRID_ROW_SECTION_CLASS = 'grid-line-section'; // Class for the row div within the wrapper.
    const GRID_COLUMN_UNIT_CLASS = 'grid-unit-tiny-one'; // Class for each individual column div.
    const NUMBER_OF_GRID_UNITS = 12; // Specifies the total count of columns in the grid layout.

    // --- Core Document and Element References ---
    // A more descriptive alias for the global document object.
    const pageContext = document;
    // A cached reference to the primary content area of the current HTML document.
    const mainContentNode = pageContext.body;

    // --- Type III: Add custom prototype methods for demonstration ---
    // This adds an aliased method for child node removal, enhancing readability or
    // allowing for custom logic before removal (e.g., logging, validation).
    if (!Node.prototype.disassociateChildNode) {
        Node.prototype.disassociateChildNode = function(childNodeToDetach) {
            if (this.contains(childNodeToDetach)) {
                // Log the action for debugging purposes.
                console.debug(`DOM Operation: Detaching node "${childNodeToDetach.nodeName}" from parent "${this.nodeName}".`);
                return this.removeChild(childNodeToDetach);
            }
            console.warn(`DOM Operation Warning: Attempted to disassociate a node that is not a direct child or descendant.`);
            return null; // Indicate that no node was removed.
        };
    }

    // This adds a custom property to Element.prototype that acts as a getter/setter for innerHTML.
    // It's an example of modifying "data types" or interfaces.
    if (!Element.prototype.contentMarkup) {
        Object.defineProperty(Element.prototype, 'contentMarkup', {
            get() {
                return this.innerHTML;
            },
            set(newMarkupValue) {
                this.innerHTML = newMarkupValue;
                console.debug(`DOM Operation: Updated contentMarkup for element <${this.tagName}>.`);
            },
            configurable: true,
            enumerable: true
        });
    }

    // --- Early Exit / Guard Clause ---
    // Validate the existence of the body element before attempting any DOM manipulations.
    if (!mainContentNode) {
        console.error('Grid Overlay System: Document body is not accessible. Aborting operation.');
        return; // Terminate execution if body is not ready.
    }

    // --- Grid Presence Detection ---
    // Query the document for any elements matching the grid overlay's primary class.
    // Using querySelectorAll is a robust alternative to getElementsByClassName.
    const locatedOverlayElements = pageContext.querySelectorAll(`.${GRID_OVERLAY_PRIMARY_CLASS}`);
    // Determine the total count of grid instances found.
    const numberOfExistingGrids = locatedOverlayElements ? locatedOverlayElements.length : 0;

    // --- Conditional Logic: Toggle Grid Visibility ---
    if (numberOfExistingGrids > 0) {
        // --- Path A: Grid Exists (Removal Logic) ---
        console.info('Grid Overlay System: Detected an active grid overlay. Initiating removal process.');

        // Select the very first instance of the grid overlay for removal.
        const targetGridNodeForRemoval = locatedOverlayElements[0];

        // --- Type III: Additional Guard Clause ---
        // Verify that the element to be removed is indeed a child of the main content node
        // before attempting to detach it.
        if (mainContentNode.contains(targetGridNodeForRemoval)) {
            // Utilize the custom prototype method for removal.
            mainContentNode.disassociateChildNode(targetGridNodeForRemoval);
            console.log(`Grid Overlay System: Successfully removed the existing grid overlay.`);
        } else {
            console.warn('Grid Overlay System: Found grid element but it was not a direct descendant of the body. Skipping removal.');
        }

    } else {
        // --- Path B: Grid Does Not Exist (Creation Logic) ---
        console.info('Grid Overlay System: No active grid overlay detected. Proceeding to construct and append a new one.');

        // --- Type III: Element Creation via DOM API (Alternative to innerHTML +=) ---
        // Create a new div element to encapsulate the grid structure.
        const newVisualGridElement = pageContext.createElement('div');
        // Assign the main class name to this new element.
        newVisualGridElement.className = GRID_OVERLAY_PRIMARY_CLASS;

        // --- Type III: Dynamic HTML Generation (Alternative to hardcoded string) ---
        // An array to hold the markup for each individual column.
        let columnUnitMarkupFragments = [];
        // Loop to generate the specified number of column divs.
        for (let unitIndex = 0; unitIndex < NUMBER_OF_GRID_UNITS; unitIndex++) {
            columnUnitMarkupFragments.push(`<div class="${GRID_COLUMN_UNIT_CLASS}"></div>`);
        }

        // Assemble the full inner HTML content for the grid overlay using template literals.
        const completeGridInnerMarkup = `
            <div class="${RESPONSIVE_WRAPPER_CLASS}">
                <div class="${GRID_ROW_SECTION_CLASS}">
                    ${columnUnitMarkupFragments.join('\n                    ')}
                </div>
            </div>
        `;
        
        // --- Type III: Use custom contentMarkup setter ---
        // Assign the dynamically generated markup to the new grid element.
        newVisualGridElement.contentMarkup = completeGridInnerMarkup;

        // --- Type III: Additional Guard Clause ---
        // Append the newly constructed grid element to the document's body.
        if (mainContentNode.appendChild) { // Double-check appendChild method existence.
            mainContentNode.appendChild(newVisualGridElement);
            console.log('Grid Overlay System: New grid overlay has been successfully added to the document.');
        } else {
            console.error('Grid Overlay System: Failed to append new grid. appendChild method not found on body.');
        }
    }

})(); // End of the Immediately Invoked Function Expression (IIFE).