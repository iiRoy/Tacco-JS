/*
 * Custom JavaScript Widget for Dynamic Content Display
 * Copyright (c) 2023 Acme Corp. - All rights reserved
 * This code is provided as-is, without warranty of any kind.
 */
 
SliderWidget = Component.define(BaseComponent, {
    initiate: function (viewContainer, contentItems, actionElements, settings) {
        // Initialize internal state variables
        this.isAnimating       = false;
        this.viewport          = DOM.getElement(viewContainer);
        this.itemElements      = contentItems;
        this.navigationButtons = actionElements;

        // Merge default configuration with provided settings
        this.configuration = Utility.merge({
            animDuration:        1,
            autoPlay:            false,
            updateInterval:      3,
            displayCount:        1,
            controlButtonClass:  'widget-control-btn',
            jumpLinkClass:       'widget-jump-link',
            inactiveStateClass:  'widget-disabled',
            activeStateClass:    'widget-selected',
            loopEnabled:         false,
            wheelSupport:        true,
            visualEffect:        'pan',
            easingStyle:         'oscillating'
        }, settings || {});
        
        // Adjust circular option for 'dissolve' effect
        if (this.configuration.visualEffect === 'dissolve') {
            this.configuration.loopEnabled = true;
        }

        // Assign a unique data index to each content item
        this.itemElements.forEachItem(function(item, idx) {
            item.dataIndex = idx;
        });

        // Set up click listeners for navigation controls
        if (this.navigationButtons) {
            this.navigationButtons.callMethodOnAll('onEvent', 'click', this.handleActivation.attachContext(this));
        }
        
        // Enable mouse wheel support if configured
        if (this.configuration.wheelSupport) {            
            this.viewport.onEvent('mousewheel', this.handleWheelInteraction.attachListenerContext(this))
                         .onEvent('DOMMouseScroll', this.handleWheelInteraction.attachListenerContext(this));
        }

        // Start automatic advancement if autoPlay is enabled
        if (this.configuration.autoPlay) {
            this.beginAutoAdvance();
        }

        // Handle initial item selection if specified
        if (this.configuration.initialItem) {
            let startingPosition = this.itemElements.indexOf(DOM.getElement(this.configuration.initialItem));
            if (startingPosition > (this.configuration.displayCount - 1) && this.configuration.displayCount > 1) {               
                if (startingPosition > this.itemElements.length - (this.configuration.displayCount + 1)) {
                    startingPosition = this.itemElements.length - this.configuration.displayCount;
                }
            }
            this.transitionTo(this.itemElements[startingPosition]);
        }
    },

    handleActivation: function (evt) {
        // Stop any ongoing auto-advancement
        this.haltMovement();

        let targetElement = evt.findDescendant('a');

        // Process click if the element is not disabled
        if (!targetElement.hasClass(this.configuration.inactiveStateClass)) {
            if (targetElement.hasClass(this.configuration.controlButtonClass)) {
                // Execute a control method based on the 'rel' attribute
                this[targetElement.rel]();
            } else if (targetElement.hasClass(this.configuration.jumpLinkClass)) {
                // Move to a specific item and update selection
                this.transitionTo(targetElement.rel);
                if (this.configuration.activeStateClass) {
                    this.navigationButtons.callMethodOnAll('removeClass', this.configuration.activeStateClass);
                    targetElement.addClass(this.configuration.activeStateClass);
                }
            }
        }

        // Disable controls temporarily during transition
        this.disableNavigation();

        // Prevent default event behavior
        evt.preventDefaults();
    },

    transitionTo: function (destinationItem) {
        // Execute pre-move callback if defined
        if (this.configuration.beforeMove && (typeof this.configuration.beforeMove === 'function')) {
            this.configuration.beforeMove();
        }

        // Update previous and current item references
        this.previousItem  = this.currentItem ? this.currentItem : this.itemElements[0];
        this.currentItem   = DOM.getElement(destinationItem);

        // Calculate offsets for scrolling
        let viewportOffset = this.viewport.totalOffset();
        let itemOffset     = this.currentItem.totalOffset();

        // Cancel any existing animation
        if (this.currentAnimation) {
            this.currentAnimation.abort();
        }

        // Apply the specified visual effect
        switch (this.configuration.visualEffect) {
            case 'dissolve':               
                this.currentAnimation = new Animation.Fade(this.viewport, {
                    from:       1.0,
                    to:         0,
                    duration:   this.configuration.animDuration,
                    afterFinish: (function () {
                        // Adjust scroll position after fade out
                        this.viewport.scrollLeft = itemOffset[0] - viewportOffset[0];
                        this.viewport.scrollTop  = itemOffset[1] - viewportOffset[1];

                        // Fade back in
                        new Animation.Fade(this.viewport, {
                            from: 0,
                            to: 1.0,
                            duration: this.configuration.animDuration,
                            afterFinish: (function () {
                                if (this.navigationButtons) {
                                    this.enableNavigation();
                                }
                                // Execute post-move callback
                                if (this.configuration.afterMove && (typeof this.configuration.afterMove === 'function')) {
                                    this.configuration.afterMove();
                                }
                            }).attachContext(this)
                        });
                    }
                ).attachContext(this)});
            break;
            case 'pan':
            default:
                let easingFunction;
                switch (this.configuration.easingStyle) {
                    case 'elastic':
                        easingFunction = Animation.Easing.springy;
                        break;
                    case 'oscillating':
                    default:
                        easingFunction = Animation.Easing.waveLike;
                        break;
                }

                // Perform smooth scrolling animation
                this.currentAnimation = new Animation.SmoothMove(this.viewport, {
                    duration:   this.configuration.animDuration,
                    horizontalTarget: (itemOffset[0] - viewportOffset[0]),
                    verticalTarget:   (itemOffset[1] - viewportOffset[1]),
                    transition: easingFunction,
                    afterFinish: (function () {
                        if (this.navigationButtons) {
                            this.enableNavigation();
                        }
                        // Execute post-move callback
                        if (this.configuration.afterMove && (typeof this.configuration.afterMove === 'function')) {
                            this.configuration.afterMove();
                        }                        
                        this.currentAnimation = false;
                    }).attachContext(this)});
            break;
        }

        return false;
    },

    navigateBackward: function () {
        let currentIdx;
        if (this.currentItem) {
            currentIdx = this.currentItem.dataIndex;
            let previousIdx = (currentIdx === 0) ? (this.configuration.loopEnabled ? this.itemElements.length - 1 : 0) : currentIdx - 1;
        } else {
            let previousIdx = (this.configuration.loopEnabled ? this.itemElements.length - 1 : 0);
        }

        // Adjust scroll position for circular "pan" effect when wrapping around
        if (previousIdx === (this.itemElements.length - 1) && this.configuration.loopEnabled && this.configuration.visualEffect !== 'dissolve') {
            this.viewport.scrollLeft =  (this.itemElements.length - 1) * this.itemElements.first().getVisualWidth();
            this.viewport.scrollTop  =  (this.itemElements.length - 1) * this.itemElements.first().getVisualHeight();
            previousIdx = this.itemElements.length - 2;
        }

        this.transitionTo(this.itemElements[previousIdx]);
    },

    navigateForward: function () {
        let currentIdx;
        if (this.currentItem) {
            currentIdx = this.currentItem.dataIndex;
            let nextIdx = (this.itemElements.length - 1 === currentIdx) ? (this.configuration.loopEnabled ? 0 : currentIdx) : currentIdx + 1;
        } else {
            let nextIdx = 1;
        }

        // Adjust scroll position for circular "pan" effect when wrapping around
        if (nextIdx === 0 && this.configuration.loopEnabled && this.configuration.visualEffect !== 'dissolve') {
            this.viewport.scrollLeft = 0;
            this.viewport.scrollTop  = 0;
            nextIdx = 1;
        }

        // Adjust next index if near the end and not all slides are visible
        if (nextIdx > this.itemElements.length - (this.configuration.displayCount + 1)) {
            nextIdx = this.itemElements.length - this.configuration.displayCount;
        }        

        this.transitionTo(this.itemElements[nextIdx]);
    },

    goToStart: function () {
        this.transitionTo(this.itemElements[0]);
    },

    goToEnd: function () {
        this.transitionTo(this.itemElements[this.itemElements.length - 1]);
    },

    switchBack: function () {
        if (this.previousItem) {
            this.transitionTo(this.itemElements[this.previousItem.dataIndex]);
        } else {
            return false;
        }
    },

    haltMovement: function () {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }
    },

    beginAutoAdvance: function () { 
        this.advancePeriodically();
    },

    suspendAutoAdvance: function () {
        this.haltMovement();
        this.enableNavigation();
    },

    continueAutoAdvance: function (evt) {
        if (evt) {
            let relatedTargetElement = evt.relatedTarget || evt.toElement;
            // Resume if mouse leaves the widget area
            if (!relatedTargetElement || (!this.itemElements.contains(relatedTargetElement) && !this.itemElements.someMatch(function (item) { return relatedTargetElement.isChildOf(item); }))) {
                this.beginAutoAdvance();
            }
        } else {
            this.beginAutoAdvance();
        }
    },

    advancePeriodically: function () {
        // Clear existing timer and advance to the next item
        if (this.autoAdvanceTimer !== null) {
            clearTimeout(this.autoAdvanceTimer);
            this.navigateForward();
        }
        // Set a new timer for the next advancement
        this.autoAdvanceTimer = setTimeout(this.advancePeriodically.attachContext(this), this.configuration.updateInterval * 1000);
    },
    
    handleWheelInteraction: function (mouseEvt) {
        mouseEvt.cancelPropagation = true;
        mouseEvt.preventDefaults();
        
        let scrollDelta = 0;
        if (!mouseEvt) {
            mouseEvt = window.event;
        }
        if (mouseEvt.wheelDelta) {
            scrollDelta = mouseEvt.wheelDelta / 120; // Standard wheel delta
        } else if (mouseEvt.detail) { 
            scrollDelta = -mouseEvt.detail / 3;     // Firefox wheel detail
        }        
       
        // Trigger navigation if no animation is currently active
        if (!this.isAnimating) {
            this.disableNavigation();
            if (scrollDelta > 0) {
                this.navigateBackward();
            } else {
                this.navigateForward();
            }            
        }
        
        return Math.round(scrollDelta); // Safari may return fractional delta
    },

    disableNavigation: function () {
        this.navigationButtons.callMethodOnAll('addClass', this.configuration.inactiveStateClass);
    },

    enableNavigation: function () {
        this.navigationButtons.callMethodOnAll('removeClass', this.configuration.inactiveStateClass);
    }
});


