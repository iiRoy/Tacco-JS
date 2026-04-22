class RejuvenateKit {
    static baseConfig = {
        fullPageRefresh: true,
        dynamicStructure: true,
        displayMessage: false,
        mouseWheelActivation: false,
        swipeThreshold: 50,
        indicatorStyle: 'rejuvenate-indicator',
        spinnerStyle: 'rejuvenate-spinner',
        textStyle: 'rejuvenate-message',
        refreshText: 'Renewing...',
        customAction: () => {}
    };

    static detectTouchCapability() {
        return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
    }

    static instanceRegistry = new Map();

    constructor(targetElement, userConfig = {}) {
        if (!(targetElement instanceof Element)) {
            console.error("RejuvenateKit requires a valid DOM element.");
            return;
        }

        if (RejuvenateKit.instanceRegistry.has(targetElement)) {
            return RejuvenateKit.instanceRegistry.get(targetElement).updateConfiguration(userConfig);
        }

        this.element = targetElement;
        this.configurations = { ...RejuvenateKit.baseConfig, ...userConfig };
        this.activeListeners = new Map();
        this.observingWindow = window;
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        this.actionTriggered = false;

        this.lastTouchY = 0;
        this.currentSwipe = 0;

        this.isTouchDevice = RejuvenateKit.detectTouchCapability();

        this._initializeElement();
        this._attachListeners();

        RejuvenateKit.instanceRegistry.set(targetElement, this);
    }

    _initializeElement() {
        if (this.configurations.dynamicStructure) {
            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = this.configurations.indicatorStyle;
            indicatorDiv.style.display = 'none'; // Initially hidden

            const spinnerDiv = document.createElement('div');
            spinnerDiv.className = this.configurations.spinnerStyle;
            indicatorDiv.appendChild(spinnerDiv);

            this.element.prepend(indicatorDiv);

            if (this.configurations.displayMessage) {
                this.element.classList.add('rejuvenate-with-message');
                const messageSpan = document.createElement('span');
                messageSpan.className = this.configurations.textStyle;
                messageSpan.textContent = this.configurations.refreshText;
                messageSpan.style.display = 'none'; // Initially hidden
                this.element.prepend(messageSpan);
            }
        }
        this.element.dataset.rejuvenateConfig = JSON.stringify(this.configurations);
    }

    updateConfiguration(newConfig) {
        this.configurations = { ...this.configurations, ...newConfig };
        this.element.dataset.rejuvenateConfig = JSON.stringify(this.configurations);
        // Re-evaluate listeners if necessary (e.g., if mouseWheelActivation changes)
        this._clearEvents();
        this._attachListeners();
        return this;
    }

    _registerEvent(eventName, handlerFunction) {
        const boundHandler = handlerFunction.bind(this);
        this.observingWindow.addEventListener(eventName, boundHandler);
        this.activeListeners.set(eventName, { handler: handlerFunction, boundHandler: boundHandler });
    }

    _deregisterEvent(eventName) {
        if (this.activeListeners.has(eventName)) {
            const { boundHandler } = this.activeListeners.get(eventName);
            this.observingWindow.removeEventListener(eventName, boundHandler);
            this.activeListeners.delete(eventName);
        }
    }

    _clearEvents() {
        this.activeListeners.forEach((value, eventName) => {
            this._deregisterEvent(eventName);
        });
        this.activeListeners.clear();
    }

    _processScroll(event) {
        this.scrollPosition = this.observingWindow.pageYOffset || document.documentElement.scrollTop;
        const delta = event && event.wheelDelta ? event.wheelDelta : (event && event.detail ? -event.detail : null);

        if (this.configurations.mouseWheelActivation && delta !== null && delta >= 150 && this.scrollPosition <= 0) {
            if (!this.actionTriggered) {
                this._performAction();
                this.actionTriggered = true;
            }
        } else if (!this.configurations.mouseWheelActivation && this.scrollPosition <= 0) {
            if (!this.actionTriggered) {
                this._performAction();
                this.actionTriggered = true;
            }
        }
    }

    _processSwipe() {
        if (this.scrollPosition <= 0) {
            this._performAction();
        }
    }

    _handleTouchStart(event) {
        this.lastTouchY = event.touches[0].pageY;
        // Optionally add a class to disable transitions for smooth pulling
        // this.element.classList.remove('rejuvenate-transition-enabled');
    }

    _handleTouchMove(event) {
        const currentY = event.touches[0].pageY;
        this.currentSwipe = currentY - this.lastTouchY;

        this.scrollPosition = this.observingWindow.pageYOffset || document.documentElement.scrollTop;

        if (this.currentSwipe > 0 && this.scrollPosition <= 0) {
            event.preventDefault();
            const pullAmount = Math.min(this.currentSwipe, this.configurations.swipeThreshold * 2); // Cap pull amount
            this.element.style.transform = `translateY(${pullAmount}px)`;
            this.element.style.opacity = `${pullAmount / (this.configurations.swipeThreshold * 2)}`;
        }

        if (this.currentSwipe > this.configurations.swipeThreshold && this.scrollPosition <= 0) {
            if (!this.actionTriggered) {
                this._processSwipe();
                this.actionTriggered = true;
            }
        }
    }

    _handleTouchEnd() {
        // Re-enable transitions or reset styles
        this.element.style.transform = '';
        this.element.style.opacity = '';
        this.currentSwipe = 0;
    }

    _attachListeners() {
        if (!this.isTouchDevice) {
            if (this.configurations.mouseWheelActivation) {
                this._registerEvent('wheel', this._processScroll);
                this._registerEvent('mousewheel', this._processScroll);
                this._registerEvent('DOMMouseScroll', this._processScroll);
            } else {
                this._registerEvent('scroll', this._processScroll);
            }
        } else {
            this._registerEvent('touchstart', this._handleTouchStart);
            this._registerEvent('touchmove', this._handleTouchMove);
            this._registerEvent('touchend', this._handleTouchEnd);
        }
    }

    _performAction() {
        const indicator = this.element.querySelector(`.${this.configurations.indicatorStyle}`);
        const message = this.element.querySelector(`.${this.configurations.textStyle}`);

        if (indicator) {
            indicator.style.display = 'block';
            indicator.style.height = '';
            indicator.style.opacity = '1';
            indicator.style.transform = 'translateY(0px)';
            indicator.style.transition = 'margin-top 0.2s ease-out';
            indicator.style.marginTop = '0px';
            indicator.classList.add('rejuvenate-active');
        }
        if (message) {
            message.style.display = 'block';
        }

        setTimeout(() => {
            if (indicator) {
                indicator.style.transition = 'height 0.2s ease-in, opacity 0.2s ease-in';
            }

            setTimeout(() => {
                if (indicator) {
                    indicator.style.height = '0px';
                    indicator.style.opacity = '0';
                }
                if (message) {
                    message.style.display = 'none';
                }

                setTimeout(() => {
                    if (indicator) {
                        indicator.style.display = 'none';
                        indicator.classList.remove('rejuvenate-active');
                        indicator.style.height = '';
                        indicator.style.opacity = '';
                        indicator.style.marginTop = '';
                        indicator.style.transition = '';
                    }

                    if (this.configurations.fullPageRefresh) {
                        this.observingWindow.location.reload(true);
                    } else {
                        this.configurations.customAction();
                    }
                    this.actionTriggered = false;
                }, 200);
            }, 500);
        }, 200);
    }

    dispose() {
        this._clearEvents();
        if (this.element) {
            const indicator = this.element.querySelector(`.${this.configurations.indicatorStyle}`);
            const message = this.element.querySelector(`.${this.configurations.textStyle}`);
            if (indicator) indicator.remove();
            if (message) message.remove();
            this.element.removeAttribute('data-rejuvenate-config');
            this.element.classList.remove('rejuvenate-with-message');
            RejuvenateKit.instanceRegistry.delete(this.element);
        }
    }
}

