// This JavaScript module implements a flexible content display component for web pages.
// It allows for dynamic presentation of images or other visual elements with various effects.
//
// (c) 2024 by CodeCraft Solutions
// For integration with jQuery library.

(function(jQ) {

    /**
     * Calculates a cyclic index within a given range, handling positive and negative deltas.
     * Ensures the index wraps around correctly.
     * @param {number} currentIdx - The current index.
     * @param {number} stepDelta - The amount to move the index by (can be positive or negative).
     * @param {number} totalItemsCount - The total number of items in the cycle.
     * @returns {number} The new cyclic index.
     */
    function getSafeCyclicIndex(currentIdx, stepDelta, totalItemsCount) {
        if (totalItemsCount <= 0) {
            return 0; // Or throw an error, depending on desired behavior for empty collections.
        }
        let rawNewIndex = (currentIdx + stepDelta) % totalItemsCount;
        return (rawNewIndex < 0) ? (rawNewIndex + totalItemsCount) : rawNewIndex;
    }

    /**
     * jQuery plugin definition for the dynamic content gallery.
     * @param {object} userConfiguration - User-defined settings to override defaults.
     * @returns {jQuery} The jQuery object for chainability.
     */
    jQ.fn.dynamicContentGallery = function(userConfiguration) {

        // If no elements match the selector, log a warning and return to maintain chainability.
        if (this.length === 0) {
            console.warn("Dynamic Content Gallery: No elements found matching the selector. Plugin initialization aborted.");
            return this;
        }

        // Define the default configuration parameters for the gallery.
        const defaultConfiguration = {
            contentScalingMode: "cover", // "cover" (fill container) or "contain" (fit within container)
            elementDisplayWidth: '100%', // CSS width (e.g., '100%', '800px', or null for window width)
            elementDisplayHeight: '100%',// CSS height (e.g., '100%', '600px', or null for window height)
            overlayDesign: "raster",     // Visual texture overlay: "raster", "square", "strip", or "none"
            containerBgColor: "#000000", // Background color for the main gallery wrapper
            autoAdvanceDelayMs: 4000,    // Milliseconds between automatic content changes (0 to disable)
            randomizeContentOrder: false,// If true, content items advance in a random sequence
            showTransition: { effect: 'fade', duration: 1500, queue: false }, // jQuery UI effect for content entry
            hideTransition: { effect: 'fade', duration: 1500, queue: false }, // jQuery UI effect for content exit
            navControlSelectors: { nextButton: '.gallery-nav.next', prevButton: '.gallery-nav.prev' }, // CSS selectors for navigation controls
            overlayAssetPath: './assets/overlays/' // Base directory for overlay pattern images
        };

        // Merge the default settings with the user-provided configuration.
        // A deep merge ensures nested objects (like transition effects) are handled correctly.
        const effectiveGallerySettings = jQ.extend(true, {}, defaultConfiguration, userConfiguration);

        // --- Configuration Validation ---
        // Ensure auto-advance delay is a valid positive number.
        if (typeof effectiveGallerySettings.autoAdvanceDelayMs !== 'number' || effectiveGallerySettings.autoAdvanceDelayMs < 0) {
            console.warn("Dynamic Content Gallery: 'autoAdvanceDelayMs' is invalid. Setting to 0 (auto-advance disabled).");
            effectiveGallerySettings.autoAdvanceDelayMs = 0;
        }

        // Validate the content scaling mode.
        const permittedScalingModes = ['cover', 'contain'];
        if (!permittedScalingModes.includes(effectiveGallerySettings.contentScalingMode)) {
            console.warn(`Dynamic Content Gallery: Invalid 'contentScalingMode': '${effectiveGallerySettings.contentScalingMode}'. Defaulting to 'cover'.`);
            effectiveGallerySettings.contentScalingMode = 'cover';
        }
        // --- End Configuration Validation ---

        // Cache references to frequently used DOM elements.
        const galleryWrapper = this; // The jQuery object representing the gallery container.
        const browserGlobalWindow = jQ(window); // The jQuery object for the global window.

        // Select all direct list item children as individual content panels.
        // Assign a specific class for easier identification and styling.
        const contentPanels = galleryWrapper.find('li').addClass('gallery-content-panel');
        const numberOfPanels = contentPanels.length;

        // --- Internal State Variables ---
        let activePanelIdx = 0; // Index of the currently displayed content panel.
        let autoAdvanceIntervalHandle = null; // Stores the ID returned by setInterval for auto-advancement.
        // --- End Internal State Variables ---

        // Apply initial CSS styles to the main gallery container.
        galleryWrapper
            .addClass('is-dynamic-gallery-active') // Mark the element as an active gallery.
            .css({
                'background-color': effectiveGallerySettings.containerBgColor,
                'overflow': 'hidden', // Crucial to hide parts of images that extend beyond the container.
                'position': 'relative' // Essential for absolute positioning of content panels.
            });

        // Set the visual overlay pattern on a designated mask layer.
        const overlayImageUrl = effectiveGallerySettings.overlayDesign === 'none' ? 'none' :
                                effectiveGallerySettings.overlayAssetPath + effectiveGallerySettings.overlayDesign + '.png';
        galleryWrapper.find('.gallery-mask-layer').css('background-image', overlayImageUrl);

        /**
         * Adjusts the dimensions and position of the image within the currently active content panel.
         * This function ensures images are scaled according to the 'contentScalingMode'.
         */
        const repositionActiveImage = function() {
            // Determine the actual display dimensions of the gallery wrapper.
            const wrapperRenderedWidth = (effectiveGallerySettings.elementDisplayWidth === null) ? browserGlobalWindow.width() : galleryWrapper.width();
            const wrapperRenderedHeight = (effectiveGallerySettings.elementDisplayHeight === null) ? browserGlobalWindow.height() : galleryWrapper.height();

            // If the container has zero dimensions, there's nothing to size against.
            if (wrapperRenderedWidth === 0 || wrapperRenderedHeight === 0) {
                console.debug("Dynamic Content Gallery: Wrapper has zero dimensions, skipping image repositioning.");
                return;
            }

            // Explicitly set the wrapper's dimensions if they were null in settings (window-based).
            galleryWrapper.width(wrapperRenderedWidth);
            galleryWrapper.height(wrapperRenderedHeight);

            const wrapperAspectRatio = wrapperRenderedWidth / wrapperRenderedHeight;

            // Find the <img> element within the currently active panel.
            const imageInFocus = jQ(contentPanels[activePanelIdx]).find("img");

            if (imageInFocus.length === 0) {
                console.warn(`Dynamic Content Gallery: No <img> element found in content panel at index ${activePanelIdx}.`);
                return;
            }

            /**
             * Performs the actual scaling and positioning of the image based on aspect ratios.
             */
            const applyImageScaling = function() {
                const imageNaturalAspectRatio = imageInFocus.width() / imageInFocus.height();

                let newTopOffset = 0;
                let newLeftOffset = 0;

                // Logic to apply 'cover' or 'contain' scaling.
                if ((wrapperAspectRatio < imageNaturalAspectRatio && effectiveGallerySettings.contentScalingMode === 'contain') ||
                    (wrapperAspectRatio >= imageNaturalAspectRatio && effectiveGallerySettings.contentScalingMode === 'cover')) {
                    // Scenario: Image is relatively wider than the container (or container is taller than image).
                    // Scale image to container width, calculate new height, and center vertically.
                    imageInFocus.removeClass('scale-to-height').addClass('scale-to-width');
                    newTopOffset = (wrapperRenderedHeight - wrapperRenderedWidth / imageNaturalAspectRatio) / 2;
                    newLeftOffset = 0;
                } else {
                    // Scenario: Image is relatively taller than the container (or container is wider than image).
                    // Scale image to container height, calculate new width, and center horizontally.
                    imageInFocus.removeClass('scale-to-width').addClass('scale-to-height');
                    newTopOffset = 0;
                    newLeftOffset = (wrapperRenderedWidth - imageNaturalAspectRatio * wrapperRenderedHeight) / 2;
                }

                imageInFocus.css({
                    top: newTopOffset + 'px',
                    left: newLeftOffset + 'px'
                });
            };

            // To reliably get natural image dimensions, the image must be fully loaded.
            // Use a temporary Image object to check load status and trigger scaling.
            const tempImageCheck = new Image();
            tempImageCheck.onload = applyImageScaling;
            tempImageCheck.onerror = function() {
                console.error(`Dynamic Content Gallery: Failed to load image asset: ${imageInFocus.attr('src')}`);
                // Could implement fallback logic here, e.g., advance to next panel.
            };
            tempImageCheck.src = imageInFocus.attr('src'); // Start loading the image.

            // If the image is already in the browser's cache and fully loaded,
            // the `onload` event might not fire. Check `complete` property directly.
            if (imageInFocus[0] && imageInFocus[0].complete) {
                applyImageScaling();
            }
        };

        /**
         * Advances the gallery to the next, previous, or a random content panel.
         * @param {jQuery.Event} [triggeringEvent] - The event object that triggered the advance (e.g., click event).
         *                                           Contains `data.advanceDelta` for step amount.
         */
        const cycleContentPanel = function(triggeringEvent) {
            // If there's only one or no panels, there's nothing to cycle.
            if (numberOfPanels <= 1) {
                console.debug("Dynamic Content Gallery: Only one or no content panels available; skipping cycle operation.");
                return;
            }

            if (triggeringEvent) {
                triggeringEvent.preventDefault(); // Prevent default browser actions for navigation elements.
            }

            let navigationDelta = 1; // Default to advancing by one panel.
            if (triggeringEvent && triggeringEvent.data && triggeringEvent.data.advanceDelta !== undefined) {
                navigationDelta = triggeringEvent.data.advanceDelta;
            }

            let nextPanelIdxToDisplay = activePanelIdx;

            if (effectiveGallerySettings.randomizeContentOrder) {
                // Select a random index that is different from the current one, if possible.
                let candidateIndex;
                do {
                    candidateIndex = Math.floor(Math.random() * numberOfPanels);
                } while (candidateIndex === activePanelIdx && numberOfPanels > 1);
                nextPanelIdxToDisplay = candidateIndex;
            } else {
                // Calculate the next index using the cyclic helper function.
                nextPanelIdxToDisplay = getSafeCyclicIndex(activePanelIdx, navigationDelta, numberOfPanels);
            }

            // Hide the current active panel with its exit animation.
            // `stop(true, true)` clears any ongoing animations and jumps to the end instantly.
            jQ(contentPanels[activePanelIdx]).stop(true, true).hide(effectiveGallerySettings.hideTransition, function() {
                // After hiding, ensure display is set to 'none' to remove it from document flow.
                jQ(this).css('display', 'none');
            });

            activePanelIdx = nextPanelIdxToDisplay; // Update the active index.

            // To accurately calculate image dimensions for the *new* panel, it must be part of the layout flow.
            // We set it to 'block' and 'visibility: hidden' so it's measurable but not yet visible to the user.
            const nextPanelElement = jQ(contentPanels[activePanelIdx]);
            nextPanelElement.css({ display: 'block', visibility: 'hidden' });
            
            // Adjust image dimensions for the newly active panel.
            repositionActiveImage();
            
            // Now, make the panel visible with its entry animation.
            nextPanelElement.css('visibility', 'visible').stop(true, true).show(effectiveGallerySettings.showTransition);

            // If auto-advance is enabled, reset the timer to restart the countdown.
            if (effectiveGallerySettings.autoAdvanceDelayMs > 0) {
                clearInterval(autoAdvanceIntervalHandle); // Clear any existing timer.
                autoAdvanceIntervalHandle = setInterval(cycleContentPanel, effectiveGallerySettings.autoAdvanceDelayMs);
            }
        };

        // --- Initial Gallery Setup ---
        // First, hide all content panels and set their base positioning.
        contentPanels.hide().css({ top: 0, left: 0, position: 'absolute' });
        
        // Explicitly set up and show the first content panel.
        // It's temporarily hidden by 'visibility: hidden' during dimension calculation.
        jQ(contentPanels[activePanelIdx]).css({ display: 'block', visibility: 'hidden' });
        repositionActiveImage(); // Calculate and apply dimensions for the first image.
        jQ(contentPanels[activePanelIdx]).css('visibility', 'visible').show(effectiveGallerySettings.showTransition);
        // --- End Initial Gallery Setup ---

        // --- Event Binding ---
        // Attach click handlers to navigation buttons.
        const nextNavButton = galleryWrapper.find(effectiveGallerySettings.navControlSelectors.nextButton);
        const prevNavButton = galleryWrapper.find(effectiveGallerySettings.navControlSelectors.prevButton);

        if (nextNavButton.length) {
            nextNavButton.on('click', { advanceDelta: 1 }, cycleContentPanel);
        } else {
            console.debug(`Dynamic Content Gallery: Next navigation button selector '${effectiveGallerySettings.navControlSelectors.nextButton}' not found.`);
        }

        if (prevNavButton.length) {
            prevNavButton.on('click', { advanceDelta: -1 }, cycleContentPanel);
        } else {
            console.debug(`Dynamic Content Gallery: Previous navigation button selector '${effectiveGallerySettings.navControlSelectors.prevButton}' not found.`);
        }

        // Initialize auto-advancement if the delay is set.
        if (effectiveGallerySettings.autoAdvanceDelayMs > 0) {
            autoAdvanceIntervalHandle = setInterval(cycleContentPanel, effectiveGallerySettings.autoAdvanceDelayMs);
        }

        // Re-adjust image dimensions whenever the browser window is resized.
        // Trigger immediately once to set up initial dimensions correctly upon plugin load.
        browserGlobalWindow.on('resize.dynamicContentGallery', repositionActiveImage).trigger('resize.dynamicContentGallery');
        // --- End Event Binding ---

        // Store a reference to the gallery instance on the DOM element itself.
        // This allows for external control and a 'destroy' method.
        galleryWrapper.data('dynamicGalleryInstance', {
            currentOptions: effectiveGallerySettings,
            getCurrentPanelIndex: () => activePanelIdx,
            // Method to programmatically jump to a specific panel.
            goToPanel: (targetIndex) => {
                if (targetIndex >= 0 && targetIndex < numberOfPanels && targetIndex !== activePanelIdx) {
                    // Simulate a navigation event with the correct delta.
                    cycleContentPanel({ data: { advanceDelta: targetIndex - activePanelIdx } });
                } else if (targetIndex < 0 || targetIndex >= numberOfPanels) {
                    console.warn(`Dynamic Content Gallery: Invalid panel index '${targetIndex}' requested. Index out of bounds.`);
                }
            },
            // Cleanup method to remove all plugin-related changes and event handlers.
            destroy: () => {
                clearInterval(autoAdvanceIntervalHandle); // Clear auto-advance timer.
                browserGlobalWindow.off('resize.dynamicContentGallery'); // Remove window resize handler.
                galleryWrapper.removeClass('is-dynamic-gallery-active'); // Remove initialization class.
                galleryWrapper.removeData('dynamicGalleryInstance'); // Remove stored instance data.
                
                // Reset styles and classes on content panels.
                contentPanels.css({ display: '', visibility: '', top: '', left: '', position: '' })
                             .removeClass('gallery-content-panel');
                
                // Clear background image from mask layer and reset container styles.
                galleryWrapper.find('.gallery-mask-layer').css('background-image', '');
                galleryWrapper.css({ 'background-color': '', 'overflow': '', 'position': '' });
                
                // Remove event handlers from navigation buttons.
                nextNavButton.off('click');
                prevNavButton.off('click');
                console.log("Dynamic Content Gallery: Plugin instance destroyed.");
            }
        });

        // Return the original jQuery object for method chaining.
        return this;
    };

    // --- Inject basic CSS rules into the document head ---
    // This ensures fundamental styling for the gallery elements is present.
    jQ(document).ready(function() {
        const galleryBaseStyleId = 'dynamic-gallery-core-styles';
        // Prevent injecting styles multiple times if the plugin is called on multiple elements.
        if (!jQ(`#${galleryBaseStyleId}`).length) {
            jQ('<style>')
                .attr('id', galleryBaseStyleId)
                .prop('type', 'text/css')
                .html(`
                    /* Base styles for the dynamic content gallery */
                    .is-dynamic-gallery-active {
                        position: relative; /* Absolutely positioned children require this */
                        overflow: hidden;   /* Clip content that exceeds container bounds */
                    }
                    .gallery-content-panel {
                        position: absolute; /* Allows stacking and animation */
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;   /* Crucial for image scaling to work */
                    }
                    .gallery-content-panel img {
                        position: absolute; /* For precise positioning within its panel */
                        max-width: none;    /* Override default responsive image behavior */
                        max-height: none;   /* Ensure custom scaling takes precedence */
                        display: block;     /* Prevents extra space below images */
                    }
                    .gallery-content-panel img.scale-to-width {
                        width: 100%;
                        height: auto;
                    }
                    .gallery-content-panel img.scale-to-height {
                        height: 100%;
                        width: auto;
                    }
                    .gallery-mask-layer {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none; /* Allows clicks to pass through to elements below */
                        background-repeat: repeat;
                        z-index: 10; /* Ensures the mask is on top of content */
                    }
                `)
                .appendTo('head'); // Add the style block to the document's head.
        }
    });

}(jQuery));