const UI_NAMESPACE = 'selection-interaction';
const OVERLAY_CLASS = UI_NAMESPACE + '-overlay';
const RECTANGLE_CLASS = UI_NAMESPACE + '-highlight';
const ITEM_SELECTED_CLASS = UI_NAMESPACE + '-item-chosen';
const INTERACTION_ACTIVE_CLASS = UI_NAMESPACE + '-active';

const DEFAULT_CONFIGURATION_SET = {
    dragInitiationThreshold: 0,
    isOperationDisabled: false,
    ignoreElements: ':input,option',
    selectionTargets: '*',
    viewportScrollMargin: 100,
    scrollSpeedFactor: 1,
    customGeometryResolver: null
};

function doRectanglesIntersect(rectA, rectB) {
    return rectA.left < rectB.right &&
           rectA.right > rectB.left &&
           rectA.top < rectB.bottom &&
           rectA.bottom > rectB.top;
}

class RegionSelector {
    constructor(hostElement, userConfig) {
        if (!(hostElement instanceof HTMLElement)) {
            throw new Error('Host element must be a valid HTMLElement.');
        }
        this._hostElement = hostElement;
        this._config = { ...DEFAULT_CONFIGURATION_SET, ...userConfig };

        this._interactionOverlay = null;
        this._highlightRectangle = null;
        this._initialPointerCoords = null; // { clientX, clientY, pageX, pageY }
        this._currentPointerCoords = null; // { clientX, clientY, pageX, pageY }
        this._isDragInitiated = false;
        this._targetItemGeometries = []; // [{ element: HTMLElement, clientRect: DOMRect, isCurrentlyChosen: boolean }]
        this._hostViewportBounds = null; // DOMRect of the host element relative to viewport
        this._currentSelectionRectangleClient = null; // Viewport-relative bounds of the highlight rectangle
        this._scrollAnimationFrameHandle = null;
        this._lastScrollTimestamp = 0;

        this._setupEventListeners();
        if (!this._config.isOperationDisabled) {
            this._enableInteraction();
        }
    }

    _setupEventListeners() {
        this._pointerDownHandler = this._onPointerDown.bind(this);
        this._pointerMoveHandler = this._onPointerMove.bind(this);
        this._pointerUpHandler = this._onPointerUp.bind(this);
        this._hostElement.addEventListener('mousedown', this._pointerDownHandler);
    }

    _removeEventListeners() {
        this._hostElement.removeEventListener('mousedown', this._pointerDownHandler);
        document.removeEventListener('mousemove', this._pointerMoveHandler);
        document.removeEventListener('mouseup', this._pointerUpHandler);
        this._stopContinuousScrolling();
    }

    _enableInteraction() {
        // No specific class to add for 'enabled' state, just ensures listeners are active
    }

    _disableInteraction() {
        this._stopContinuousScrolling();
        this._removeVisualElements();
        this._isDragInitiated = false;
        this._initialPointerCoords = null;
        this._currentPointerCoords = null;
        this._targetItemGeometries = [];
        this._hostElement.classList.remove(INTERACTION_ACTIVE_CLASS);
    }

    _onPointerDown(event) {
        if (event.button !== 0 || this._config.isOperationDisabled) {
            return;
        }

        if (event.target.matches(this._config.ignoreElements)) {
            return;
        }

        // Basic scrollbar detection heuristic (different from original's detailed check)
        const hostRect = this._hostElement.getBoundingClientRect();
        const scrollbarWidth = this._hostElement.offsetWidth - this._hostElement.clientWidth;
        const scrollbarHeight = this._hostElement.offsetHeight - this._hostElement.clientHeight;

        if (this._hostElement.scrollWidth > this._hostElement.clientWidth && event.clientY > hostRect.bottom - scrollbarHeight && event.clientY < hostRect.bottom) {
            return; // Clicked on horizontal scrollbar
        }
        if (this._hostElement.scrollHeight > this._hostElement.clientHeight && event.clientX > hostRect.right - scrollbarWidth && event.clientX < hostRect.right) {
            return; // Clicked on vertical scrollbar
        }

        event.preventDefault();
        this._initialPointerCoords = {
            clientX: event.clientX, clientY: event.clientY,
            pageX: event.pageX, pageY: event.pageY
        };
        this._currentPointerCoords = { ...this._initialPointerCoords };

        document.addEventListener('mousemove', this._pointerMoveHandler);
        document.addEventListener('mouseup', this._pointerUpHandler);

        this._hostElement.classList.add(INTERACTION_ACTIVE_CLASS);
    }

    _onPointerMove(event) {
        if (!this._initialPointerCoords) return;

        this._currentPointerCoords = {
            clientX: event.clientX, clientY: event.clientY,
            pageX: event.pageX, pageY: event.pageY
        };

        const horizontalDistance = Math.abs(this._currentPointerCoords.pageX - this._initialPointerCoords.pageX);
        const verticalDistance = Math.abs(this._currentPointerCoords.pageY - this._initialPointerCoords.pageY);

        if (!this._isDragInitiated && (horizontalDistance > this._config.dragInitiationThreshold || verticalDistance > this._config.dragInitiationThreshold)) {
            this._isDragInitiated = true;
            this._prepareVisualElements();
            this._captureTargetItemBounds();
        }

        if (this._isDragInitiated) {
            this._updateHighlightRectangleGeometry();
            this._evaluateItemIntersections();
            this._startContinuousScrolling();
        }
    }