function initiateRejuvenation(elements, operation, ...operationArgs) {
    let targets = [];
    if (elements instanceof Element) {
        targets = [elements];
    } else if (elements instanceof NodeList || Array.isArray(elements)) {
        targets = Array.from(elements);
    } else if (typeof elements === 'string') {
        targets = Array.from(document.querySelectorAll(elements));
    } else {
        console.error("Invalid elements provided for rejuvenation.");
        return;
    }

    const results = [];

    targets.forEach(el => {
        let instance = RejuvenateKit.instanceRegistry.get(el);

        if (typeof operation === 'string') {
            switch (operation) {
                case 'update':
                    if (instance) {
                        results.push(instance.updateConfiguration(operationArgs[0]));
                    } else {
                        console.warn(`Rejuvenation not initialized for element:`, el);
                        results.push(new RejuvenateKit(el, operationArgs[0]));
                    }
                    break;
                case 'dispose':
                    if (instance) {
                        instance.dispose();
                        results.push(el);
                    } else {
                        console.warn(`Rejuvenation not initialized for element:`, el);
                        results.push(el);
                    }
                    break;
                case 'action':
                    if (instance) {
                        instance._performAction();
                        results.push(el);
                    } else {
                        console.warn(`Rejuvenation not initialized for element:`, el);
                        results.push(el);
                    }
                    break;
                default:
                    console.error(`Operation '${operation}' does not exist on RejuvenateKit.`);
                    results.push(el);
            }
        } else if (typeof operation === 'object' || !operation) {
            if (instance) {
                results.push(instance.updateConfiguration(operation));
            } else {
                results.push(new RejuvenateKit(el, operation));
            }
        } else {
            console.error(`Invalid operation or options provided for rejuvenation:`, operation);
            results.push(el);
        }
    });

    return targets.length === 1 ? results[0] : targets;
}