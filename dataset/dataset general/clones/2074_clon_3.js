var ViewScaler = function(configurationObject) {
    // Initialize configuration parameters, providing sensible defaults for robustness.
    configurationObject = Object.assign({}, {
        mainContentArea: null,
        visualBackdrop: null, // This specific property is present in the configuration but not used by the class logic.
        visualTargetElement: null
    }, configurationObject);

    // Critical validation: Ensure essential DOM elements are provided to prevent runtime errors.
    if (!configurationObject.mainContentArea || !configurationObject.visualTargetElement) {
        console.error("ViewScaler Initialization Error: 'mainContentArea' or 'visualTargetElement' are missing in the provided configuration.");
        return; // Abort constructor execution if key elements are absent.
    }

    /**
     * @property {HTMLElement} containerElement - The primary scrollable DOM element managed by this instance.
     */
    this.containerElement = configurationObject.mainContentArea;

    /**
     * @property {HTMLElement} primaryVisualTarget - The DOM element whose style will be transformed (scaled, translated).
     */
    this.primaryVisualTarget = configurationObject.visualTargetElement;

    /**
     * @property {boolean} isAppleTouchDevice - Flag indicating if the user agent is an iOS device (iPad, iPhone, iPod).
     * This determines whether to use a custom scroll library or rely on native scrolling behavior.
     */
    this.isAppleTouchDevice = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);

    // Pre-bind all frequently used instance methods to ensure they retain the correct 'this' context
    // when invoked as event listeners or callbacks.
    this.animationFrameRunner = this.initiateAnimationLoop.bind(this);
    this.scrollPositionHandler = this.queueScrollNormalization.bind(this);
    this.scrollCorrectionHandler = this.normalizeScrollPosition.bind(this);
    this.effectActivationHandler = this.activateVisualTransformation.bind(this);
    this.finalUpdateHandler = this.performFinalRefresh.bind(this);

    /**
     * @property {IScroll|null} scrollManagementInstance - An instance of the IScroll library, used for non-iOS devices.
     * Null for iOS devices where native scrolling is preferred.
     */
    this.scrollManagementInstance = null;

    // Conditional initialization of scrolling mechanism based on device detection.
    if (!this.isAppleTouchDevice) {
        // For non-Apple devices, an external IScroll library is utilized for custom scroll behavior.
        // Assumes 'IScroll' constructor is globally available.
        this.scrollManagementInstance = new IScroll(this.containerElement);
    } else {
        // For Apple touch devices, native scrolling is managed with custom event handling.
        this.normalizeScrollPosition(); // Perform an initial scroll adjustment.
        this.registerCoreHandlers();    // Attach general DOM event listeners.
    }

    // Interaction listeners are always registered to handle touch-based visual effects,
    // regardless of the underlying scroll implementation.
    this.registerInteractionListeners();
};

/**
 * Registers fundamental DOM event handlers to the main content area and the document.
 * This setup is primarily for iOS devices to manage native scrolling and prevent unwanted browser behaviors.
 */
ViewScaler.prototype.registerCoreHandlers = function() {
    // Guard clause: Ensure the container element is valid before attempting to bind events.
    if (!this.containerElement) {
        console.warn("ViewScaler: Aborting core handler registration; 'containerElement' is undefined.");
        return;
    }

    // Prevent 'touchmove' events within the container from propagating.
    // This helps in isolating custom scroll/touch interactions to this component.
    this.containerElement.addEventListener('touchmove', function(eventObject) {
        eventObject.stopPropagation();
    }, { passive: false }); // 'passive: false' allows potential `preventDefault` if needed, though not directly used here.

    // Attach a scroll event listener to queue scroll position normalization.
    // Using `{ passive: true }` for performance, indicating that `preventDefault` will not be called.
    this.containerElement.addEventListener('scroll', this.scrollPositionHandler, { passive: true });

    // Prevent default 'touchmove' behavior on the entire document. This is crucial for preventing
    // the browser's native pull-to-refresh or general page scrolling during custom interactions.
    document.addEventListener('touchmove', function(eventObject) {
        eventObject.preventDefault();
    }, { passive: false });
};

/**
 * Registers touch interaction listeners to the main content area.
 * These listeners are responsible for activating and deactivating the visual scaling/pulling effect.
 */
ViewScaler.prototype.registerInteractionListeners = function() {
    // Guard clause: Ensure the container element is valid.
    if (!this.containerElement) {
        console.warn("ViewScaler: Aborting interaction listener registration; 'containerElement' is undefined.");
        return;
    }

    // Trigger effect activation when a touch interaction begins.
    this.containerElement.addEventListener('touchstart', this.effectActivationHandler, { passive: true });

    // Finalize the visual state (e.g., reset transformations) when a touch interaction ends or is cancelled.
    this.containerElement.addEventListener('touchend', this.finalUpdateHandler, { passive: true });
    this.containerElement.addEventListener('touchcancel', this.finalUpdateHandler, { passive: true });
};

/**
 * Schedules the `normalizeScrollPosition` method to run asynchronously.
 * This ensures that scroll adjustments occur after the browser has finished processing
 * current events and rendering, preventing potential race conditions or jank.
 */
