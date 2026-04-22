/*
 * FlowGrid Layout Engine v1.0.0 - a responsive grid layout plugin
 *
 * This software is provided "as-is" under the terms of the Unlicense.
 * For more details, refer to UNLICENSE.org.
 *
 * (c) 2023 - A community project. All rights reserved.
 * Inspired by VGrid.
 */
(function($) {
    "use strict"; // Enforce stricter parsing and error handling

    // --- Utility Functions ---

    /**
     * Safely parses a CSS property string into an integer.
     * Returns 0 if the value is not a valid number.
     * @param {jQuery} element - The jQuery element.
     * @param {string} propertyName - The CSS property name.
     * @returns {number} The parsed integer value, or 0.
     */
    const getNumericCssValue = (element, propertyName) => {
        const parsedValue = parseInt(element.css(propertyName), 10);
        return isNaN(parsedValue) ? 0 : parsedValue;
    };

    /**
     * Retrieves a numeric value, falling back to a default if invalid.
     * @param {*} valueInput - The value to check.
     * @param {number} defaultValue - The default value to use if valueInput is not a valid number.
     * @returns {number} The numeric value or the default.
     */
    const retrieveNumericValue = (valueInput, defaultValue) => {
        return (typeof valueInput === "number" && isFinite(valueInput)) ? valueInput : defaultValue;
    };

    /**
     * Calculates the total outer dimensions (width/height + margins/padding/borders) of an element.
     * @param {jQuery} targetElement - The jQuery element to measure.
     * @returns {Array<number>} An array [totalWidth, totalHeight].
     */
    function calculateElementDimensions(targetElement) {
        if (!targetElement || targetElement.length === 0) {
            console.warn("FlowGrid: Attempted to calculate dimensions for an invalid element.");
            return [0, 0];
        }

        let totalWidth = targetElement.width();
        let totalHeight = targetElement.height();

        // Sum all horizontal box model properties
        totalWidth += getNumericCssValue(targetElement, "margin-left") +
                      getNumericCssValue(targetElement, "padding-left") +
                      getNumericCssValue(targetElement, "border-left-width") +
                      getNumericCssValue(targetElement, "margin-right") +
                      getNumericCssValue(targetElement, "padding-right") +
                      getNumericCssValue(targetElement, "border-right-width");

        // Sum all vertical box model properties
        totalHeight += getNumericCssValue(targetElement, "margin-top") +
                       getNumericCssValue(targetElement, "padding-top") +
                       getNumericCssValue(targetElement, "border-top-width") +
                       getNumericCssValue(targetElement, "margin-bottom") +
                       getNumericCssValue(targetElement, "padding-bottom") +
                       getNumericCssValue(targetElement, "border-bottom-width");

        return [totalWidth, totalHeight];
    }

    // --- Layout Matrix Management Functions ---

    /**
     * Sorts layout coordinate segments primarily by their depth (Y-coordinate),
     * then by their starting X-coordinate if depths are equal.
     * @param {Array<number>} segmentA - First segment [startX, endX, depthY].
     * @param {Array<number>} segmentB - Second segment [startX, endX, depthY].
     * @returns {number} Comparison result (-1, 0, 1).
     */
    function coordinateSortByDepth(segmentA, segmentB) {
        // Guard against null/undefined segments
        if (!segmentA && !segmentB) return 0;
        if (!segmentA) return 1;
        if (!segmentB) return -1;

        if (segmentA[2] === segmentB[2]) {
            return (segmentA[0] > segmentB[0]) ? 1 : -1;
        }
        return (segmentA[2] > segmentB[2]) ? 1 : -1;
    }

    /**
     * Sorts layout coordinate segments by their starting X-coordinate.
     * @param {Array<number>} segmentA - First segment [startX, endX, depthY].
     * @param {Array<number>} segmentB - Second segment [startX, endX, depthY].
     * @returns {number} Comparison result (-1, 0, 1).
     */
    function coordinateSortByX(segmentA, segmentB) {
        if (!segmentA && !segmentB) return 0;
        if (!segmentA) return 1;
        if (!segmentB) return -1;
        return (segmentA[0] > segmentB[0]) ? 1 : -1;
    }

    /**
     * Finds the optimal attachment point (X, Y) within the layout matrix for a new item.
     * The point allows the item to fit with its given width.
     * @param {Array<Array<number>>} layoutMatrix - The current matrix of available spaces.
     * @param {number} itemWidth - The width of the item to place.
     * @returns {Array<number>} An array [xCoord, yCoord] for the placement.
     */
    function determinePlacementSpot(layoutMatrix, itemWidth) {
        // Sort a copy of the matrix by depth to find the shallowest suitable spot first.
        const sortedMatrix = layoutMatrix.slice().sort(coordinateSortByDepth);

        // If matrix is empty, start at [0,0]
        if (sortedMatrix.length === 0) {
            return [0, 0];
        }

        // The maximum depth found in the current matrix (bottom-most point)
        const maxDepth = sortedMatrix[sortedMatrix.length - 1][2];

        // Iterate through sorted segments to find the first suitable spot
        for (let i = 0; i < sortedMatrix.length; i++) {
            const currentSegment = sortedMatrix[i];

            // If we've reached segments deeper than or equal to maxDepth,
            // and haven't found a spot, it means we need to place it at maxDepth.
            if (currentSegment[2] >= maxDepth) break;

            // Check if the current segment's width is sufficient for the item.
            if ((currentSegment[1] - currentSegment[0]) >= itemWidth) {
                return [currentSegment[0], currentSegment[2]]; // [x, y]
            }
        }
        // If no suitable spot found in shallower areas, place it at the beginning of the deepest level.
        return [0, maxDepth];
    }

    /**
     * Trims a layout segment's width if it overlaps with a blocking segment.
     * @param {Array<number>} targetSegment - The segment to be trimmed [startX, endX, depthY].
     * @param {Array<number>} blockingSegment - The segment causing the trim [blockStartX, blockEndX, blockBottomY].
     * @returns {Array<number>} The trimmed segment.
     */
    function trimSegmentWidth(targetSegment, blockingSegment) {
        // Check for horizontal overlap
        const overlaps = (targetSegment[0] < blockingSegment[1] && targetSegment[1] > blockingSegment[0]);

        if (overlaps) {
            // If target starts within blocking area or blocking starts within target
            if (targetSegment[0] >= blockingSegment[0] && targetSegment[0] < blockingSegment[1]) {
                targetSegment[0] = blockingSegment[1]; // Shift start to after blocking segment
            } else if (targetSegment[1] > blockingSegment[0] && targetSegment[1] <= blockingSegment[1]) {
                targetSegment[1] = blockingSegment[0]; // Shift end to before blocking segment
            }
            // Note: If blocking segment fully covers target, this logic will lead to targetSegment[0] >= targetSegment[1],
            // which will be handled by subsequent filtering.
        }
        return targetSegment;
    }

    /**
     * Updates the layout matrix after an item has been placed,
     * removing or trimming segments that are now occupied.
     * @param {Array<Array<number>>} currentMatrix - The existing layout matrix.
     * @param {Array<number>} placementCoords - The [x, y] coordinates where the item was placed.
     * @param {Array<number>} elementSize - The [width, height] of the placed item.
     * @returns {Array<Array<number>>} The updated layout matrix.
     */
    function adjustLayoutMatrix(currentMatrix, placementCoords, elementSize) {
        // Ensure we operate on a copy and sort by depth for consistent processing
        let workingMatrix = currentMatrix.slice().sort(coordinateSortByDepth);

        // Define the new occupied area (left, right, bottomY)
        const occupiedZone = [
            placementCoords[0],
            placementCoords[0] + elementSize[0],
            placementCoords[1] + elementSize[1]
        ];

        // Filter and adjust existing segments based on the new occupied zone
        workingMatrix = workingMatrix.filter(segment => {
            // A segment is removed if it's entirely covered by the new occupied zone.
            // Or if after trimming, its width becomes zero or negative.
            return !(occupiedZone[0] <= segment[0] && segment[1] <= occupiedZone[1]);
        }).map(currentSegment => {
            // Trim the segment's width if it overlaps
            return trimSegmentWidth(currentSegment, occupiedZone);
        }).filter(segment => segment[1] > segment[0]); // Remove segments that became invalid (width <= 0) after trimming

        // Combine the updated matrix with the new occupied zone
        return mergeCoordinateSegments(workingMatrix, occupiedZone);
    }

    /**
     * Merges adjacent or overlapping segments in the layout matrix that share the same depth.
     * @param {Array<Array<number>>} segmentsList - The list of segments.
     * @param {Array<number>} newSegment - A new segment to add and potentially merge.
     * @returns {Array<Array<number>>} The consolidated list of segments.
     */
    function mergeCoordinateSegments(segmentsList, newSegment) {
        // Start with existing valid segments and add the new one, then sort by X-coordinate.
        const combinedAndSorted = segmentsList.filter(s => s && s[1] > s[0]) // Ensure valid segments
                                            .concat([newSegment])
                                            .sort(coordinateSortByX);

        if (combinedAndSorted.length === 0) {
            return [];
        }

        const mergedResult = [];
        let currentMergedSegment = combinedAndSorted[0];

        for (let i = 1; i < combinedAndSorted.length; i++) {
            const nextSegment = combinedAndSorted[i];

            // If segments are at the same depth and are adjacent or overlapping
            if (currentMergedSegment[2] === nextSegment[2] &&
                currentMergedSegment[1] >= nextSegment[0]) // Adjacent or overlap (>= to handle touching)
            {
                // Merge by extending the current segment's end point
                currentMergedSegment[1] = Math.max(currentMergedSegment[1], nextSegment[1]);
            } else {
                // No merge possible, add the current merged segment to the result and start a new one
                mergedResult.push(currentMergedSegment);
                currentMergedSegment = nextSegment;
            }
        }
        // Add the last merged segment
        mergedResult.push(currentMergedSegment);
        return mergedResult;
    }

    // --- Core Layout and Animation Functions ---

    /**
     * Calculates and stores the grid item positions within the container.
     * @param {jQuery} gridContainer - The main grid container element.
     */
    function processGridElementsLayout(gridContainer) {
        if (!gridContainer || gridContainer.length === 0) {
            console.warn("FlowGrid: Cannot process layout for an invalid container.");
            return;
        }

        const gridItems = gridContainer.data("_fg_items");
        if (!gridItems || gridItems.length === 0) {
            gridContainer.data("_fg_totalHeight", 0);
            return;
        }

        // Initialize the layout matrix with the full container width at Y=0
        const containerWidth = gridContainer.width();
        let layoutMatrix = [[0, containerWidth, 0]]; // [startX, endX, bottomY]
        let maximumGridHeight = 0; // Tracks the height of the tallest column

        gridItems.each(function() {
            const currentItem = $(this);

            // Skip hidden elements, but ensure they don't block space if they were visible
            if (currentItem.is(":hidden")) {
                return true; // continue jQuery .each loop
            }

            const itemSize = calculateElementDimensions(currentItem);
            const itemWidth = itemSize[0];

            // Find the best available spot for the current item
            const placementPoint = determinePlacementSpot(layoutMatrix, itemWidth);

            // Update the layout matrix to reflect the newly occupied space
            layoutMatrix = adjustLayoutMatrix(layoutMatrix, placementPoint, itemSize);

            // Store the calculated position on the item itself
            currentItem.data("_fg_left", placementPoint[0]);
            currentItem.data("_fg_top", placementPoint[1]);

            // Update the maximum height of the grid
            maximumGridHeight = Math.max(maximumGridHeight, placementPoint[1] + itemSize[1]);
        });

        // Store the calculated total height for the container
        gridContainer.data("_fg_totalHeight", maximumGridHeight);
        updateContainerHeight(gridContainer);
    }

    /**
     * Applies the calculated positions to elements immediately without animation.
     * @param {jQuery} elementsToPosition - A jQuery collection of elements.
     */
    function applyImmediatePositions(elementsToPosition) {
        if (!elementsToPosition || elementsToPosition.length === 0) {
            return;
        }
        elementsToPosition.each(function() {
            const item = $(this);
            item.css({
                "left": item.data("_fg_left") + "px",
                "top": item.data("_fg_top") + "px"
            });
        });
    }

    /**
     * Helper to apply height animation or direct set.
     * @param {jQuery} targetElement - The element whose height is to be changed.
     * @param {number} newHeight - The target height in pixels.
     * @param {number} duration - The duration of the animation in milliseconds.
     */
    const applyHeightChange = (targetElement, newHeight, duration) => {
        if (targetElement.css("display") === "none" || duration <= 0 || !$.fn.animate) {
             targetElement.height(newHeight); // Direct set if hidden, no duration, or no animate capability
        } else {
             targetElement.animate(
                { height: newHeight + "px" },
                duration,
                "easeOutQuart"
            );
        }
    };

    /**
     * Manages the main container's height, animating it if necessary.
     * @param {jQuery} gridContainer - The grid container element.
     */
    function updateContainerHeight(gridContainer) {
        if (!gridContainer || gridContainer.length === 0) {
            console.warn("FlowGrid: Cannot update height for an invalid container.");
            return;
        }

        const currentOptions = gridContainer.data("_fg_options") || {};
        const animationDuration = retrieveNumericValue(currentOptions.time, 500);
        const itemElements = gridContainer.data("_fg_items") || $();
        const itemDelay = retrieveNumericValue(currentOptions.delay, 0);

        // Calculate total delay for height adjustment, considering all item animations
        const totalDelayForHeight = itemElements.length * itemDelay + animationDuration;

        gridContainer.stop(true, true); // Stop any current animations and jump to end

        const targetHeight = gridContainer.data("_fg_totalHeight");
        const currentContainerHeight = gridContainer.height();

        // If container needs to expand, animate immediately
        if (currentContainerHeight < targetHeight) {
            applyHeightChange(gridContainer, targetHeight, animationDuration);
        } else {
            // If container needs to shrink, delay to allow items to settle
            clearTimeout(gridContainer.data("_fg_heightAdjustmentTimeout"));
            gridContainer.data("_fg_heightAdjustmentTimeout", setTimeout(() => {
                applyHeightChange(gridContainer, targetHeight, animationDuration);
            }, totalDelayForHeight));
        }
    }

    /**
     * Animates grid items to their new calculated positions.
     * @param {jQuery} elementsToAnimate - Collection of grid items.
     * @param {string} animationEasing - Easing function name (e.g., "linear", "easeOutQuart").
     * @param {number} animationDuration - Duration of animation in milliseconds.
     * @param {number} itemAnimationDelay - Delay between animating each item in sequence.
     * @param {Function} [onCompleteCallback] - Function to call after all animations complete.
     */
    function animateElementsToPositions(elementsToAnimate, animationEasing, animationDuration, itemAnimationDelay, onCompleteCallback) {
        if (!elementsToAnimate || elementsToAnimate.length === 0) {
            if (typeof onCompleteCallback === "function") {
                onCompleteCallback(); // Call complete if no elements to animate
            }
            return;
        }

        let needsMovement = false;
        elementsToAnimate.each(function() {
            const item = $(this);
            const currentPos = item.position();
            if (currentPos.left !== item.data("_fg_left") || currentPos.top !== item.data("_fg_top")) {
                needsMovement = true;
                return false; // Break out of jQuery .each loop
            }
        });

        if (!needsMovement) {
            if (typeof onCompleteCallback === "function") {
                onCompleteCallback();
            }
            return;
        }

        const parentContainer = $(elementsToAnimate).parent();
        const gridOptions = parentContainer.data("_fg_options") || {};

        if (typeof gridOptions.onLayoutStart === "function") {
            gridOptions.onLayoutStart();
        }

        let completedAnimations = 0;
        const totalItems = elementsToAnimate.length;

        elementsToAnimate.each(function(index) {
            const currentItem = $(this);
            const animProps = {
                left: currentItem.data("_fg_left") + "px",
                top: currentItem.data("_fg_top") + "px"
            };

            const animSettings = {
                duration: animationDuration,
                easing: animationEasing,
                complete: () => {
                    completedAnimations++;
                    if (completedAnimations === totalItems && typeof onCompleteCallback === "function") {
                        onCompleteCallback();
                        if (typeof gridOptions.onLayoutEnd === "function") {
                            gridOptions.onLayoutEnd();
                        }
                    }
                }
            };

            clearTimeout(currentItem.data("_fg_animTimeout"));
            currentItem.data("_fg_animTimeout", setTimeout(() => {
                currentItem.animate(animProps, animSettings);
            }, index * itemAnimationDelay));
        });
    }

    /**
     * Orchestrates the recalculation of layout and subsequent animation.
     * This is the main refresh entry point.
     * @param {jQuery} targetGridElement - The grid container to refresh.
     */
    function recalculateLayoutAndAnimate(targetGridElement) {
        if (!targetGridElement || targetGridElement.length === 0) {
            console.warn("FlowGrid: Cannot refresh invalid target element.");
            return;
        }

        clearTimeout(targetGridElement.data("_fg_refreshTimeout"));

        targetGridElement.data("_fg_refreshTimeout", setTimeout(() => {
            // Update the collection of child items first
            targetGridElement.data("_fg_items", targetGridElement.find("> *"));
            // Ensure child items have absolute positioning
            targetGridElement.data("_fg_items").css("position", "absolute");

            processGridElementsLayout(targetGridElement);

            const options = targetGridElement.data("_fg_options") || {};
            const animEasing = options.easing || "linear";
            const animDuration = retrieveNumericValue(options.time, 500);
            const itemDelay = retrieveNumericValue(options.delay, 0);

            animateElementsToPositions(
                targetGridElement.data("_fg_items"),
                animEasing,
                animDuration,
                itemDelay,
                options.onFinish || null // Use onFinish from options as general completion callback
            );
        }, retrieveNumericValue(targetGridElement.data("_fg_options")?.wait, 500)));
    }

    // --- Event Listeners ---

    // Store references to initialized grid containers for global events
    const initializedFlowGrids = $(); // jQuery collection

    /**
     * Handles window resize events. It iterates over all initialized FlowGrid instances
     * and triggers a refresh for each.
     * Bound once globally.
     */
    let resizeEventHandlerInitialized = false;
    function handleGlobalResize() {
        if (initializedFlowGrids.length > 0) {
            initializedFlowGrids.each(function() {
                recalculateLayoutAndAnimate($(this));
            });
        }
    }

    /**
     * Sets up a listener for font size changes by periodically checking a hidden span.
     * @param {jQuery} gridRef - The grid container element.
     * @param {Function} callbackFn - Function to call when font size changes.
     */
    function setupFontSizeWatcher(gridRef, callbackFn) {
        if (gridRef.data("_fg_fontSizeWatcherActive")) {
            return; // Already active for this grid
        }
        gridRef.data("_fg_fontSizeWatcherActive", true);

        // Create a hidden span to monitor font size
        const fontSizeMonitor = $("<span />")
            .text(" ")
            .addClass("flowgrid-font-size-monitor") // Use a class instead of ID
            .css({
                position: "absolute",
                left: "-9999px",
                fontSize: "1em" // Monitor relative font size
            })
            .appendTo("body");

        // Store initial font size and setup interval
        fontSizeMonitor.data("initial-font-size", fontSizeMonitor.css("font-size"));

        const checkInterval = setInterval(() => {
            const currentFontSize = fontSizeMonitor.css("font-size");
            if (currentFontSize !== fontSizeMonitor.data("initial-font-size")) {
                fontSizeMonitor.data("initial-font-size", currentFontSize);
                callbackFn(gridRef);
            }
        }, 1000); // Check every second

        // Store interval ID to clear it later if needed
        gridRef.data("_fg_fontSizeCheckIntervalId", checkInterval);

        // Clean up when element is removed from DOM (requires a custom event or mutation observer)
        // For simplicity, we'll rely on global cleanup if the grid is explicitly destroyed.
    }

    /**
     * Configures event handling for image loading within the grid and its appended/prepended content.
     * @param {jQuery} gridRef - The grid container element.
     * @param {Function} callbackFn - Function to call when an image loads.
     */
    function configureImageLoadHandling(gridRef, callbackFn) {
        if (gridRef.data("flowgrid-image-events-setup")) {
            return; // Already configured
        }
        gridRef.data("flowgrid-image-events-setup", true);

        const imageLoadEventName = "flowgrid-content-added";

        // Bind a custom event handler to the grid container
        gridRef.on(imageLoadEventName, function() {
            // Find all images within the grid that haven't had a load handler attached yet
            gridRef.find("img").each(function() {
                const imgElement = $(this);
                if (!imgElement.data("flowgrid-image-load-handler-bound")) {
                    imgElement.data("flowgrid-image-load-handler-bound", true);
                    imgElement.on("load.flowgrid", () => callbackFn(gridRef)); // Namespace the event
                    // Also check if image is already loaded (from cache)
                    if (this.complete) {
                        callbackFn(gridRef);
                    }
                }
            });
        });

        // Trigger the initial check for existing images
        gridRef.trigger(imageLoadEventName);

        // Override jQuery's append/prepend methods for this specific grid instance
        // to automatically trigger the image load check when new content is added.
        // This is a powerful but potentially intrusive Type III change.
        const originalAppend = gridRef.append;
        const originalPrepend = gridRef.prepend;

        gridRef.append = function(...args) {
            const result = originalAppend.apply(this, args);
            this.trigger(imageLoadEventName);
            return result;
        };

        gridRef.prepend = function(...args) {
            const result = originalPrepend.apply(this, args);
            this.trigger(imageLoadEventName);
            return result;
        };
    }

    // --- jQuery Plugin Definition ---

    $.fn.extend({
        /**
         * Initializes the FlowGrid layout on selected elements.
         * @param {object} [options] - Configuration options.
         * @param {string} [options.easing='linear'] - Animation easing function.
         * @param {number} [options.time=500] - Animation duration in milliseconds.
         * @param {number} [options.delay=0] - Delay between animating each item.
         * @param {number} [options.wait=500] - Initial delay before first layout refresh.
         * @param {object|number} [options.fadeIn] - Configuration for initial fade-in animation.
         * @param {boolean} [options.useLoadImageEvent=false] - Whether to re-layout on image load.
         * @param {boolean} [options.useFontSizeListener=false] - Whether to re-layout on font size changes.
         * @param {Function} [options.onLayoutStart] - Callback before layout animation starts.
         * @param {Function} [options.onLayoutEnd] - Callback after all layout animations complete.
         */
        initializeFlowGrid: function(options) {
            if (!resizeEventHandlerInitialized) {
                $(window).on("resize.flowgrid", handleGlobalResize); // Namespace the resize event
                resizeEventHandlerInitialized = true;
            }

            const settings = $.extend(true, {
                easing: "linear",
                time: 500,
                delay: 0,
                wait: 500,
                fadeIn: false,
                useLoadImageEvent: false,
                useFontSizeListener: false,
                onLayoutStart: null,
                onLayoutEnd: null
            }, options);

            // Handle legacy 'easeing' typo
            if (settings.easeing) {
                settings.easing = settings.easeing;
                delete settings.easeing;
            }

            this.each(function() {
                const currentGridElement = $(this);

                // Prevent re-initialization
                if (currentGridElement.data("_fg_initialized")) {
                    console.warn("FlowGrid: Element already initialized.", this);
                    return;
                }
                currentGridElement.data("_fg_initialized", true);

                // Add to global collection of initialized grids
                initializedFlowGrids = initializedFlowGrids.add(currentGridElement);

                currentGridElement.data("_fg_options", settings);
                currentGridElement.data("_fg_items", currentGridElement.find("> *"));

                currentGridElement.css({
                    "position": "relative",
                    "width": "auto", // Ensure container adapts to content width
                    "overflow": "hidden" // Hide overflow during layout
                });

                // Ensure all direct children are absolutely positioned for layout control
                currentGridElement.data("_fg_items").css("position", "absolute");

                // Perform initial layout calculation and positioning
                processGridElementsLayout(currentGridElement);
                applyImmediatePositions(currentGridElement.data("_fg_items"));

                // Apply initial fade-in effect if configured
                if (settings.fadeIn) {
                    const fadeInProps = (typeof settings.fadeIn === "object") ? settings.fadeIn : { time: settings.fadeIn };
                    const fadeInDuration = retrieveNumericValue(fadeInProps.time, 250);
                    const fadeInItemDelay = retrieveNumericValue(fadeInProps.delay, 0);

                    currentGridElement.data("_fg_items").each(function(idx) {
                        const item = $(this);
                        if (item.is(":hidden")) {
                            return true; // Skip hidden items
                        }
                        item.stop(true, true).css({ opacity: 0 }); // Ensure opacity is 0 initially
                        setTimeout(() => {
                            item.stop(true, true).fadeTo(fadeInDuration, 1);
                        }, idx * fadeInItemDelay);
                    });
                }

                // Set up event listeners based on options
                if (settings.useLoadImageEvent) {
                    configureImageLoadHandling(currentGridElement, recalculateLayoutAndAnimate);
                }
                if (settings.useFontSizeListener) {
                    setupFontSizeWatcher(currentGridElement, recalculateLayoutAndAnimate);
                }
            });
            return this; // Allow chaining
        },

        /**
         * Refreshes the FlowGrid layout for selected elements.
         * @param {string} [easing] - Override animation easing.
         * @param {number} [time] - Override animation duration.
         * @param {number} [delay] - Override item animation delay.
         * @param {Function} [onComplete] - Callback after refresh animations.
         */
        updateFlowGrid: function(easing, time, delay, onComplete) {
            this.each(function() {
                const targetElement = $(this);
                if (!targetElement.data("_fg_initialized")) {
                    console.warn("FlowGrid: Element not initialized. Call .initializeFlowGrid() first.", this);
                    return;
                }

                const options = targetElement.data("_fg_options") || {};

                // Update child collection and ensure positioning
                targetElement.data("_fg_items", targetElement.find("> *"));
                targetElement.data("_fg_items").css("position", "absolute");

                processGridElementsLayout(targetElement);

                const finalEasing = easing || options.easing || "linear";
                const finalTime = retrieveNumericValue(time, retrieveNumericValue(options.time, 500));
                const finalDelay = retrieveNumericValue(delay, retrieveNumericValue(options.delay, 0));

                animateElementsToPositions(
                    targetElement.data("_fg_items"),
                    finalEasing,
                    finalTime,
                    finalDelay,
                    onComplete // Pass the specific onComplete callback
                );

                // Re-configure image load handling if enabled, to catch new images added outside append/prepend
                if (options.useLoadImageEvent) {
                    configureImageLoadHandling(targetElement, recalculateLayoutAndAnimate);
                }
            });
            return this;
        },

        /**
         * Reorders the FlowGrid items based on a custom sort function.
         * @param {Function} sortFunction - A function to sort the child elements (similar to Array.prototype.sort).
         * @param {string} [easing] - Override animation easing.
         * @param {number} [time] - Override animation duration.
         * @param {number} [delay] - Override item animation delay.
         */
        reorderFlowGrid: function(sortFunction, easing, time, delay) {
            if (typeof sortFunction !== "function") {
                console.error("FlowGrid: A valid sort function is required for reorderFlowGrid.");
                return this;
            }

            this.each(function() {
                const targetElement = $(this);
                if (!targetElement.data("_fg_initialized")) {
                    console.warn("FlowGrid: Element not initialized. Call .initializeFlowGrid() first.", this);
                    return;
                }

                let currentItems = targetElement.data("_fg_items");
                if (!currentItems || currentItems.length === 0) {
                    return;
                }

                // Convert jQuery collection to a plain array, sort it, then re-append to DOM
                const sortedItemsArray = currentItems.get().sort(sortFunction);
                $.each(sortedItemsArray, function() {
                    $(this).appendTo(targetElement); // Re-append to change DOM order
                });

                // Update the stored jQuery collection with the new DOM order
                targetElement.data("_fg_items", targetElement.find("> *"));

                processGridElementsLayout(targetElement);

                const options = targetElement.data("_fg_options") || {};
                const finalEasing = easing || options.easing || "linear";
                const finalTime = retrieveNumericValue(time, retrieveNumericValue(options.time, 500));
                const finalDelay = retrieveNumericValue(delay, retrieveNumericValue(options.delay, 0));

                animateElementsToPositions(
                    targetElement.data("_fg_items"),
                    finalEasing,
                    finalTime,
                    finalDelay,
                    options.onLayoutEnd || null
                );
            });
            return this;
        },

        /**
         * Cleans up all FlowGrid-related data and event handlers for the selected elements.
         */
        destroyFlowGrid: function() {
            this.each(function() {
                const targetElement = $(this);
                if (!targetElement.data("_fg_initialized")) {
                    return; // Not initialized
                }

                // Clear timeouts
                clearTimeout(targetElement.data("_fg_refreshTimeout"));
                clearTimeout(targetElement.data("_fg_heightAdjustmentTimeout"));
                clearTimeout(targetElement.data("_fg_fontSizeCheckIntervalId"));

                // Clear item animation timeouts
                targetElement.data("_fg_items")?.each(function() {
                    clearTimeout($(this).data("_fg_animTimeout"));
                });

                // Remove event handlers
                targetElement.off(".flowgrid"); // Remove namespaced events
                targetElement.find("img").off(".flowgrid"); // Remove namespaced image load events

                // Restore original append/prepend if they were overridden
                if (targetElement.data("originalAppend")) {
                    targetElement.append = targetElement.data("originalAppend");
                    targetElement.prepend = targetElement.data("originalPrepend");
                }

                // Remove font size monitor element
                $(".flowgrid-font-size-monitor", "body").remove();

                // Remove data attributes
                targetElement.removeData([
                    "_fg_options", "_fg_items", "_fg_totalHeight", "_fg_initialized",
                    "_fg_refreshTimeout", "_fg_heightAdjustmentTimeout", "_fg_fontSizeWatcherActive",
                    "_fg_fontSizeCheckIntervalId", "flowgrid-image-events-setup",
                    "originalAppend", "originalPrepend"
                ]);

                // Remove item-specific data
                targetElement.find("> *").removeData(["_fg_left", "_fg_top", "_fg_animTimeout", "flowgrid-image-load-handler-bound"]);

                // Remove from global initialized grids collection
                initializedFlowGrids = initializedFlowGrids.not(targetElement);

                // If no more grids are initialized, remove global resize handler
                if (initializedFlowGrids.length === 0) {
                    $(window).off("resize.flowgrid");
                    resizeEventHandlerInitialized = false;
                }

                // Restore original CSS properties if necessary (e.g., position, width, overflow)
                targetElement.css({
                    "position": "",
                    "width": "",
                    "overflow": ""
                });
                targetElement.find("> *").css("position", "");

                console.log("FlowGrid: Destroyed instance for", this);
            });
            return this;
        }
    });

})(jQuery);