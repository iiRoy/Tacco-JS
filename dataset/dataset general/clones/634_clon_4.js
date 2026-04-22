(function() {
    // Custom easing function for smoother animations
    function calculateEase(progress) {
        return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    }

    // Generic animation utility using requestAnimationFrame
    function performTransition(elementNode, styleProperty, initialValue, finalValue, durationMilliseconds, onCompletionCallback) {
        const startTime = performance.now();
        const valueDifference = finalValue - initialValue;

        function animationStep(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMilliseconds, 1);
            const easedProgress = calculateEase(progress);

            elementNode.style[styleProperty] = (initialValue + valueDifference * easedProgress) + 'px';

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                if (onCompletionCallback) {
                    onCompletionCallback();
                }
            }
        }
        requestAnimationFrame(animationStep);
    }

    // Default configuration for the scroller instances
    const standardSettings = {
        componentLabel: 'Content Scroller',
        nextActionSelector: null,
        previousActionSelector: null,
        pauseActionSelector: null,
        resumeActionSelector: null,
        itemDisplayHeight: '100px',
        animationDuration: 800,
        scrollInterval: 4000,
        maxDisplayedItems: null,
        haltOnHover: false,
        scrollDirection: 'down'
    };

    // Main class for the vertical item scroller
    class ItemScrollerComponent {
        constructor(hostElement, customConfiguration) {
            this.containerElement = hostElement;
            this.activeConfiguration = { ...standardSettings, ...customConfiguration };

            this.currentAnimationId = null;
            this.cycleStartTime = 0;
            this.singleItemPixelHeight = parseFloat(this.activeConfiguration.itemDisplayHeight);

            // Numeric multiplier for scroll direction: 1 for 'down', -1 for 'up'
            this.movementFactor = this.activeConfiguration.scrollDirection === 'up' ? -1 : 1;

            this.initiateComponent();
        }

        initiateComponent() {
            this.configureContainerVisuals();
            this.bindInteractionEvents();
            this.beginContinuousScrolling();
        }

        beginContinuousScrolling() {
            this.stopContinuousScrolling(); // Ensure no prior animations are running
            this.cycleStartTime = performance.now();

            const animationCycle = (currentTime) => {
                if (this.currentAnimationId === null) return; // Component was stopped externally

                const timeSinceLastCycleStart = currentTime - this.cycleStartTime;

                if (timeSinceLastCycleStart >= this.activeConfiguration.scrollInterval) {
                    // Time to initiate a new scroll step
                    if (this.movementFactor === 1) { // Equivalent to original 'down' direction
                        this.executeScrollDownTransition();
                    } else { // Equivalent to original 'up' direction
                        this.executeScrollUpTransition();
                    }
                    this.cycleStartTime = currentTime; // Reset timer for the next interval
                }
                this.currentAnimationId = requestAnimationFrame(animationCycle);
            };
            this.currentAnimationId = requestAnimationFrame(animationCycle);
        }

        stopContinuousScrolling() {
            if (this.currentAnimationId) {
                cancelAnimationFrame(this.currentAnimationId);
                this.currentAnimationId = null;
            }
        }

        recommenceScrolling() {
            this.stopContinuousScrolling();
            this.beginContinuousScrolling();
        }

        executeScrollDownTransition() {
            const topItem = this.containerElement.firstElementChild;
            if (!topItem) return;

            performTransition(topItem, 'marginTop', 0, -this.singleItemPixelHeight, this.activeConfiguration.animationDuration, () => {
                topItem.remove();
                topItem.style.marginTop = '0px';
                this.containerElement.appendChild(topItem);
            });
        }

        executeScrollUpTransition() {
            const bottomItem = this.containerElement.lastElementChild;
            if (!bottomItem) return;

            bottomItem.remove();
            this.containerElement.prepend(bottomItem);
            bottomItem.style.marginTop = -this.singleItemPixelHeight + 'px';

            performTransition(bottomItem, 'marginTop', -this.singleItemPixelHeight, 0, this.activeConfiguration.animationDuration, () => {
                // No specific action needed here other than animation completion
            });
        }

        configureContainerVisuals() {
            if (typeof this.activeConfiguration.maxDisplayedItems === "number" && this.activeConfiguration.maxDisplayedItems !== null) {
                const calculatedHeight = this.singleItemPixelHeight * this.activeConfiguration.maxDisplayedItems;
                this.containerElement.style.height = calculatedHeight + 'px';
                this.containerElement.style.overflow = 'hidden';
            } else {
                this.containerElement.style.overflow = 'hidden';
            }
        }

        bindInteractionEvents() {
            // Mapping control selectors to their respective action functions
            const interactionMap = {
                pauseActionSelector: this.stopContinuousScrolling.bind(this),
                resumeActionSelector: this.beginContinuousScrolling.bind(this),
                previousActionSelector: () => {
                    this.stopContinuousScrolling();
                    // 'Previous' action is like an 'up' scroll
                    const bottomItem = this.containerElement.lastElementChild;
                    if (!bottomItem) { this.recommenceScrolling(); return; }

                    bottomItem.remove();
                    this.containerElement.prepend(bottomItem);
                    bottomItem.style.marginTop = -this.singleItemPixelHeight + 'px';

                    performTransition(bottomItem, 'marginTop', -this.singleItemPixelHeight, 0, this.activeConfiguration.animationDuration, () => {
                        this.recommenceScrolling();
                    });
                },
                nextActionSelector: () => {
                    this.stopContinuousScrolling();
                    // 'Next' action is like a 'down' scroll
                    const topItem = this.containerElement.firstElementChild;
                    if (!topItem) { this.recommenceScrolling(); return; }

                    performTransition(topItem, 'marginTop', 0, -this.singleItemPixelHeight, this.activeConfiguration.animationDuration, () => {
                        topItem.remove();
                        topItem.style.marginTop = '0px';
                        this.containerElement.appendChild(topItem);
                        this.recommenceScrolling();
                    });
                }
            };

            for (const configKey in interactionMap) {
                const selectorValue = this.activeConfiguration[configKey];
                if (selectorValue) {
                    const controlNode = document.querySelector(selectorValue);
                    if (controlNode) {
                        controlNode.addEventListener('click', (event) => {
                            event.preventDefault();
                            interactionMap[configKey]();
                        });
                    }
                }
            }

            if (this.activeConfiguration.haltOnHover) {
                this.containerElement.addEventListener('mouseenter', this.stopContinuousScrolling.bind(this));
                this.containerElement.addEventListener('mouseleave', this.beginContinuousScrolling.bind(this));
            }
        }
    }

    // Global factory function to initialize scrollers
    window.initializeVerticalContentScroller = function(targetSelector, optionsObject) {
        document.querySelectorAll(targetSelector).forEach(element => {
            new ItemScrollerComponent(element, optionsObject);
        });
    };

    // Expose default settings for potential external inspection
    window.initializeVerticalContentScroller.defaultConfiguration = standardSettings;
})();