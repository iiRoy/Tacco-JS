// This module facilitates making specified embedded media elements dynamically resize to fit their container
// while preserving their original aspect ratio. It handles both initially present and asynchronously loaded content.
(function () {
    'use strict';

    // Core configuration parameters for the module's operation.
    const MODULE_SETTINGS = {
        RESIZE_THROTTLE_MS: 180, // Milliseconds delay for debouncing window resize events.
        MONITOR_TARGET_OPTS: { subtree: true, childList: true }, // Options for the DOM mutation observer.
        ASPECT_RATIO_KEY: 'data-aspect-ratio', // Data attribute name to store calculated aspect ratio.
        STYLE_DIMENSION_WIDTH: 'width',
        STYLE_DIMENSION_HEIGHT: 'height'
    };

    // A collection of CSS selectors for elements that require responsive treatment.
    let responsiveTargetQueries = [];

    // Simple utility to prevent a function from firing too rapidly (e.g., on resize).
    const generateDebouncer = (funcToDebounce, waitPeriod) => {
        let timeoutHandle;
        return function(...args) {
            clearTimeout(timeoutHandle);
            timeoutHandle = setTimeout(() => funcToDebounce.apply(this, args), waitPeriod);
        };
    };

    // Determines if the document's content is fully loaded and ready for interaction.
    const isDocumentContentReady = () => ['interactive', 'complete', 'loaded'].includes(document.readyState);

    // Checks if a given DOM element satisfies a CSS selector,
    // accommodating potential browser inconsistencies for older versions.
    const doesElementConform = (domNode, cssSelector) => {
        if (!domNode || domNode.nodeType !== Node.ELEMENT_NODE) {
            return false; // Only process actual element nodes.
        }
        // Prefer standard matches() method.
        if (typeof domNode.matches === 'function') {
            return domNode.matches(cssSelector);
        }

        // Fallback for older browsers using prefixed methods.
        const prefixMethods = [
            'webkitMatchesSelector',
            'mozMatchesSelector',
            'msMatchesSelector'
        ];
        for (const methodName of prefixMethods) {
            if (typeof domNode[methodName] === 'function') {
                return domNode[methodName](cssSelector);
            }
        }
        return false; // No compatible method found.
    };

    // Re-calculates and applies the height of a flexible element based on its current width
    // and its stored aspect ratio.
    const syncElementHeight = (flexElement) => {
        if (!flexElement || !flexElement.dataset || !flexElement.dataset[MODULE_SETTINGS.ASPECT_RATIO_KEY]) {
            return; // Exit if element or ratio data is missing.
        }

        const storedAspectRatio = Number(flexElement.dataset[MODULE_SETTINGS.ASPECT_RATIO_KEY]);
        if (isNaN(storedAspectRatio) || storedAspectRatio <= 0) {
            console.warn('Invalid aspect ratio found for element:', flexElement);
            return;
        }

        const currentComputedStyle = getComputedStyle(flexElement);
        const currentNumericalWidth = Number(currentComputedStyle[MODULE_SETTINGS.STYLE_DIMENSION_WIDTH].replace('px', ''));

        if (isNaN(currentNumericalWidth) || currentNumericalWidth <= 0) {
            return; // Cannot calculate height without a valid width.
        }

        flexElement.style[MODULE_SETTINGS.STYLE_DIMENSION_HEIGHT] = `${currentNumericalWidth / storedAspectRatio}px`;
    };

    // Prepares a specified media element for responsive behavior:
    // calculates its aspect ratio, stores it, and sets initial CSS properties.
    const prepareResponsiveElement = (targetMediaElement) => {
        if (!targetMediaElement || !targetMediaElement.style) {
            return; // Ensure we have a valid DOM element.
        }

        const initialStyles = getComputedStyle(targetMediaElement);
        const initialWidthVal = Number(initialStyles[MODULE_SETTINGS.STYLE_DIMENSION_WIDTH].replace('px', ''));
        const initialHeightVal = Number(initialStyles[MODULE_SETTINGS.STYLE_DIMENSION_HEIGHT].replace('px', ''));

        if (isNaN(initialWidthVal) || isNaN(initialHeightVal) || initialHeightVal === 0) {
            console.warn('Unable to retrieve initial dimensions for:', targetMediaElement);
            return;
        }

        const calculatedAspect = initialWidthVal / initialHeightVal;
        targetMediaElement.dataset[MODULE_SETTINGS.ASPECT_RATIO_KEY] = calculatedAspect.toFixed(5); // Store with higher precision.
        targetMediaElement.style[MODULE_SETTINGS.STYLE_DIMENSION_WIDTH] = '100%'; // Force element to span full width.
        targetMediaElement.removeAttribute(MODULE_SETTINGS.STYLE_DIMENSION_WIDTH); // Remove any explicit 'width' attribute.
        targetMediaElement.removeAttribute(MODULE_SETTINGS.STYLE_DIMENSION_HEIGHT); // Remove any explicit 'height' attribute.
        syncElementHeight(targetMediaElement); // Apply first height adjustment.
    };

    // A MutationObserver instance that watches for new nodes being added to the DOM.
    // When new nodes appear, it checks if they match any registered selectors and makes them responsive.
    const domNodeMonitor = new MutationObserver((changeRecords) => {
        for (const recordEntry of changeRecords) {
            if (recordEntry.addedNodes && recordEntry.addedNodes.length > 0) {
                Array.from(recordEntry.addedNodes).forEach((newlyAddedNode) => {
                    // Process only element nodes.
                    if (newlyAddedNode.nodeType === Node.ELEMENT_NODE) {
                        for (const storedQuery of responsiveTargetQueries) {
                            // Check the added node itself.
                            if (doesElementConform(newlyAddedNode, storedQuery)) {
                                prepareResponsiveElement(newlyAddedNode);
                            }
                            // Also check for any matching elements nested within the newly added node.
                            const containedMatches = newlyAddedNode.querySelectorAll(storedQuery);
                            if (containedMatches.length > 0) {
                                Array.from(containedMatches).forEach(prepareResponsiveElement);
                            }
                        }
                    }
                });
            }
        }
    });

    // The primary function to designate elements matching a CSS selector as responsive.
    // It initializes existing elements and sets up listeners for future content.
    const activateFluidSizing = (cssQueryString) => {
        if (typeof cssQueryString !== 'string' || !cssQueryString.trim()) {
            console.error('An invalid or empty CSS selector was provided for fluid sizing:', cssQueryString);
            return;
        }

        // Add the selector to our internal list if not already present.
        if (!responsiveTargetQueries.includes(cssQueryString)) {
            responsiveTargetQueries.push(cssQueryString);
        }

        // Function to find and initialize all current elements matching the selector.
        const processExistingElements = () => {
            const currentMatchingElements = document.querySelectorAll(cssQueryString);
            if (currentMatchingElements.length > 0) {
                Array.from(currentMatchingElements).forEach(prepareResponsiveElement);
            }
        };

        // Execute initial processing based on document readiness.
        if (isDocumentContentReady()) {
            processExistingElements();
        } else {
            // Wait for the DOM to be fully loaded before processing initial elements.
            document.addEventListener('DOMContentLoaded', processExistingElements, { once: true });
        }

        // Set up a debounced window resize listener to adjust heights dynamically.
        const debouncedWindowResize = generateDebouncer(() => {
            const elementsToRealign = document.querySelectorAll(cssQueryString);
            Array.from(elementsToRealign).forEach(syncElementHeight);
        }, MODULE_SETTINGS.RESIZE_THROTTLE_MS);

        window.addEventListener('resize', debouncedWindowResize);
    };

    // Begin observing the entire document for DOM changes,
    // ensuring new content also becomes responsive.
    if (document.documentElement) {
        domNodeMonitor.observe(document.documentElement, MODULE_SETTINGS.MONITOR_TARGET_OPTS);
    } else {
        console.error('The document root element is inaccessible; DOM monitoring cannot be initiated.');
    }

    // Expose the main function to the global window object.
    window.activateFluidSizing = activateFluidSizing;

})();