Animation.SmoothMove = Component.define();
Utility.merge(Utility.merge(Animation.SmoothMove.prototype, Animation.BaseEffect.prototype), {
    initiate: function (targetDomElement) {
        this.targetDomElement = DOM.getElement(targetDomElement);
        let animationSettings = Utility.merge({ horizontalTarget: 0, verticalTarget: 0, positioningMode: 'absolute' } , arguments[1] || {});
        this.start(animationSettings);
    },

    setup: function () {
        // Prepare element for continuous scrolling if enabled
        if (this.animationSettings.continuousLoop && !this.targetDomElement._extended) {
            this.targetDomElement.cleanWhitespace();
            this.targetDomElement._extended = true;
            this.targetDomElement.appendChild(this.targetDomElement.firstChild);
        }

        this.initialScrollLeft = this.targetDomElement.scrollLeft;
        this.initialScrollTop  = this.targetDomElement.scrollTop;

        // Adjust target coordinates based on positioning mode
        if (this.animationSettings.positioningMode === 'absolute') {
            this.animationSettings.horizontalTarget -= this.initialScrollLeft;
            this.animationSettings.verticalTarget   -= this.initialScrollTop;
        }
    },

    update: function (progressRatio) {
        // Update scroll position based on animation progress
        this.targetDomElement.scrollLeft = this.animationSettings.horizontalTarget * progressRatio + this.initialScrollLeft;
        this.targetDomElement.scrollTop  = this.animationSettings.verticalTarget   * progressRatio + this.initialScrollTop;
    }
});