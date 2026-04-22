/*global jQuery */
/*!
 * Text Flow Path Plugin - Version 3.0
 *
 * Copyright (c) 2024, Artistic Code Labs. All rights reserved.
 * This plugin dynamically arranges and justifies text along various paths
 * (e.g., Bezier curves, linear slopes) within a designated container.
 * It's an advanced text layout utility, inspired by similar prior implementations.
 */

(function( $ ){
    "use strict"; // Enforce stricter parsing and error handling

    /**
     * Creates a standardized 2D point object with numeric coordinates.
     * Ensures robustness by converting inputs to numbers and defaulting to 0.
     * @param {number} [xCoord=0] - The horizontal coordinate.
     * @param {number} [yCoord=0] - The vertical coordinate.
     * @returns {{x: number, y: number}} A point object.
     */
    const makeCoordinatePair = (xCoord = 0, yCoord = 0) => ({
        x: Number(xCoord) || 0,
        y: Number(yCoord) || 0
    });

    // --- Bezier Curve Weight Functions (Cubic Bernstein Polynomials) ---
    // These functions define the influence of each of the four control points
    // (P1, P2, P3, P4) at a given 't' value (progression ratio from 0 to 1).
    const calculateBezierWeightA = (tFactor) => Math.pow(tFactor, 3);                 // Weight for P4 (end point)
    const calculateBezierWeightB = (tFactor) => 3 * Math.pow(tFactor, 2) * (1 - tFactor); // Weight for P3
    const calculateBezierWeightC = (tFactor) => 3 * tFactor * Math.pow((1 - tFactor), 2); // Weight for P2
    const calculateBezierWeightD = (tFactor) => Math.pow((1 - tFactor), 3);           // Weight for P1 (start point)

    /**
     * Determines a point on a cubic Bezier curve given a progression factor and four control points.
     * The curve is defined by P1, P2, P3, P4.
     * @param {number} tProgress - The parameter 't' from 0 to 1, representing progression along the curve.
     * @param {object} pnt1 - The first control point {x, y}.
     * @param {object} pnt2 - The second control point {x, y}.
     * @param {object} pnt3 - The third control point {x, y}.
     * @param {object} pnt4 - The fourth control point {x, y}.
     * @returns {object} The computed {x, y} coordinate on the Bezier curve.
     */
    const computeCurvePoint = (tProgress, pnt1, pnt2, pnt3, pnt4) => {
        const resultingPoint = makeCoordinatePair(); // Initialize with (0,0)

        // Sum the weighted contributions of each control point
        resultingPoint.x = pnt4.x * calculateBezierWeightA(tProgress) +
                           pnt3.x * calculateBezierWeightB(tProgress) +
                           pnt2.x * calculateBezierWeightC(tProgress) +
                           pnt1.x * calculateBezierWeightD(tProgress);

        resultingPoint.y = pnt4.y * calculateBezierWeightA(tProgress) +
                           pnt3.y * calculateBezierWeightB(tProgress) +
                           pnt2.y * calculateBezierWeightC(tProgress) +
                           pnt1.y * calculateBezierWeightD(tProgress);

        return resultingPoint;
    };

    // --- jQuery Plugin Definition: flowTextAlongPath ---
    $.fn.flowTextAlongPath = function( layoutOptions ) {
        // --- Input Validation and Setup ---
        // Basic check for jQuery availability
        if (!$) {
            console.error("Dependency Error: jQuery is not loaded. 'flowTextAlongPath' cannot initialize.");
            return this;
        }
        // Ensure the plugin is called on at least one valid DOM element
        if (this.length === 0) {
            console.warn("Plugin Warning: No elements were selected for 'flowTextAlongPath'. Operation aborted.");
            return this;
        }

        // Define default configuration settings for the plugin
        const defaultConfiguration = {
            'textAlignment': 'justify',   // CSS text-align property for line content
            'pathDefinition': 'linear',   // Defines the path type: 'bezier', 'dualBezier', or 'linear'
            'horizontalAlign': 'left',    // Controls line positioning: 'left' or 'right'
            'lineStepOffset': 10,         // Horizontal offset increment for 'linear' path type
            // Default Bezier control points (P1, P2, P3, P4) for the main curve
            'ctrlPnt1': { x: 0, y: 0 },
            'ctrlPnt2': { x: 0, y: 0 },
            'ctrlPnt3': { x: 0, y: 0 },
            'ctrlPnt4': { x: 0, y: 0 },
            // Default Dual Bezier control points (D1, D2, D3, D4) for the secondary curve (right edge)
            'dualCtrlPnt1': { x: 0, y: 0 },
            'dualCtrlPnt2': { x: 0, y: 0 },
            'dualCtrlPnt3': { x: 0, y: 0 },
            'dualCtrlPnt4': { x: 0, y: 0 }
        };

        // Merge user-provided options with the defaults, performing a deep merge
        const activeConfiguration = $.extend(true, {}, defaultConfiguration, layoutOptions);

        // Validate the specified path definition; fallback to 'linear' if invalid
        const validPathTypes = ['bezier', 'dualBezier', 'linear'];
        if (!validPathTypes.includes(activeConfiguration.pathDefinition)) {
            console.warn(`Plugin Warning: Unknown pathDefinition '${activeConfiguration.pathDefinition}'. Defaulting to 'linear'.`);
            activeConfiguration.pathDefinition = 'linear';
        }

        // --- Core Plugin Variables ---
        const targetElement = $(this);        // The original jQuery element context
        let contentSourceClone = null;        // A hidden clone of the original content for processing
        let layoutWorkspace = null;           // The primary container for the new text layout
        let currentProcessedLine = null;      // Reference to the line div currently being filled
        let generatedLineDivs = [];           // Array to hold all dynamically created line elements

        // --- Prepare the Target Element and Workspace ---
        targetElement.empty(); // Clear existing content from the target element

        // Create the main layout workspace: a relatively positioned container
        layoutWorkspace = $('<div>').css({
            'position': 'relative',
            'width': '100%',
            'height': '100%',
            'overflow': 'hidden' // Temporarily hide overflow during layout calculations
        }).appendTo(targetElement);

        // Clone the original element's content for processing.
        // The clone is appended to the body and hidden to ensure it's in the DOM
        // for accurate text node extraction and measurements, without affecting visual layout.
        contentSourceClone = targetElement.clone(true, true) // Deep clone with data and events
                                          .removeClass('demo_bacontext') // Remove any demo-specific classes
                                          .css('visibility', 'hidden')   // Keep it invisible
                                          .appendTo('body');             // Attach to body temporarily

        // --- Determine Line Metrics ---
        // Create a temporary, invisible element to accurately measure the height of a single line of text.
        const heightMeasurementProbe = $('<div>').css({
            'visibility': 'hidden',
            'height': 'auto',
            'white-space': 'nowrap', // Prevent wrapping for measurement
            'position': 'absolute'   // Take out of flow to prevent influencing layout
        }).text('The quick brown fox jumps over the lazy dog.').appendTo(layoutWorkspace);

        const measuredLineHeight = heightMeasurementProbe.outerHeight(); // Get computed height including padding/border
        heightMeasurementProbe.remove(); // Clean up the temporary element

        // Guard against zero line height, which indicates a problem with CSS or element visibility
        if (measuredLineHeight === 0) {
            console.error("Initialization Error: Could not determine line height. Ensure target element has visible text styling.");
            contentSourceClone.remove(); // Clean up clone
            return this;
        }

        const maximumLinesPossible = Math.floor(layoutWorkspace.height() / measuredLineHeight);
        if (maximumLinesPossible === 0) {
            console.warn("Plugin Warning: Target element is too short to display any lines. Operation aborted.");
            contentSourceClone.remove(); // Clean up clone
            return this;
        }

        // --- Generate and Position Individual Text Lines ---
        for (let lineIndex = 0; lineIndex < maximumLinesPossible; lineIndex++) {
            let linePathPosition = makeCoordinatePair();
            let calculatedLineWidth = layoutWorkspace.width();

            // Calculate progression ratio (t-value) along the path.
            // (maximumLinesPossible - 1 || 1) prevents division by zero for single-line cases.
            const pathProgressionRatio = lineIndex / (maximumLinesPossible - 1 || 1);

            // Determine line position and width based on the chosen path type
            switch (activeConfiguration.pathDefinition) {
                case 'bezier':
                    linePathPosition = computeCurvePoint(
                        pathProgressionRatio,
                        makeCoordinatePair(activeConfiguration.ctrlPnt1.x, activeConfiguration.ctrlPnt1.y),
                        makeCoordinatePair(activeConfiguration.ctrlPnt2.x, activeConfiguration.ctrlPnt2.y),
                        makeCoordinatePair(activeConfiguration.ctrlPnt3.x, activeConfiguration.ctrlPnt3.y),
                        makeCoordinatePair(activeConfiguration.ctrlPnt4.x, activeConfiguration.ctrlPnt4.y)
                    );
                    calculatedLineWidth -= linePathPosition.x;
                    break;
                case 'dualBezier':
                    const leftBoundaryPosition = computeCurvePoint(
                        pathProgressionRatio,
                        makeCoordinatePair(activeConfiguration.ctrlPnt1.x, activeConfiguration.ctrlPnt1.y),
                        makeCoordinatePair(activeConfiguration.ctrlPnt2.x, activeConfiguration.ctrlPnt2.y),
                        makeCoordinatePair(activeConfiguration.ctrlPnt3.x, activeConfiguration.ctrlPnt3.y),
                        makeCoordinatePair(activeConfiguration.ctrlPnt4.x, activeConfiguration.ctrlPnt4.y)
                    );
                    // For the right boundary, use the Y-coordinates from the left curve if not specified,
                    // as solving for X given Y on a Bezier is non-trivial and often approximated.
                    const rightBoundaryPosition = computeCurvePoint(
                        pathProgressionRatio,
                        makeCoordinatePair(activeConfiguration.dualCtrlPnt1.x, activeConfiguration.ctrlPnt1.y),
                        makeCoordinatePair(activeConfiguration.dualCtrlPnt2.x, activeConfiguration.ctrlPnt2.y),
                        makeCoordinatePair(activeConfiguration.dualCtrlPnt3.x, activeConfiguration.ctrlPnt3.y),
                        makeCoordinatePair(activeConfiguration.dualCtrlPnt4.x, activeConfiguration.ctrlPnt4.y)
                    );
                    linePathPosition.x = leftBoundaryPosition.x;
                    linePathPosition.y = leftBoundaryPosition.y;
                    calculatedLineWidth -= (leftBoundaryPosition.x + rightBoundaryPosition.x);
                    break;
                case 'linear':
                default: // Fallback for any invalid or unspecified path type
                    linePathPosition.x = lineIndex * activeConfiguration.lineStepOffset;
                    linePathPosition.y = (lineIndex / maximumLinesPossible) * layoutWorkspace.height();
                    calculatedLineWidth -= linePathPosition.x;
                    break;
            }

            // Ensure line width is never negative; set a minimum of 1 pixel
            calculatedLineWidth = Math.max(1, calculatedLineWidth);

            // Create the line container div and apply base styling
            const currentLineDiv = $('<div>').addClass('path-text-line').css({
                'position': 'absolute',
                'top': `${linePathPosition.y}px`,
                'width': `${calculatedLineWidth}px`,
                'height': 'auto', // Allow content to define initial height
                'min-height': `${measuredLineHeight}px` // Ensure a baseline height
            });

            // Position the line horizontally based on the alignment setting
            if (activeConfiguration.horizontalAlign === 'right') {
                currentLineDiv.css('right', `${linePathPosition.x}px`);
            } else {
                currentLineDiv.css('left', `${linePathPosition.x}px`);
            }

            // Create an inner wrapper for the actual text content
            const contentWrapper = $('<div>').addClass('line-content-area').css({
                'text-align': activeConfiguration.textAlignment,
                'overflow': 'hidden',     // Prevent content from spilling horizontally
                'white-space': 'normal',  // Allow text to wrap normally
                'word-break': 'break-word' // Handle very long words
            }).appendTo(currentLineDiv);

            layoutWorkspace.append(currentLineDiv);
            generatedLineDivs.push(currentLineDiv);
        }

        // Initialize the first line as the active target for text distribution
        currentProcessedLine = generatedLineDivs[0];

        /**
         * Recursively processes DOM nodes from the cloned content, distributing them word-by-word
         * into the prepared layout lines. It handles overflow by moving content to the next line.
         * @param {jQuery} currentDestinationWrapper - The jQuery object of the '.line-content-area' to append to.
         * @param {HTMLElement} sourceNodeFragment - The raw DOM node from the cloned content being processed.
         * @returns {boolean} False if processing should stop (e.g., ran out of lines), true otherwise.
         */
        const distributeContentElements = (currentDestinationWrapper, sourceNodeFragment) => {
            let shouldContinue = true; // Flag to control continuation of the $.each loop

            $(sourceNodeFragment).contents().each(function () {
                if (!shouldContinue) return false; // Stop if previous iteration indicated an early exit

                const processedItem = $(this);
                const parentLineDiv = currentDestinationWrapper.closest('.path-text-line');
                const initialLineDivHeight = parentLineDiv.height(); // Get current height of the line div

                if (this.nodeType === Node.TEXT_NODE) {
                    // Temporarily append the text node to check for overflow
                    currentDestinationWrapper.append(processedItem);

                    // Check if the content now exceeds the available width or height of its container
                    const contentScrollWidth = currentDestinationWrapper[0].scrollWidth;
                    const containerClientWidth = parentLineDiv.width();
                    const contentScrollHeight = currentDestinationWrapper[0].scrollHeight;

                    // If text overflows horizontally or forces a line break vertically
                    if (contentScrollWidth > containerClientWidth || contentScrollHeight > initialLineDivHeight) {
                        processedItem.detach(); // Remove the overflowing item without losing it

                        // Find the next available line div
                        const currentLineIndex = generatedLineDivs.indexOf(parentLineDiv);
                        const nextLineIndex = currentLineIndex + 1;

                        if (nextLineIndex < generatedLineDivs.length) {
                            // Move to the next line and try appending the item there
                            currentProcessedLine = generatedLineDivs[nextLineIndex];
                            const nextLineWrapper = currentProcessedLine.find('.line-content-area');
                            nextLineWrapper.append(processedItem);
                            // Update the current destination for subsequent items in this `each` iteration
                            currentDestinationWrapper = nextLineWrapper;
                        } else {
                            // No more lines left, so this content cannot be placed
                            processedItem.remove(); // Permanently remove the unplaced content
                            console.warn("Text Overflow: Ran out of available lines. Some content may be truncated.");
                            shouldContinue = false; // Signal to stop further processing in this loop
                            return false; // Break out of the current `each` loop
                        }
                    }
                } else if (this.nodeType === Node.ELEMENT_NODE) {
                    // For element nodes (e.g., <span>, <a>), clone them empty and recurse into their children
                    const clonedSubElement = processedItem.clone().empty().appendTo(currentDestinationWrapper);
                    distributeContentElements(clonedSubElement, this);
                }
            });
            return shouldContinue; // Return the flag state
        };

        // --- Pre-process Text Content: Split into Word-level Nodes ---
        // This crucial step splits all significant text nodes into smaller nodes,
        // typically one per word (including trailing punctuation/spaces). This enables
        // the word-by-word wrapping logic to function effectively.
        const allRelevantTextNodes = contentSourceClone.find('*').add(contentSourceClone).contents()
            .filter(function() {
                // Select only non-empty text nodes for splitting
                return this.nodeType === Node.TEXT_NODE && this.nodeValue.trim() !== '';
            });

        allRelevantTextNodes.each(function () {
            let currentSegment = this;
            // Regular expression to find the position *after* a non-word character that precedes a word boundary.
            // This ensures that words (and their immediately preceding non-word characters like spaces or punctuation)
            // are separated into distinct text nodes. E.g., "Hello, world!" becomes "Hello, " and "world!".
            const wordDelimiterPattern = /(\W\b)/g;

            let matchIteration;
            while ((matchIteration = wordDelimiterPattern.exec(currentSegment.nodeValue)) !== null) {
                // `matchIteration.index` is the start of the matched non-word character.
                // We split the text node *after* this character, using `+ 1`.
                currentSegment = currentSegment.splitText(matchIteration.index + 1);
                // `splitText` returns the new text node containing the remainder of the string.
                // We continue searching for delimiters within this new segment.
            }
        });

        // --- Initiate Text Distribution ---
        // Begin the recursive process of filling the generated line containers with content.
        if (currentProcessedLine) {
            distributeContentElements(currentProcessedLine.find('.line-content-area'), contentSourceClone[0]);
        } else {
            console.error("Execution Error: No initial line was available for content distribution. Check plugin configuration and element dimensions.");
        }

        // --- Final Layout Refinements and Cleanup ---
        let cumulativeVerticalOffset = 0;
        generatedLineDivs.forEach(function(lineContainer) {
            const innerContentArea = lineContainer.find('.line-content-area');
            const actualContentHeight = innerContentArea.outerHeight(true); // Get actual height including margins/padding

            // Reposition each line vertically based on the cumulative height of preceding lines
            lineContainer.css('top', `${cumulativeVerticalOffset}px`);

            // Force the inner content wrapper to fill the line's width for proper justification
            innerContentArea.css('width', '100%');

            // Append a non-breaking space filler. This is a common technique to assist
            // CSS 'text-align: justify' in browsers where the last line might not justify fully,
            // by providing an invisible, expandable element that pushes content apart.
            innerContentArea.append('<span class="justify-filler" style="white-space: nowrap; display: inline-block; width: 100%; height: 0; overflow: hidden;">&nbsp;</span>');

            cumulativeVerticalOffset += actualContentHeight;
        });

        // Remove the temporary content clone from the DOM
        contentSourceClone.remove();
        layoutWorkspace.css('overflow', 'visible'); // Restore default overflow behavior

        return this; // Enable jQuery method chaining
    };

})( jQuery );