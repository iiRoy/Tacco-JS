(function(pluginBuilder) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], pluginBuilder);
    } else {
        pluginBuilder(jQuery);
    }
}(function(jQ) {

    'use strict';

    /**
     * Common jQuery objects.
     */
    const documentHandler = jQ(document);
    const windowHandler = jQ(window);

    /**
     * CSS class identifiers.
     */
    const displayClasses = {
        boxClass     : 'scaler-box',
        visualClass  : 'scaler-visual',
        concealedClass: 'scaler-concealed'
    };

    /**
     * Default configuration.
     */
    const standardSettings = {
        applyStyleSheet: true,
        wrapperElement : 'parent',
        placement      : {
            x: 'center',
            y: 'center'
        },
        delayDuration  : 100
    };

    /**
     * Feature detection for background-size.
     */
    const supportsBackgroundCover = 'backgroundSize' in document.createElement('div').style;

    /**
     * Lookup table for position calculations.
     */
    const positionCalculators = {
        y: {
            'top': (containerDim, itemDim) => ({ top: 0, bottom: 'auto' }),
            'bottom': (containerDim, itemDim) => ({ bottom: 0, top: 'auto' }),
            'center': (containerDim, itemDim) => ({ top: (containerDim - itemDim) / 2, bottom: 'auto' }),
        },
        x: {
            'left': (containerDim, itemDim) => ({ left: 0, right: 'auto' }),
            'right': (containerDim, itemDim) => ({ right: 0, left: 'auto' }),
            'center': (containerDim, itemDim) => ({ left: (containerDim - itemDim) / 2, right: 'auto' }),
        }
    };

    /**
     * Manages scaling and positioning of an image within a container.
     */
    class ContentScaler {
        constructor(visualElement, userOptions) {
            this.originalVisual = visualElement;
            this.jQVisual = jQ(visualElement);
            this.activeSettings = Object.assign({}, standardSettings, userOptions);

            this.calculationData = {
                visual: { width: null, height: null },
                enclosure: { width: null, height: null },
                proportions: { visual: null, enclosure: null }
            };

            if (this.activeSettings.wrapperElement === 'parent') {
                this.jQEnclosure = this.jQVisual.parent();
            } else if (this.activeSettings.wrapperElement instanceof jQ && this.activeSettings.wrapperElement.length) {
                this.jQEnclosure = this.activeSettings.wrapperElement;
            } else {
                this.reportError('The designated enclosure element is invalid.');
                return;
            }

            this.instanceKey = this.generateUniqueId();
            this.initializeOperation();
        }

        /**
         * Sets up the scaling logic.
         */
        initializeOperation() {
            this.jQVisual.addClass(displayClasses.visualClass);
            this.jQEnclosure.addClass(displayClasses.boxClass);

            if (supportsBackgroundCover && this.activeSettings.applyStyleSheet) {
                this.configureBackground();
            } else if (!supportsBackgroundCover || !this.activeSettings.applyStyleSheet) {
                this.establishListeners();
                this.adjustDisplay();
            } else {
                this.reportError('No available scaling mechanism.');
                return;
            }
        }

        /**
         * Applies image as CSS background.
         */
        configureBackground() {
            this.jQVisual.addClass(displayClasses.concealedClass);
            this.jQEnclosure.css({
                'background-image': `url(${this.originalVisual.src})`,
                'background-position': `${this.activeSettings.placement.x} ${this.activeSettings.placement.y}`,
                'background-size': 'cover', // Added for completeness, though original relies on 'backgroundSize' check
                'background-repeat': 'no-repeat'
            });
        }

        /**
         * Attaches event handlers for responsiveness.
         */
        establishListeners() {
            const self = this;
            windowHandler.on(`resize.${this.instanceKey} orientationchange.${this.instanceKey}`, this.rateLimitFunction(() => {
                    self.adjustDisplay();
                },
                this.activeSettings.delayDuration
            ));
        }

        /**
         * Triggers dimension recalculation and visual update.
         */
        adjustDisplay() {
            this.calculateProportions();
            this.refreshVisualPosition();
        }

        /**
         * Determines current ratios of the image and its container.
         */
        calculateProportions() {
            const currentVisual = this.jQVisual;
            const currentEnclosure = this.jQEnclosure;
            const data = this.calculationData;

            // Calculate visual proportions only once
            if (!data.proportions.visual) {
                const visualWidthAttr = parseInt(currentVisual.attr('width'), 10);
                const visualHeightAttr = parseInt(currentVisual.attr('height'), 10);

                if (isNaN(visualWidthAttr) || isNaN(visualHeightAttr)) {
                    this.reportError('Source image needs width/height attributes for dynamic scaling.');
                    return;
                }

                data.visual.width = visualWidthAttr;
                data.visual.height = visualHeightAttr;
                data.proportions.visual = visualHeightAttr / visualWidthAttr;
            }

            // Calculate enclosure proportions
            const enclosureWidth = currentEnclosure.width();
            const enclosureHeight = currentEnclosure.height();

            data.enclosure.width = enclosureWidth;
            data.enclosure.height = enclosureHeight;
            data.proportions.enclosure = enclosureHeight / enclosureWidth;
        }

        /**
         * Updates the image's style properties for positioning and sizing.
         */
        refreshVisualPosition() {
            const currentVisual = this.jQVisual;
            const proportions = this.calculationData.proportions;
            const enclosureDims = this.calculationData.enclosure;
            const config = this.activeSettings;

            let computedStyles = {
                width: 0,
                height: 0,
                top: 'auto',
                right: 'auto',
                bottom: 'auto',
                left: 'auto'
            };

            // Determine visual dimensions
            if (proportions.visual < proportions.enclosure) {
                computedStyles.height = enclosureDims.height;
                computedStyles.width = enclosureDims.height / proportions.visual;
            } else {
                computedStyles.width = enclosureDims.width;
                computedStyles.height = enclosureDims.width * proportions.visual;
            }

            // Apply vertical positioning
            const verticalPosHandler = positionCalculators.y[config.placement.y];
            if (verticalPosHandler) {
                Object.assign(computedStyles, verticalPosHandler(enclosureDims.height, computedStyles.height));
            } else {
                this.reportError('Invalid vertical placement setting.');
                return;
            }

            // Apply horizontal positioning
            const horizontalPosHandler = positionCalculators.x[config.placement.x];
            if (horizontalPosHandler) {
                Object.assign(computedStyles, horizontalPosHandler(enclosureDims.width, computedStyles.width));
            } else {
                this.reportError('Invalid horizontal placement setting.');
                return;
            }

            currentVisual.css(computedStyles);
        }

        /**
         * Cleans up the instance and reverts changes.
         */
        terminateInstance() {
            this.jQVisual
                .removeClass(displayClasses.concealedClass)
                .removeClass(displayClasses.visualClass)
                .removeAttr('style');

            this.jQEnclosure
                .removeClass(displayClasses.boxClass)
                .removeAttr('style');

            windowHandler.off(`resize.${this.instanceKey} orientationchange.${this.instanceKey}`);
            this.jQVisual.removeData('contentScalerInstance');
        }

        /**
         * Generates a unique string identifier.
         */
        generateUniqueId() {
            return `scl${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
        }

        /**
         * Logs an error message.
         */
        reportError(issueMessage) {
            window.alert(`ContentScaler Issue: ${issueMessage}`);
        }

        /**
         * Limits how often a function can be executed.
         */
        rateLimitFunction(actionToExecute, delayDuration, throttleOptions = {}) {
            let timerReference = null;
            let lastExecutionTimestamp = 0;
            let invocationContext, invocationArguments, operationOutcome;

            const executeDelayed = () => {
                lastExecutionTimestamp = throttleOptions.leadingCall === false ? 0 : Date.now();
                timerReference = null;
                operationOutcome = actionToExecute.apply(invocationContext, invocationArguments);
            };

            return function(...args) {
                const currentMoment = Date.now();
                let timeUntilNextAllowed;

                if (!lastExecutionTimestamp && throttleOptions.leadingCall === false) {
                    lastExecutionTimestamp = currentMoment;
                }

                timeUntilNextAllowed = delayDuration - (currentMoment - lastExecutionTimestamp);
                invocationContext = this;
                invocationArguments = args;

                if (timeUntilNextAllowed <= 0 || timeUntilNextAllowed > delayDuration) {
                    clearTimeout(timerReference);
                    timerReference = null;
                    lastExecutionTimestamp = currentMoment;
                    operationOutcome = actionToExecute.apply(invocationContext, invocationArguments);
                } else {
                    if (!timerReference && throttleOptions.leadingCall !== false) {
                        timerReference = setTimeout(executeDelayed, timeUntilNextAllowed);
                    }
                }
                return operationOutcome;
            };
        }
    }

    /**
     * Integrates ContentScaler as a jQuery plugin.
     */
    jQ.fn.imageHarmonizer = function(pluginArguments) {
        return this.each(function() {
            const currentElement = jQ(this);
            let activeInstance = currentElement.data('contentScalerInstance');

            if (!activeInstance) {
                if (typeof pluginArguments !== 'string') {
                    currentElement.data('contentScalerInstance', new ContentScaler(this, pluginArguments));
                }
            } else {
                if (typeof pluginArguments === 'string') {
                    if (typeof activeInstance[pluginArguments] === 'function') {
                        activeInstance[pluginArguments]();
                    } else {
                        ContentScaler.prototype.reportError('Invalid method specified.');
                    }
                }
            }
        });
    };

}));