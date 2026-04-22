/*
 * Content Slider Module
 *
 * This module manages the display and interaction of a content slider or carousel.
 * It supports various navigation methods, auto-advancing, and different transition effects.
 */

// A basic component structure for inheritance, mimicking Prototype's Abstract.
// In a real-world scenario, this might be a more robust base class.
var BaseComponent = {
    // Placeholder for common component methods or properties.
    // For this clone, it mainly serves as a parent for Class.create.
};

// Define constants for default settings to improve readability and maintainability.
const SLIDER_DEFAULTS = Object.freeze({
    animationDuration:      1,          // Duration of transitions in seconds
    autoPlayEnabled:        false,      // Whether the slider should auto-advance
    autoPlayIntervalSec:    3,          // Time between auto-advances in seconds
    visibleItemCount:       1,          // Number of items visible at once
    navControlClass:        'slider-nav-btn', // CSS class for navigation buttons
    itemSelectorClass:      'slider-jumper',  // CSS class for direct item selection buttons
    inactiveClass:          'slider-control-disabled', // CSS class for disabled controls
    activeSelectorClass:    'slider-control-selected', // CSS class for selected jumper controls
    loopMode:               false,      // If true, slider loops infinitely
    mouseWheelNavEnabled:   true,       // Enable navigation via mouse wheel
    transitionEffect:       'scroll',   // 'scroll' or 'fade'
    easingFunction:         'sinoidal'  // Easing function for scroll effect: 'spring' or 'sinoidal'
});

/**
 * Utility function to retrieve a DOM element by ID or return the element itself.
 * Mimics Prototype.js's `$` function for element selection.
 * @param {string|HTMLElement} elementRef - The ID string or the HTMLElement itself.
 * @returns {HTMLElement|null} The resolved DOM element or null if not found.
 */
function getElementByIdOrNode(elementRef) {
    if (typeof elementRef === 'string') {
        return document.getElementById(elementRef);
    }
    return elementRef; // Assume it's already a DOM node
}

// Custom animation easing functions, replacing Prototype.js's Effect.Transitions.
const CustomEasing = {
    sinoidal: function(progress) {
        return (-Math.cos(progress * Math.PI) / 2) + 0.5;
    },
    spring: function(progress) {
        return 1 - (Math.cos(progress * 4.5 * Math.PI) * Math.exp(-progress * 6));
    },
    linear: function(progress) {
        return progress;
    }
};

// A custom animation engine base class, replacing Prototype.js's Effect.Base.
// Provides core animation loop logic.
const AnimationEngine = {};
AnimationEngine.Base = {
    // Placeholder for child-specific setup logic.
    initializeAnimation: function() {},
    // Placeholder for applying animation step changes.
    applyAnimationStep: function() {},
    // Placeholder for post-animation cleanup.
    finalizeAnimation: function() {},

    /**
     * Cancels any ongoing animation.
     */
    cancel: function() {
        if (this.animationTimerId) {
            clearInterval(this.animationTimerId);
            this.animationTimerId = null;
        }
    },

    /**
     * Initiates the animation process.
     * @param {object} animationOpts - Options for the animation.
     */
    start: function(animationOpts) {
        this.animationConfiguration = animationOpts || {};
        this.animationConfiguration.duration = this.animationConfiguration.duration || 1; // Default duration
        this.animationConfiguration.afterFinish = this.animationConfiguration.afterFinish || function() {};

        this.initializeAnimation(); // Call child-specific setup

        this.animationStartTime = new Date().getTime();
        this.animationTimerId = setInterval(this.advanceAnimation.bind(this), 10); // Aim for ~100 frames per second
    },

    /**
     * Advances the animation by one step.
     */
    advanceAnimation: function() {
        const currentTime = new Date().getTime();
        const elapsedTimeMs = currentTime - this.animationStartTime;
        const totalDurationMs = this.animationConfiguration.duration * 1000;
        let progress = elapsedTimeMs / totalDurationMs;

        if (progress >= 1) {
            this.applyAnimationStep(1); // Ensure final state is reached
            clearInterval(this.animationTimerId);
            this.animationTimerId = null;
            this.animationConfiguration.afterFinish(); // Execute callback
            this.finalizeAnimation(); // Call child-specific finalization hook
            return;
        }

        // Apply easing function if specified, otherwise linear
        const easedPosition = this.animationConfiguration.transition ?
            CustomEasing[this.animationConfiguration.transition](progress) : progress;
        this.applyAnimationStep(easedPosition);
    }
};

