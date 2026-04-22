"use strict";

// This block ensures our code runs only after the DOM is fully loaded.
// It also provides a local alias '$' for jQuery to prevent conflicts with other libraries.
jQuery(function($) {

    // Define a core configuration object for the slideshow functionality.
    // This allows for easier management and potential externalization of settings.
    const primaryConfiguration = {
        defaultAnimationEffect: 'fade', // Specifies the initial visual transition.
        userNavigationControls: 'arrows', // Defines the type of navigation elements (e.g., 'arrows', 'dots').
        // Future extensions could include: autoPlay: true, slideInterval: 5000, etc.
    };

    // Reference to the main element hosting the image gallery.
    // Using a more descriptive variable name than a generic ID selector directly.
    const $imageGalleryContainer = $('#images');

    // --- Pre-initialization Checks (Type III: Added Guard Clause) ---
    // Validate if the target container for the slideshow actually exists in the DOM.
    if ($imageGalleryContainer.length === 0) {
        console.warn('Initialization Warning: The designated image gallery container (#images) was not found. Slideshow setup aborted.');
        // If the element isn't present, there's no need to proceed further.
        return;
    }

    // Initialize the 'imageCarouselEngine' plugin on the identified container.
    // This is a renamed version of 'refineSlide'.
    $imageGalleryContainer.imageCarouselEngine({
        // Applying initial settings from our configuration object.
        animationMode: primaryConfiguration.defaultAnimationEffect, // Renamed 'transition'.
        navigationType: primaryConfiguration.userNavigationControls, // Renamed 'controls'.

        // The primary callback function executed once the carousel's internal setup is complete.
        // This is a renamed 'onInit' method.
        initializationRoutine: function () {
            // Store a reference to the carousel's internal controller instance for easier access.
            const carouselController = this.controllerReference; // Renamed 'slider'.

            // Select all interactive elements that trigger a change in animation mode.
            // Renamed '$triggers' and '.translist'.
            const $modeSelectionButtons = $('.animationModeSwitchers').find('li > a');

            // --- Helper Function: Update Active State (Type III: Added Helper) ---
            // Encapsulates the logic for setting the 'active' class on a selected button.
            const designateActiveMode = (targetButtonElement) => {
                // Remove 'active' class from all mode selection buttons first.
                $modeSelectionButtons.removeClass('active');
                // Add 'active' class to the currently selected button.
                targetButtonElement.addClass('active');
            };

            // Determine the currently configured animation mode from the carousel's settings.
            const currentActiveMode = carouselController.configOptions.animationMode; // Renamed 'slider.settings['transition']'.

            // Locate the button corresponding to the current active mode.
            // Note: We're using a 'data-animation-key' attribute for cleaner value retrieval (Type III: Updated logic).
            const $initialActiveModeButton = $modeSelectionButtons.filter(`[data-animation-key="${currentActiveMode}"]`);

            // --- Initial Active Button Setup (Type III: Added Fallback Logic) ---
            if ($initialActiveModeButton.length > 0) {
                // If a matching button is found, set it as active.
                designateActiveMode($initialActiveModeButton);
            } else {
                // Fallback: If no specific button matches, activate the very first one.
                console.info(`No specific button found for initial animation mode '${currentActiveMode}'. Activating the first available option.`);
                designateActiveMode($modeSelectionButtons.eq(0));
            }

            // --- Event Listener for Mode Changes ---
            // Attach a click event handler to each mode selection button.
            $modeSelectionButtons.on('click', function (clickEvent) {
                // Prevent the default browser action for anchor tags (e.g., navigating to '#').
                clickEvent.preventDefault();

                const $currentClickedButton = $(this); // Cache the jQuery object for the clicked element.

                // Check if the selected mode is marked as unsupported.
                // Renamed '.unsupported' to '.featureDisabled'.
                const isModeDisabled = $currentClickedButton.children('.featureDisabled').length > 0;

                // --- Conditional Logic for Mode Switching (Type III: Rewritten Condition) ---
                if (!isModeDisabled) {
                    // Update the visual active state.
                    designateActiveMode($currentClickedButton);

                    // Extract the new animation mode from a data attribute.
                    // This replaces the 'attr('href').replace('#_', '')' pattern.
                    const desiredAnimation = $currentClickedButton.data('animation-key'); // Using .data() for data attributes.

                    // Update the carousel's internal configuration with the new mode.
                    carouselController.configOptions.animationMode = desiredAnimation;
                    console.log(`Carousel animation mode successfully updated to: "${desiredAnimation}".`); // Type III: Added console log.
                } else {
                    // Provide feedback if an unsupported mode was clicked.
                    console.warn(`User attempted to select a disabled animation mode: "${$currentClickedButton.data('animation-key') || 'Unknown'}".`);
                }
            });

            // --- Browser Feature Compatibility Validation (Type III: Rewritten Function) ---
            // Helper function to dynamically check and display browser feature support.
            function validateFeatureSupport(featureCheckResult, indicatorLabel) { // Renamed 'support', 'result', 'bobble'.
                // The 'phrase' variable from the original code was unused, so it's removed (Type III: Deleted).

                if (!featureCheckResult) { // If the feature is NOT supported.
                    // Locate the specific indicator element for the unsupported feature.
                    const $featureStatusIndicator = $('#featureStatusDisplay').find(`div.statusIndicator-${indicatorLabel}`); // Renamed '#upper', 'div.bobble-'.

                    if ($featureStatusIndicator.length > 0) {
                        $featureStatusIndicator.addClass('featureDisabled'); // Mark as disabled.
                    }

                    // --- Special Handling for Combined JS/CSS Unsupported State (Type III: Updated Logic) ---
                    // This targets a specific scenario where both JS and CSS features are unsupported together.
                    const $combinedJsCssIndicator = $('#featureStatusDisplay').find('div.statusIndicator-js.statusIndicator-css.featureDisabled');
                    if ($combinedJsCssIndicator.length > 0) {
                        // Remove specific classes and update text to reflect JS-only fallback.
                        $combinedJsCssIndicator
                            .removeClass('statusIndicator-css featureDisabled') // Renamed 'bobble-css unsupported'.
                            .text('JS-Fallback'); // Changed text content for clarity.
                    }
                }
            }

            // Execute the compatibility checks for key carousel features.
            validateFeatureSupport(carouselController.has3DTransforms, '3d'); // Renamed 'cssTransforms3d'.
            validateFeatureSupport(carouselController.hasCSSTransitions, 'css'); // Renamed 'cssTransitions'.

            // Type III: Added an informational log after all initializations.
            console.info('Image carousel successfully initialized and ready for user interaction.');
        } // End of initializationRoutine
    }); // End of imageCarouselEngine initialization
}); // End of jQuery document ready