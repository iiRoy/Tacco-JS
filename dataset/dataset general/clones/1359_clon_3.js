const GALLERY_ELEMENT_ID = '#mainImageGallery';
const MEDIA_FRAME_SELECTOR = '.displayWrapper img';
const INITIAL_OVERLAY_ID = '#initialLoadingScreen';
const IMAGE_FADE_DURATION_MS = 350;
const STAGGER_ANIMATION_INCREMENT_MS = 120;
const RESIZE_DEBOUNCE_TIME_MS = 150;

/**
 * Utility function to perform a Fisher-Yates shuffle on an array.
 * @param {Array} collection - The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function randomizeOrder(collection) {
    let currentIdx = collection.length;
    let randomIdx;

    while (currentIdx !== 0) {
        randomIdx = Math.floor(Math.random() * currentIdx);
        currentIdx--;

        // Swap elements
        [collection[currentIdx], collection[randomIdx]] = [
            collection[randomIdx], collection[currentIdx]];
    }
    return collection;
}

/**
 * Handles the responsive adjustment of image dimensions.
 * This function replaces the original 'flexy' call.
 * It assumes a global 'responsiveImageProcessor' function exists,
 * or provides a basic fallback.
 * @param {HTMLElement} mediaItem - The image element to adjust.
 */
function manageImageScaling(mediaItem) {
    // A Type III clone might add validation or logging.
    if (!$(mediaItem).is('img')) {
        // console.warn('manageImageScaling received a non-image element.');
        return;
    }

    // Attempt to use a more robust, renamed global handler if available.
    if (typeof responsiveImageProcessor === 'function') {
        responsiveImageProcessor(mediaItem);
    } else {
        // Basic illustrative fallback for scaling if the specialized handler is absent.
        $(mediaItem).css({
            'width': '100%',
            'height': 'auto',
            'object-fit': 'contain' // Using 'contain' as an alternative to 'cover'
        });
    }
}

/**
 * Initializes the main image gallery and its loading sequence.
 * This function is called when the DOM is ready.
 */
function setupVisualContentModule() {
    const mainGalleryTarget = $(GALLERY_ELEMENT_ID);

    // Type III: Guard clause to ensure the target element exists.
    if (mainGalleryTarget.length === 0) {
        // console.info('Visual content module target not found. Skipping setup.');
        return;
    }

    // Type III: Using a renamed plugin with additional configuration options.
    mainGalleryTarget.resourcePreloader({ // Renamed 'queryLoader2'
        minimumDisplayTime: 600, // Added new configuration
        overlayColor: '#222222', // Modified configuration
        onAllAssetsReady: function () { // Renamed 'onLoadComplete'
            const framedMediaElements = $(MEDIA_FRAME_SELECTOR);

            // Type III: Iterate using jQuery's .each() on the collection.
            framedMediaElements.each(function() {
                manageImageScaling(this); // Renamed 'flexy' to 'manageImageScaling'
            });

            // Retrieve all images within the main gallery and convert to a plain array.
            const allGalleryImages = mainGalleryTarget.find('img').get();
            const randomizedMediaSequence = randomizeOrder(allGalleryImages); // Renamed 'imagesArray', using helper.

            // Type III: Slightly adjust the loading screen fade-out duration.
            $(INITIAL_OVERLAY_ID).fadeOut(1100, function() { // Renamed 'loading-mask', updated duration.
                 // Ensure the element is completely removed from layout after fading.
                 $(this).css('display', 'none').remove();
            });

            let currentStaggerOffset = 0; // Renamed 'delay'

            // Type III: Using Array.forEach for iteration, and setTimeout for explicit staggering.
            randomizedMediaSequence.forEach((imageElem, index) => {
                setTimeout(() => {
                    $(imageElem).fadeIn(IMAGE_FADE_DURATION_MS);
                }, currentStaggerOffset + (index * STAGGER_ANIMATION_INCREMENT_MS));
                // The staggering is now calculated directly based on index.
            });
            // Type III: Explicit 'return;' is not necessary for callback functions.
        }
    });
}

/**
 * Handles window resize events, debouncing the image adjustment calls.
 */
function handleViewportResizing() {
    // Type III: Implement debouncing for performance optimization on resize events.
    clearTimeout(window.resizeAdjustmentTimer);
    window.resizeAdjustmentTimer = setTimeout(() => {
        const elementsToAdjust = $(MEDIA_FRAME_SELECTOR);
        // Type III: Add a guard clause for element existence.
        if (elementsToAdjust.length > 0) {
            elementsToAdjust.each(function() {
                manageImageScaling(this); // Renamed 'flexy'
            });
        }
    }, RESIZE_DEBOUNCE_TIME_MS);
}

// Type III: Encapsulate main setup within a named function called on document ready.
$(document).ready(function() {
    setupVisualContentModule();
});

// Type III: Use .on() for event binding and a named function for the handler.
$(window).on('resize', handleViewportResizing);