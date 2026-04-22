const _Util = {
    obtainElement: (designator) => (typeof designator === 'string' ? document.querySelector(designator) : designator),
    obtainAllElements: (designator) => (typeof designator === 'string' ? Array.from(document.querySelectorAll(designator)) : Array.isArray(designator) ? designator : [designator]),
    applyClass: (elem, cls) => elem && elem.classList && elem.classList.add(cls),
    removeClass: (elem, cls) => elem && elem.classList && elem.classList.remove(cls),
    hasClass: (elem, cls) => elem && elem.classList && elem.classList.contains(cls),
    listenTo: (elem, evt, handler, capture = false) => elem && elem.addEventListener(evt, handler, capture),
    stopListeningTo: (elem, evt, handler, capture = false) => elem && elem.removeEventListener(evt, handler, capture),
    getEventHandlerTarget: (eventPayload) => eventPayload.target,
    getElementBoundaries: (elem) => elem ? elem.getBoundingClientRect() : { top: 0, left: 0, width: 0, height: 0, x: 0, y: 0, right: 0, bottom: 0 },
    getCurrentScrollY: () => window.scrollY || document.documentElement.scrollTop,
    getCurrentScrollX: () => window.scrollX || document.documentElement.scrollLeft,
    getViewportWidth: () => window.innerWidth || document.documentElement.clientWidth,
    getViewportHeight: () => window.innerHeight || document.documentElement.clientHeight,
    isString: (val) => typeof val === 'string',
    containsChild: (parentElem, childElem) => parentElem && childElem && parentElem.contains(childElem)
};

const _INITIAL_PROPERTIES = {
    _statusDeactivated: false,
    _displayComponent: null,
    _referenceObject: null,
    _triggerElements: '',
    _dynamicTriggerContainer: null,
    _displayContent: '',
    _positionMode: 'bl',
    _styleIdentifier: 'overlay-display',
    _positionOffset: { x: 0, y: 0 }
};

class ElementConductor {
    constructor(initialSettings = {}) {
        this._eventRegistry = new Map();
        this._operationalSettings = { ..._INITIAL_PROPERTIES, ...initialSettings };

        this._resizeThrottleId = null;
        this._eventAttachDelayId = null;
        this._activeTriggerElement = null;
        this._isComponentRendered = false;

        // Bind event handlers to the instance
        this._boundInitiateDisplay = this.initiateDisplay.bind(this);
        this._boundAttemptDismissal = this.attemptDismissal.bind(this);
        this._boundHandleViewportResize = this.handleViewportResize.bind(this);

        this.setupComponent(initialSettings);
    }

    // Event Management
    subscribe(eventName, callback) {
        if (!this._eventRegistry.has(eventName)) {
            this._eventRegistry.set(eventName, new Set());
        }
        this._eventRegistry.get(eventName).add(callback);
    }