ViewScaler.prototype.queueScrollNormalization = function() {
    setTimeout(this.scrollCorrectionHandler, 0);
};

/**
 * Adjusts the scroll position of the primary container element.
 * If the scroll position is at the very top (0), it is subtly nudged to 1.
 * This is a common workaround to prevent unwanted native "pull-to-refresh" gestures
 * on some mobile browsers (e.g., iOS Safari) when the content is at the absolute top.
 */
ViewScaler.prototype.normalizeScrollPosition = function() {
    // Guard clause: Ensure the container element is valid.
    if (!this.containerElement) {
        console.warn("ViewScaler: Cannot normalize scroll position; 'containerElement' is undefined.");
        return;
    }

    if (this.containerElement.scrollTop === 0) {
        this.containerElement.scrollTop = 1;
    }
};

/**
 * Initiates an animation loop using `requestAnimationFrame` (or its webkit-prefixed version).
 * This method continuously calls itself to synchronize visual updates with the browser's rendering cycle,
 * ensuring smooth animations.
 */
ViewScaler.prototype.initiateAnimationLoop = function() {
    // Choose the appropriate requestAnimationFrame function, falling back to setTimeout for compatibility.
    const requestFrameFunction = window.webkitRequestAnimationFrame || window.requestAnimationFrame || function(callback) {
        return setTimeout(callback, 1000 / 60); // Fallback to ~60 frames per second.
    };
    requestFrameFunction(this.animationFrameRunner);

    // Execute the visual update logic within each animation frame.
    this.updateVisuals();
};

/**
 * Sets a flag indicating that dynamic visual transformations should be applied.
 * This typically happens when a user initiates a touch interaction.
 */
ViewScaler.prototype.activateVisualTransformation = function() {
    this.isTransformationActive = true;
};

/**
 * Completes the visual effect cycle by performing a final update and then deactivating the effect.
 * This method is usually invoked when a touch interaction ends or is cancelled, ensuring the UI
 * returns to a stable state.
 */
ViewScaler.prototype.performFinalRefresh = function() {
    // Force a specific scroll offset during the final update to ensure a clean reset.
    this.updateVisuals({ forcedOffsetValue: 1 });

    // Deactivate the transformation flag, stopping further dynamic visual updates until the next interaction.
    this.isTransformationActive = false;
};

/**
 * Updates the CSS transformations (translateY and scale) of the primary visual target element.
 * The applied transformations are based on the current scroll position or a forced offset.
 *
 * @param {object} [updateOptions] - Optional configuration object for the update.
 * @param {number} [updateOptions.forcedOffsetValue] - If provided, this value overrides the actual scroll position for calculations.
 */
ViewScaler.prototype.updateVisuals = function(updateOptions) {
    // Ensure updateOptions is an object to prevent errors when accessing properties.
    updateOptions = updateOptions || {};

    // Guard clause: If transformations are not active, reset the visual target to its default state and exit.
    if (!this.isTransformationActive) {
        if (this.primaryVisualTarget) {
            this.primaryVisualTarget.style.webkitTransition = "-webkit-transform 0.5s";
            this.primaryVisualTarget.style.webkitTransform = "translateZ(0) translateY(0px) scale(1)";
        }
        return;
    }

    // Guard clause: Ensure the visual target element is valid before attempting to modify its style.
    if (!this.primaryVisualTarget) {
        console.warn("ViewScaler: Cannot apply visual updates; 'primaryVisualTarget' is undefined.");
        return;
    }

    // Determine the scroll offset to use for calculations.
    // Prioritize a forced value, then the iScroll instance's 'y' (negated), then the native scrollTop.
    const effectiveScrollOffset = updateOptions.forcedOffsetValue !== undefined ?
                                  updateOptions.forcedOffsetValue :
                                  (this.scrollManagementInstance ? this.scrollManagementInstance.y * -1 : this.containerElement.scrollTop);

    let magnificationLevel = 1.0;       // Default scale factor (no zoom).
    let verticalShiftAmount = 0;        // Default Y-axis translation (no shift).
    let cssTransformTransition = "-webkit-transform 0.5s"; // Default transition for non-active or reset state.

    // Apply specific dynamic transformations if the scroll offset indicates a "pull" gesture (negative offset).
    if (effectiveScrollOffset < 0) {
        // Calculate the scale factor: as `effectiveScrollOffset` becomes more negative, `magnificationLevel` increases.
        magnificationLevel = (effectiveScrollOffset * -0.005) + 1;
        // Introduce a floor for the magnification level to prevent excessive shrinking.
        magnificationLevel = Math.max(0.8, magnificationLevel);

        // Calculate the vertical translation: pulls the element downwards as the content is pulled up.
        verticalShiftAmount = Math.ceil(effectiveScrollOffset * 1.1);

        // Use a quicker, linear transition for an immediate response during the active pull.
        cssTransformTransition = "-webkit-transform 0.1s linear";
    }

    // Apply the computed CSS styles to the primary visual target element.
    // Using `webkit` prefixes to maintain consistency with the original code's presumed target environment.
    this.primaryVisualTarget.style.webkitTransition = cssTransformTransition;
    this.primaryVisualTarget.style.webkitTransform =
        `translateZ(0) translateY(${verticalShiftAmount}px) scale(${magnificationLevel})`;
};