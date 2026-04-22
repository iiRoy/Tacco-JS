const SceneNavigator = (function() {

    // Internal state management for the scene display system
    let registeredScenes = new Map();         // Map to store jQuery references of all navigable scene elements by ID
    let isTransitionLocked = false;           // Flag to prevent concurrent scene transitions
    let activeScene = null;                   // Reference to the currently displayed scene element (jQuery object)
    let pendingSceneChange = null;            // Holds options for a subsequent transition to be chained

    // Default configuration for scene transition effects and timings
    let defaultEntryEffect = 'fade';          // Default incoming animation type
    let defaultExitEffect = 'fade';           // Default outgoing animation type
    let defaultEntryDuration = 500;           // Default duration for incoming animations (ms)
    let defaultExitDuration = 500;            // Default duration for outgoing animations (ms)
    let defaultTransitionDelay = false;       // If true, exit animation completes before entry animation starts
    let defaultVerticalOffset = 100;          // Pixel buffer for vertical scene positioning during animation
    let defaultHorizontalOffset = 100;        // Pixel buffer for horizontal scene positioning during animation
    let defaultScrollDuration = 300;          // Time (ms) to scroll to the page top before a scene transition

    // Collection of all recognized animation commands
    const supportedEffects = new Set([
        'fade', 'fadetop', 'fadetopright', 'faderight', 'fadebottomright',
        'fadebottom', 'fadebottomleft', 'fadeleft', 'fadetopleft',
        'top', 'topright', 'right', 'bottomright', 'bottom',
        'bottomleft', 'left', 'topleft'
    ]);

    /**
     * Initializes the Scene Navigator, discovers scenes, and sets up event listeners.
     * @param {Object} userOptions - Optional configuration object to override defaults.
     */
    const initializeViews = function(userOptions) {
        const sceneElements = $('div.scene-wrapper');

        // Enforce minimum scene count for functionality
        if (sceneElements.length < 2) {
            console.warn('SceneNavigator: At least two elements with class "scene-wrapper" are required.');
            return;
        }

        // Identify and set the initial active scene
        let initialActive = $('div.scene-wrapper.scene-active-initial');

        if (initialActive.length === 0) {
            // If no explicit initial scene, designate the first one
            initialActive = $(sceneElements[0]);
            initialActive.addClass('scene-active-initial');
        } else if (initialActive.length > 1) {
            // If multiple initial scenes, prioritize the first and deactivate others
            initialActive = $(initialActive[0]);
            $('div.scene-wrapper.scene-active-initial').not(initialActive).removeClass('scene-active-initial');
        }

        activeScene = initialActive; // Set the determined active scene

        // Store all found scenes for later lookup
        cacheSceneElements(sceneElements);

        // Apply any user-defined default settings
        applyInitialSettings(userOptions);

        // Prepare for navigation: unlock and bind event handlers
        isTransitionLocked = false;
        pendingSceneChange = null;
        bindNavigationEvents();
    };

    /**
     * Attaches click event handlers to all designated navigation triggers.
     * Uses event delegation on the document for efficiency.
     */
    const bindNavigationEvents = function() {
        $(document).on('click', '.scene-link-trigger', function(event) {
            event.preventDefault(); // Prevent default browser link behavior

            const clickedElement = $(this);
            const transitionOptions = {
                targetId: clickedElement.data('scene-target'),
                animationCommand: clickedElement.data('scene-animation'),
                entryAnimation: clickedElement.data('scene-entry-animation'),
                exitAnimation: clickedElement.data('scene-exit-animation'),
                animationDuration: clickedElement.data('scene-duration'),
                entryDuration: clickedElement.data('scene-entry-duration'),
                exitDuration: clickedElement.data('scene-exit-duration'),
                transitionDelay: clickedElement.data('scene-delay'),
                overallDistance: clickedElement.data('scene-distance'),
                verticalDistance: clickedElement.data('scene-vertical-distance'),
                horizontalDistance: clickedElement.data('scene-horizontal-distance'),
                scrollDelay: clickedElement.data('scene-scroll-duration')
            };

            transitionToScene(transitionOptions);
        });
    };

    /**
     * Public method to initiate a scene transition.
     * @param {Object} options - Parameters for the desired scene transition.
     * @returns {boolean} True if the transition was successfully initiated, false otherwise.
     */
    const transitionToScene = function(options) {
        if (isTransitionLocked) {
            console.log('SceneNavigator: A transition is already active, ignoring new request.');
            return false;
        }

        // Validate the target scene identifier
        const targetId = options.targetId;
        if (!targetId || typeof targetId !== 'string') {
            console.error('SceneNavigator: Invalid or missing targetId in transition options.');
            return false;
        }

        const nextScene = retrieveSceneElement(targetId);
        if (!nextScene) {
            console.warn(`SceneNavigator: Target scene with ID "${targetId}" was not found.`);
            return false;
        }

        // Avoid transitioning to the scene that is already active
        if (activeScene && nextScene[0] === activeScene[0]) {
            console.info(`SceneNavigator: Target scene "${targetId}" is already the active scene.`);
            return false;
        }

        isTransitionLocked = true; // Engage the transition lock

        // Check for and store any chained transition requests
        pendingSceneChange = (typeof options.chainNextTransition === 'object' && options.chainNextTransition !== null)
            ? options.chainNextTransition
            : null;

        // Consolidate transition options, prioritizing specific settings over general ones
        const resolvedOptions = { ...options }; // Create a shallow copy
        resolvedOptions.exitAnimation = resolvedOptions.exitAnimation || resolvedOptions.animationCommand;
        resolvedOptions.entryAnimation = resolvedOptions.entryAnimation || resolvedOptions.animationCommand;
        resolvedOptions.exitDuration = resolvedOptions.exitDuration || resolvedOptions.animationDuration;
        resolvedOptions.entryDuration = resolvedOptions.entryDuration || resolvedOptions.animationDuration;
        resolvedOptions.verticalDistance = resolvedOptions.verticalDistance || resolvedOptions.overallDistance;
        resolvedOptions.horizontalDistance = resolvedOptions.horizontalDistance || resolvedOptions.overallDistance;

        // Scroll to the top of the page before animation for a smoother experience
        if ($(document).scrollTop() > 0) {
            $('html, body').animate({ scrollTop: 0 }, resolveDuration(resolvedOptions.scrollDelay, 'scroll'), () => {
                performViewAnimation(
                    activeScene, nextScene,
                    resolvedOptions.entryAnimation, resolvedOptions.entryDuration,
                    resolvedOptions.exitAnimation, resolvedOptions.exitDuration,
                    resolvedOptions.transitionDelay,
                    resolvedOptions.verticalDistance, resolvedOptions.horizontalDistance
                );
            });
        } else {
            // If already at top, proceed directly to scene animation
            performViewAnimation(
                activeScene, nextScene,
                resolvedOptions.entryAnimation, resolvedOptions.entryDuration,
                resolvedOptions.exitAnimation, resolvedOptions.exitDuration,
                resolvedOptions.transitionDelay,
                resolvedOptions.verticalDistance, resolvedOptions.horizontalDistance
            );
        }

        activeScene = nextScene; // Update the reference to the new active scene
        return true;
    };

    /**
     * Parses and resolves an animation duration, falling back to a default if invalid.
     * @param {string|number} timeInput - The duration value provided (e.g., from data attribute).
     * @param {string} type - Context for default lookup ('entry', 'exit', 'scroll').
     * @returns {number} The resolved animation duration in milliseconds.
     */
    const resolveDuration = function(timeInput, type) {
        let parsedDuration = parseInt(timeInput, 10);
        if (Number.isInteger(parsedDuration) && parsedDuration >= 0) {
            return parsedDuration;
        }
        return getDefaultEffectDuration(type); // Use a default if input is not a valid non-negative integer
    };

    /**
     * Populates the internal map with all discovered scene elements, indexed by their ID.
     * @param {jQuery} elementsToCache - A jQuery collection of scene container elements.
     */
    const cacheSceneElements = function(elementsToCache) {
        registeredScenes.clear(); // Clear any previously cached scenes
        elementsToCache.each(function() {
            const sceneId = $(this).attr('id');
            if (sceneId) {
                registeredScenes.set(sceneId, this);
            } else {
                console.warn('SceneNavigator: Encountered a scene-wrapper element without an ID. It will not be navigable.');
            }
        });
    };

    /**
     * Retrieves a scene element from the cache by its unique ID.
     * @param {string} sceneId - The ID of the desired scene.
     * @returns {jQuery|null} A jQuery object representing the scene, or null if not found.
     */
    const retrieveSceneElement = function(sceneId) {
        if (typeof sceneId === 'string' && registeredScenes.has(sceneId)) {
            return $(registeredScenes.get(sceneId));
        }
        return null;
    };

    /**
     * Orchestrates the visual animation sequence between the exiting and entering scenes.
     * @param {jQuery} currentView - The scene currently visible.
     * @param {jQuery} targetView - The scene to become visible.
     * @param {string} entryEffectStr - Raw command for the entry animation.
     * @param {string|number} entryTimeStr - Raw duration for the entry animation.
     * @param {string} exitEffectStr - Raw command for the exit animation.
     * @param {string|number} exitTimeStr - Raw duration for the exit animation.
     * @param {boolean|string} delaySetting - Specifies if animations should be sequential (true) or parallel (false).
     * @param {string|number} vBuffer - Vertical distance buffer for animation calculation.
     * @param {string|number} hBuffer - Horizontal distance buffer for animation calculation.
     */
    const performViewAnimation = function(currentView, targetView, entryEffectStr, entryTimeStr, exitEffectStr, exitTimeStr, delaySetting, vBuffer, hBuffer) {
        // Validate or default animation command strings
        const resolvedEntryEffect = validateTransitionString(entryEffectStr) ? entryEffectStr : getDefaultEffectName('entry');
        const resolvedExitEffect = validateTransitionString(exitEffectStr) ? exitEffectStr : getDefaultEffectName('exit');

        const isEntryFaded = resolvedEntryEffect.startsWith('fade');
        const isExitFaded = resolvedExitEffect.startsWith('fade');

        // Extract the base directional command (e.g., 'fadetop' becomes 'top')
        const cleanEntryEffect = isEntryFaded ? resolvedEntryEffect.substring(4) : resolvedEntryEffect;
        const cleanExitEffect = isExitFaded ? resolvedExitEffect.substring(4) : resolvedExitEffect;

        // Gather scene dimensions for movement calculations
        const viewDimensions = {
            currentH: currentView.outerHeight(),
            targetH: targetView.outerHeight(),
            currentW: currentView.outerWidth(),
            targetW: targetView.outerWidth()
        };

        // Calculate the exact pixel offsets for animation starts and ends
        const movementVectors = calculateMovementVectors(
            viewDimensions.currentH, viewDimensions.targetH,
            viewDimensions.currentW, viewDimensions.targetW,
            cleanEntryEffect, cleanExitEffect,
            vBuffer, hBuffer
        );

        // Generate the full set of CSS properties for both scenes' animations
        const targetElementStyles = getEntryStyles(movementVectors.enter.x, movementVectors.enter.y, isEntryFaded);
        const currentElementStyles = getExitStyles(movementVectors.exit.x, movementVectors.exit.y, isExitFaded);

        // Determine if animations should run sequentially (exit then entry) or in parallel
        let useSequentialDelay = getDefaultTransitionDelay(); // Start with default
        if (typeof delaySetting === 'boolean') {
            useSequentialDelay = delaySetting;
        } else if (typeof delaySetting === 'string') {
            const lowerCaseDelay = delaySetting.toLowerCase();
            if (lowerCaseDelay === 'true') useSequentialDelay = true;
            else if (lowerCaseDelay === 'false') useSequentialDelay = false;
        }

        if (useSequentialDelay) {
            applyExitAnimation(currentView, currentElementStyles, exitTimeStr, true, targetView, targetElementStyles, entryTimeStr);
        } else {
            applyExitAnimation(currentView, currentElementStyles, exitTimeStr, false);
            applyEntryAnimation(targetView, targetElementStyles, entryTimeStr);
        }
    };

    /**
     * Executes the animation for the scene that is leaving the view.
     * @param {jQuery} exitingView - The scene element that is exiting.
     * @param {Object} styles - Object containing initial, final, and cleanup CSS properties.
     * @param {string|number} durationStr - Duration of this exit animation.
     * @param {boolean} sequential - If true, the entry animation is called upon completion.
     * @param {jQuery} [enteringView] - The scene element that is entering (required if sequential).
     * @param {Object} [enteringStyles] - Styles for the entering scene (required if sequential).
     * @param {string|number} [enteringDurationStr] - Duration for the entering scene (required if sequential).
     */
    const applyExitAnimation = function(exitingView, styles, durationStr, sequential, enteringView, enteringStyles, enteringDurationStr) {
        exitingView.css(styles.initial).animate(styles.final, resolveDuration(durationStr, 'exit'), () => {
            exitingView.css(styles.cleanup); // Apply final cleanup styles (e.g., display: 'none')
            if (sequential) {
                applyEntryAnimation(enteringView, enteringStyles, enteringDurationStr);
            }
        });
    };

    /**
     * Executes the animation for the scene that is entering the view.
     * @param {jQuery} enteringView - The scene element that is entering.
     * @param {Object} styles - Object containing initial, final, and cleanup CSS properties.
     * @param {string|number} durationStr - Duration of this entry animation.
     */
    const applyEntryAnimation = function(enteringView, styles, durationStr) {
        enteringView.css(styles.initial).animate(styles.final, resolveDuration(durationStr, 'entry'), () => {
            enteringView.css(styles.cleanup); // Apply final cleanup styles
            isTransitionLocked = false; // Release the transition lock

            // If a chained transition was queued, initiate it now
            if (pendingSceneChange) {
                const queuedOptions = pendingSceneChange;
                pendingSceneChange = null; // Clear the queue
                transitionToScene(queuedOptions);
            }
        });
    };

    /**
     * Calculates the pixel offsets (X and Y) for both the entering and exiting scenes.
     * @param {number} currentHeight - Outer height of the current scene.
     * @param {number} targetHeight - Outer height of the target scene.
     * @param {number} currentWidth - Outer width of the current scene.
     * @param {number} targetWidth - Outer width of the target scene.
     * @param {string} entryEffect - Cleaned command for the entering animation.
     * @param {string} exitEffect - Cleaned command for the exiting animation.
     * @param {string|number} vBuffer - Vertical buffer value (pixels).
     * @param {string|number} hBuffer - Horizontal buffer value (pixels).
     * @returns {Object} An object containing 'enter' and 'exit' movement vectors (x, y).
     */
    const calculateMovementVectors = function(currentHeight, targetHeight, currentWidth, targetWidth, entryEffect, exitEffect, vBuffer, hBuffer) {
        const verticalBuffer = isPositiveInteger(vBuffer) ? parseInt(vBuffer, 10) : getDefaultBoundaryOffset('vertical');
        const horizontalBuffer = isPositiveInteger(hBuffer) ? parseInt(hBuffer, 10) : getDefaultBoundaryOffset('horizontal');

        const movements = {
            enter: { x: 0, y: 0 },
            exit: { x: 0, y: 0 }
        };

        const windowHeight = $(window).height();
        const windowWidth = $(window).width();

        // Determine initial position for the entering scene
        switch (entryEffect) {
            case 'top':        movements.enter.y = -targetHeight - verticalBuffer; break;
            case 'bottom':     movements.enter.y = windowHeight + verticalBuffer; break;
            case 'left':       movements.enter.x = -targetWidth - horizontalBuffer; break;
            case 'right':      movements.enter.x = windowWidth + horizontalBuffer; break;
            case 'topright':   movements.enter.y = -targetHeight - verticalBuffer; movements.enter.x = windowWidth + horizontalBuffer; break;
            case 'bottomright':movements.enter.y = windowHeight + verticalBuffer; movements.enter.x = windowWidth + horizontalBuffer; break;
            case 'bottomleft': movements.enter.y = windowHeight + verticalBuffer; movements.enter.x = -targetWidth - horizontalBuffer; break;
            case 'topleft':    movements.enter.y = -targetHeight - verticalBuffer; movements.enter.x = -targetWidth - horizontalBuffer; break;
            default: /* No movement for 'fade' or no specific direction */ break;
        }

        // Determine final position for the exiting scene
        switch (exitEffect) {
            case 'top':        movements.exit.y = -currentHeight - verticalBuffer; break;
            case 'bottom':     movements.exit.y = windowHeight + verticalBuffer; break;
            case 'left':       movements.exit.x = -currentWidth - horizontalBuffer; break;
            case 'right':      movements.exit.x = windowWidth + horizontalBuffer; break;
            case 'topright':   movements.exit.y = -currentHeight - verticalBuffer; movements.exit.x = windowWidth + horizontalBuffer; break;
            case 'bottomright':movements.exit.y = windowHeight + verticalBuffer; movements.exit.x = windowWidth + horizontalBuffer; break;
            case 'bottomleft': movements.exit.y = windowHeight + verticalBuffer; movements.exit.x = -currentWidth - horizontalBuffer; break;
            case 'topleft':    movements.exit.y = -currentHeight - verticalBuffer; movements.exit.x = -currentWidth - horizontalBuffer; break;
            default: /* No movement for 'fade' or no specific direction */ break;
        }

        return movements;
    };

    /**
     * Generates the set of CSS properties for an entering scene's animation.
     * @param {number} xOffset - The initial X position (left offset).
     * @param {number} yOffset - The initial Y position (top offset).
     * @param {boolean} isFaded - True if the animation includes an opacity fade.
     * @returns {Object} An object with 'initial', 'final', and 'cleanup' CSS property sets.
     */
    const getEntryStyles = function(xOffset, yOffset, isFaded) {
        const initialStyles = {
            position: 'absolute',
            top: `${yOffset}px`,
            left: `${xOffset}px`,
            display: 'block', // Ensure visibility during animation
            opacity: isFaded ? 0 : 1,
            zIndex: 10 // Place above the exiting scene
        };
        const finalStyles = {
            top: '0px',
            left: '0px',
            opacity: 1
        };
        const cleanupStyles = {
            position: '', top: '', left: '', opacity: '', display: '', zIndex: ''
        };
        return { initial: initialStyles, final: finalStyles, cleanup: cleanupStyles };
    };

    /**
     * Generates the set of CSS properties for an exiting scene's animation.
     * @param {number} xOffset - The final X position (left offset).
     * @param {number} yOffset - The final Y position (top offset).
     * @param {boolean} isFaded - True if the animation includes an opacity fade.
     * @returns {Object} An object with 'initial', 'final', and 'cleanup' CSS property sets.
     */
    const getExitStyles = function(xOffset, yOffset, isFaded) {
        const initialStyles = {
            position: 'absolute',
            top: '0px',
            left: '0px',
            display: 'block', // Ensure visibility during animation
            opacity: 1,
            zIndex: 5 // Place below the entering scene
        };
        const finalStyles = {
            top: `${yOffset}px`,
            left: `${xOffset}px`,
            opacity: isFaded ? 0 : 1
        };
        const cleanupStyles = {
            position: '', top: '', left: '', opacity: '', display: 'none', zIndex: '' // Hide completely after animation
        };
        return { initial: initialStyles, final: finalStyles, cleanup: cleanupStyles };
    };

    /**
     * Checks if a given command string is a recognized animation effect.
     * @param {string} command - The animation command string to validate.
     * @returns {boolean} True if the command is supported, false otherwise.
     */
    const validateTransitionString = function(command) {
        return typeof command === 'string' && supportedEffects.has(command.toLowerCase());
    };

    /**
     * Determines if a value can be parsed as a non-negative integer.
     * @param {*} value - The value to test.
     * @returns {boolean} True if it's a valid non-negative integer, false otherwise.
     */
    const isPositiveInteger = function(value) {
        const num = Number(value);
        return Number.isInteger(num) && num >= 0;
    };

    /**
     * Applies user-provided settings to override the default configuration.
     * @param {Object} options - An object containing settings to be applied.
     */
    const applyInitialSettings = function(options) {
        if (!options || typeof options !== 'object') {
            return; // No valid options object provided
        }

        defaultEntryEffect = options.defaultEntryEffect || defaultEntryEffect;
        defaultExitEffect = options.defaultExitEffect || defaultExitEffect;
        defaultEntryDuration = isPositiveInteger(options.defaultEntryDuration) ? parseInt(options.defaultEntryDuration, 10) : defaultEntryDuration;
        defaultExitDuration = isPositiveInteger(options.defaultExitDuration) ? parseInt(options.defaultExitDuration, 10) : defaultExitDuration;
        defaultTransitionDelay = (typeof options.defaultTransitionDelay === 'boolean') ? options.defaultTransitionDelay : defaultTransitionDelay;
        defaultVerticalOffset = isPositiveInteger(options.defaultVerticalOffset) ? parseInt(options.defaultVerticalOffset, 10) : defaultVerticalOffset;
        defaultHorizontalOffset = isPositiveInteger(options.defaultHorizontalOffset) ? parseInt(options.defaultHorizontalOffset, 10) : defaultHorizontalOffset;
        defaultScrollDuration = isPositiveInteger(options.defaultScrollDuration) ? parseInt(options.defaultScrollDuration, 10) : defaultScrollDuration;
    };

    /**
     * Retrieves the default animation command for a given type.
     * @param {string} type - 'entry' or 'exit'.
     * @returns {string} The default animation command string.
     */
    const getDefaultEffectName = function(type) {
        return type === 'entry' ? defaultEntryEffect : defaultExitEffect;
    };

    /**
     * Retrieves the default duration for a specific animation type.
     * @param {string} type - 'entry', 'exit', or 'scroll'.
     * @returns {number} The default duration in milliseconds.
     */
    const getDefaultEffectDuration = function(type) {
        switch (type) {
            case 'entry': return defaultEntryDuration;
            case 'exit': return defaultExitDuration;
            case 'scroll': return defaultScrollDuration;
            default: return 0; // Fallback, though should not be reached with valid types
        }
    };

    /**
     * Retrieves the default setting for sequential animation delay.
     * @returns {boolean} True if animations should be sequential by default, false otherwise.
     */
    const getDefaultTransitionDelay = function() {
        return defaultTransitionDelay;
    };

    /**
     * Retrieves the default pixel buffer for scene movement along an axis.
     * @param {string} axis - 'vertical' or 'horizontal'.
     * @returns {number} The default buffer value in pixels.
     */
    const getDefaultBoundaryOffset = function(axis) {
        return axis === 'vertical' ? defaultVerticalOffset : defaultHorizontalOffset;
    };

    // Expose public API methods
    return {
        init: initializeViews,
        navigate: transitionToScene
    };

})();

// Optional: Auto-initialize the SceneNavigator when the DOM is ready
$(function() {
    // SceneNavigator.init(); // Uncomment and provide options if needed, e.g., SceneNavigator.init({ defaultEntryDuration: 700 });
});