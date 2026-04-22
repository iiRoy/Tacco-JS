(function(context) {

    // --- Utility for deep merging objects (replacing $.extend(true, ...)) ---
    function deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    // --- Private static identifiers and settings ---
    const SHUTDOWN_SIGNAL = 'ShutdownEvent';
    const PRE_SHUTDOWN_SIGNAL = 'BeforeShutdownEvent';
    const POST_SHUTDOWN_SIGNAL = 'AfterShutdownEvent';
    const PRE_APPEND_SIGNAL = 'BeforeAppendEvent';
    const CONTENT_RENDER_SIGNAL = 'ContentRenderEvent';
    const ACTIVATION_SIGNAL = 'ActivationEvent';
    const UPDATE_SIGNAL = 'ChangeEvent';
    const SYSTEM_IDENTIFIER = 'displaySystem';
    const GLOBAL_EVENT_SUFFIX = '.' + SYSTEM_IDENTIFIER;
    const ACTIVE_DISPLAY_CLASS = 'overlay-active';
    const FADING_AWAY_CLASS = 'overlay-fading';
    const LOCK_CLOSURE_CLASS = 'overlay-no-close';

    // --- Internal State Variables (now mostly instance-specific) ---
    let globalWindow = window;
    let documentBody;
    let globalDocument;
    let wrapperStylingClasses;
    let currentUnitType;

    // --- Custom Event Emitter (replacing jQuery's event system) ---
    const eventHub = {
        _listeners: {},
        on: function(eventName, handler) {
            if (!this._listeners[eventName]) {
                this._listeners[eventName] = [];
            }
            this._listeners[eventName].push(handler);
        },
        triggerHandler: function(eventName, data) {
            if (this._listeners[eventName]) {
                const currentListeners = [...this._listeners[eventName]];
                currentListeners.forEach(handler => {
                    handler(data);
                });
            }
        },
        off: function(eventName, handler) {
            if (this._listeners[eventName]) {
                this._listeners[eventName] = this._listeners[eventName].filter(h => h !== handler);
            }
        }
    };

    // --- Core Overlay Display Class ---
    const OverlayDisplay = function() {
        this.instanceEventSource = Object.create(eventHub);

        // Store bound functions for event listener removal
        this._boundKeyHandler = this.handleEscapeKey.bind(this);
        this._boundResizeHandler = this.adjustDimensions.bind(this);
        this._boundFocusInHandler = this.handleFocusIn.bind(this);
        this._boundBackdropClickHandler = this.handleBackdropClick.bind(this);
        this._boundWrapperClickHandler = this.handleWrapperClick.bind(this);
        
        OverlayDisplay.currentActiveInstance = this; 
    };

    OverlayDisplay.prototype = {
        constructor: OverlayDisplay,

        // --- Instance-specific event methods ---
        attachSystemListener: function(name, handler) {
            this.instanceEventSource.on(SYSTEM_IDENTIFIER + name + GLOBAL_EVENT_SUFFIX, handler);
        },

        emitSystemEvent: function(eventName, eventData) {
            this.instanceEventSource.triggerHandler(SYSTEM_IDENTIFIER + eventName, eventData);

            if (this.config && this.config.actionCallbacks) {
                let callbackName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
                if (this.config.actionCallbacks[callbackName]) {
                    this.config.actionCallbacks[callbackName].apply(this, Array.isArray(eventData) ? eventData : [eventData]);
                }
            }
        },

        initializeDisplay: function() {
            const agentString = navigator.userAgent;
            this.isLegacyBrowser = agentString.indexOf("MSIE 7.") !== -1 || agentString.indexOf("MSIE 8.") !== -1;
            this.isAndroidOS = (/android/gi).test(agentString);
            this.isIOSDevice = (/iphone|ipad|ipod/gi).test(agentString);
            this.supportsCSSTransitions = checkTransitionSupport();

            this.isMobileDevice = (this.isAndroidOS || this.isIOSDevice || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(agentString));
            
            documentBody = globalDocument.body;
            globalDocument = globalWindow.document;

            this.elementCache = {};
        },

        launchOverlay: function(inputData) {
            let i;

            if (inputData.isObject === false) {
                this.displayUnits = Array.from(inputData.displayUnits);
                this.currentUnitIndex = 0;
                const units = inputData.displayUnits;
                let unitElement;
                for (i = 0; i < units.length; i++) {
                    unitElement = units[i];
                    if (unitElement.processed) {
                        unitElement = unitElement.node;
                    }
                    if (unitElement === inputData.targetNode) {
                        this.currentUnitIndex = i;
                        break;
                    }
                }
            } else {
                this.displayUnits = Array.isArray(inputData.displayUnits) ? inputData.displayUnits : [inputData.displayUnits];
                this.currentUnitIndex = inputData.unitIndex || 0;
            }

            if (this.active) {
                this.refreshContent();
                return;
            }

            this.unitTypes = [];
            wrapperStylingClasses = '';

            if (inputData.uniqueKey) {
                if (!this.elementCache[inputData.uniqueKey]) {
                    this.elementCache[inputData.uniqueKey] = {};
                }
                this.cachedElements = this.elementCache[inputData.uniqueKey];
            } else {
                this.cachedElements = {};
            }

            this.config = deepMerge(deepMerge({}, OverlaySystem.defaultSettings), inputData);
            this.fixedPositionContent = this.config.fixedContentPosition === 'auto' ? !this.isMobileDevice : this.config.fixedContentPosition;

            if (this.config.isModal) {
                this.config.closeOnContentClick = false;
                this.config.closeOnBackdropClick = false;
                this.config.showDismissButton = false;
                this.config.enableEscapeKey = false;
            }

            if (!this.backdropElement) {
                this.backdropElement = createVisualElement('backdrop');
                this.backdropElement.addEventListener('click', this._boundBackdropClickHandler);

                this.wrapperElement = createVisualElement('wrapper');
                this.wrapperElement.setAttribute('tabindex', '-1');
                this.wrapperElement.addEventListener('click', this._boundWrapperClickHandler);

                this.mainContainer = createVisualElement('container', this.wrapperElement);
            }

            this.contentHolder = createVisualElement('content-holder');
            if (this.config.showPreloader) {
                this.loadingIndicator = createVisualElement('loading-indicator', this.mainContainer, this.config.textLoading);
            }

            // Module initialization (placeholder, not implemented in original snippet)
            // for (i = 0; i < OverlaySystem.modules.length; i++) {
            //     const moduleName = OverlaySystem.modules[i];
            //     const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            //     if (typeof this[`init${capitalizedName}`] === 'function') {
            //         this[`init${capitalizedName}`].call(this);
            //     }
            // }

            this.emitSystemEvent('PreActivation');

            if (this.config.showDismissButton) {
                if (!this.config.dismissButtonInside) {
                    this.wrapperElement.appendChild(getDismissButton());
                } else {
                    this.attachSystemListener(CONTENT_RENDER_SIGNAL, (data) => {
                        data.replacementCloseButton = getDismissButton(data.unitType);
                    });
                    wrapperStylingClasses += ' overlay-dismiss-inside';
                }
            }

            if (this.config.alignTop) {
                wrapperStylingClasses += ' overlay-align-top';
            }

            if (this.fixedPositionContent) {
                this.wrapperElement.style.overflow = this.config.overflowY;
                this.wrapperElement.style.overflowX = 'hidden';
                this.wrapperElement.style.overflowY = this.config.overflowY;
            } else {
                this.wrapperElement.style.top = `${globalWindow.scrollY}px`;
                this.wrapperElement.style.position = 'absolute';
            }

            if (this.config.fixedBackdropPosition === false || (this.config.fixedBackdropPosition === 'auto' && !this.fixedPositionContent)) {
                this.backdropElement.style.height = `${globalDocument.documentElement.scrollHeight}px`;
                this.backdropElement.style.position = 'absolute';
            }

            if (this.config.enableEscapeKey) {
                globalDocument.addEventListener('keyup', this._boundKeyHandler);
            }

            globalWindow.addEventListener('resize', this._boundResizeHandler);

            if (!this.config.closeOnContentClick) {
                wrapperStylingClasses += ' overlay-auto-cursor';
            }

            if (wrapperStylingClasses) {
                this.wrapperElement.classList.add(...wrapperStylingClasses.trim().split(' '));
            }

            this.windowHeight = globalWindow.innerHeight;

            const htmlStyleAdjustments = {};
            if (this.fixedPositionContent) {
                const scrollbarWidth = this.getScrollbarWidth(this.windowHeight);
                if (scrollbarWidth) {
                    htmlStyleAdjustments.marginRight = `${scrollbarWidth}px`;
                }
                if (!this.isLegacyBrowser) {
                    htmlStyleAdjustments.overflow = 'hidden';
                } else {
                    documentBody.style.overflow = 'hidden';
                    globalDocument.documentElement.style.overflow = 'hidden';
                }
            }

            let additionalClasses = this.config.mainClass || '';
            if (this.isLegacyBrowser) {
                additionalClasses += ' overlay-legacy-browser';
            }
            if (additionalClasses) {
                this.wrapperElement.classList.add(...additionalClasses.trim().split(' '));
            }

            this.refreshContent();
            this.emitSystemEvent('BuildControls');

            Object.assign(globalDocument.documentElement.style, htmlStyleAdjustments);

            documentBody.appendChild(this.backdropElement);
            documentBody.appendChild(this.wrapperElement);

            this.lastFocusedElement = globalDocument.activeElement;

            setTimeout(() => {
                if (this.contentNode) {
                    this.wrapperElement.classList.add(ACTIVE_DISPLAY_CLASS);
                    this.setFocus();
                } else {
                    this.backdropElement.classList.add(ACTIVE_DISPLAY_CLASS);
                }
                globalDocument.addEventListener('focusin', this._boundFocusInHandler);
            }, 16);

            this.active = true;
            this.adjustDimensions(this.windowHeight);
            this.emitSystemEvent('Activation');

            return inputData;
        },

        terminateOverlay: function() {
            if (!this.active) return;
            this.emitSystemEvent('PreShutdown');

            this.active = false;

            if (this.config.removalDelay && !this.isLegacyBrowser && this.supportsCSSTransitions) {
                this.wrapperElement.classList.add(FADING_AWAY_CLASS);
                setTimeout(() => {
                    this.completeTermination();
                }, this.config.removalDelay);
            } else {
                this.completeTermination();
            }
        },

        completeTermination: function() {
            this.emitSystemEvent('Shutdown');

            const classesToClear = `${FADING_AWAY_CLASS} ${ACTIVE_DISPLAY_CLASS} `;
            if (this.config.mainClass) {
                classesToClear += `${this.config.mainClass} `;
            }

            this.backdropElement.remove();
            this.wrapperElement.remove();
            this.mainContainer.replaceChildren();

            this.wrapperElement.classList.remove(...classesToClear.trim().split(' '));

            if (this.fixedPositionContent) {
                const htmlStyleReset = { marginRight: '', overflow: '' };
                if (this.isLegacyBrowser) {
                    documentBody.style.overflow = '';
                    globalDocument.documentElement.style.overflow = '';
                }
                Object.assign(globalDocument.documentElement.style, htmlStyleReset);
            }

            globalDocument.removeEventListener('keyup', this._boundKeyHandler);
            globalWindow.removeEventListener('resize', this._boundResizeHandler);
            globalDocument.removeEventListener('focusin', this._boundFocusInHandler);
            this.backdropElement.removeEventListener('click', this._boundBackdropClickHandler);
            this.wrapperElement.removeEventListener('click', this._boundWrapperClickHandler);
            
            this.instanceEventSource._listeners = {};

            this.wrapperElement.className = 'overlay-wrapper';
            this.wrapperElement.removeAttribute('style');
            this.backdropElement.className = 'overlay-backdrop';
            this.mainContainer.className = 'overlay-container';

            if (this.config.showDismissButton &&
                (!this.config.dismissButtonInside || (this.currentUnit && this.currentUnit.unitCategory === true))) {
                if (this.cachedElements.dismissButton) {
                    this.cachedElements.dismissButton.remove();
                }
            }

            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }

            this.currentUnit = null;
            this.contentNode = null;
            this.cachedElements = null;
            this.previousHeight = 0;

            this.emitSystemEvent('PostShutdown');
        },

        adjustDimensions: function(inputHeight) {
            if (this.isIOSDevice) {
                const zoomFactor = globalDocument.documentElement.clientWidth / globalWindow.innerWidth;
                const calculatedHeight = globalWindow.innerHeight * zoomFactor;
                this.wrapperElement.style.height = `${calculatedHeight}px`;
                this.windowHeight = calculatedHeight;
            } else {
                this.windowHeight = inputHeight || globalWindow.innerHeight;
            }

            if (!this.fixedPositionContent) {
                this.wrapperElement.style.height = `${this.windowHeight}px`;
            }

            this.emitSystemEvent('Rescale');
        },

        refreshContent: function() {
            let unit = this.displayUnits[this.currentUnitIndex];

            if (this.contentHolder.parentNode) {
                this.contentHolder.remove();
            }
            if (this.contentNode && this.contentNode.parentNode) {
                this.contentNode.remove();
            }

            if (!unit.processed) {
                unit = this.processUnit(this.currentUnitIndex);
            }

            const unitCategory = unit.unitCategory;

            this.emitSystemEvent('PreChange', [this.currentUnit ? this.currentUnit.unitCategory : '', unitCategory]);

            this.currentUnit = unit;
            this.contentNode = unit.contentElement || createVisualElement('placeholder-content', null, `<span>Content for ${unitCategory || 'unknown'} unit</span>`);
            this.contentHolder.appendChild(this.contentNode);
            this.mainContainer.appendChild(this.contentHolder);

            if (this.loadingIndicator && this.loadingIndicator.parentNode) {
                this.loadingIndicator.remove();
            }
        },

        // --- Utility Methods ---

        processUnit: function(index) {
            const rawUnit = this.displayUnits[index];
            return {
                processed: true,
                unitCategory: rawUnit.type || 'unknown',
                node: rawUnit.el || null,
                contentElement: rawUnit.contentElement || null,
                data: rawUnit
            };
        },

        getScrollbarWidth: function(viewportHeight) {
            const hasScrollbar = documentBody.scrollHeight > viewportHeight;
            if (!hasScrollbar) {
                return 0;
            }

            const scrollDiv = globalDocument.createElement('div');
            scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
            documentBody.appendChild(scrollDiv);
            const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            documentBody.removeChild(scrollDiv);
            return scrollbarWidth;
        },

        setFocus: function() {
            const focusableElements = this.wrapperElement.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            } else {
                this.wrapperElement.focus();
            }
        },

        handleFocusIn: function(event) {
            if (this.active && !this.wrapperElement.contains(event.target)) {
                this.setFocus();
            }
        },

        handleEscapeKey: function(event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.terminateOverlay();
            }
        },

        handleBackdropClick: function() {
            if (this.config.closeOnBackdropClick) {
                this.terminateOverlay();
            }
        },

        handleWrapperClick: function(event) {
            if (this.config.closeOnContentClick && event.target === this.wrapperElement) {
                this.terminateOverlay();
            }
        },

        // Placeholder methods for modules
        initImage: function() {},
        initAjax: function() {},
        initIframe: function() {},
        initVideo: function() {},
        initZoom: function() {},
        initRetina: function() {}
    };

    // --- Helper Functions (need to access the active instance) ---
    const createVisualElement = function(baseClass, parentElement, contentHTML) {
        const visualElement = globalDocument.createElement('div');
        visualElement.className = `overlay-${baseClass}`;
        if (contentHTML) {
            visualElement.innerHTML = contentHTML;
        }
        if (parentElement) {
            parentElement.appendChild(visualElement);
        }
        return visualElement;
    };

    const getDismissButton = function(unitType) {
        const currentInstance = OverlayDisplay.currentActiveInstance;
        if (unitType !== currentUnitType || !currentInstance.cachedElements.dismissButton) {
            const buttonMarkup = currentInstance.config.closeMarkup.replace('%title%', currentInstance.config.textClose);
            const tempDiv = globalDocument.createElement('div');
            tempDiv.innerHTML = buttonMarkup;
            currentInstance.cachedElements.dismissButton = tempDiv.firstElementChild || tempDiv.firstChild;
            currentUnitType = unitType;
        }
        return currentInstance.cachedElements.dismissButton;
    };

    const checkTransitionSupport = function() {
        const testElement = globalDocument.createElement('p');
        const style = testElement.style;
        const vendors = ['ms', 'O', 'Moz', 'Webkit'];

        if (style.transition !== undefined) {
            return true;
        }

        while (vendors.length) {
            if ((vendors.pop() + 'Transition') in style) {
                return true;
            }
        }
        return false;
    };

    // --- Public API Global Object (replacing $.magnificPopup) ---
    const OverlaySystem = {
        instance: null,
        defaultSettings: {
            mainClass: '',
            closeMarkup: '<button title="%title%" type="button" class="overlay-dismiss-button">&#xD7;</button>',
            textClose: 'Close (Esc)',
            isModal: false,
            fixedContentPosition: 'auto',
            fixedBackdropPosition: 'auto',
            overflowY: 'auto',
            showDismissButton: true,
            dismissButtonInside: false,
            alignTop: false,
            enableEscapeKey: true,
            closeOnContentClick: false,
            closeOnBackdropClick: true,
            showPreloader: true,
            textLoading: 'Loading...',
            removalDelay: 0,
            actionCallbacks: {}
        },
        modules: ['image', 'ajax', 'iframe', 'video', 'zoom', 'retina'],

        launch: function(options) {
            if (!OverlaySystem.instance) {
                OverlaySystem.instance = new OverlayDisplay();
                OverlaySystem.instance.initializeDisplay();
            }
            OverlayDisplay.currentActiveInstance = OverlaySystem.instance;
            return OverlaySystem.instance.launchOverlay(options);
        },

        terminate: function() {
            if (OverlaySystem.instance) {
                OverlaySystem.instance.terminateOverlay();
            }
        },

        DisplayClass: OverlayDisplay
    };

    context.OverlaySystem = OverlaySystem;

})(window);