/**
 * Custom animation class for smooth scrolling, replacing Prototype.js's Effect.SmoothScroll.
 */
AnimationEngine.Scroller = Class.create(AnimationEngine.Base, {
    /**
     * Constructor/initializer for the scroller animation.
     * @param {string|HTMLElement} elementRef - The element to scroll.
     * @param {object} configOptions - Configuration for the scroll, e.g., targetX, targetY.
     */
    initializeAnimation: function(elementRef, configOptions) {
        this.targetElement = getElementByIdOrNode(elementRef);
        this.animationConfiguration = Object.assign({
            targetX: 0,
            targetY: 0,
            scrollMode: 'absolute' // 'absolute' means targetX/Y are final scroll positions
        }, configOptions || {}, this.animationConfiguration); // Merge with base config

        if (!this.targetElement) {
            console.error("AnimationEngine.Scroller: Target element not found for animation.", elementRef);
            return;
        }

        // Store initial scroll positions
        this.initialScrollX = this.targetElement.scrollLeft;
        this.initialScrollY = this.targetElement.scrollTop;

        // Calculate delta: The Scroller expects targetX/Y to be the *final* absolute scroll position.
        // The `moveTo` method passes these as `(itemPosition - viewportPosition)`, which is already the absolute target.
        // So, we need to convert these absolute targets into deltas relative to the current scroll position for animation.
        this.animationConfiguration.targetX -= this.initialScrollX;
        this.animationConfiguration.targetY -= this.initialScrollY;
    },

    /**
     * Applies the scroll transformation for a given animation progress.
     * @param {number} progress - The current progress of the animation (0 to 1).
     */
    applyAnimationStep: function(progress) {
        if (!this.targetElement) return; // Guard against element removal during animation

        this.targetElement.scrollLeft = this.animationConfiguration.targetX * progress + this.initialScrollX;
        this.targetElement.scrollTop  = this.animationConfiguration.targetY * progress + this.initialScrollY;
    }
});

/**
 * Custom animation class for fading opacity, replacing Prototype.js's Effect.Opacity.
 */
AnimationEngine.Fader = Class.create(AnimationEngine.Base, {
    /**
     * Constructor/initializer for the fader animation.
     * @param {string|HTMLElement} elementRef - The element to fade.
     * @param {object} configOptions - Configuration for the fade, e.g., from, to opacity.
     */
    initializeAnimation: function(elementRef, configOptions) {
        this.targetElement = getElementByIdOrNode(elementRef);
        this.animationConfiguration = Object.assign({
            from: 1.0,
            to: 0
        }, configOptions || {}, this.animationConfiguration); // Merge with base config

        if (!this.targetElement) {
            console.error("AnimationEngine.Fader: Target element not found for animation.", elementRef);
            return;
        }

        // Ensure the element's starting opacity is set correctly.
        this.targetElement.style.opacity = this.animationConfiguration.from;
    },

    /**
     * Applies the opacity transformation for a given animation progress.
     * @param {number} progress - The current progress of the animation (0 to 1).
     */
    applyAnimationStep: function(progress) {
        if (!this.targetElement) return;

        const currentOpacity = this.animationConfiguration.from +
                               (this.animationConfiguration.to - this.animationConfiguration.from) * progress;
        this.targetElement.style.opacity = currentOpacity;
    },

    /**
     * Ensures the element reaches its final opacity state.
     */
    finalizeAnimation: function() {
        if (this.targetElement) {
            this.targetElement.style.opacity = this.animationConfiguration.to;
        }
    }
});


