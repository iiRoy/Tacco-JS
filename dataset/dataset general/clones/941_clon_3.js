// This module provides a custom Modernizr feature detection and
// a responsive image layout adjustment utility.
// It addresses common challenges with CSS object-fit and dynamic viewport units
// by applying classes based on calculated aspect ratios.

// =============================================================================
// Part 1: Modernizr Feature Detection for Percentage Height Support
// =============================================================================

// Ensure Modernizr is available before attempting to add a test.
if (typeof Modernizr !== 'undefined') {
    /**
     * Registers a custom Modernizr test to determine if image elements
     * correctly scale their height when styled with `height: 100%`
     * within a full-height document structure.
     * This helps identify environments where percentage-based height scaling
     * might not behave as expected for images.
     */
    Modernizr.addTest('image-percentage-height-scaling', function() {
        const rootElement = document.documentElement; // Represents <html>
        const contentArea = document.body;            // Represents <body>

        // Store current styles to revert after the test, ensuring no side effects.
        const initialRootHeightStyle = rootElement.style.height;
        const initialBodyHeightStyle = contentArea.style.height;
        const initialBodyOverflowStyle = contentArea.style.overflow;

        // Set up the testing environment: make html and body full height.
        rootElement.style.height = '100%';
        contentArea.style.height = '100%';
        contentArea.style.overflow = 'hidden'; // Prevent scrollbars from influencing height.

        // Create a temporary, invisible container to house the test image.
        // This isolates the test and keeps it from affecting visible layout.
        const isolationWrapper = document.createElement('div');
        isolationWrapper.style.cssText = 'position: absolute; top: 0; left: 0; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none;';
        contentArea.appendChild(isolationWrapper);

        // Create a minimal image element for the test.
        const testPicture = new Image();
        testPicture.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // A 1x1 transparent GIF.
        testPicture.style.height = '100%';
        testPicture.style.display = 'block'; // Ensure block display for accurate height calculation.

        isolationWrapper.appendChild(testPicture);

        let finalTestResult = false;

        try {
            /**
             * Utility to safely parse a numeric value from a computed CSS style.
             * @param {HTMLElement} element - The element to query.
             * @param {string} property - The CSS property name (e.g., 'height').
             * @returns {number} The parsed integer value, or 0 if parsing fails.
             */
            const getComputedPixelValue = (element, property) => {
                const styleValue = window.getComputedStyle(element)[property];
                return parseInt(styleValue, 10) || 0;
            };

            // Compare the computed height of the test image with the viewport height.
            const computedImageHeight = getComputedPixelValue(testPicture, 'height');
            const currentViewportHeight = window.innerHeight;

            finalTestResult = (computedImageHeight === currentViewportHeight);
        } finally {
            // Crucial cleanup: remove test elements and restore original styles.
            if (isolationWrapper.parentNode) {
                isolationWrapper.parentNode.removeChild(isolationWrapper);
            }
            rootElement.style.height = initialRootHeightStyle;
            contentArea.style.height = initialBodyHeightStyle;
            contentArea.style.overflow = initialBodyOverflowStyle;
        }

        return finalTestResult;
    });
}


// =============================================================================
// Part 2: Dynamic Image Layout Adjustment based on Aspect Ratio
// =============================================================================