    unsubscribe(eventName, callback) {
        const callbacks = this._eventRegistry.get(eventName);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this._eventRegistry.delete(eventName);
            }
        }
    }

    publish(eventName, payload) {
        const callbacks = this._eventRegistry.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => callback(payload));
        }
    }

    // Component Initialization and Structure
    setupComponent(settings) {
        this._operationalSettings = { ...this._operationalSettings, ...settings };

        this._statusDeactivated = this._operationalSettings._statusDeactivated;
        this._displayContent = this._operationalSettings._displayContent;

        if (this._operationalSettings._referenceObject) {
            this._referenceObject = _Util.obtainElement(this._operationalSettings._referenceObject);
        }

        this._displayComponent = this._operationalSettings._displayComponent 
            ? _Util.obtainElement(this._operationalSettings._displayComponent) 
            : document.createElement('div');

        if (this._operationalSettings._displayComponent) {
            _Util.applyClass(this._displayComponent, this._operationalSettings._styleIdentifier);
        } else {
            this._displayComponent.className = this._operationalSettings._styleIdentifier;
            this._displayComponent.style.position = 'absolute';
            this._displayComponent.style.left = '-9999px';
            this._displayComponent.style.top = '-9999px';
        }

        this.bindTriggerEvents();
    }

    // Render Visual Component (replaces render)
    renderVisualComponent() {
        if (!this._isComponentRendered) {
            this._isComponentRendered = true;
            if (!this._operationalSettings._displayComponent) {
                document.body.appendChild(this._displayComponent);
            }

            _Util.listenTo(this._displayComponent, 'click', (evt) => {
                this.publish('componentClicked', { event: evt });
            });
        }

        if (this._displayContent) {
            this._displayComponent.innerHTML = this._displayContent;
        }
        return this;
    }

    // Event Binding for Triggers
    bindTriggerEvents() {
        // Detach existing dynamic parent event if set up
        if (this._dynamicTriggerContainer) {
            _Util.stopListeningTo(this._dynamicTriggerContainer, 'click', this._boundInitiateDisplay);
            this._dynamicTriggerContainer = null;
        }
        // Detach existing static trigger elements
        if (this._triggerElements && Array.isArray(this._triggerElements)) {
            this._triggerElements.forEach(elem => 
                _Util.stopListeningTo(elem, 'click', this._boundInitiateDisplay)
            );
            this._triggerElements = [];
        }

        if (this._operationalSettings._dynamicTriggerContainer) {
            this._dynamicTriggerContainer = _Util.obtainElement(this._operationalSettings._dynamicTriggerContainer);
            if (this._dynamicTriggerContainer) {
                _Util.listenTo(this._dynamicTriggerContainer, 'click', this._boundInitiateDisplay);
            }
        } else {
            const sources = _Util.isString(this._operationalSettings._triggerElements) 
                ? _Util.obtainAllElements(this._operationalSettings._triggerElements) 
                : _Util.obtainAllElements(this._operationalSettings._triggerElements);
            
            this._triggerElements = sources;
            this._triggerElements.forEach(elem => {
                _Util.listenTo(elem, 'click', this._boundInitiateDisplay);
            });
        }
    }

    // Handler for display requests (replaces onShow)
    initiateDisplay(eventPayload) {
        const priorReference = this._referenceObject;

        this.publish('beforeDisplay', { event: eventPayload });

        if (this._statusDeactivated) {
            return;
        }

        // If reference object changed, hide previous display
        if (priorReference !== this._referenceObject) {
            this.concealComponent();
        }

        let actualTrigger = _Util.getEventHandlerTarget(eventPayload);
        if (this._dynamicTriggerContainer) {
            const triggerClass = this._operationalSettings._triggerElements;
            while (actualTrigger && !_Util.hasClass(actualTrigger, triggerClass) && actualTrigger !== this._dynamicTriggerContainer) {
                actualTrigger = actualTrigger.parentNode;
            }
            if (!actualTrigger || !_Util.hasClass(actualTrigger, triggerClass)) {
                return;
            }
        }
        
        this.showComponent();
        this._activeTriggerElement = actualTrigger;

        // Bind global and window events after a short delay
        this._eventAttachDelayId = setTimeout(() => {
            _Util.listenTo(document, 'click', this._boundAttemptDismissal);
            _Util.listenTo(window, 'resize', this._boundHandleViewportResize);
        }, 0);
    }

    // Handler for dismissal attempts (replaces onHide)
    attemptDismissal(eventPayload) {
        const clickedElem = _Util.getEventHandlerTarget(eventPayload);
        if (this._displayComponent === clickedElem || _Util.containsChild(this._displayComponent, clickedElem)) {
            return;
        }
        this.concealComponent();
        clearTimeout(this._resizeThrottleId);
    }

    // Display the visual component (replaces show)
    showComponent() {
        this.determineComponentPlacement();
        this.publish('displayed');
    }

    // Hide the visual component (replaces hide)
    concealComponent() {
        this._displayComponent.style.left = '-9999px';
        this._displayComponent.style.top = '-9999px';
        this.publish('concealed');

        _Util.stopListeningTo(document, 'click', this._boundAttemptDismissal);
        _Util.stopListeningTo(window, 'resize', this._boundHandleViewportResize);

        clearTimeout(this._eventAttachDelayId);
        clearTimeout(this._resizeThrottleId);
    }

    // Handle window resizing (replaces onResize)
    handleViewportResize() {
        clearTimeout(this._resizeThrottleId);
        this._resizeThrottleId = setTimeout(() => {
            this.showComponent();
        }, 100);
    }

    // Calculate and apply visual component placement (replaces computePosition)
    determineComponentPlacement() {
        const currentSettings = this._operationalSettings;
        const targetElem = this._referenceObject || this._triggerElements[0] || this._activeTriggerElement;

        if (!targetElem) return;

        const targetRect = _Util.getElementBoundaries(targetElem);
        const overlayRect = _Util.getElementBoundaries(this._displayComponent);

        let placementMode = currentSettings._positionMode;
        const dataPlacement = targetElem.getAttribute('data-overlay-placement');
        if (dataPlacement) {
            placementMode = /^[trbl]{2}$/.test(dataPlacement) ? dataPlacement : 'auto';
        }

        let calculatedY, calculatedX;
        const offsetX = currentSettings._positionOffset.x;
        const offsetY = currentSettings._positionOffset.y;

        const scrollY = _Util.getCurrentScrollY();
        const scrollX = _Util.getCurrentScrollX();
        const viewportW = _Util.getViewportWidth();
        const viewportH = _Util.getViewportHeight();

        // Target coordinates relative to document
        const targetDocY = targetRect.top + scrollY;
        const targetDocX = targetRect.left + scrollX;
        const targetDocRight = targetRect.right + scrollX;
        const targetDocBottom = targetRect.bottom + scrollY;

        let primaryAxis, secondaryAxis;

        if (placementMode === 'auto') {
            let horizontalPreference, verticalPreference;

            // Determine horizontal preference ('l', 'c', 'r')
            const targetCenterViewportX = targetRect.left + targetRect.width / 2;
            const overlayHalfWidth = overlayRect.width / 2;
            const centeredOverlayLeftViewport = targetCenterViewportX - overlayHalfWidth;
            const centeredOverlayRightViewport = targetCenterViewportX + overlayHalfWidth;

            if (targetRect.width >= overlayRect.width || (centeredOverlayLeftViewport >= 0 && centeredOverlayRightViewport <= viewportW)) {
                horizontalPreference = 'c';
            } else if (targetRect.left + overlayRect.width > viewportW) {
                horizontalPreference = 'r';
            } else {
                horizontalPreference = 'l';
            }

            // Determine vertical preference ('t', 'c', 'b')
            const targetMiddleViewportY = targetRect.top + targetRect.height / 2;
            const overlayHalfHeight = overlayRect.height / 2;
            const centeredOverlayTopViewport = targetMiddleViewportY - overlayHalfHeight;
            const centeredOverlayBottomViewport = targetMiddleViewportY + overlayHalfHeight;

            if (targetRect.height >= overlayRect.height || (centeredOverlayTopViewport >= 0 && centeredOverlayBottomViewport <= viewportH)) {
                verticalPreference = 'c';
            } else if (targetRect.top + overlayRect.height > viewportH) {
                verticalPreference = 'b';
            } else {
                verticalPreference = 't';
            }

            // Auto-selection of primary direction
            if (targetRect.bottom + overlayRect.height <= viewportH) { // Space below
                primaryAxis = 'b';
                secondaryAxis = horizontalPreference;
            } else if (targetRect.right + overlayRect.width <= viewportW) { // Space right
                primaryAxis = 'r';
                secondaryAxis = verticalPreference;
            } else if (targetRect.top - overlayRect.height >= 0) { // Space above
                primaryAxis = 't';
                secondaryAxis = horizontalPreference;
            } else if (targetRect.left - overlayRect.width >= 0) { // Space left
                primaryAxis = 'l';
                secondaryAxis = verticalPreference;
            } else { // Fallback, bottom-left
                primaryAxis = 'b';
                secondaryAxis = 'l';
            }
            placementMode = primaryAxis + secondaryAxis;

        } else {
            primaryAxis = placementMode.charAt(0);
            secondaryAxis = placementMode.charAt(1);
        }

        // Calculate base position
        if (primaryAxis === 't' || primaryAxis === 'b') {
            // Vertical primary placement
            switch (secondaryAxis) {
                case 'l': calculatedX = targetDocX; break;
                case 'c': calculatedX = targetDocX + (targetRect.width / 2) - (overlayRect.width / 2); break;
                case 'r': calculatedX = targetDocRight - overlayRect.width; break;
                default: calculatedX = targetDocX;
            }

            if (primaryAxis === 't') {
                calculatedY = targetDocY - overlayRect.height;
            } else { // 'b'
                calculatedY = targetDocBottom;
            }
            
            // Apply offsets for 't'/'b' primary
            calculatedX += offsetX;
            calculatedY += offsetY;

        } else if (primaryAxis === 'l' || primaryAxis === 'r') {
            // Horizontal primary placement
            switch (secondaryAxis) {
                case 't': calculatedY = targetDocY; break;
                case 'c': calculatedY = targetDocY + (targetRect.height / 2) - (overlayRect.height / 2); break;
                case 'b': calculatedY = targetDocBottom - overlayRect.height; break;
                default: calculatedY = targetDocY;
            }

            if (primaryAxis === 'l') {
                calculatedX = targetDocX - overlayRect.width - offsetX;
            } else { // 'r'
                calculatedX = targetDocRight + offsetX;
            }

            // Apply Y offset for 'l'/'r' primary
            calculatedY += offsetY;

        } else {
            // Fallback for invalid placementMode, default to 'bl' with offsets
            calculatedX = targetDocX + offsetX;
            calculatedY = targetDocBottom + offsetY;
        }

        this._displayComponent.style.left = `${calculatedX}px`;
        this._displayComponent.style.top = `${calculatedY}px`;
    }

    // Cleanup method
    destroy() {
        this.concealComponent();

        // Clean up trigger events
        if (this._dynamicTriggerContainer) {
            _Util.stopListeningTo(this._dynamicTriggerContainer, 'click', this._boundInitiateDisplay);
        }
        if (this._triggerElements && Array.isArray(this._triggerElements)) {
            this._triggerElements.forEach(elem => _Util.stopListeningTo(elem, 'click', this._boundInitiateDisplay));
        }

        // Remove visual component if it was created by this instance
        if (!this._operationalSettings._displayComponent && this._displayComponent && this._displayComponent.parentNode) {
            this._displayComponent.parentNode.removeChild(this._displayComponent);
        }

        // Clear all event listeners
        this._eventRegistry.clear();
        
        // Nullify references
        this._operationalSettings = null;
        this._displayComponent = null;
        this._referenceObject = null;
        this._triggerElements = null;
        this._dynamicTriggerContainer = null;
        this._activeTriggerElement = null;
    }
}