/**
 * The main SliderWidget class, replacing the original Carousel.
 * Manages a collection of items within a viewport, providing navigation and animation.
 */
SliderWidget = Class.create(BaseComponent, {
    /**
     * Initializes the slider component with its viewport, items, controls, and settings.
     * @param {string|HTMLElement} viewportId - The ID or element of the scrolling container.
     * @param {Array<HTMLElement>} itemElements - An array of the individual items/slides.
     * @param {Array<HTMLElement>} navControls - An array of navigation control elements.
     * @param {object} customSettings - User-defined configuration options.
     */
    setupComponent: function (viewportId, itemElements, navControls, customSettings) {
        // Internal state flags and timers
        this.isAnimating        = false;        // True if an animation is currently active
        this.autoPlayTimerId    = null;         // ID of the setTimeout for auto-advancing
        this.isAutoPlaying      = false;        // True if the auto-advance feature is enabled and running

        // Resolve and store DOM elements
        this.viewportElement    = getElementByIdOrNode(viewportId);
        this.itemCollection     = Array.isArray(itemElements) ? itemElements : Array.from(itemElements || []);
        this.controlElements    = Array.isArray(navControls) ? navControls : Array.from(navControls || []);

        // Merge default and custom settings for the component's configuration
        this.configuration      = Object.assign({}, SLIDER_DEFAULTS, customSettings || {});

        // Critical guard clauses for initialization failure
        if (!this.viewportElement || this.itemCollection.length === 0) {
            console.error("SliderWidget: Essential elements (viewport or items) are missing. Initialization aborted.");
            return;
        }

        // Adjust configuration based on chosen transition effect
        if (this.configuration.transitionEffect === 'fade') {
            // Fade transitions implicitly require circular looping for best effect
            this.configuration.loopMode = true;
        }

        // Assign a unique data index to each item for easy reference
        this.itemCollection.forEach((itemNode, idx) => {
            if (itemNode) {
                itemNode.dataIndex = idx;
            }
        });

        // Attach event listeners to navigation controls
        if (this.controlElements.length > 0) {
            this.controlElements.forEach(controlNode => {
                if (controlNode && typeof controlNode.addEventListener === 'function') {
                    controlNode.addEventListener('click', this.handleInteraction.bind(this));
                }
            });
        }

        // Set up mouse wheel navigation if enabled
        if (this.configuration.mouseWheelNavEnabled && typeof this.viewportElement.addEventListener === 'function') {
            const wheelEventHandler = this.handleWheelInput.bind(this); // No bindAsEventListener needed with modern JS
            this.viewportElement.addEventListener('mousewheel', wheelEventHandler, { passive: false }); // Chrome, Safari
            this.viewportElement.addEventListener('DOMMouseScroll', wheelEventHandler, { passive: false }); // Firefox
        }

        // Begin auto-advance if configured
        if (this.configuration.autoPlayEnabled) {
            this.initiateAutoAdvance();
        }

        // Position the slider to an initial item if specified in settings
        if (this.configuration.initial) {
            this.processInitialPosition(this.configuration.initial);
        }

        console.log("SliderWidget initialized successfully.", this.configuration);
    },

    /**
     * Determines and sets the slider's initial display position.
     * @param {string|HTMLElement} initialRef - Reference to the initial item (ID or element).
     */
    processInitialPosition: function(initialRef) {
        const initialElementNode = getElementByIdOrNode(initialRef);
        if (!initialElementNode) {
            console.warn("SliderWidget: Initial item reference not found in DOM.", initialRef);
            return;
        }

        let startingPositionIdx = -1;
        // Find the dataIndex of the initial element
        for (let i = 0; i < this.itemCollection.length; i++) {
            if (this.itemCollection[i] === initialElementNode) {
                startingPositionIdx = i;
                break;
            }
        }

        if (startingPositionIdx === -1) {
            console.warn("SliderWidget: Initial item not found within the item collection.");
            return;
        }

        // Adjust the starting index if multiple items are visible,
        // ensuring the specified item is within the first visible set.
        if (this.configuration.visibleItemCount > 1) {
            const lastPossibleStartIndex = this.itemCollection.length - this.configuration.visibleItemCount;
            if (startingPositionIdx > lastPossibleStartIndex) {
                startingPositionIdx = lastPossibleStartIndex < 0 ? 0 : lastPossibleStartIndex; // Ensure it's not negative
            }
        }
        this.transitionToItem(this.itemCollection[startingPositionIdx]);
    },

    /**
     * Handles click events on navigation controls.
     * @param {Event} interactionEvent - The click event object.
     */
    handleInteraction: function (interactionEvent) {
        this.haltAutoAdvance(); // Always stop auto-advance on user interaction

        const triggeredElement = interactionEvent.target.closest('a, button'); // Find closest interactive element
        if (!triggeredElement) {
            interactionEvent.preventDefault();
            return;
        }

        // Ignore disabled controls
        if (triggeredElement.classList.contains(this.configuration.inactiveClass)) {
            interactionEvent.preventDefault();
            return;
        }

        // Map control actions to methods, replacing the original `eval()` for safety and clarity.
        const actionMap = {
            'prev': this.goBackward,
            'next': this.goForward,
            'first': this.jumpToStart,
            'last': this.jumpToEnd,
            'toggle': this.revertToPrevious
        };

        if (triggeredElement.classList.contains(this.configuration.navControlClass)) {
            const actionKey = triggeredElement.getAttribute('data-action') || triggeredElement.rel; // Use data-action or rel
            const actionFunction = actionMap[actionKey];

            if (typeof actionFunction === 'function') {
                actionFunction.call(this);
            } else {
                console.warn("SliderWidget: Unrecognized navigation control action:", actionKey);
            }
        } else if (triggeredElement.classList.contains(this.configuration.itemSelectorClass)) {
            const targetRef = triggeredElement.getAttribute('data-target') || triggeredElement.rel; // Use data-target or rel
            let itemToTransitionTo = null;

            // Attempt to resolve target by ID first, then by index if numeric
            const resolvedById = getElementByIdOrNode(targetRef);
            if (resolvedById) {
                itemToTransitionTo = resolvedById;
            } else if (!isNaN(parseInt(targetRef, 10))) {
                const targetIndex = parseInt(targetRef, 10);
                if (targetIndex >= 0 && targetIndex < this.itemCollection.length) {
                    itemToTransitionTo = this.itemCollection[targetIndex];
                }
            }

            if (itemToTransitionTo) {
                this.transitionToItem(itemToTransitionTo);

                // Update 'selected' state for jumper controls
                if (this.configuration.activeSelectorClass) {
                    this.controlElements.forEach(ctrl => ctrl.classList.remove(this.configuration.activeSelectorClass));
                    triggeredElement.classList.add(this.configuration.activeSelectorClass);
                }
            } else {
                console.warn("SliderWidget: Jumper target invalid or not found:", targetRef);
            }
        }

        // Temporarily disable controls during animation, re-enabled by afterFinish callback
        this.disableNavigationButtons();

        interactionEvent.preventDefault(); // Prevent default link/button behavior
        interactionEvent.stopPropagation();
    },

    /**
     * Initiates the visual transition to a specified item within the slider.
     * @param {HTMLElement} targetItemNode - The DOM element of the item to transition to.
     * @returns {boolean} False to indicate event prevention (if used as an event handler).
     */
    transitionToItem: function (targetItemNode) {
        if (!targetItemNode || this.isAnimating) {
            // Guard against invalid target or concurrent animations
            return false;
        }

        // Execute 'beforeMove' callback if provided in configuration
        if (typeof this.configuration.beforeMove === 'function') {
            this.configuration.beforeMove();
        }

        // Update tracking of current and previous items
        this.lastSelectedItem = this.currentSelectedItem || this.itemCollection[0];
        this.currentSelectedItem  = targetItemNode;

        // Calculate current viewport and target item positions for animation
        const viewportRect = this.viewportElement.getBoundingClientRect();
        const itemRect     = this.currentSelectedItem.getBoundingClientRect();

        // If an animation is already in progress, cancel it to avoid conflicts
        if (this.currentAnimationInstance) {
            this.currentAnimationInstance.cancel();
            this.currentAnimationInstance = null;
        }

        this.isAnimating = true; // Set flag to indicate animation is active

        // Callback function executed after an animation completes
        const onAnimationFinished = () => {
            this.isAnimating = false; // Reset animation flag
            this.enableNavigationButtons(); // Re-enable controls
            if (typeof this.configuration.afterMove === 'function') {
                this.configuration.afterMove(); // Execute 'afterMove' callback
            }
        };

        // Select and start the appropriate animation effect
        switch (this.configuration.transitionEffect) {
            case 'fade':
                // Fade effect involves fading out, repositioning, then fading in.
                this.currentAnimationInstance = new AnimationEngine.Fader(this.viewportElement, {
                    from: 1.0,
                    to: 0,
                    duration: this.configuration.animationDuration,
                    afterFinish: () => {
                        // After fading out, instantly adjust scroll position
                        this.viewportElement.scrollLeft = itemRect.left - viewportRect.left;
                        this.viewportElement.scrollTop  = itemRect.top - viewportRect.top;

                        // Then, fade the viewport back in
                        new AnimationEngine.Fader(this.viewportElement, {
                            from: 0,
                            to: 1.0,
                            duration: this.configuration.animationDuration,
                            afterFinish: onAnimationFinished
                        }).start();
                    }
                });
                this.currentAnimationInstance.start();
                break;

            case 'scroll':
            default:
                // Scroll effect moves the viewport smoothly to the target item.
                const selectedEasing = CustomEasing[this.configuration.easingFunction] ?
                                        this.configuration.easingFunction : 'sinoidal';

                this.currentAnimationInstance = new AnimationEngine.Scroller(this.viewportElement, {
                    duration: this.configuration.animationDuration,
                    targetX: (itemRect.left - viewportRect.left), // Absolute scroll position X
                    targetY: (itemRect.top - viewportRect.top),   // Absolute scroll position Y
                    transition: selectedEasing,
                    afterFinish: onAnimationFinished
                });
                this.currentAnimationInstance.start();
                break;
        }

        return false;
    },

    /**
     * Navigates the slider to the previous item.
     */
    goBackward: function () {
        if (this.isAnimating || this.itemCollection.length === 0) return;

        let currentIdx = this.currentSelectedItem ? this.currentSelectedItem.dataIndex : 0;
        let prevItemIdx = currentIdx - 1;

        if (prevItemIdx < 0) {
            if (this.configuration.loopMode) {
                prevItemIdx = this.itemCollection.length - 1;
                // For circular scroll (non-fade), instantly jump to the end visually
                if (this.configuration.transitionEffect !== 'fade') {
                    const lastItem = this.itemCollection[this.itemCollection.length - 1];
                    this.viewportElement.scrollLeft = lastItem.offsetLeft;
                    this.viewportElement.scrollTop = lastItem.offsetTop;
                    prevItemIdx = this.itemCollection.length - 2; // Then animate to second-to-last
                }
            } else {
                prevItemIdx = 0; // Stay at first item if not looping
            }
        }
        this.transitionToItem(this.itemCollection[prevItemIdx]);
    },

    /**
     * Navigates the slider to the next item.
     */
    goForward: function () {
        if (this.isAnimating || this.itemCollection.length === 0) return;

        let currentIdx = this.currentSelectedItem ? this.currentSelectedItem.dataIndex : 0;
        let nextItemIdx = currentIdx + 1;

        if (nextItemIdx >= this.itemCollection.length) {
            if (this.configuration.loopMode) {
                nextItemIdx = 0;
                // For circular scroll (non-fade), instantly jump to the start visually
                if (this.configuration.transitionEffect !== 'fade') {
                    this.viewportElement.scrollLeft = 0;
                    this.viewportElement.scrollTop  = 0;
                    nextItemIdx = 1; // Then animate to second item
                }
            } else {
                nextItemIdx = this.itemCollection.length - 1; // Stay at last item if not looping
            }
        }

        // Adjust for multiple visible items to ensure the last possible set is shown
        if (this.configuration.visibleItemCount > 1) {
            const lastPossibleNextIndex = this.itemCollection.length - this.configuration.visibleItemCount;
            if (nextItemIdx > lastPossibleNextIndex) {
                nextItemIdx = lastPossibleNextIndex < 0 ? 0 : lastPossibleNextIndex;
            }
        }

        this.transitionToItem(this.itemCollection[nextItemIdx]);
    },

    /**
     * Jumps the slider directly to the first item.
     */
    jumpToStart: function () {
        if (this.isAnimating || this.itemCollection.length === 0) return;
        this.transitionToItem(this.itemCollection[0]);
    },

    /**
     * Jumps the slider directly to the last item.
     */
    jumpToEnd: function () {
        if (this.isAnimating || this.itemCollection.length === 0) return;
        this.transitionToItem(this.itemCollection[this.itemCollection.length - 1]);
    },

    /**
     * Reverts the slider to the previously selected item.
     * @returns {boolean} True if a revert occurred, false otherwise.
     */
    revertToPrevious: function () {
        if (this.isAnimating || !this.lastSelectedItem) {
            console.warn("SliderWidget: No previous item to revert to, or animation in progress.");
            return false;
        }
        this.transitionToItem(this.lastSelectedItem);
        return true;
    },

    /**
     * Stops the auto-advance timer and clears the auto-play flag.
     */
    haltAutoAdvance: function () {
        if (this.autoPlayTimerId) {
            clearTimeout(this.autoPlayTimerId);
            this.autoPlayTimerId = null;
            this.isAutoPlaying = false;
            console.log("SliderWidget: Auto-advance halted.");
        }
    },

    /**
     * Initiates the auto-advance functionality.
     */
    initiateAutoAdvance: function () {
        if (this.isAutoPlaying || !this.configuration.autoPlayEnabled) {
            // Already auto-playing or feature not enabled, do nothing
            return;
        }
        this.isAutoPlaying = true;
        // Schedule the first advance with a slight delay to allow UI to settle
        this.autoPlayTimerId = setTimeout(this.scheduleNextAdvance.bind(this), 100);
        console.log("SliderWidget: Auto-advance initiated.");
    },

    /**
     * Suspends auto-advance and enables navigation controls.
     */
    suspendAutoAdvance: function () {
        this.haltAutoAdvance();
        this.enableNavigationButtons();
    },

    /**
     * Resumes auto-advance, typically after a user interaction or mouse leave event.
     * @param {Event} [interactionEvent] - Optional event object, used to check related target.
     */
    continueAutoAdvance: function (interactionEvent) {
        let shouldResume = true;
        if (interactionEvent) {
            const relatedTargetNode = interactionEvent.relatedTarget || interactionEvent.toElement; // IE compatibility
            if (relatedTargetNode) {
                // Only resume if the mouse has left the slider's item area
                shouldResume = Array.from(this.itemCollection).every(item =>
                    item !== relatedTargetNode && !item.contains(relatedTargetNode)
                );
            }
        }

        if (shouldResume) {
            this.initiateAutoAdvance();
        }
    },

    /**
     * Schedules the next auto-advance movement. This method calls itself recursively.
     */
    scheduleNextAdvance: function () {
        if (!this.isAutoPlaying) {
            // Guard against scheduling if auto-play was stopped externally
            return;
        }

        // Perform the next item transition
        this.goForward();

        // Clear any existing timer and set a new one
        if (this.autoPlayTimerId) {
            clearTimeout(this.autoPlayTimerId);
        }
        this.autoPlayTimerId = setTimeout(this.scheduleNextAdvance.bind(this),
                                            this.configuration.autoPlayIntervalSec * 1000);
    },

    /**
     * Handles mouse wheel events for navigation.
     * @param {Event} interactionEvent - The mouse wheel event object.
     * @returns {number} The rounded scroll delta (for Safari compatibility).
     */
    handleWheelInput: function (interactionEvent) {
        if (!this.configuration.mouseWheelNavEnabled || this.isAnimating) {
            return 0;
        }

        interactionEvent.preventDefault(); // Prevent page scrolling
        interactionEvent.stopPropagation();

        let scrollDelta = 0;
        if (interactionEvent.wheelDelta) { // Standard for Chrome, Safari, Edge
            scrollDelta = interactionEvent.wheelDelta / 120;
        } else if (interactionEvent.detail) { // Firefox specific
            scrollDelta = -interactionEvent.detail / 3;
        }

        if (scrollDelta > 0) {
            this.goBackward();
        } else if (scrollDelta < 0) {
            this.goForward();
        }

        return Math.round(scrollDelta); // Return rounded delta as per original code
    },

    /**
     * Adds the 'inactive' class to all navigation controls to visually disable them.
     */
    disableNavigationButtons: function () {
        if (this.controlElements) {
            this.controlElements.forEach(ctrl => {
                if (ctrl) ctrl.classList.add(this.configuration.inactiveClass);
            });
        }
    },

    /**
     * Removes the 'inactive' class from all navigation controls to visually enable them.
     */
    enableNavigationButtons: function () {
        if (this.controlElements) {
            this.controlElements.forEach(ctrl => {
                if (ctrl) ctrl.classList.remove(this.configuration.inactiveClass);
            });
        }
    }
});