// Encapsulate the layout logic within an Immediately Invoked Function Expression (IIFE)
// to prevent global scope pollution.
(function() {

    // --- Configuration Constants ---
    // Multiplier for the viewport height, allowing for a margin or header/footer space.
    const VIEWPORT_EFFECTIVE_HEIGHT_MULTIPLIER = 0.9;
    // CSS selector for the containers holding the images to be adjusted.
    const MEDIA_WRAPPER_SELECTOR = '.gallery-item'; // Renamed from '.photo'
    // Class name to apply when an image is determined to be "tall" (portrait-like relative to space).
    const PORTRAIT_CLASS_INDICATOR = 'portrait-mode'; // Renamed from 'tall'
    // Debounce delay for resize/orientation events in milliseconds.
    const LAYOUT_ADJUSTMENT_DEBOUNCE_DELAY = 150;

    // --- Utility Functions ---

    /**
     * Safely retrieves and parses a numeric data attribute from an HTML element.
     * Provides console warnings for missing or invalid attributes.
     * @param {HTMLElement} element - The DOM element to query.
     * @param {string} attributeName - The name of the data attribute (e.g., 'data-original-width').
     * @returns {number|null} The parsed integer value, or `null` if the attribute is missing or invalid.
     */
    function getSafeNumericDataAttribute(element, attributeName) {
        const rawValue = element.getAttribute(attributeName);
        if (rawValue === null || rawValue.trim() === '') {
            console.warn(`Missing or empty required data attribute '${attributeName}' on element:`, element);
            return null;
        }
        const numericVal = parseInt(rawValue, 10);
        if (isNaN(numericVal)) {
            console.warn(`Invalid non-numeric value for data attribute '${attributeName}' on element:`, element, `Value: '${rawValue}'`);
            return null;
        }
        return numericVal;
    }

    /**
     * Debounces a function, ensuring it's only called after a specified delay
     * has passed since the last invocation. Useful for performance-critical
     * events like window resizing.
     * @param {Function} callableFunction - The function to debounce.
     * @param {number} waitDurationMs - The debounce delay in milliseconds.
     * @returns {Function} The debounced version of the function.
     */
    function debounceFunction(callableFunction, waitDurationMs) {
        let timeoutIdentifier;
        return function(...argumentsArray) {
            clearTimeout(timeoutIdentifier);
            timeoutIdentifier = setTimeout(() => callableFunction.apply(this, argumentsArray), waitDurationMs);
        };
    }

    // --- Core Layout Adjustment Logic ---

    /**
     * Iterates through designated media containers, calculates their contained
     * image's aspect ratio against the current viewport's effective aspect ratio,
     * and applies a CSS class accordingly. This class can then be used by CSS
     * to adjust image fitting (e.g., object-fit: contain/cover behavior).
     */
    var updateMediaProportions = function() {
        const allMediaWrappers = document.querySelectorAll(MEDIA_WRAPPER_SELECTOR);

        // Guard clause: If no target elements are found, there's nothing to do.
        if (allMediaWrappers.length === 0) {
            // console.info('No media wrappers found for aspect ratio adjustment.');
            return;
        }

        const currentViewportWidth = window.innerWidth;
        // Calculate an 'effective' viewport height, potentially smaller than actual height.
        const effectiveViewportHeight = window.innerHeight * VIEWPORT_EFFECTIVE_HEIGHT_MULTIPLIER;

        // Guard against division by zero or invalid dimensions.
        if (effectiveViewportHeight <= 0 || currentViewportWidth <= 0) {
            console.warn('Viewport dimensions are invalid (width or effective height is zero/negative), skipping media layout update.');
            return;
        }

        // Determine the aspect ratio of the available display space.
        const displaySpaceRatio = currentViewportWidth / effectiveViewportHeight;

        // Process each media wrapper using a modern forEach loop.
        allMediaWrappers.forEach(function(wrapperElem) {
            // Locate the primary image element within the wrapper.
            const containedImage = wrapperElem.querySelector('img');

            // Validate that an image element actually exists.
            if (!containedImage) {
                console.warn('Skipping media wrapper as no image element was found inside:', wrapperElem);
                return;
            }

            // Retrieve original image dimensions from data attributes.
            const imageOriginalWidth = getSafeNumericDataAttribute(containedImage, 'data-original-width'); // Renamed from 'data-width'
            const imageOriginalHeight = getSafeNumericDataAttribute(containedImage, 'data-original-height'); // Renamed from 'data-height'

            // Validate the retrieved dimensions.
            if (imageOriginalWidth === null || imageOriginalHeight === null || imageOriginalHeight === 0) {
                console.warn('Skipping image due to invalid or zero original dimensions (width/height):', containedImage);
                return;
            }

            // Calculate the intrinsic aspect ratio of the image.
            const imageIntrinsicRatio = imageOriginalWidth / imageOriginalHeight;

            // Determine if the image's intrinsic ratio is 'taller' than the available display space ratio.
            // If true, it means the image is relatively taller and might need special CSS handling (e.g., letterboxing).
            const isImagePortraitLike = (imageIntrinsicRatio < displaySpaceRatio);

            // Toggle the 'portrait-mode' class based on the comparison.
            // This allows CSS to apply different styling rules dynamically.
            wrapperElem.classList.toggle(PORTRAIT_CLASS_INDICATOR, isImagePortraitLike);
        });
    };

    // --- Event Handling and Initialization ---

    // Execute the layout adjustment once the script loads to set initial states.
    updateMediaProportions();

    // Create a debounced version of our layout function to optimize performance
    // during rapid window resizing or device orientation changes.
    const debouncedLayoutUpdater = debounceFunction(updateMediaProportions, LAYOUT_ADJUSTMENT_DEBOUNCE_DELAY);

    // Attach event listeners to trigger layout updates.
    // 'resize' event covers most dynamic size changes, including on desktop.
    // 'orientationchange' specifically targets mobile devices for explicit handling
    // of screen rotation, although 'resize' often fires for it too.
    // Using { passive: true } for performance, indicating the listener won't call preventDefault().
    window.addEventListener('resize', debouncedLayoutUpdater, { passive: true });
    window.addEventListener('orientationchange', debouncedLayoutUpdater, { passive: true });

})();