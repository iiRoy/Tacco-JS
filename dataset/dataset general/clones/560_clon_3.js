(function(globalScope, documentRef, ModuleLoader, UtilityLoader) {

    // Initialize core utility functions
    const appUtilities = UtilityLoader(globalScope, documentRef);

    // Initialize the main UI module
    const mainUIModule = ModuleLoader(globalScope, documentRef, appUtilities);

    // Expose the UI module globally, prioritizing existing definitions
    globalScope.OverlayManager = globalScope.OverlayManager || mainUIModule;
    globalScope.OverlayManager.helpers = appUtilities;

    // Support CommonJS/AMD module definition if available
    globalScope.define && globalScope.define(function() {
        return mainUIModule;
    });

})(window, document, function(windowContext, documentContext, helpers) {
    /**
     * Cache frequently used helper functions for minification and readability.
     */
    const isNumeric = helpers.isNum;
    const applyStyles = helpers.css;
    const fetchComputedStyle = helpers.getStyle;
    const animateElement = helpers.animation;
    const getElementOuterWidth = helpers.outerWidth;
    const getElementOuterHeight = helpers.outerHeight;
    const findElementsByClass = helpers.findByClassName;
    const attachEventHandler = helpers.bind;
    const createDomElement = helpers.createDom;
    const removeDomNode = helpers.removeNode;
    const addCssClass = helpers.addClass;
    const removeCssClass = helpers.removeClass;
    const fadeInElement = helpers.fadeIn;
    const fadeOutElement = helpers.fadeOut;
    const iterateCollection = helpers.each;
    const renderTemplate = helpers.render;
    const createStyleSheet = helpers.createStyleSheet;

    /**
     * Load essential HTML templates for various overlay types.
     * Assuming `loadResource` is a synchronous utility similar to `requires`.
     */
    const baseLayoutTemplate = helpers.loadResource('template/base.html');
    const popupFrameTemplate = helpers.loadResource('template/pop.html');
    const confirmationDialogTemplate = helpers.loadResource('template/confirm.html');
    const questionPromptTemplate = helpers.loadResource('template/ask.html');
    const actionButtonsTemplate = helpers.loadResource('template/confirmBar.html');
    const inputPromptTemplate = helpers.loadResource('template/prompt.html');
    const backdropCurtainTemplate = helpers.loadResource('template/cover.html');
    const selectionOptionsTemplate = helpers.loadResource('template/select.html');
    const overlayCssContent = helpers.loadResource('style.css');

    // Basic browser environment detection for legacy support
    let isLegacyIE = false;
    let isVeryOldIE = false;
    const userAgent = navigator.userAgent;

    if (userAgent.includes("MSIE")) {
        const msieVersionMatch = /MSIE (\d+\.\d+);/.exec(userAgent);
        if (msieVersionMatch && msieVersionMatch.length > 1) {
            const version = parseFloat(msieVersionMatch[1]);
            if (version <= 7.0) {
                isVeryOldIE = true;
                isLegacyIE = true;
            } else if (version === 8.0) {
                isLegacyIE = true;
            }
        }
    }

    /**
     * Internal module state and DOM references.
     */
    let mainOverlayWrapper = null;
    let overlayCurtain = null;
    const documentBody = documentContext.body;

    let viewportWidth = 0;
    let windowHeight = 0;
    let documentHeight = 0;
    let scrollOffsetTop = 0;

    const overlaySettings = {
        marginConstraints: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
        baseZIndex: 499,
        animationDurationFast: 100, // New setting for quick animations
        defaultTransitionEase: 'ease-out'
    };

    // Determine the scrollable root element based on `compatMode`
    const rootElementForScroll = (documentContext.compatMode === "BackCompat") ? documentBody : documentContext.documentElement;

    /**
     * Updates cached viewport and document dimensions.
     */
    function updateViewportMetrics() {
        scrollOffsetTop = rootElementForScroll.scrollTop === 0 ? documentBody.scrollTop : rootElementForScroll.scrollTop;
        windowHeight = windowContext.innerHeight || documentContext.documentElement.clientHeight;
        viewportWidth = windowContext.innerWidth || documentContext.documentElement.clientWidth;
        documentHeight = rootElementForScroll.scrollHeight;
        // documentWidth is not directly used in the original, but I'll add it for completeness.
        // documentWidth = rootElementForScroll.scrollWidth; // Not in original logic, but good for completeness
    }

    // Stack to manage currently active overlay instances
    const activeOverlayStack = [];

    /**
     * Removes a specific overlay instance from the active stack.
     * @param {object} overlayInstance - The overlay object to remove.
     */
    function removeFromStack(overlayInstance) {
        const indexToRemove = activeOverlayStack.findIndex(item => item === overlayInstance);
        if (indexToRemove !== -1) {
            activeOverlayStack.splice(indexToRemove, 1);
        }
    }

    /**
     * Closes the topmost overlay that has dismissible behavior enabled.
     */
    function dismissTopmostDismissible() {
        for (let i = activeOverlayStack.length - 1; i >= 0; i--) {
            if (activeOverlayStack[i].isDismissible) {
                activeOverlayStack[i].close();
                break;
            }
        }
    }

    /**
     * Retrieves the Z-index of the topmost overlay that uses a mask.
     * @returns {number} The Z-index, or 0 if no masked overlays are active.
     */
    function getTopMaskZIndex() {
        for (let i = activeOverlayStack.length - 1; i >= 0; i--) {
            if (activeOverlayStack[i].isDismissible) { // Original used _easyClose, assuming it's related to mask
                return parseInt(fetchComputedStyle(activeOverlayStack[i].domElement, 'zIndex'), 10) || 0;
            }
        }
        return 0;
    }

    // Debounce timer for repositioning overlays
    let repositionDelayTimer;

    /**
     * Triggers repositioning for all currently active overlays after a short delay.
     */
    function repositionActiveOverlays() {
        clearTimeout(repositionDelayTimer);
        repositionDelayTimer = setTimeout(() => {
            iterateCollection(activeOverlayStack, (index, item) => {
                item.adjustPosition();
            });
        }, 150); // Debounce time
    }

    /**
     * Handles global interactions for dismissible overlays.
     * @param {Event} event - The DOM event.
     */
    function handleGlobalInteraction(event) {
        let targetElement = event.srcElement || event.target;
        // Schedule check to allow event bubbling to complete
        setTimeout(() => {
            while (targetElement) {
                if (helpers.hasClass(targetElement, 'ui-dismissible')) {
                    // Click originated inside a dismissible element, do nothing.
                    return;
                }
                targetElement = targetElement.parentNode;
            }
            // Click outside any dismissible element, close the topmost one.
            dismissTopmostDismissible();
        });
    }

    /**
     * Handles keyboard events for dismissible overlays (e.g., ESC key).
     * @param {Event} event - The DOM event.
     */
    function handleKeyboardEvents(event) {
        if (event.key === 'Escape' || event.keyCode === 27) { // event.key for modern, keyCode for older
            dismissTopmostDismissible();
        }
    }

    // Attach global event listeners for dismissible behavior
    attachEventHandler(documentBody, 'mouseup', handleGlobalInteraction);
    attachEventHandler(documentBody, 'keyup', handleKeyboardEvents);

    /**
     * Applies dismissible behavior to an overlay instance.
     * @param {boolean} shouldBeDismissible - Whether the overlay should be dismissible.
     * @param {boolean} defaultValue - Default value if `shouldBeDismissible` is not a boolean.
     */
    function enableDismissibleBehavior(shouldBeDismissible, defaultValue) {
        const instance = this; // `this` refers to the overlay instance
        if (typeof shouldBeDismissible === 'boolean' ? shouldBeDismissible : defaultValue) {
            addCssClass(instance.domElement, 'ui-dismissible');
            setTimeout(() => {
                instance.isDismissible = true;
            });
        }
    }

    // --- Module Initialization ---
    // This part runs immediately when the UI_factory is invoked.
    (function initializeModule() {
        // Inject the main stylesheet into the document head
        createStyleSheet(overlayCssContent, {
            'data-module': "OverlayManager"
        });

        // Create the main wrapper element and append it to the body
        mainOverlayWrapper = createDomElement(baseLayoutTemplate)[0];
        documentBody.appendChild(mainOverlayWrapper);

        // Find the overlay mask within the main wrapper
        overlayCurtain = findElementsByClass(mainOverlayWrapper, 'UI_mask')[0];

        // Ensure initial size calculation
        updateViewportMetrics();
        // A slight delay for potentially dynamic content or browser rendering quirks
        setTimeout(updateViewportMetrics, 500);

        // Apply IE-specific class if detected
        if (isLegacyIE) {
            addCssClass(mainOverlayWrapper, 'UI_ie_legacy');
        }

        let responsiveLayoutUpdateCallback = null;

        if (isVeryOldIE) {
            // For very old IE, mask needs to scroll with content
            responsiveLayoutUpdateCallback = () => {
                updateViewportMetrics();
                repositionActiveOverlays();
                applyStyles(overlayCurtain, {
                    marginTop: scrollOffsetTop
                });
            };
        } else {
            // For modern browsers, mask can be fixed
            applyStyles(overlayCurtain, {
                position: 'fixed',
                top: 0
            });
            responsiveLayoutUpdateCallback = () => {
                updateViewportMetrics();
                repositionActiveOverlays();
            };
        }

        // Attach event listeners for window resize and scroll events
        attachEventHandler(windowContext, 'resize', responsiveLayoutUpdateCallback);
        attachEventHandler(windowContext, 'scroll', responsiveLayoutUpdateCallback);
    })();


    /**
     * Constrains an element's position within the viewport, respecting defined margins.
     * @param {number} top - Desired top position.
     * @param {number} left - Desired left position.
     * @param {number} width - Element's width.
     * @param {number} height - Element's height.
     * @returns {{top: number, left: number}} Adjusted top and left positions.
     */
    function constrainElementPosition(top, left, width, height) {
        const constraints = overlaySettings.marginConstraints;

        // Adjust top position
        if (top < scrollOffsetTop + constraints.top) {
            top = scrollOffsetTop + constraints.top;
        } else if (top + height - scrollOffsetTop > windowHeight - constraints.bottom) {
            if (height > windowHeight - constraints.top - constraints.bottom) {
                // Element is taller than available viewport space, snap to top
                top = scrollOffsetTop + constraints.top;
            } else {
                // Element fits, but extends below viewport, snap to bottom
                top = scrollOffsetTop + windowHeight - height - constraints.bottom;
            }
        }

        // Adjust left position
        if (left < constraints.left) {
            left = constraints.left;
        } else if (left + width > viewportWidth - constraints.right) {
            left = viewportWidth - width - constraints.right;
        }

        return {
            top: Math.ceil(top),
            left: Math.ceil(left)
        };
    }

    /**
     * Centers and adjusts an element's position on the page.
     * @param {HTMLElement} element - The DOM element to position.
     * @param {object} [positionOverride] - Optional `{top, left}` properties to override calculated center.
     * @param {number} [transitionDuration] - Duration for CSS animation, if applicable.
     */
    function centerAndAdjustElement(element, positionOverride, transitionDuration) {
        const override = positionOverride || {};
        const elementWidth = getElementOuterWidth(element);
        const elementHeight = getElementOuterHeight(element);

        const calculatedTop = (windowHeight - elementHeight) / 2 + scrollOffsetTop;
        const calculatedLeft = (viewportWidth - elementWidth) / 2;

        const newCalculatedPosition = constrainElementPosition(
            calculatedTop,
            calculatedLeft,
            elementWidth,
            elementHeight
        );

        const targetStyles = {
            top: isNumeric(override.top) ? override.top : Math.ceil(newCalculatedPosition.top),
            left: isNumeric(override.left) ? override.left : Math.ceil(newCalculatedPosition.left)
        };

        const method = isNumeric(transitionDuration) ? animateElement : applyStyles;
        method(element, targetStyles, transitionDuration);
    }

    /**
     * Prototype method for an overlay instance to adjust its position.
     */
    function AdjustPositionProto() {
        centerAndAdjustElement(this.domElement, null, overlaySettings.animationDurationFast);
    }

    /**
     * Adds confirmation/cancel buttons to an overlay.
     * @param {HTMLElement} containerElement - The DOM element to append buttons to.
     * @param {Function|object} options - Callback function or an object with `callback`, `cancel`, `btns` properties.
     * @param {Function} closeAction - Function to call to close the overlay.
     */
    function attachConfirmationButtons(containerElement, options, closeAction) {
        let confirmCallback = null;
        let cancelCallback = null;
        const defaultButtonLabels = ['Confirm', 'Cancel'];
        let customButtonLabels = [...defaultButtonLabels]; // Clone array

        if (typeof options === "function") {
            confirmCallback = options;
        } else if (typeof options === "object" && options !== null) {
            if (Array.isArray(options.btns) && options.btns.length >= 1) {
                customButtonLabels[0] = options.btns[0] || defaultButtonLabels[0];
                if (options.btns.length >= 2) {
                    customButtonLabels[1] = options.btns[1] || defaultButtonLabels[1];
                }
            }
            if (typeof options.callback === "function") {
                confirmCallback = options.callback;
            }
            if (typeof options.cancel === "function") {
                cancelCallback = options.cancel;
            }
        } else {
            console.warn('attachConfirmationButtons received invalid options:', options);
        }

        const buttonBarHtml = renderTemplate(actionButtonsTemplate, {
            confirm: customButtonLabels[0],
            cancel: customButtonLabels[1]
        });
        containerElement.appendChild(createDomElement(buttonBarHtml)[0]);

        // Bind click events to the buttons
        attachEventHandler(containerElement, 'click', '.UI_pop_confirm_ok', function() {
            // If callback returns `false`, prevent closing the overlay
            if (confirmCallback && confirmCallback() === false) {
                return;
            }
            closeAction();
        });
        attachEventHandler(containerElement, 'click', '.UI_pop_confirm_cancel', function() {
            // If callback returns `false`, prevent closing the overlay
            if (cancelCallback && cancelCallback() === false) {
                return;
            }
            closeAction();
        });
    }

    /**
     * --- Visual Effects: Blur ---
     * Functions to apply/remove a blur effect to root-level document elements.
     */

    /**
     * Iterates over direct children of the body, excluding the overlay system itself.
     * @param {Function} processor - Callback function to apply to each eligible DOM element.
     */
    function iterateRootSiblings(processor) {
        const bodyChildren = documentBody.children;
        // Using `Array.from` for proper iteration over HTMLCollection
        Array.from(bodyChildren).forEach(domNode => {
            // Exclude the overlay system's main container and non-element nodes
            if (domNode !== mainOverlayWrapper && domNode.nodeType === 1 &&
                !['SCRIPT', 'LINK', 'STYLE', 'META'].includes(domNode.tagName)) {
                processor(domNode);
            }
        });
    }

    let applyVisualBlur = null;
    let clearVisualBlur = null;

    // Check for CSS filter support
    if (helpers.supports('-webkit-filter') || helpers.supports('filter')) {
        applyVisualBlur = () => {
            iterateRootSiblings(domNode => {
                addCssClass(domNode, 'UI-blur');
            });
        };
        clearVisualBlur = () => {
            iterateRootSiblings(domNode => {
                removeCssClass(domNode, 'UI-blur');
            });
        };
    }

    /**
     * --- Overlay Mask Management ---
     */

    /**
     * Displays the overlay curtain and applies blur effect if configured.
     * `this` refers to the overlay instance requesting the mask.
     */
    function displayOverlayCurtain() {
        if (!this.hasOverlayMask) { // Assuming `_mask` is renamed to `hasOverlayMask`
            return;
        }

        const currentTopMaskZIndex = getTopMaskZIndex();
        // Set the requesting overlay's z-index higher than the mask
        applyStyles(this.domElement, {
            zIndex: currentTopMaskZIndex + 2
        });

        // Set the mask's z-index between the requesting overlay and previous elements
        applyStyles(overlayCurtain, {
            zIndex: currentTopMaskZIndex + 1
        });

        if (currentTopMaskZIndex === 0) {
            // If no other mask was active, apply blur and fade in the mask
            applyVisualBlur && applyVisualBlur();
            fadeInElement(overlayCurtain, 400);
        }
    }

    /**
     * Hides the overlay curtain and removes blur effect if no other masks are active.
     * `this` refers to the overlay instance being closed.
     */
    function hideOverlayCurtain() {
        if (!this.hasOverlayMask) {
            return;
        }

        const instance = this;
        // Update mask's z-index to reflect the removal of this overlay
        const currentTopMaskZIndex = getTopMaskZIndex();
        applyStyles(overlayCurtain, {
            zIndex: currentTopMaskZIndex - 1
        });

        if (currentTopMaskZIndex === 0) {
            // If this was the last masked overlay, remove blur and fade out the mask
            clearVisualBlur && clearVisualBlur();
            fadeOutElement(overlayCurtain, 200);
        }
    }

    /**
     * --- Animation Helpers ---
     */

    /**
     * Calculates the CSS transform property and initial value for entry/exit animations.
     * @param {string} direction - 'left', 'right', 'top', 'bottom'.
     * @param {number} offsetRange - The pixel range for the initial transform.
     * @returns {[string, number]} An array containing the transform axis ('X' or 'Y') and the starting value.
     */
    function calculateTransformVector(direction, offsetRange) {
        let transformAxis;
        let startValue;

        switch (direction) {
            case 'left':
                transformAxis = 'X';
                startValue = -offsetRange;
                break;
            case 'right':
                transformAxis = 'X';
                startValue = offsetRange;
                break;
            case 'bottom':
                transformAxis = 'Y';
                startValue = offsetRange;
                break;
            case 'top': // Default case if direction is 'top' or undefined/invalid
            default:
                transformAxis = 'Y';
                startValue = -offsetRange;
                break;
        }
        return [transformAxis, startValue];
    }

    /**
     * Performs the entry animation for an overlay.
     * @param {Function} onAnimationComplete - Callback fired after animation finishes.
     */
    function performEntryAnimation(onAnimationComplete) {
        const instance = this;
        const targetElement = instance.domElement;
        const animationOrigin = instance.animationFrom; // Renamed `_from` to `animationFrom`
        const animationDuration = overlaySettings.animationDurationFast;

        // Add the current overlay to the active stack
        activeOverlayStack.push(instance);

        // Display the overlay mask (logic inside handles conditional display)
        displayOverlayCurtain.call(instance);

        // Skip animation for legacy IE or if no specific animation origin is defined
        if (isLegacyIE || !animationOrigin || animationOrigin === 'none') {
            onAnimationComplete && onAnimationComplete();
            return;
        }

        let initialStyles = {};
        let finalStyles = {};

        // Case 1: Animation from a source DOM element
        if (animationOrigin.tagName && animationOrigin.parentNode) {
            const sourceElementCoords = helpers.offset(animationOrigin);
            const targetElementCoords = helpers.offset(targetElement); // Get current position before animation

            initialStyles = {
                top: sourceElementCoords.top,
                left: sourceElementCoords.left,
                clip: `rect(0, ${getElementOuterWidth(animationOrigin)}px, ${getElementOuterHeight(animationOrigin)}px, 0)`,
                overflow: 'hidden'
            };
            finalStyles = {
                clip: `rect(0, ${getElementOuterWidth(targetElement)}px, ${getElementOuterHeight(targetElement)}px, 0)`,
                top: targetElementCoords.top,
                left: targetElementCoords.left
            };
        }
        // Case 2: Animation from a directional string ('left', 'right', 'top', 'bottom')
        else if (typeof animationOrigin === 'string') {
            const [transformAxis, startValue] = calculateTransformVector(animationOrigin, 40); // 40px offset
            initialStyles.transform = `translate${transformAxis}(${startValue}px)`;
            finalStyles.transform = 'translateX(0) translateY(0)';
        } else {
            // Invalid animation origin, skip animation
            console.warn('Invalid animation origin specified:', animationOrigin);
            onAnimationComplete && onAnimationComplete();
            return;
        }

        // Common animation properties: fade in
        initialStyles.opacity = 0;
        finalStyles.opacity = 1;

        // Apply initial styles and start the animation
        applyStyles(targetElement, initialStyles);
        addCssClass(mainOverlayWrapper, 'is-animating'); // Indicate global animation state

        animateElement(targetElement, finalStyles, animationDuration, overlaySettings.defaultTransitionEase, () => {
            removeCssClass(mainOverlayWrapper, 'is-animating');
            // Restore clip to 'auto' after animation to prevent content issues
            applyStyles(targetElement, {
                clip: 'auto',
                overflow: 'visible' // Ensure content is visible
            });
            onAnimationComplete && onAnimationComplete();
        });
    }

    /**
     * Handles overlay closure and performs the exit animation.
     * @param {Function} onClosureComplete - Callback fired after the overlay is completely closed and removed.
     */
    function performExitAnimation(onClosureComplete) {
        const instance = this;

        // Guard against closing an already dead instance
        if (instance.isDead) {
            return;
        }
        instance.isDead = true; // Mark as dead

        // Remove from the active overlay stack
        removeFromStack(instance);

        // Trigger the instance's specific close callback if available
        instance.onCloseCallback && instance.onCloseCallback();

        // Hide the overlay mask (logic inside handles conditional hiding)
        hideOverlayCurtain.call(instance);

        // Execute the provided callback specific to this closure
        onClosureComplete && onClosureComplete.call(instance);

        const targetElement = instance.domElement;
        const animationOrigin = instance.animationFrom; // Re-use animation origin for reverse effect

        // Function to remove the DOM element
        function cleanupDomElement() {
            removeCssClass(mainOverlayWrapper, 'is-animating');
            removeDomNode(targetElement);
        }

        // Skip animation for legacy IE or if no animation origin was defined for entry
        if (isLegacyIE || !animationOrigin || animationOrigin === 'none') {
            cleanupDomElement();
            return;
        }

        const animationDuration = overlaySettings.animationDurationFast;
        let finalStyles = {
            opacity: 0
        };

        // Determine reverse animation styles based on original entry animation
        if (animationOrigin.tagName && animationOrigin.parentNode) {
            const sourceElementCoords = helpers.offset(animationOrigin);
            finalStyles = {
                ...finalStyles, // Inherit opacity: 0
                top: sourceElementCoords.top,
                left: sourceElementCoords.left,
                clip: `rect(0, ${getElementOuterWidth(animationOrigin)}px, ${getElementOuterHeight(animationOrigin)}px, 0)`
            };
        } else if (typeof animationOrigin === 'string') {
            const [transformAxis, startValue] = calculateTransformVector(animationOrigin, 40);
            // Reverse the entry transform
            finalStyles.transform = `translate${transformAxis}(${startValue}px)`;
        }

        addCssClass(mainOverlayWrapper, 'is-animating');
        animateElement(targetElement, finalStyles, animationDuration, overlaySettings.defaultTransitionEase, () => {
            cleanupDomElement();
        });
    }

    // The rest of the original file would follow here, defining the actual UI components
    // (e.g., Pop, Confirm, Ask, Prompt, Select) using these utility functions and patterns.
    // For this clone, I will stop here as the request is to show the Type III changes
    // in the provided snippet, which ends at `closeAnimation`.

    // The factory would return an object with methods like `Pop`, `Confirm`, etc.
    // As per the original snippet, the closure ends with `return UI;`.
    // I'll return a placeholder object to represent the UI module.
    return {
        // Placeholder for the actual UI components that would be defined later
        // e.g., Pop: function(...) { ... }, Confirm: function(...) { ... }
        // For demonstration, expose some internal functions if needed or just an empty object.
        _internal: {
            updateViewportMetrics,
            repositionActiveOverlays,
            getTopMaskZIndex,
            performEntryAnimation,
            performExitAnimation,
            enableDismissibleBehavior,
            attachConfirmationButtons,
            AdjustPositionProto,
            currentActiveOverlays: activeOverlayStack,
            mainWrapperElement: mainOverlayWrapper,
            overlayMaskElement: overlayCurtain
        },
        // Example of a public method, assuming Pop would be a constructor
        Pop: function() {
            console.log('Pop constructor would be defined here.');
        },
        Confirm: function() {
            console.log('Confirm constructor would be defined here.');
        }
    };

});