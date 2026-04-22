(function() {
    "use strict";

    // --- Utility Functions ---

    // Retrieves the computed style value for a given property from an element.
    function acquireCalculatedStyle(elementReference, propertyIdentifier) {
        if (!elementReference || elementReference.nodeType !== 1) return null;
        const computedStyle = window.getComputedStyle(elementReference);
        return computedStyle.getPropertyValue(propertyIdentifier);
    }

    // Determines an element's position relative to the document's top-left corner.
    function locateElementCoordinates(elementReference) {
        if (!elementReference) return { top: 0, left: 0 };
        const rect = elementReference.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }

    // Calculates an element's outer dimensions, optionally including its margins.
    function measureElementOuter(elementReference, includeMargin) {
        if (!elementReference) return { width: 0, height: 0 };
        const style = window.getComputedStyle(elementReference);
        const width = elementReference.offsetWidth;
        const height = elementReference.offsetHeight;

        if (includeMargin) {
            const marginLeft = parseFloat(style.marginLeft) || 0;
            const marginRight = parseFloat(style.marginRight) || 0;
            const marginTop = parseFloat(style.marginTop) || 0;
            const marginBottom = parseFloat(style.marginBottom) || 0;
            return {
                width: width + marginLeft + marginRight,
                height: height + marginTop + marginBottom
            };
        }
        return { width, height };
    }

    // Throttles function execution to prevent excessive calls during rapid events like scrolling or resizing.
    function limitExecution(operationRoutine, delayDuration) {
        let timerIdentification;
        let lastInvocation = 0;
        return function(...functionArguments) {
            const contextReference = this;
            const nowTime = Date.now();
            if (nowTime - lastInvocation < delayDuration) {
                clearTimeout(timerIdentification);
                timerIdentification = setTimeout(() => {
                    lastInvocation = nowTime;
                    operationRoutine.apply(contextReference, functionArguments);
                }, delayDuration);
            } else {
                lastInvocation = nowTime;
                operationRoutine.apply(contextReference, functionArguments);
            }
        };
    }

    // --- Stabilizer Class Definition ---

    const elementStickerIdentifier = 'element-sticker-active';
    const containerWrapperIdentifier = 'element-sticker-container';

    const defaultConfiguration = {
        topOffset: 0,
        bottomOffset: 0,
        bottomBoundaryOffset: 0,
        innerTopPadding: 0,
        innerElementSelector: null,
        activeClass: elementStickerIdentifier,
        wrapperClass: containerWrapperIdentifier,
        anchorTo: null, // Can be 'document' or a DOM element/selector
        responsiveMode: true,
        scrollFollow: true,
        disabledResolutions: null, // e.g., [{ width: 768, height: 1024, maxWidth: 1200 }]
        onActivation: () => {},
        onDeactivation: () => {},
        enabledState: true,
        _internalState: null // For remembering state across reinitializations
    };

    class ElementStabilizer {
        constructor(targetElement, userOptions) {
            if (!targetElement || targetElement.nodeType !== 1) {
                console.error('Invalid DOM element provided for ElementStabilizer.');
                return;
            }

            this.focusElement = targetElement;
            this.settings = { ...defaultConfiguration, ...userOptions };

            this.containerElement = null;
            this.enclosingWrapper = null;

            this.initialElementStyles = {};
            this.initialElementWidth = ''; // Store original width to restore
            this.initialElementTopInWrapper = 0; // Top position of target relative to its wrapper

            this.currentScrollY = window.pageYOffset;
            this.previousScrollY = window.pageYOffset;
            this.scrollMovementDirection = 'none'; // 'up', 'down', 'none'

            this.isCurrentlyFixed = false;
            this.activeBreakpoint = false; // True if current resolution is in disabledResolutions

            this.scrollMonitor = limitExecution(this.performStabilizationUpdate.bind(this), 10);
            this.resizeMonitor = limitExecution(this.handleWindowResize.bind(this), 50);

            this.initializeComponent();
        }

        initializeComponent() {
            this.createEnclosingWrapper();
            this.determineContainerElement();
            this.captureInitialMetrics();
            this.attachEventHandlers();

            // If re-activating after a stop/off, use remembered state
            if (this.settings._internalState && this.settings.enabledState) {
                this.settings.rememberPosition = {
                    initialDocumentTop: locateElementCoordinates(this.focusElement).top,
                    initialScrollY: this.currentScrollY,
                    ...this.settings._internalState
                };
                delete this.settings._internalState;
            }

            this.handleWindowResize(); // Initial check for responsive and metrics
            this.performStabilizationUpdate(); // Initial positioning
        }

        createEnclosingWrapper() {
            const existingWrapper = this.focusElement.parentElement;
            if (existingWrapper && existingWrapper.classList.contains(this.settings.wrapperClass)) {
                this.enclosingWrapper = existingWrapper;
                this.updateEnclosingWrapperDimensions();
            } else {
                this.initialElementStyles = {
                    position: acquireCalculatedStyle(this.focusElement, 'position'),
                    top: acquireCalculatedStyle(this.focusElement, 'top'),
                    bottom: acquireCalculatedStyle(this.focusElement, 'bottom'),
                    left: acquireCalculatedStyle(this.focusElement, 'left'),
                    right: acquireCalculatedStyle(this.focusElement, 'right'),
                    width: acquireCalculatedStyle(this.focusElement, 'width')
                };
                this.initialElementWidth = this.initialElementStyles.width;

                const elementComputedStyle = window.getComputedStyle(this.focusElement);
                const elementDisplay = elementComputedStyle.display;

                this.enclosingWrapper = document.createElement('div');
                this.enclosingWrapper.classList.add(this.settings.wrapperClass);

                // Copy relevant styles from target element to wrapper
                const wrapperStyles = {
                    display: elementDisplay,
                    height: measureElementOuter(this.focusElement, true).height + 'px',
                    width: (function() {
                        const originalWidth = this.initialElementWidth;
                        const outerMetrics = measureElementOuter(this.focusElement, true);
                        if (originalWidth.includes('%') || (originalWidth === 'auto' && !['inline-block', 'inline'].includes(elementDisplay))) {
                            this.focusElement.style.width = this.focusElement.offsetWidth + 'px'; // Set target to pixel width
                            return originalWidth; // Wrapper takes percentage
                        } else if (originalWidth === 'auto' && ['inline-block', 'inline'].includes(elementDisplay)) {
                            return outerMetrics.width + 'px'; // Wrapper takes measured width
                        } else {
                            const marginLeft = acquireCalculatedStyle(this.focusElement, 'margin-left');
                            return (marginLeft === 'auto' && acquireCalculatedStyle(this.focusElement, 'margin-right') === 'auto') ?
                                this.focusElement.offsetWidth + 'px' : outerMetrics.width + 'px';
                        }
                    }).call(this),
                    margin: acquireCalculatedStyle(this.focusElement, 'margin-left') === 'auto' ? 'auto' : null,
                    position: elementComputedStyle.position === 'static' ? 'relative' : elementComputedStyle.position,
                    float: acquireCalculatedStyle(this.focusElement, 'float') || null,
                    left: acquireCalculatedStyle(this.focusElement, 'left'),
                    right: acquireCalculatedStyle(this.focusElement, 'right'),
                    top: acquireCalculatedStyle(this.focusElement, 'top'),
                    bottom: acquireCalculatedStyle(this.focusElement, 'bottom'),
                    'vertical-align': 'top'
                };

                for (const prop in wrapperStyles) {
                    if (wrapperStyles[prop] !== null) {
                        this.enclosingWrapper.style[prop] = wrapperStyles[prop];
                    }
                }

                this.focusElement.parentNode.insertBefore(this.enclosingWrapper, this.focusElement);
                this.enclosingWrapper.appendChild(this.focusElement);
            }
        }

        updateEnclosingWrapperDimensions() {
            const outerMetrics = measureElementOuter(this.focusElement, true);
            this.enclosingWrapper.style.height = outerMetrics.height + 'px';

            // Re-evaluate width if it was percentage based or auto
            const originalWidth = this.initialElementWidth;
            const elementComputedStyle = window.getComputedStyle(this.focusElement);
            const elementDisplay = elementComputedStyle.display;

            if (originalWidth.includes('%') || (originalWidth === 'auto' && !['inline-block', 'inline'].includes(elementDisplay))) {
                this.focusElement.style.width = this.enclosingWrapper.offsetWidth + 'px';
            } else if (originalWidth === 'auto' && ['inline-block', 'inline'].includes(elementDisplay)) {
                this.enclosingWrapper.style.width = outerMetrics.width + 'px';
            } else {
                 const marginLeft = acquireCalculatedStyle(this.focusElement, 'margin-left');
                 this.enclosingWrapper.style.width = (marginLeft === 'auto' && acquireCalculatedStyle(this.focusElement, 'margin-right') === 'auto') ?
                     this.focusElement.offsetWidth + 'px' : outerMetrics.width + 'px';
            }
        }

        determineContainerElement() {
            const anchorTarget = this.settings.anchorTo;
            if (anchorTarget) {
                if (anchorTarget === 'document' || (anchorTarget.nodeType && anchorTarget.nodeType === 9) || (anchorTarget instanceof Document)) {
                    this.containerElement = document.documentElement;
                } else if (typeof anchorTarget === 'string') {
                    this.containerElement = document.querySelector(anchorTarget);
                } else if (anchorTarget.nodeType === 1) {
                    this.containerElement = anchorTarget;
                }
            }
            if (!this.containerElement) {
                this.containerElement = this.enclosingWrapper.parentElement || document.documentElement;
            }
        }

        captureInitialMetrics() {
            this.initialElementTopInWrapper = this.focusElement.offsetTop;
        }

        attachEventHandlers() {
            window.addEventListener('scroll', this.scrollMonitor);
            window.addEventListener('resize', this.resizeMonitor);
        }

        detachEventHandlers() {
            window.removeEventListener('scroll', this.scrollMonitor);
            window.removeEventListener('resize', this.resizeMonitor);
        }

        handleWindowResize() {
            if (!this.settings.responsiveMode) return;

            // Check for disabled resolutions
            if (this.settings.disabledResolutions) {
                const currentWidth = window.innerWidth;
                const currentHeight = window.innerHeight;
                this.activeBreakpoint = this.settings.disabledResolutions.some(res => {
                    const minW = res.width || 0;
                    const maxW = res.maxWidth || Infinity;
                    const minH = res.height || 0;
                    const maxH = res.maxHeight || Infinity;
                    return (currentWidth >= minW && currentWidth <= maxW) &&
                           (currentHeight >= minH && currentHeight <= maxH);
                });
            }

            this.updateEnclosingWrapperDimensions();
            this.captureInitialMetrics();
            this.performStabilizationUpdate();
        }

        performStabilizationUpdate() {
            if (!this.settings.enabledState || !this.focusElement.offsetParent || this.activeBreakpoint) {
                this.returnToInitialState();
                return;
            }

            // Update scroll direction
            this.currentScrollY = window.pageYOffset;
            this.scrollMovementDirection = (this.currentScrollY > this.previousScrollY) ? 'down' : 'up';
            const scrollDistance = Math.abs(this.currentScrollY - this.previousScrollY);
            this.previousScrollY = this.currentScrollY;

            const elementOuterHeight = measureElementOuter(this.focusElement, true).height;
            const windowHeight = window.innerHeight;

            const containerCoords = locateElementCoordinates(this.containerElement);
            const containerTotalHeight = this.containerElement === document.documentElement ?
                                         document.documentElement.scrollHeight :
                                         this.containerElement.offsetHeight;

            // If the element is taller than its container, it cannot be sticky
            if (elementOuterHeight >= containerTotalHeight) {
                this.returnToInitialState();
                return;
            }

            const innerPaddingTop = this.settings.innerElementSelector ?
                                    (this.focusElement.querySelector(this.settings.innerElementSelector)?.offsetTop || 0) :
                                    (this.settings.innerTopPadding || 0);

            const wrapperDocumentTop = locateElementCoordinates(this.enclosingWrapper).top;

            // Point where element should start being fixed
            const fixedActivationY = wrapperDocumentTop - this.settings.topOffset + innerPaddingTop;

            // Point where element should stop being fixed (bottom boundary of container)
            const containerBottomBoundary = containerCoords.top + containerTotalHeight - this.settings.bottomBoundaryOffset;

            // Original had a 'remember' state for reinit.
            // This means if it was stopped and restarted, it might need to "catch up" to its position.
            if (this.settings.rememberPosition) {
                const targetPositionWhenFixed = locateElementCoordinates(this.focusElement).top - this.settings.topOffset - innerPaddingTop;

                if (elementOuterHeight - innerPaddingTop > windowHeight && this.settings.scrollFollow) {
                    if (targetPositionWhenFixed < this.currentScrollY && this.currentScrollY + windowHeight <= targetPositionWhenFixed + this.focusElement.offsetHeight) {
                        this.settings.rememberPosition = null;
                    }
                } else {
                    if (this.settings.rememberPosition.initialScrollY > targetPositionWhenFixed) { // Was scrolling up
                        if (this.currentScrollY <= targetPositionWhenFixed) {
                            this.applyFixedPosition({ top: this.settings.topOffset - innerPaddingTop });
                            this.settings.rememberPosition = null;
                        }
                    } else { // Was scrolling down
                        if (this.currentScrollY >= targetPositionWhenFixed) {
                            this.applyFixedPosition({ top: this.settings.topOffset - innerPaddingTop });
                            this.settings.rememberPosition = null;
                        }
                    }
                }
                if (this.settings.rememberPosition) return;
            }


            // --- Core Sticky Logic ---
            if (this.currentScrollY > fixedActivationY) {
                // Element should be sticky

                // Check if we hit the bottom boundary of the container
                // The original calculation:
                // bottom_limit + options.bottom - (options.followScroll && window_height < this_height ? 0 : options.top) <= offset_top + this_height - top_spacing - ((this_height - top_spacing > window_height - (top_limit - top_spacing) && options.followScroll) ? (((bottom_distance = this_height - window_height - top_spacing) > 0) ? bottom_distance : 0) : 0))
                // This is a highly complex condition. Let's simplify its intent.
                // It basically checks if the *calculated fixed bottom position* of the element
                // would exceed the container's bottom boundary.
                const effectiveElementBottom = this.currentScrollY + elementOuterHeight - innerPaddingTop - (this.settings.scrollFollow && windowHeight < elementOuterHeight ? 0 : this.settings.topOffset);
                const containerStopPoint = containerBottomBoundary + this.settings.bottomOffset;

                if (containerStopPoint <= effectiveElementBottom) {
                    // The element's bottom is about to go past the container's bottom boundary.
                    // Position it absolutely at the bottom of the container.
                    this.applyRelativePosition({
                        top: containerBottomBoundary - elementOuterHeight + this.settings.bottomOffset - wrapperDocumentTop
                    });
                } else if (elementOuterHeight - innerPaddingTop > windowHeight && this.settings.scrollFollow) {
                    // Element is taller than the viewport AND scroll-follow is enabled
                    const currentElementDocumentTop = locateElementCoordinates(this.focusElement).top;
                    const currentElementViewportTop = currentElementDocumentTop - this.currentScrollY;

                    if (currentElementViewportTop + elementOuterHeight <= windowHeight) {
                        // Element's bottom is at or above viewport's bottom
                        if (this.scrollMovementDirection === 'down') {
                            this.applyFixedPosition({ top: windowHeight - elementOuterHeight });
                        } else { // Scrolling up
                            if (currentElementViewportTop < 0 && this.isCurrentlyFixed) {
                                this.applyRelativePosition({
                                    top: currentElementDocumentTop - (fixedActivationY + this.settings.topOffset - innerPaddingTop) - scrollDistance
                                });
                            }
                        }
                    } else {
                        // Element's bottom is below viewport's bottom (it's partially visible or fully off-screen at the top)
                        if (this.scrollMovementDirection === 'up' && currentElementDocumentTop >= this.currentScrollY + this.settings.topOffset - innerPaddingTop) {
                            this.applyFixedPosition({ top: this.settings.topOffset - innerPaddingTop });
                        } else if (this.scrollMovementDirection === 'down' && currentElementDocumentTop + elementOuterHeight > windowHeight && this.isCurrentlyFixed) {
                            this.applyRelativePosition({
                                top: currentElementDocumentTop - (fixedActivationY + this.settings.topOffset - innerPaddingTop) - scrollDistance
                            });
                        }
                    }
                } else {
                    // Standard fixed position (element shorter than viewport or scroll-follow off)
                    this.applyFixedPosition({ top: this.settings.topOffset - innerPaddingTop });
                }
            } else {
                // Scroll position is above the activation point, return to initial state
                this.returnToInitialState();
            }
        }

        applyFixedPosition({ top }) {
            if (this.isCurrentlyFixed) return;

            this.focusElement.style.position = 'fixed';
            this.focusElement.style.top = `${top}px`;
            this.focusElement.style.left = `${this.enclosingWrapper.getBoundingClientRect().left}px`;
            this.focusElement.style.right = 'auto';
            this.focusElement.style.bottom = 'auto';
            this.focusElement.classList.add(this.settings.activeClass);
            this.enclosingWrapper.classList.add('active-stabilizer-container');

            this.isCurrentlyFixed = true;
            this.settings.onActivation.call(this.focusElement);
        }

        applyRelativePosition({ top, position = 'absolute', left = 0 }) {
            if (this.focusElement.style.position !== 'fixed' && parseFloat(this.focusElement.style.top) === top) return;

            this.focusElement.style.position = position;
            this.focusElement.style.top = `${top}px`;
            this.focusElement.style.left = `${left}px`;
            this.focusElement.style.right = 'auto';
            this.focusElement.style.bottom = 'auto';
            this.focusElement.classList.remove(this.settings.activeClass);
            this.enclosingWrapper.classList.remove('active-stabilizer-container');

            this.isCurrentlyFixed = false;
            this.settings.onDeactivation.call(this.focusElement);
        }

        returnToInitialState() {
            if (!this.isCurrentlyFixed && !this.focusElement.classList.contains(this.settings.activeClass)) return;

            this.focusElement.style.position = 'relative';
            this.focusElement.style.top = 'auto';
            this.focusElement.style.bottom = 'auto';
            this.focusElement.style.left = 'auto';
            this.focusElement.style.right = 'auto';
            this.focusElement.classList.remove(this.settings.activeClass);
            this.enclosingWrapper.classList.remove('active-stabilizer-container');

            this.isCurrentlyFixed = false;
            this.settings.onDeactivation.call(this.focusElement);
        }

        // --- Public API Methods ---

        reconfigure(newOptions) {
            if (typeof newOptions === 'object') {
                this.settings = { ...this.settings, ...newOptions };
                this.handleWindowResize();
                this.performStabilizationUpdate();
            }
        }

        deactivate() { // Corresponds to original 'stop'
            this.settings.enabledState = false;
            const currentElementTop = locateElementCoordinates(this.focusElement).top;
            const wrapperTop = locateElementCoordinates(this.enclosingWrapper).top;
            this.focusElement.style.position = 'absolute';
            this.focusElement.style.top = `${currentElementTop - wrapperTop}px`;
            this.focusElement.style.bottom = 'auto';
            this.focusElement.style.left = 'auto';
            this.focusElement.style.right = 'auto';
            this.focusElement.classList.remove(this.settings.activeClass);
            this.enclosingWrapper.classList.remove('active-stabilizer-container');
        }

        disable() { // Corresponds to original 'off'
            this.settings.enabledState = false;
            this.returnToInitialState();
            this.enclosingWrapper.style.height = 'auto';
        }

        activate() { // Corresponds to original 'on'
            this.settings.enabledState = true;
            this.settings.rememberPosition = {
                initialScrollY: window.pageYOffset,
                initialDocumentTop: locateElementCoordinates(this.focusElement).top
            };
            this.handleWindowResize();
            this.performStabilizationUpdate();
        }

        terminate() { // Corresponds to original 'destroy'
            this.detachEventHandlers();

            // Restore original styles to the target element
            for (const prop in this.initialElementStyles) {
                this.focusElement.style[prop] = this.initialElementStyles[prop];
            }
            this.focusElement.classList.remove(this.settings.activeClass);

            // Unwrap the element
            if (this.enclosingWrapper && this.enclosingWrapper.parentNode) {
                this.enclosingWrapper.parentNode.insertBefore(this.focusElement, this.enclosingWrapper);
                this.enclosingWrapper.parentNode.removeChild(this.enclosingWrapper);
            }

            // Remove instance from registry
            stabilizerInstances.delete(this.focusElement);
        }
    }

    // --- Global API ---

    const stabilizerInstances = new WeakMap();

    // Factory function to create or manage ElementStabilizer instances
    window.createContentStabilizer = function(elementInput, actionOrConfig) {
        let targetElement;
        if (typeof elementInput === 'string') {
            targetElement = document.querySelector(elementInput);
        } else if (elementInput instanceof HTMLElement) {
            targetElement = elementInput;
        } else {
            console.error('Invalid element or selector provided for createContentStabilizer.');
            return;
        }

        if (!targetElement) {
            console.warn('Target element not found for createContentStabilizer.');
            return;
        }

        let instance = stabilizerInstances.get(targetElement);

        if (typeof actionOrConfig === 'string') {
            if (!instance) {
                console.warn(`Stabilizer not initialized for this element. Cannot perform "${actionOrConfig}".`);
                return;
            }
            if (typeof instance[actionOrConfig] === 'function') {
                instance[actionOrConfig]();
            } else {
                console.warn(`Method "${actionOrConfig}" not found on stabilizer instance.`);
            }
        } else { // Configuration object
            if (instance) {
                instance.reconfigure(actionOrConfig);
            } else {
                instance = new ElementStabilizer(targetElement, actionOrConfig);
                stabilizerInstances.set(targetElement, instance);
            }
        }
        return instance;
    };

})();