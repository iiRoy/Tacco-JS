// This JavaScript module provides a sophisticated system for managing responsive layouts
// based on the actual computed width of container elements, rather than global viewport dimensions.
// It applies CSS classes dynamically to child components, emulating media query behavior
// but at a component level, enabling more granular and flexible UI adaptations.

var ResponsiveLayoutManager = function(settings) {
    // A persistent reference to the current instance, useful for callbacks and nested scopes.
    const instanceContext = this;

    // Ensure the incoming settings object is valid; initialize as an empty object if not.
    if (!settings || typeof settings !== 'object') {
        settings = {};
    }

    // Defines the default operational parameters for the responsive manager.
    const standardSettings = {
        pollFrequencyMs: 600, // The frequency (in milliseconds) at which container dimensions are re-evaluated.
        elementLocators: {
            targetElements: '.component-block' // The universal CSS selector for all elements to be tracked and styled.
        },
        classModifiers: {
            upperBound: '--max-size-', // Suffix for classes applied when width is below a breakpoint (e.g., '--max-size-300').
            lowerBound: '--min-size-' // Suffix for classes applied when width is above or equal to a breakpoint (e.g., '--min-size-300').
        },
        metadataKeys: {
            elementIdentifier: 'data-comp-id', // Data attribute key for a component's unique identifier.
            associatedElements: 'data-tracked-children', // Data attribute key for storing references to child components on a container.
            parentContainer: 'data-host-container', // A flag to mark an element as a tracked container.
            sizeThresholds: 'data-breakpoints', // Data attribute key for defining custom breakpoints on a component.
            cachedDimension: 'data-cached-width' // Data attribute key for storing the last known width of a container.
        }
    };

    // Deep merge user-provided settings with the standard defaults to create the final runtime configuration.
    // This ensures that nested configuration objects are correctly merged.
    this.runtimeConfig = $.extend(true, {}, standardSettings, settings);

    // Initiates the process of identifying and caching all relevant DOM elements for tracking.
    this.initializeElementTracking();

    // Establishes a continuous background polling mechanism to periodically check for dimension changes.
    // This function recursively calls itself using setTimeout.
    const initiatePolling = function() {
        instanceContext.evaluateDimensions();
        setTimeout(initiatePolling, instanceContext.runtimeConfig.pollFrequencyMs);
    };
    initiatePolling(); // Start the polling loop immediately.

    // Attaches a debounced event handler to the window's resize event.
    // Debouncing prevents the `evaluateDimensions` method from being called excessively
    // during rapid resizing, improving performance.
    if (typeof $(window).on === 'function' && typeof _ !== 'undefined' && typeof _.debounce === 'function') {
        $(window).on('resize', _.debounce(() => {
            instanceContext.evaluateDimensions();
        }, 150)); // A 150ms debounce time provides a good balance between responsiveness and performance.
    } else {
        // Log a warning if jQuery or Lodash are not available, as resize handling might be suboptimal.
        console.warn("ResponsiveLayoutManager: Required jQuery or Lodash components for resize event handling are missing.");
    }
};

