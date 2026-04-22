const ViewportScrollManager = (() => {

    // Internal state and configuration
    let _interactionState = {
        isCurrentlyDragging: false,
        lastPointerX: 0,
        lastPointerY: 0,
        previousTargetX: 0,
        previousTargetY: 0,
        currentInertiaX: 0,
        currentInertiaY: 0,
        currentVelocityX: 0,
        currentVelocityY: 0,
        lastInteractionTimestamp: 0,
        hasPerformedDrag: false,
        potentialClickTarget: null
    };

    // Viewport-related properties
    let _viewport = {
        scrollableElement: null,
        activeScrollAxis: 'x', // 'x' or 'y'
        displayPositionX: 0,
        displayPositionY: 0,
        roundedDisplayX: 0,
        roundedDisplayY: 0,
        scrollTargetX: 0,
        scrollTargetY: 0,
        maxScrollExtent: 0,
        minScrollExtent: 0, // Always 0 for this implementation
        viewportWidth: 0, // Will be dynamically updated
        viewportHeight: 0 // Will be dynamically updated
    };

    // Scroller behavior constants
    const _SCROLL_CONSTS = {
        DRAG_THRESHOLD: 10, // Minimum movement before a drag is registered
        INERTIA_DECAY_FACTOR: 0.9,
        EASING_FACTOR: 0.12,
        VELOCITY_SMOOTHING: 0.3,
        INERTIA_MIN_VELOCITY: 0.01
    };

    // Event handling properties
    let _eventHandlers = {
        inputMethod: 'mouse', // 'mouse' or 'touch'
        startEventName: '',
        moveEventName: '',
        endEventName: '',
        startHandler: null,
        moveHandler: null,
        endHandler: null,
        cancelHandler: null, // For touchcancel
        windowBlurHandler: null // For mouse leaving window
    };

    let _helperRefs = {
        instanceReference: null, // Reference to the public API
        canUse3DTransforms: false, // Feature detection
        parallaxBackgroundElement: null, // Optional element for parallax effect
        clickableTagName: 'IMG' // Default tag for clickable items
    };

    // Public properties exposed by the manager
    const managerPublicAPI = {
        currentXOffset: 0,
        currentYOffset: 0
    };

    // --- Private Utility Functions ---

    /**
     * Determines if 3D CSS transforms are supported.
     * This replaces the Modernizr dependency.
     * @returns {boolean} True if 3D transforms are supported.
     */
    const _check3DTransformSupport = () => {
        const el = document.createElement('p');
        const transforms = {
            'webkitTransform': '-webkit-transform',
            'OTransform': '-o-transform',
            'msTransform': '-ms-transform',
            'MozTransform': '-moz-transform',
            'transform': 'transform'
        };
        document.body.insertBefore(el, null);
        for (const t in transforms) {
            if (el.style[t] !== undefined) {
                el.style[t] = 'translate3d(1px,1px,1px)';
                const computedStyle = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                document.body.removeChild(el);
                return (computedStyle !== undefined && computedStyle.length > 0 && computedStyle !== 'none');
            }
        }
        document.body.removeChild(el);
        return false;
    };

    /**
     * Applies CSS transform to an element.
     * @param {HTMLElement} element - The DOM element to transform.
     * @param {string} x - X translation value (e.g., "10px").
     * @param {string} y - Y translation value (e.g., "5px").
     * @param {boolean} use3d - Whether to use translate3d (for hardware acceleration).
     */
    const _applyTransform = (element, x, y, use3d) => {
        if (!element) return;
        const transformValue = use3d ? `translate3d(${x}, ${y}, 0px)` : `translate(${x}, ${y})`;
        element.style.transform = transformValue;
        element.style.WebkitTransform = transformValue; // Webkit specific
        element.style.msTransform = transformValue; // IE specific
        element.style.MozTransform = transformValue; // Firefox specific
    };

    /**
     * Prevents default behavior for an event.
     * @param {Event} evt - The event object.
     */
    const _preventEventDefault = (evt) => {
        evt.preventDefault();
    };

    /**
     * Updates the internal viewport dimensions.
     */
    const _updateViewportDimensions = () => {
        _viewport.viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        _viewport.viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    };

    // --- Core Scroller Logic ---

    /**
     * Handles the start of a drag/touch interaction.
     * @param {Event} evt - The event object.
     * @param {number} clientX - X coordinate of the pointer.
     * @param {number} clientY - Y coordinate of the pointer.
     */
    const _handlePointerDown = (evt, clientX, clientY) => {
        _interactionState.lastPointerX = clientX;
        _interactionState.lastPointerY = clientY;
        _interactionState.currentInertiaX = 0;
        _interactionState.currentInertiaY = 0;
        _interactionState.currentVelocityX = 0;
        _interactionState.currentVelocityY = 0;
        _interactionState.lastInteractionTimestamp = Date.now();
        _interactionState.previousTargetX = _viewport.scrollTargetX;
        _interactionState.previousTargetY = _viewport.scrollTargetY;
        _interactionState.isCurrentlyDragging = true;
        _interactionState.hasPerformedDrag = false;

        // Capture potential click target
        if (evt.target && evt.target.nodeName === _helperRefs.clickableTagName) {
            _interactionState.potentialClickTarget = evt.target;
        } else {
            _interactionState.potentialClickTarget = null;
        }

        _enablePointerTracking();
        _preventEventDefault(evt);
    };

    /**
     * Handles pointer movement during a drag/touch interaction.
     * @param {Event} evt - The event object.
     * @param {number} clientX - X coordinate of the pointer.
     * @param {number} clientY - Y coordinate of the pointer.
     */
    const _handlePointerMove = (evt, clientX, clientY) => {
        if (!_interactionState.isCurrentlyDragging) return;

        const currentTime = Date.now();
        const deltaX = clientX - _interactionState.lastPointerX;
        const deltaY = clientY - _interactionState.lastPointerY;

        // Check drag threshold
        if (_viewport.activeScrollAxis === 'x' && Math.abs(deltaX) < _SCROLL_CONSTS.DRAG_THRESHOLD) return;
        if (_viewport.activeScrollAxis === 'y' && Math.abs(deltaY) < _SCROLL_CONSTS.DRAG_THRESHOLD) return;

        _interactionState.lastPointerX = clientX;
        _interactionState.lastPointerY = clientY;
        _interactionState.lastInteractionTimestamp = currentTime;

        let currentDelta = 0;
        let currentTarget = 0;
        let previousTarget = 0;
        let currentVelocity = 0;
        let direction = 0;
        let viewportDimension = 0;

        if (_viewport.activeScrollAxis === 'y') {
            currentTarget = _viewport.scrollTargetY;
            previousTarget = _interactionState.previousTargetY;
            currentVelocity = _interactionState.currentVelocityY;
            viewportDimension = _viewport.viewportHeight;

            // Apply drag, with "bounce" effect at boundaries
            if (currentTarget > _viewport.minScrollExtent && currentTarget < _viewport.maxScrollExtent - viewportDimension) {
                _viewport.scrollTargetY -= deltaY;
            } else {
                _viewport.scrollTargetY -= deltaY / 3; // Reduce speed at boundaries
            }

            currentDelta = _viewport.scrollTargetY - previousTarget;
            _interactionState.previousTargetY = _viewport.scrollTargetY;

            const velocity = Math.abs(currentDelta);
            _interactionState.currentVelocityY += (velocity - currentVelocity) * _SCROLL_CONSTS.VELOCITY_SMOOTHING;
            _viewport.verticalDirection = currentDelta < 0 ? -1 : 1;

        } else { // activeScrollAxis === 'x'
            currentTarget = _viewport.scrollTargetX;
            previousTarget = _interactionState.previousTargetX;
            currentVelocity = _interactionState.currentVelocityX;
            viewportDimension = _viewport.viewportWidth;

            // Apply drag, with "bounce" effect at boundaries
            if (currentTarget > _viewport.minScrollExtent && currentTarget < _viewport.maxScrollExtent - viewportDimension) {
                _viewport.scrollTargetX -= deltaX;
            } else {
                _viewport.scrollTargetX -= deltaX / 3; // Reduce speed at boundaries
            }

            currentDelta = _viewport.scrollTargetX - previousTarget;
            _interactionState.previousTargetX = _viewport.scrollTargetX;

            const velocity = Math.abs(currentDelta);
            _interactionState.currentVelocityX += (velocity - currentVelocity) * _SCROLL_CONSTS.VELOCITY_SMOOTHING;
            _viewport.horizontalDirection = currentDelta < 0 ? -1 : 1;
        }

        _interactionState.hasPerformedDrag = true;
    };

    /**
     * Handles the end of a drag/touch interaction.
     * @param {Event} evt - The event object.
     * @returns {boolean|undefined} Returns false if a drag occurred, undefined otherwise.
     */
    const _handlePointerUp = (evt) => {
        if (_interactionState.isCurrentlyDragging) {
            _interactionState.isCurrentlyDragging = false;
            _interactionState.currentInertiaX = Math.abs(_interactionState.currentVelocityX);
            _interactionState.currentInertiaY = Math.abs(_interactionState.currentVelocityY);
            _viewport.isApplyingInertia = true;

            const currentTime = Date.now();
            let deltaTime = currentTime - _interactionState.lastInteractionTimestamp;
            deltaTime = Math.max(10, deltaTime); // Prevent division by zero or too small a delta

            // Reduce initial velocity based on how long ago the last motion was
            const velocityDecayFactor = 1 - Math.min(1, Math.max(0, deltaTime / 100));
            _interactionState.currentVelocityX *= velocityDecayFactor;
            _interactionState.currentVelocityY *= velocityDecayFactor;
        }

        _disablePointerTracking();

        // If no drag occurred, and there was a potential click target, trigger the click handler
        if (!_interactionState.hasPerformedDrag && _interactionState.potentialClickTarget) {
            managerPublicAPI.handleItemClick(_interactionState.potentialClickTarget);
            _interactionState.potentialClickTarget = null; // Reset
        }

        return _interactionState.hasPerformedDrag ? false : undefined;
    };

    /**
     * The main rendering and update loop.
     */
    const _renderFrame = () => {
        _updateScrollState(); // Update positions and inertia
        _applyTransformsToElements(); // Apply CSS transforms

        // Update public offsets
        managerPublicAPI.currentXOffset = _viewport.roundedDisplayX;
        managerPublicAPI.currentYOffset = _viewport.roundedDisplayY;
    };

    /**
     * Updates the scroll target based on inertia and applies easing.
     */
    const _updateScrollState = () => {
        if (_viewport.activeScrollAxis === 'x') {
            if (_viewport.isApplyingInertia) {
                _viewport.scrollTargetX += _interactionState.currentVelocityX * _viewport.horizontalDirection;
                _interactionState.currentVelocityX *= _SCROLL_CONSTS.INERTIA_DECAY_FACTOR;

                // Boundary checks for inertia
                if (_viewport.scrollTargetX < _viewport.minScrollExtent) {
                    _interactionState.currentVelocityX = 0;
                    _viewport.scrollTargetX = _viewport.minScrollExtent;
                    _viewport.isApplyingInertia = false;
                } else if (_viewport.scrollTargetX > _viewport.maxScrollExtent - _viewport.viewportWidth) {
                    _interactionState.currentVelocityX = 0;
                    _viewport.scrollTargetX = _viewport.maxScrollExtent - _viewport.viewportWidth;
                    _viewport.isApplyingInertia = false;
                }

                if (_interactionState.currentVelocityX < _SCROLL_CONSTS.INERTIA_MIN_VELOCITY) {
                    _viewport.isApplyingInertia = false;
                    _interactionState.currentVelocityX = 0;
                }
            }

            // Apply easing to smooth out the scroll
            const speed = (_viewport.scrollTargetX - _viewport.displayPositionX) * _SCROLL_CONSTS.EASING_FACTOR;
            _viewport.displayPositionX += speed;
            _viewport.roundedDisplayX = Math.round(-_viewport.displayPositionX);

        } else if (_viewport.activeScrollAxis === 'y') {
            if (_viewport.isApplyingInertia) {
                _viewport.scrollTargetY += _interactionState.currentVelocityY * _viewport.verticalDirection;
                _interactionState.currentVelocityY *= _SCROLL_CONSTS.INERTIA_DECAY_FACTOR;

                // Boundary checks for inertia
                if (_viewport.scrollTargetY < _viewport.minScrollExtent) {
                    _interactionState.currentVelocityY = 0;
                    _viewport.scrollTargetY = _viewport.minScrollExtent;
                    _viewport.isApplyingInertia = false;
                } else if (_viewport.scrollTargetY > _viewport.maxScrollExtent - _viewport.viewportHeight) {
                    _interactionState.currentVelocityY = 0;
                    _viewport.scrollTargetY = _viewport.maxScrollExtent - _viewport.viewportHeight;
                    _viewport.isApplyingInertia = false;
                }

                if (_interactionState.currentVelocityY < _SCROLL_CONSTS.INERTIA_MIN_VELOCITY) {
                    _viewport.isApplyingInertia = false;
                    _interactionState.currentVelocityY = 0;
                }
            }

            // Apply easing to smooth out the scroll
            const speedY = (_viewport.scrollTargetY - _viewport.displayPositionY) * _SCROLL_CONSTS.EASING_FACTOR;
            _viewport.displayPositionY += speedY;
            _viewport.roundedDisplayY = Math.round(-_viewport.displayPositionY);
        }
    };

    /**
     * Applies the calculated transforms to the scrollable element and parallax element.
     */
    const _applyTransformsToElements = () => {
        // Main scrollable element
        if (_viewport.activeScrollAxis === 'x') {
            _applyTransform(_viewport.scrollableElement, `${_viewport.roundedDisplayX}px`, '0px', _helperRefs.canUse3DTransforms);
            // Parallax background element
            if (_helperRefs.parallaxBackgroundElement) {
                _applyTransform(_helperRefs.parallaxBackgroundElement, `${_viewport.roundedDisplayX / 8}px`, '0px', _helperRefs.canUse3DTransforms);
            }
        } else { // activeScrollAxis === 'y'
            _applyTransform(_viewport.scrollableElement, '0px', `${_viewport.roundedDisplayY}px`, _helperRefs.canUse3DTransforms);
            // Parallax background element (no parallax effect for Y axis in original, so keeping it simple)
            // If needed, add similar logic for _helperRefs.parallaxBackgroundElement
        }
    };

    /**
     * Initiates the animation loop using requestAnimationFrame.
     */
    const _startAnimationLoop = () => {
        // Polyfill for requestAnimationFrame if not available
        window.requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        const animationFrameCallback = () => {
            _renderFrame();
            window.requestAnimationFrame(animationFrameCallback);
        };
        window.requestAnimationFrame(animationFrameCallback);
    };

    // --- Event Binding/Unbinding ---

    /**
     * Enables pointer tracking (mousemove/touchmove and mouseup/touchend).
     */
    const _enablePointerTracking = () => {
        document.addEventListener(_eventHandlers.moveEventName, _eventHandlers.moveHandler, { passive: false });
        document.addEventListener(_eventHandlers.endEventName, _eventHandlers.endHandler, { passive: false });
        if (_eventHandlers.cancelHandler) {
            document.addEventListener('touchcancel', _eventHandlers.cancelHandler, { passive: false });
        }
        if (_eventHandlers.inputMethod === 'mouse') {
            window.addEventListener('blur', _eventHandlers.windowBlurHandler);
            // Prevent text selection during drag on mouse input
            document.addEventListener('mousedown', _preventEventDefault);
        }
    };

    /**
     * Disables pointer tracking.
     */
    const _disablePointerTracking = () => {
        document.removeEventListener(_eventHandlers.moveEventName, _eventHandlers.moveHandler, { passive: false });
        document.removeEventListener(_eventHandlers.endEventName, _eventHandlers.endHandler, { passive: false });
        if (_eventHandlers.cancelHandler) {
            document.removeEventListener('touchcancel', _eventHandlers.cancelHandler, { passive: false });
        }
        if (_eventHandlers.inputMethod === 'mouse') {
            window.removeEventListener('blur', _eventHandlers.windowBlurHandler);
            document.removeEventListener('mousedown', _preventEventDefault);
        }
    };

    /**
     * Sets up event listeners based on the input method (mouse or touch).
     * @param {string} inputMethod - 'mouse' or 'touch'.
     */
    const _setupEventBindings = (inputMethod) => {
        _eventHandlers.inputMethod = inputMethod;

        if (inputMethod === 'mouse') {
            _eventHandlers.startEventName = "mousedown";
            _eventHandlers.moveEventName = "mousemove";
            _eventHandlers.endEventName = "mouseup";
            _eventHandlers.cancelHandler = null; // No touchcancel for mouse
            _eventHandlers.windowBlurHandler = (e) => _handlePointerUp(e); // Treat window blur as mouse up

            _eventHandlers.startHandler = (e) => _handlePointerDown(e, e.clientX, e.clientY);
            _eventHandlers.moveHandler = (e) => _handlePointerMove(e, e.clientX, e.clientY);
            _eventHandlers.endHandler = (e) => _handlePointerUp(e);

        } else { // 'touch'
            _eventHandlers.startEventName = "touchstart";
            _eventHandlers.moveEventName = "touchmove";
            _eventHandlers.endEventName = "touchend";
            _eventHandlers.cancelHandler = (e) => _handlePointerUp(e); // Treat touchcancel as touch end

            _eventHandlers.startHandler = (e) => {
                if (e.touches.length > 0) {
                    const t = e.touches[0];
                    _handlePointerDown(e, t.pageX, t.pageY);
                }
            };
            _eventHandlers.moveHandler = (e) => {
                if (e.touches.length > 0) {
                    const t = e.touches[0];
                    _handlePointerMove(e, t.pageX, t.pageY);
                }
            };
            _eventHandlers.endHandler = (e) => _handlePointerUp(e);
        }

        // Bind the start event to the scrollable element
        _viewport.scrollableElement.addEventListener(_eventHandlers.startEventName, _eventHandlers.startHandler, { passive: false });
    };

    /**
     * Configures the scrollable element's initial styles and dimensions.
     * @param {string} axis - The scrolling axis ('x' or 'y').
     */
    const _configureElementStyles = (axis) => {
        const element = _viewport.scrollableElement;
        if (!element) return;

        // Reset previous styles and classes
        element.style.width = '';
        element.style.height = '';
        element.style.marginLeft = '';
        element.style.marginTop = '';
        element.classList.remove('hCenter', 'vCenter');

        // Apply new styles based on axis
        if (axis === 'y') {
            // Hardcoded values, ideally should be dynamic or configurable
            element.style.width = '640px';
            element.classList.add('hCenter');
            element.style.marginLeft = '-320px';
            _viewport.maxScrollExtent = element.clientHeight;
        } else if (axis === 'x') {
            // Hardcoded values, ideally should be dynamic or configurable
            element.style.width = '12900px';
            element.style.height = '410px';
            element.classList.add('vCenter');
            element.style.marginTop = '-205px';
            _viewport.maxScrollExtent = element.clientWidth;
        }
    };

    // --- Public API Methods ---

    /**
     * Initializes the scroll manager.
     * @param {HTMLElement} element - The DOM element to make scrollable.
     * @param {string} axis - The primary scrolling axis ('x' or 'y').
     * @param {boolean} useTouchInput - Whether to enable touch input (true) or mouse input (false).
     * @param {HTMLElement} [parallaxElement=null] - Optional element for parallax effect.
     */
    managerPublicAPI.initialize = function(element, axis, useTouchInput, parallaxElement = null) {
        if (!(element instanceof HTMLElement)) {
            console.error("ViewportScrollManager: Provided element is not a valid HTMLElement.");
            return;
        }

        _helperRefs.instanceReference = this; // Store reference to public API
        _viewport.scrollableElement = element;
        _viewport.activeScrollAxis = axis;
        _helperRefs.parallaxBackgroundElement = parallaxElement;

        // Perform feature detection once
        _helperRefs.canUse3DTransforms = _check3DTransformSupport();
        _updateViewportDimensions();
        window.addEventListener('resize', _updateViewportDimensions);

        _configureElementStyles(_viewport.activeScrollAxis);
        _setupEventBindings(useTouchInput ? "touch" : "mouse");

        // Set initial transform to reduce flicker on some devices (e.g., iOS)
        _applyTransform(_viewport.scrollableElement, "1px", "0px", _helperRefs.canUse3DTransforms);

        _startAnimationLoop();
    };

    /**
     * Adjusts the scroller's configuration based on orientation change.
     * @param {boolean} isPortraitMode - True if the new orientation is portrait, false for landscape.
     */
    managerPublicAPI.updateOrientation = function(isPortraitMode) {
        const element = _viewport.scrollableElement;
        if (!element) return;

        if (isPortraitMode) {
            _viewport.activeScrollAxis = 'y';
            element.style.width = '640px';
            element.style.height = '8200px'; // Increased height for portrait
            element.classList.remove('vCenter');
            element.classList.add('hCenter');
            element.style.marginLeft = '-320px';
            element.style.marginTop = ''; // Clear previous margin
            _viewport.maxScrollExtent = element.clientHeight;
        } else {
            _viewport.activeScrollAxis = 'x';
            element.style.width = '12900px';
            element.style.height = '410px';
            element.classList.remove('hCenter');
            element.classList.add('vCenter');
            element.style.marginTop = '-205px';
            element.style.marginLeft = ''; // Clear previous margin
            _viewport.maxScrollExtent = element.clientWidth;
        }
        // Reset scroll position to avoid being out of bounds after orientation change
        _viewport.scrollTargetX = 0;
        _viewport.scrollTargetY = 0;
        _viewport.displayPositionX = 0;
        _viewport.displayPositionY = 0;
    };

    /**
     * Placeholder for handling clicks on scrollable items.
     * This method can be overridden by the consumer.
     * @param {HTMLElement} clickedElement - The element that was clicked.
     */
    managerPublicAPI.handleItemClick = function(clickedElement) {
        // Implement custom click logic here
        console.log("Item clicked:", clickedElement);
    };

    // Return the public API
    return managerPublicAPI;

})();