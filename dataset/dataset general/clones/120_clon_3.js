if (typeof jQuery !== 'undefined') {
    // Execute the module's initialization routine once the Document Object Model is fully loaded and parsed.
    jQuery(function($) {
        // Define configuration parameters for the content presentation rotator.
        const presentationConfig = {
            fadeTransitionMs: 580,    // Duration for the visual fade effect in milliseconds.
            autoCycleIntervalMs: 5200, // Time delay between automatic content changes in milliseconds.
            activeContentClass: 'is-currently-displayed', // CSS class for the visible content item.
            hiddenContentClass: 'content-panel-hidden'   // CSS class to visually conceal content items.
        };

        // Locate all individual content units within the primary display component.
        // Expects a parent container with ID 'visual-story-display' and children with class 'story-panel'.
        const $contentUnits = $('#visual-story-display').children('.story-panel');
        let totalContentUnits = $contentUnits.length; // Determine the total count of available content panels.

        // Implement a guard clause: if there's one or zero content units, automatic rotation is not necessary.
        if (totalContentUnits <= 1) {
            // Ensure the single content unit (if present) is visible and marked as active.
            if (totalContentUnits === 1) {
                $contentUnits.first()
                    .removeClass(presentationConfig.hiddenContentClass)
                    .css('opacity', 1)
                    .addClass(presentationConfig.activeContentClass);
            }
            return; // Terminate execution as no further rotation logic is required.
        }

        let currentActiveUnitIndex = 0; // Maintain the zero-based index of the panel currently in view.
        let rotationTimerReference;     // Variable to store the identifier returned by setInterval, for control.

        // Initial state setup: Conceal all content units first, then reveal only the very first one.
        $contentUnits.addClass(presentationConfig.hiddenContentClass).css('opacity', 0); // All hidden and transparent.
        $contentUnits.eq(currentActiveUnitIndex)
            .removeClass(presentationConfig.hiddenContentClass)
            .css('opacity', 1)
            .addClass(presentationConfig.activeContentClass); // First unit visible and active.

        /**
         * Function responsible for orchestrating the transition to the subsequent content unit.
         * It handles fading out the current unit and fading in the next in a sequential manner.
         */
        const advanceContentDisplay = function() {
            // Identify the content unit that is presently visible based on its designated class.
            const $previousVisibleUnit = $contentUnits.filter(`.${presentationConfig.activeContentClass}`);

            // Calculate the index for the next content unit, ensuring a cyclical progression.
            // Utilizes the modulo operator to wrap around to the beginning after the last unit.
            const nextTargetUnitIndex = (currentActiveUnitIndex + 1) % totalContentUnits;

            // Initiate the fade-out animation for the previously active content unit.
            $previousVisibleUnit.animate({ opacity: 0 }, presentationConfig.fadeTransitionMs, function() {
                // Once the fade-out animation completes, remove its active state and hide it completely.
                $(this)
                    .removeClass(presentationConfig.activeContentClass)
                    .addClass(presentationConfig.hiddenContentClass);
            });

            // Update the internal tracker to reflect the new active content unit's index.
            currentActiveUnitIndex = nextTargetUnitIndex;

            // Select the content unit destined to be the next one displayed.
            const $incomingVisibleUnit = $contentUnits.eq(currentActiveUnitIndex);

            // Prepare the incoming unit for animation by removing its hidden class
            // and then initiating its fade-in transition.
            $incomingVisibleUnit
                .removeClass(presentationConfig.hiddenContentClass) // Make it display-block before animating opacity.
                .animate({ opacity: 1 }, presentationConfig.fadeTransitionMs, function() {
                    // After the fade-in animation finishes, apply the active class to the newly visible unit.
                    $(this).addClass(presentationConfig.activeContentClass);
                });
        };

        // Establish the recurring timer to automatically advance the content display at a fixed interval.
        rotationTimerReference = setInterval(advanceContentDisplay, presentationConfig.autoCycleIntervalMs);
    });
}