// All core functionalities are defined on the prototype to optimize memory usage
// by sharing methods across all instances of ResponsiveLayoutManager.
ResponsiveLayoutManager.prototype = {

    /**
     * Core Dimension Evaluation Logic:
     * Iterates through all tracked container elements, measures their current width,
     * and triggers an update of responsive classes if a significant dimension change is detected.
     */
    evaluateDimensions: function() {
        const selfRef = this; // Capture 'this' for use within nested callbacks.
        let sortedHostElements; // Holds container elements, sorted by their DOM hierarchy.

        // Pre-check: If no host elements have been cached, there's nothing to evaluate.
        if (!this.allHostElements || this.allHostElements.length === 0) {
            return;
        }

        // Sort the host containers by their nesting depth within other tracked components.
        // This ensures that outer containers are processed before their inner children,
        // which might have their sizes affected by parent-level class changes.
        sortedHostElements = $(_.sortBy(this.allHostElements, function(domElement) {
            // Count how many ancestors of the current DOM element match the 'targetElements' selector.
            return $(domElement).parents(selfRef.runtimeConfig.elementLocators.targetElements).length;
        }));

        // Process each host container to check for dimension changes.
        sortedHostElements.each(function() {
            const currentHost = $(this); // The current container element as a jQuery object.
            // Measure the outer width (including padding and border) for a more accurate dimension.
            const currentDimension = currentHost.outerWidth();

            // Input validation: Skip if the measured dimension is not a valid positive number.
            if (isNaN(currentDimension) || currentDimension <= 0) {
                return; // Move to the next container.
            }

            // Retrieve the width recorded during the previous evaluation cycle.
            const previousDimension = currentHost.data(selfRef.runtimeConfig.metadataKeys.cachedDimension);

            // Compare the current width with the cached one. A small tolerance (e.g., 1 pixel)
            // is used to prevent unnecessary updates due to sub-pixel rendering differences.
            // Also, trigger an update if no previous dimension was recorded.
            if (Math.abs(currentDimension - previousDimension) > 1 || previousDimension === undefined) {
                // Update the cached dimension for this container.
                currentHost.data(selfRef.runtimeConfig.metadataKeys.cachedDimension, currentDimension);
                // Trigger the class update process for all associated child components.
                selfRef.updateResponsiveClasses(currentHost);
            }
        });
    },

    /**
     * Element Tracking and Caching:
     * Scans the Document Object Model for elements matching the specified selectors,
     * establishes parent-child relationships between components and their containers,
     * and stores these references for efficient access.
     */
    initializeElementTracking: function() {
        const selfRef = this;
        // Use a Set to automatically ensure that only unique host containers are collected.
        const uniqueHostCollection = new Set();
        let allComponentNodes = $(selfRef.runtimeConfig.elementLocators.targetElements);

        // If no components are found, initialize empty jQuery objects and exit.
        if (!allComponentNodes.length) {
            this.trackedComponents = $();
            this.allHostElements = $();
            return;
        }

        // Store all identified components as a jQuery object for later access.
        this.trackedComponents = allComponentNodes;

        // Iterate over each identified component to establish relationships.
        this.trackedComponents.each(function() {
            const currentComp = $(this); // The current component element.
            const parentHost = currentComp.parent(); // The direct parent element is considered its container.

            // Explicitly mark the parent host element as a container in its data attributes.
            parentHost.data(selfRef.runtimeConfig.metadataKeys.parentContainer, true);
            // Add the raw DOM element of the parent host to the Set to track unique containers.
            uniqueHostCollection.add(parentHost[0]);

            // Retrieve the array of child components already associated with this parent host.
            // If it doesn't exist or isn't an array, initialize it.
            let hostAssociatedComps = parentHost.data(selfRef.runtimeConfig.metadataKeys.associatedElements);
            if (!Array.isArray(hostAssociatedComps)) {
                hostAssociatedComps = [];
            }

            // Add the current component to the parent's list if it's not already present.
            // Compare raw DOM elements for accurate uniqueness checking.
            if (!hostAssociatedComps.some(existingElem => existingElem[0] === currentComp[0])) {
                hostAssociatedComps.push(currentComp);
            }

            // Update the data attribute on the parent host with the (potentially updated) list of associated components.
            parentHost.data(selfRef.runtimeConfig.metadataKeys.associatedElements, hostAssociatedComps);

            // Also, store a reverse reference from the component back to its parent container.
            currentComp.data(selfRef.runtimeConfig.metadataKeys.parentContainer, parentHost);
        });

        // Convert the Set of unique DOM elements back into a jQuery object for consistent handling.
        this.allHostElements = $(Array.from(uniqueHostCollection));
    },

    /**
     * Class Management for Responsive Behavior:
     * Responsible for removing any previously applied responsive classes from components
     * and then applying new classes based on the container's current dimensions
     * and the component's defined breakpoints.
     * @param {jQuery} currentHost - The jQuery object representing the container element.
     */
    updateResponsiveClasses: function(currentHost) {
        const selfRef = this;
        const affiliatedComponents = currentHost.data(selfRef.runtimeConfig.metadataKeys.associatedElements);
        const currentDimension = currentHost.data(selfRef.runtimeConfig.metadataKeys.cachedDimension);

        // Guard against incomplete data: if no associated components or no valid dimension, exit.
        if (!Array.isArray(affiliatedComponents) || affiliatedComponents.length === 0 || !currentDimension) {
            return;
        }

        // Iterate through each component associated with the current host container.
        $.each(affiliatedComponents, function(index, componentJQ) {
            const currentComp = $(componentJQ); // The individual component to be updated.
            // Determine a label for the component, falling back to ID or a generic name.
            const componentLabel = currentComp.data(selfRef.runtimeConfig.metadataKeys.elementIdentifier) || currentComp.attr('id') || 'component';
            let computedClasses = []; // An array to temporarily store new classes to be added.

            // Retrieve all current classes from the component, splitting robustly and filtering out empty strings.
            const currentClasses = (currentComp.attr('class') || '').split(/\s+/).filter(Boolean);

            // Identify and remove all existing responsive classes (those with min/max size modifiers).
            const lowerBoundClasses = selfRef.extractMatchingClasses(currentClasses, selfRef.runtimeConfig.classModifiers.lowerBound);
            const upperBoundClasses = selfRef.extractMatchingClasses(currentClasses, selfRef.runtimeConfig.classModifiers.upperBound);
            // Remove the identified classes in a single operation for efficiency.
            currentComp.removeClass(lowerBoundClasses.concat(upperBoundClasses).join(' '));

            // Determine which new classes need to be applied based on breakpoints.
            const thresholdValuesRaw = currentComp.data(selfRef.runtimeConfig.metadataKeys.sizeThresholds);
            if (thresholdValuesRaw) {
                // Parse the breakpoint string: remove whitespace, split by comma, convert to numbers,
                // filter out invalid numbers, and sort them numerically for consistent processing.
                const thresholdValues = String(thresholdValuesRaw)
                    .replace(/\s+/g, '')
                    .split(',')
                    .map(Number)
                    .filter(val => !isNaN(val) && val > 0)
                    .sort((a, b) => a - b);

                // Iterate through the sorted breakpoints to decide which classes to apply.
                for (let loopIndex = 0; loopIndex < thresholdValues.length; loopIndex++) {
                    const breakpoint = thresholdValues[loopIndex];
                    if (currentDimension < breakpoint) {
                        // If container width is less than breakpoint, apply max-size class.
                        computedClasses.push(componentLabel + selfRef.runtimeConfig.classModifiers.upperBound + breakpoint);
                    } else if (currentDimension >= breakpoint) {
                        // If container width is greater than or equal to breakpoint, apply min-size class.
                        computedClasses.push(componentLabel + selfRef.runtimeConfig.classModifiers.lowerBound + breakpoint);
                    }
                }
                // Apply all newly computed classes to the component.
                if (computedClasses.length > 0) {
                    currentComp.addClass(computedClasses.join(' '));
                }
            }
        });
    },

    /**
     * Utility Function: Class Filtering
     * Filters an array of CSS class strings, returning only those that
     * contain a specific substring.
     * @param {Array<string>} classList - An array of CSS class names.
     * @param {string} matchString - The substring to search for within class names.
     * @returns {Array<string>} An array of class names that contain the matchString.
     */
    extractMatchingClasses: function(classList, matchString) {
        // Guard against invalid inputs: return an empty array if inputs are not as expected.
        if (!Array.isArray(classList) || typeof matchString !== 'string') {
            return [];
        }
        // Use Array.prototype.filter and String.prototype.includes for concise filtering.
        return classList.filter(item => item.includes(matchString));
    }
};