    _onPointerUp(event) {
        if (!this._initialPointerCoords) return;

        document.removeEventListener('mousemove', this._pointerMoveHandler);
        document.removeEventListener('mouseup', this._pointerUpHandler);

        this._stopContinuousScrolling();

        if (this._isDragInitiated) {
            this._removeVisualElements();
            this._dispatchOutcomeEvents();
        } else {
            this._hostElement.classList.remove(INTERACTION_ACTIVE_CLASS);
        }

        this._isDragInitiated = false;
        this._initialPointerCoords = null;
        this._currentPointerCoords = null;
        this._targetItemGeometries = [];
    }

    _prepareVisualElements() {
        this._interactionOverlay = document.createElement('div');
        this._interactionOverlay.classList.add(OVERLAY_CLASS);
        Object.assign(this._interactionOverlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            height: `${this._hostElement.scrollHeight}px`,
            width: `${this._hostElement.scrollWidth}px`,
            overflow: 'hidden',
            zIndex: '9998'
        });
        this._hostElement.appendChild(this._interactionOverlay);

        this._highlightRectangle = document.createElement('div');
        this._highlightRectangle.classList.add(RECTANGLE_CLASS);
        Object.assign(this._highlightRectangle.style, {
            position: 'absolute',
            zIndex: '9999'
        });
        this._interactionOverlay.appendChild(this._highlightRectangle);
    }

    _removeVisualElements() {
        if (this._interactionOverlay && this._interactionOverlay.parentNode) {
            this._interactionOverlay.parentNode.removeChild(this._interactionOverlay);
        }
        this._interactionOverlay = null;
        this._highlightRectangle = null;
    }

    _captureTargetItemBounds() {
        this._targetItemGeometries = [];
        this._hostViewportBounds = this._hostElement.getBoundingClientRect();

        const targetElements = this._hostElement.querySelectorAll(this._config.selectionTargets);

        targetElements.forEach(element => {
            let itemClientBounds;
            if (this._config.customGeometryResolver) {
                const resolved = this._config.customGeometryResolver(element);
                itemClientBounds = {
                    left: this._hostViewportBounds.left + resolved.left - this._hostElement.scrollLeft,
                    top: this._hostViewportBounds.top + resolved.top - this._hostElement.scrollTop,
                    right: this._hostViewportBounds.left + resolved.left - this._hostElement.scrollLeft + resolved.width,
                    bottom: this._hostViewportBounds.top + resolved.top - this._hostElement.scrollTop + resolved.height,
                    width: resolved.width,
                    height: resolved.height
                };
            } else {
                itemClientBounds = element.getBoundingClientRect();
            }
            this._targetItemGeometries.push({
                element: element,
                clientRect: itemClientBounds,
                isCurrentlyChosen: false
            });
            element.classList.remove(ITEM_SELECTED_CLASS);
        });
    }

    _updateHighlightRectangleGeometry() {
        if (!this._highlightRectangle || !this._initialPointerCoords || !this._currentPointerCoords) return;

        const hostScrollLeft = this._hostElement.scrollLeft;
        const hostScrollTop = this._hostElement.scrollTop;
        const hostRect = this._hostViewportBounds;

        const startX = this._initialPointerCoords.clientX;
        const startY = this._initialPointerCoords.clientY;
        const currentX = this._currentPointerCoords.clientX;
        const currentY = this._currentPointerCoords.clientY;

        const rectLeftRelative = Math.min(startX, currentX) - hostRect.left + hostScrollLeft;
        const rectTopRelative = Math.min(startY, currentY) - hostRect.top + hostScrollTop;
        const rectWidth = Math.abs(startX - currentX);
        const rectHeight = Math.abs(startY - currentY);

        Object.assign(this._highlightRectangle.style, {
            left: `${rectLeftRelative}px`,
            top: `${rectTopRelative}px`,
            width: `${rectWidth}px`,
            height: `${rectHeight}px`
        });

        this._currentSelectionRectangleClient = {
            left: Math.min(startX, currentX),
            top: Math.min(startY, currentY),
            right: Math.max(startX, currentX),
            bottom: Math.max(startY, currentY),
            width: rectWidth,
            height: rectHeight
        };
    }

    _evaluateItemIntersections() {
        if (!this._currentSelectionRectangleClient) return;

        this._targetItemGeometries.forEach(item => {
            const intersects = doRectanglesIntersect(this._currentSelectionRectangleClient, item.clientRect);
            if (intersects && !item.isCurrentlyChosen) {
                item.element.classList.add(ITEM_SELECTED_CLASS);
                item.isCurrentlyChosen = true;
            } else if (!intersects && item.isCurrentlyChosen) {
                item.element.classList.remove(ITEM_SELECTED_CLASS);
                item.isCurrentlyChosen = false;
            }
        });
    }

    _startContinuousScrolling() {
        if (this._scrollAnimationFrameHandle) return;

        this._scrollAnimationFrameHandle = requestAnimationFrame(this._performScrollCycle.bind(this));
    }

    _stopContinuousScrolling() {
        if (this._scrollAnimationFrameHandle) {
            cancelAnimationFrame(this._scrollAnimationFrameHandle);
            this._scrollAnimationFrameHandle = null;
        }
    }

    _performScrollCycle() {
        if (!this._isDragInitiated || !this._currentPointerCoords) {
            this._stopContinuousScrolling();
            return;
        }

        const currentTime = performance.now();
        const deltaTime = currentTime - this._lastScrollTimestamp;
        this._lastScrollTimestamp = currentTime;

        let documentScrollX = 0, documentScrollY = 0;
        let hostScrollX = 0, hostScrollY = 0;

        const mouseX = this._currentPointerCoords.clientX;
        const mouseY = this._currentPointerCoords.clientY;
        const margin = this._config.viewportScrollMargin;
        const scrollIncrement = 5 * this._config.scrollSpeedFactor;

        // Determine document scrolling needs
        if (mouseY < margin) {
            documentScrollY = -scrollIncrement;
        } else if (mouseY > window.innerHeight - margin) {
            documentScrollY = scrollIncrement;
        }
        if (mouseX < margin) {
            documentScrollX = -scrollIncrement;
        } else if (mouseX > window.innerWidth - margin) {
            documentScrollX = scrollIncrement;
        }

        // Apply document scroll first
        if (documentScrollX !== 0 || documentScrollY !== 0) {
            window.scrollBy(documentScrollX, documentScrollY);
            // Re-evaluate host element's viewport bounds after document scroll
            this._hostViewportBounds = this._hostElement.getBoundingClientRect();
        }

        // Determine host element (container) scrolling needs
        const hostRect = this._hostViewportBounds;
        const mouseXRelativeToHost = mouseX - hostRect.left;
        const mouseYRelativeToHost = mouseY - hostRect.top;

        if (mouseYRelativeToHost < margin && this._hostElement.scrollTop > 0) {
            hostScrollY = -scrollIncrement;
        } else if (mouseYRelativeToHost > hostRect.height - margin && this._hostElement.scrollHeight - this._hostElement.scrollTop > hostRect.height) {
            hostScrollY = scrollIncrement;
        }
        if (mouseXRelativeToHost < margin && this._hostElement.scrollLeft > 0) {
            hostScrollX = -scrollIncrement;
        } else if (mouseXRelativeToHost > hostRect.width - margin && this._hostElement.scrollWidth - this._hostElement.scrollLeft > hostRect.width) {
            hostScrollX = scrollIncrement;
        }

        // Apply host element scroll
        if (hostScrollX !== 0 || hostScrollY !== 0) {
            this._hostElement.scrollBy({ left: hostScrollX, top: hostScrollY, behavior: 'auto' });
        }

        // Update highlight rectangle and check collisions if any scrolling occurred
        if (documentScrollX !== 0 || documentScrollY !== 0 || hostScrollX !== 0 || hostScrollY !== 0) {
            this._updateHighlightRectangleGeometry();
            this._evaluateItemIntersections();
        }

        this._scrollAnimationFrameHandle = requestAnimationFrame(this._performScrollCycle.bind(this));
    }

    _dispatchOutcomeEvents() {
        const chosenElements = this._targetItemGeometries.filter(item => item.isCurrentlyChosen).map(item => item.element);
        const unchosenElements = this._targetItemGeometries.filter(item => !item.isCurrentlyChosen).map(item => item.element);

        if (chosenElements.length > 0) {
            this._hostElement.dispatchEvent(new CustomEvent('regionSelected', { detail: { elements: chosenElements } }));
        }
        if (unchosenElements.length > 0) {
            this._hostElement.dispatchEvent(new CustomEvent('regionUnselected', { detail: { elements: unchosenElements } }));
        }
    }

    setOperationStatus(enabled) {
        this._config.isOperationDisabled = !enabled;
        if (!enabled) {
            this._disableInteraction();
        } else {
            this._enableInteraction();
        }
    }

    updateSettings(newSettings) {
        this._config = { ...this._config, ...newSettings };
    }

    dispose() {
        this._removeEventListeners();
        this._disableInteraction();
        this._hostElement = null;
        this._config = null;
    }
}

window.createRegionSelector = function(elementOrSelector, config) {
    let targetElement;
    if (typeof elementOrSelector === 'string') {
        targetElement = document.querySelector(elementOrSelector);
    } else if (elementOrSelector instanceof HTMLElement) {
        targetElement = elementOrSelector;
    } else {
        console.error('Invalid element or selector provided to createRegionSelector.');
        return null;
    }

    if (!targetElement) {
        console.error('No element found for the given selector:', elementOrSelector);
        return null;
    }

    return new RegionSelector(targetElement, config);
};