/**
 * A custom `Class.create` implementation to mimic Prototype.js's class system.
 * This provides a structural replacement for the framework's class definition utility.
 * @param {object} parent - The parent class/object to inherit from.
 * @param {object} properties - An object containing methods and properties for the new class.
 * @returns {function} The newly created constructor function for the class.
 */
function ClassCreate(parent, properties) {
    var NewClass = function() {
        // Call the `setupComponent` method as the constructor if it exists.
        // This convention replaces `initialize` from the original code.
        if (typeof this.initializeAnimation === 'function') { // For animation classes
            this.initializeAnimation.apply(this, arguments);
        } else if (typeof this.setupComponent === 'function') { // For main component
            this.setupComponent.apply(this, arguments);
        }
    };

    // Inherit from the parent prototype
    if (parent) {
        NewClass.prototype = Object.create(parent.prototype || parent);
        NewClass.prototype.constructor = NewClass;
    }

    // Assign new properties and methods to the prototype
    Object.assign(NewClass.prototype, properties);

    // Add a simplified `bindAsEventListener` helper directly to the prototype
    // to maintain compatibility with the original event binding style for mousewheel.
    if (!NewClass.prototype.bindAsEventListener) {
        NewClass.prototype.bindAsEventListener = function(method) {
            const self = this;
            return function(event) {
                return method.call(self, event);
            };
        };
    }

    return NewClass;
}

// Global `Class` object with a `create` method, replacing Prototype.js's global `Class`.
var Class = {
    create: ClassCreate
};

// Note: The original code also used `Object.extend` for merging objects and extending prototypes.
// For options merging, `Object.assign` is used directly within methods.
// For prototype extension, the custom `Class.create` handles this internally.
// This avoids relying on a global `Object.extend` polyfill or direct replacement.