(function ( domUtil ) {

    // --- Application Configuration and Data Retrieval ---

    // Constants for API interaction and DOM selectors.
    const API_SOURCE_URL = "http://api.dribbble.com/players/johnneiner/shots";
    const API_CALLBACK_PARAM = "callback=?";
    const DISPLAY_ITEMS_LIMIT = 6;
    const PRIMARY_DISPLAY_CONTAINER_ID = "#dribbble-shots";
    const TEMPLATE_RENDER_ELEMENT_ID = "#shot-template";

    // Initiate an asynchronous request to fetch visual content from the Dribbble API.
    // The JSONP method is used due to cross-domain policy.
    domUtil.getJSON(
        `${API_SOURCE_URL}?${API_CALLBACK_PARAM}`, // Dynamically construct the API endpoint.
        { per_page: DISPLAY_ITEMS_LIMIT }, // Request a specific number of items.
        function ( apiResponsePayload ) { // Renamed 'data' to 'apiResponsePayload'.
            // Validate the incoming API response to ensure it contains expected data.
            if ( apiResponsePayload && apiResponsePayload.shots && Array.isArray(apiResponsePayload.shots) ) {

                // If no actual shot data is present, log a warning and exit.
                if (apiResponsePayload.shots.length === 0) {
                    console.warn("Dribbble API returned an empty set of shots.");
                    return;
                }

                // Locate the target container where the content will be appended.
                const targetContentArea = domUtil(PRIMARY_DISPLAY_CONTAINER_ID);
                if (targetContentArea.length === 0) {
                    console.error(`Error: The target container '${PRIMARY_DISPLAY_CONTAINER_ID}' was not found in the DOM.`);
                    return; // Abort if the container doesn't exist.
                }

                // Utilize a client-side templating engine to render the fetched shot data,
                // then insert the generated HTML into the designated display area.
                domUtil(TEMPLATE_RENDER_ELEMENT_ID)
                    .tmpl( apiResponsePayload.shots ) // Pass the array of shot objects to the template.
                    .appendTo( targetContentArea ); // Attach the rendered content to the DOM.

            } else {
                console.error("Dribbble API response was invalid or lacked the expected 'shots' array.", apiResponsePayload);
            }
        }
    );

    // --- Interactive Hover Effects Demonstrations ---
    /*
     * The following functions illustrate various techniques for implementing
     * hover-based interactions on list items. Each subsequent function
     * refines the interaction, addressing common UI challenges such as
     * animation queuing, incomplete animations, and responsive timing.
     *
     * These examples progressively introduce more sophisticated control,
     * culminating in the use of the 'doTimeout' plugin for debouncing
     * and advanced state management.
     */

    /**
     * Helper function to consistently select the overlay label within a list item.
     * Assumes the label is a child element with the class 'item-overlay'.
     * @param {jQuery} parentElement The jQuery object representing the list item.
     * @returns {jQuery} The jQuery object for the label element.
     */
    const retrieveItemLabel = (parentElement) => parentElement.find(".item-overlay"); // Renamed 'div' to a more semantic class.

    /**
     * Interaction Model 1: Elementary Fade In/Out
     * This is a straightforward implementation where a label fades in on mouse entry
     * and fades out on mouse exit. This approach is prone to animation queuing issues
     * if the user moves the pointer quickly across multiple elements.
     */
    function basicLabelVisibility() {
        const itemLayoutContainer = domUtil(PRIMARY_DISPLAY_CONTAINER_ID);
        if (itemLayoutContainer.length === 0) return; // Ensure container exists.

        const ANIM_DURATION_MS = 250; // Milliseconds for animation.

        itemLayoutContainer.on( // Using .on() for modern event delegation.
            "mouseenter",
            "li", // Event delegated to 'li' elements.
            function ( eventContext ) { // Renamed 'e' to 'eventContext'.
                const hoveredListElement = domUtil( this ); // Cache the current element.
                retrieveItemLabel(hoveredListElement).fadeIn( ANIM_DURATION_MS );
                // console.log("Basic hover: Mouse entered item.");
            }
        );

        itemLayoutContainer.on(
            "mouseleave",
            "li",
            function ( eventContext ) {
                const hoveredListElement = domUtil( this );
                retrieveItemLabel(hoveredListElement).fadeOut( ANIM_DURATION_MS );
                // console.log("Basic hover: Mouse left item.");
            }
        );
    }

    /**
     * Interaction Model 2: Preventing Animation Queue Buildup
     * This version improves upon the basic model by calling `.stop(true, false)`
     * before starting a new animation. This immediately halts any current animation
     * on the target element and prevents new animations from queuing up.
     * The `false` argument means the animation does *not* jump to its end state.
     */
    function controlledAnimationHover() {
        const displayGridArea = domUtil(PRIMARY_DISPLAY_CONTAINER_ID);
        if (displayGridArea.length === 0) return;

        const FAST_ANIM_MS = 180; // Slightly faster animation duration.

        displayGridArea.on(
            "mouseenter",
            "li",
            function ( interactionEvent ) {
                const currentHoverTarget = domUtil( this );
                // Stop any current animation, clear queue, but don't jump to end.
                retrieveItemLabel(currentHoverTarget).stop( true, false ).fadeIn( FAST_ANIM_MS );
                // console.log("Controlled hover: Mouse entered item, stopped previous.");
            }
        );

        displayGridArea.on(
            "mouseleave",
            "li",
            function ( interactionEvent ) {
                const currentHoverTarget = domUtil( this );
                retrieveItemLabel(currentHoverTarget).fadeOut( FAST_ANIM_MS );
                // console.log("Controlled hover: Mouse left item.");
            }
        );
    }

    /**
     * Interaction Model 3: Guaranteeing Full Opacity on Fade-In
     * This approach addresses a potential issue where `fadeIn` might not reach
     * 100% opacity if `stop()` is called mid-animation. By using `fadeTo(duration, 1.0)`,
     * we explicitly ensure the element reaches full opacity. The `stop(true, true)`
     * call also forces the current animation to complete before starting a new one.
     */
    function guaranteedOpacityHover() {
        const contentPresentationArea = domUtil(PRIMARY_DISPLAY_CONTAINER_ID);
        if (contentPresentationArea.length === 0) return;

        const DEFAULT_ANIM_MS = 220; // Standard animation duration.

        contentPresentationArea.on(
            "mouseenter",
            "li",
            function ( evtObj ) {
                const activeItem = domUtil( this );
                // Stop current animation, clear queue, and jump to the end of the previous animation.
                retrieveItemLabel(activeItem).stop( true, true ).fadeTo( DEFAULT_ANIM_MS, 1.0 );
                // console.log("Guaranteed opacity hover: Mouse entered item.");
            }
        );

        contentPresentationArea.on(
            "mouseleave",
            "li",
            function ( evtObj ) {
                const activeItem = domUtil( this );
                retrieveItemLabel(activeItem).fadeOut( DEFAULT_ANIM_MS );
                // console.log("Guaranteed opacity hover: Mouse left item.");
            }
        );
    }

    /**
     * Interaction Model 4: Debounced Hover with Element-Scoped `doTimeout`
     * This method introduces a delay (debouncing) for both mouse entry and exit,
     * mimicking a "hoverIntent" plugin's behavior. `doTimeout` is used on the
     * specific jQuery element, meaning each list item manages its own timers
     * independently.
     */
    function delayedHoverActivation() {
        const interactiveDisplayArea = domUtil(PRIMARY_DISPLAY_CONTAINER_ID);
        if (interactiveDisplayArea.length === 0) return;
        // Verify the doTimeout plugin is available on jQuery elements.
        if (!domUtil.fn.doTimeout) {
            console.error("The 'doTimeout' plugin (element-scoped) is required for delayedHoverActivation.");
            return;
        }

        const ENTRY_DELAY_MS = 500; // Time pointer must dwell before activation.
        const EXIT_DELAY_MS = 500;  // Time pointer must be off before deactivation.
        const ANIMATION_FX_MS = 180; // Duration for fade effects.

        interactiveDisplayArea.on(
            "mouseenter",
            "li",
            function ( inputEvent ) {
                const currentVisualItem = domUtil( this );
                const itemOverlayLabel = retrieveItemLabel(currentVisualItem);

                // Clear any pending 'leave' timeout specific to this item.
                currentVisualItem.doTimeout( "itemLeaveTimer" );

                // Set a new 'enter' timeout.
                currentVisualItem.doTimeout( "itemEnterTimer", ENTRY_DELAY_MS, () => {
                    itemOverlayLabel.fadeTo( ANIMATION_FX_MS, 1.0 );
                    // console.log("Delayed hover: Item activated after dwell.");
                });
            }
        );

        interactiveDisplayArea.on(
            "mouseleave",
            "li",
            function ( inputEvent ) {
                const currentVisualItem = domUtil( this );
                const itemOverlayLabel = retrieveItemLabel(currentVisualItem);

                // Clear any pending 'enter' timeout specific to this item.
                currentVisualItem.doTimeout( "itemEnterTimer" );

                // Set a new 'leave' timeout.
                currentVisualItem.doTimeout( "itemLeaveTimer", EXIT_DELAY_MS, () => {
                    // Stop any ongoing animation, clear queue, but don't jump to end.
                    itemOverlayLabel.stop( true, false ).fadeOut( ANIMATION_FX_MS );
                    // console.log("Delayed hover: Item deactivated after delay.");
                });
            }
        );
    }

    /**
     * Interaction Model 5: Advanced Adaptive Hover with Global `doTimeout`
     * This is the most refined model, utilizing a shared global `doTimeout` timer.
     * It enables sophisticated transitions when moving rapidly between items,
     * instantly hiding the previous label and showing the new one after a short delay,
     * while still respecting the initial dwell time for the first hover.
     */
    function sophisticatedAdaptiveHover() {
        const presentationLayout = domUtil(PRIMARY_DISPLAY_CONTAINER_ID);
        if (presentationLayout.length === 0) return;
        // Verify the global doTimeout plugin is available.
        if (!domUtil.doTimeout) {
            console.error("The global 'doTimeout' plugin is required for sophisticatedAdaptiveHover.");
            return;
        }

        let lastActiveElement = null; // Keeps track of the last list item that was considered "active" (hovered).
        let isAnyElementActive = false; // A global flag indicating if any item is currently in an "active" hover state.

        const INITIAL_DWELL_TIME = 550; // The time required for the *first* hover to activate.
        const RAPID_TRANSITION_DELAY = 0; // Delay for label appearance when moving between active items.
        const FADE_IN_DURATION = 200; // Standard fade-in duration.
        const FADE_OUT_DURATION = 250; // Standard fade-out duration.
        const GLOBAL_TIMEOUT_KEY_ENTER = "globalHoverActivate"; // Key for global enter timer.
        const GLOBAL_TIMEOUT_KEY_LEAVE = "globalHoverDeactivate"; // Key for global leave timer.

        presentationLayout.on(
            "mouseenter",
            "li",
            function ( mouseEvent ) {
                const currentItemNode = this; // Raw DOM element for comparison.
                const currentItemWrapper = domUtil(currentItemNode);
                const currentItemLabel = retrieveItemLabel(currentItemWrapper);
                let activationMoment = 0; // Determines how quickly the new label appears.

                // Scenario 1: Re-entering the *same* already active element.
                // In this case, simply cancel any pending global 'leave' timer.
                if (lastActiveElement === currentItemNode && isAnyElementActive) {
                    domUtil.doTimeout( GLOBAL_TIMEOUT_KEY_LEAVE );
                    return; // No further action needed as the item is already active.
                }

                // Scenario 2: Moving from one active element to another.
                // Immediately hide the previous label and set a quick activation for the new one.
                if (isAnyElementActive) {
                    // Force the immediate execution of the global leave timer's callback.
                    // This ensures the previous label fades out instantly.
                    domUtil.doTimeout( GLOBAL_TIMEOUT_KEY_LEAVE, true );
                    activationMoment = RAPID_TRANSITION_DELAY; // New label appears almost instantly.
                } else {
                    // Scenario 3: First hover or re-entering after a global 'leave'.
                    // Clear any lingering global leave timer and apply the full dwell time.
                    domUtil.doTimeout( GLOBAL_TIMEOUT_KEY_LEAVE );
                    activationMoment = INITIAL_DWELL_TIME; // Full delay before activation.
                }

                // Set a global 'enter' timeout with the determined activation delay.
                domUtil.doTimeout( GLOBAL_TIMEOUT_KEY_ENTER, activationMoment, () => {
                    isAnyElementActive = true; // Mark global state as active.
                    lastActiveElement = currentItemNode; // Update reference to the currently active element.
                    currentItemLabel.fadeTo( FADE_IN_DURATION, 1.0 ); // Ensure full opacity.
                    // console.log(`Adaptive hover: Item activated after ${activationMoment}ms.`);
                });
            }
        );

        presentationLayout.on(
            "mouseleave",
            "li",
            function ( mouseEvent ) {
                const currentItemWrapper = domUtil( this );
                const currentItemLabel = retrieveItemLabel(currentItemWrapper);

                // Clear any pending global 'enter' timeout.
                domUtil.doTimeout( GLOBAL_TIMEOUT_KEY_ENTER );

                // Set a global 'leave' timeout. If the user quickly hovers another item,
                // this timer will be cleared by the next 'mouseenter' event.
                domUtil.doTimeout( GLOBAL_TIMEOUT_KEY_LEAVE, INITIAL_DWELL_TIME, () => {
                    isAnyElementActive = false; // Global state is no longer active.
                    lastActiveElement = null; // Clear the reference to the last active element.
                    // Stop any ongoing animation, clear queue, but don't jump to end.
                    currentItemLabel.stop( true, false ).fadeOut( FADE_OUT_DURATION );
                    // console.log(`Adaptive hover: Item deactivated after ${INITIAL_DWELL_TIME}ms.`);
                });
            }
        );
    }

    // --- Activation of Chosen Interaction Model ---
    // Uncomment only one function call below to activate a specific hover behavior.
    // Each represents a different stage of refinement in handling interactive elements.

    // basicLabelVisibility();
    // controlledAnimationHover();
    // guaranteedOpacityHover();
    // delayedHoverActivation();
    sophisticatedAdaptiveHover(); // The most advanced and recommended interaction.

}( jQuery )); // The global jQuery object is passed as 'domUtil' for local scope.