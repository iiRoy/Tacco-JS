class FlowScroller {
    constructor(hostElement, userSettings) {
        this._displayContainer = hostElement;
        this._configuration = Object.assign({}, FlowScroller.defaultParameters, userSettings);

        this._contentWrapper = hostElement.firstElementChild; 
        this._autoAdvanceHandle = null; 
        this._isMouseSuspended = false; 
        this._isWindowFocused = true; 
        this._storedAdvanceHandle = null; 

        this._setupVisuals();
        this._monitorEnvironment();
        this._bindControls();
        this._initiateAutoAdvance(); 
    }

    static get defaultParameters() {
        return {
            flowDirection: 'ascend', 
            transitionTiming: 'ease-in-out', 
            transitionDuration: 600, 
            advanceInterval: 2000,
            frameHeight: 'auto', 
            visibleElements: 0, 
            pauseOnCursorHover: true, 
            interactionElements: {
                upwardButtonSelector: '', 
                downwardButtonSelector: '', 
                toggleButtonSelector: '', 
                activateLabel: 'Activate', 
                deactivateLabel: 'Deactivate' 
            }
        };
    }

    _setupVisuals() {
        // Remove margins from immediate children and their children
        Array.from(this._displayContainer.children).forEach(child => {
            child.style.margin = '0';
            Array.from(child.children).forEach(grandchild => {
                grandchild.style.margin = '0';
            });
        });

        this._displayContainer.style.position = 'relative';
        this._displayContainer.style.height = this._configuration.frameHeight;
        this._displayContainer.style.overflow = 'hidden';

        this._contentWrapper.style.position = 'absolute';
        this._contentWrapper.style.margin = '0';
        this._contentWrapper.style.width = '100%'; 

        // Prepare for CSS transform transitions
        this._contentWrapper.style.transitionProperty = 'transform';
        this._contentWrapper.style.transitionTimingFunction = this._configuration.transitionTiming;

        // Start periodic height recalibration
        setInterval(() => this._recalibrateHeight(false), 100);
    }

    _monitorEnvironment() {
        window.addEventListener('focus', () => {
            this._isWindowFocused = true;
        });
        window.addEventListener('blur', () => {
            this._isWindowFocused = false;
        });

        if (this._configuration.pauseOnCursorHover) {
            this._displayContainer.addEventListener('mouseenter', () => {
                this._storedAdvanceHandle = this._autoAdvanceHandle; 
                this._ceaseAutoAdvance();
            });
            this._displayContainer.addEventListener('mouseleave', () => {
                if (this._storedAdvanceHandle !== null) { 
                    this._initiateAutoAdvance();
                }
                this._storedAdvanceHandle = null;
            });
        }
    }

    _bindControls() {
        const controls = this._configuration.interactionElements;

        if (controls.upwardButtonSelector) {
            document.querySelector(controls.upwardButtonSelector)?.addEventListener('click', (event) => {
                event.preventDefault();
                this._triggerManualShift('ascend');
            });
        }
        if (controls.downwardButtonSelector) {
            document.querySelector(controls.downwardButtonSelector)?.addEventListener('click', (event) => {
                event.preventDefault();
                this._triggerManualShift('descend');
            });
        }
        if (controls.toggleButtonSelector) {
            document.querySelector(controls.toggleButtonSelector)?.addEventListener('click', (event) => {
                event.preventDefault();
                if (this._autoAdvanceHandle === null) {
                    this._initiateAutoAdvance();
                } else {
                    this._ceaseAutoAdvance();
                }
            });
        }
    }

    _initiateAutoAdvance() {
        if (this._autoAdvanceHandle !== null) {
            clearInterval(this._autoAdvanceHandle);
        }
        this._autoAdvanceHandle = setInterval(() => {
            if (this._isWindowFocused) {
                this._executeContentShift(this._configuration.flowDirection);
            }
        }, this._configuration.advanceInterval);

        const toggleButton = document.querySelector(this._configuration.interactionElements.toggleButtonSelector);
        if (toggleButton) {
            toggleButton.classList.add('active-flow'); 
            toggleButton.textContent = this._configuration.interactionElements.deactivateLabel;
        }
    }

    _ceaseAutoAdvance() {
        clearInterval(this._autoAdvanceHandle);
        this._autoAdvanceHandle = null;
        const toggleButton = document.querySelector(this._configuration.interactionElements.toggleButtonSelector);
        if (toggleButton) {
            toggleButton.classList.remove('active-flow');
            toggleButton.textContent = this._configuration.interactionElements.activateLabel;
        }
    }

    _executeContentShift(shiftDirection) {
        if (!this._displayContainer.offsetParent) return; 

        const contentItems = Array.from(this._contentWrapper.children);
        if (contentItems.length === 0) return;

        let itemToRelocate;
        let shiftMagnitude;

        const onAnimationComplete = () => {
            this._contentWrapper.removeEventListener('transitionend', onAnimationComplete);
            this._contentWrapper.style.transitionDuration = '0ms'; 
            this._contentWrapper.style.transform = 'translateY(0)'; 

            if (shiftDirection === 'ascend') {
                this._contentWrapper.appendChild(itemToRelocate);
            } else { 
                itemToRelocate.style.opacity = '1'; 
            }
            this._recalibrateHeight(true);
        };

        if (shiftDirection === 'ascend') {
            itemToRelocate = contentItems[0];
            shiftMagnitude = itemToRelocate.offsetHeight;

            this._contentWrapper.style.transitionDuration = `${this._configuration.transitionDuration}ms`;
            this._contentWrapper.style.transform = `translateY(-${shiftMagnitude}px)`;
            this._contentWrapper.addEventListener('transitionend', onAnimationComplete);

        } else { // 'descend'
            itemToRelocate = contentItems[contentItems.length - 1];
            shiftMagnitude = itemToRelocate.offsetHeight;

            itemToRelocate.style.opacity = '0'; 
            this._contentWrapper.prepend(itemToRelocate);

            this._contentWrapper.style.transitionDuration = '0ms';
            this._contentWrapper.style.transform = `translateY(-${shiftMagnitude}px)`;
            
            // Force reflow for the transform to apply instantly before the next transition
            void this._contentWrapper.offsetWidth; 

            this._contentWrapper.style.transitionDuration = `${this._configuration.transitionDuration}ms`;
            this._contentWrapper.style.transform = 'translateY(0)';
            this._contentWrapper.addEventListener('transitionend', onAnimationComplete);
        }
    }

    _triggerManualShift(direction) {
        this._ceaseAutoAdvance(); 
        this._executeContentShift(direction); 
    }

    _calculateFullHeight() {
        let totalHeight = 0;
        const currentDisplay = this._displayContainer.style.display;
        this._displayContainer.style.display = 'block'; 

        Array.from(this._contentWrapper.children).forEach(child => {
            totalHeight += child.offsetHeight;
        });

        this._displayContainer.style.display = currentDisplay; 
        this._displayContainer.style.height = `${totalHeight}px`;
    }

    _calculatePartialHeight(animateChange) {
        let desiredHeight = 0;
        const contentItems = Array.from(this._contentWrapper.children);

        for (let i = 0; i < this._configuration.visibleElements && i < contentItems.length; i++) {
            desiredHeight += contentItems[i].offsetHeight;
        }

        if (animateChange) {
            this._displayContainer.style.transition = `height ${this._configuration.transitionDuration}ms`;
            this._displayContainer.style.height = `${desiredHeight}px`;
            const onHeightTransitionEnd = () => {
                this._displayContainer.removeEventListener('transitionend', onHeightTransitionEnd);
                this._displayContainer.style.transition = ''; 
            };
            this._displayContainer.addEventListener('transitionend', onHeightTransitionEnd);
        } else {
            this._displayContainer.style.height = `${desiredHeight}px`;
        }
    }

    _recalibrateHeight(shouldAnimate) {
        if (this._configuration.frameHeight === 'auto' && this._configuration.visibleElements !== 0) {
            this._calculatePartialHeight(shouldAnimate);
        } else if (this._configuration.frameHeight === 'auto') {
            this._calculateFullHeight();
        }
    }

    // Exposed functionality
    advanceContent() {
        this._triggerManualShift('ascend');
    }

    recedeContent() {
        this._triggerManualShift('descend');
    }

    beginScrolling() {
        this._initiateAutoAdvance();
    }

    endScrolling() {
        this._ceaseAutoAdvance();
    }
}

(function (globalScope) {
    globalScope.FlowScrollerPlugin = function (targetSelector, options) {
        const selectedElements = document.querySelectorAll(targetSelector);
        const activeInstances = [];

        selectedElements.forEach(element => {
            let elementApi = element._flowScrollApiHandle;
            if (!elementApi) {
                const newInstance = new FlowScroller(element, options);
                elementApi = {
                    up: newInstance.advanceContent.bind(newInstance),
                    down: newInstance.recedeContent.bind(newInstance),
                    start: newInstance.beginScrolling.bind(newInstance),
                    stop: newInstance.endScrolling.bind(newInstance),
                    settings: newInstance._configuration 
                };
                element._flowScrollApiHandle = elementApi;
            } else if (options) {
                Object.assign(elementApi.settings, options);
            }
            activeInstances.push(elementApi);
        });

        if (selectedElements.length === 1) {
            return activeInstances[0];
        } else {
            const collectionFacade = {};
            ['up', 'down', 'start', 'stop'].forEach(methodName => {
                collectionFacade[methodName] = function() {
                    activeInstances.forEach(inst => inst[methodName]());
                    return collectionFacade; 
                };
            });
            collectionFacade.settings = activeInstances.map(inst => inst.settings); 
            return collectionFacade;
        }
    };
})(window);