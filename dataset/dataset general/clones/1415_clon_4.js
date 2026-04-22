class SelectionScroller {
    constructor(hostElement, selectionFilter, configuration) {
        this.baseElement = hostElement;
        this.itemSelector = selectionFilter;
        this.config = {
            scrollableElement: null,
            scrollEdgeX: 5,
            scrollEdgeY: 5,
            scrollMagnitude: 25,
            scrollCadence: 100,
            toleranceMode: 'touch',
            ...configuration
        };

        this.scrollContainer = this.config.scrollableElement || this.baseElement;

        this.selectionOverlay = null;
        this.dragState = {
            isEngaged: false,
            lastPointerEvent: null,
            initialPointerX: 0,
            initialPointerY: 0,
            scrollingIdentifier: null,
            containerMetrics: null
        };
        this.cachedSelectableItems = [];
        this.itemDataMap = new WeakMap();

        this.initiateComponent();
    }

    initiateComponent() {
        this.baseElement.classList.add('selection-host');
        this.selectionOverlay = document.createElement('div');
        this.selectionOverlay.classList.add('selection-lasso');
        this.selectionOverlay.style.position = 'absolute';
        this.selectionOverlay.style.display = 'none';
        document.body.appendChild(this.selectionOverlay);

        this.recomputeSelectableItems();
        this.attachGlobalListeners();
    }

    recomputeSelectableItems() {
        const currentScrollLeft = this.scrollContainer.scrollLeft;
        const currentScrollTop = this.scrollContainer.scrollTop;
        const containerRect = this.scrollContainer.getBoundingClientRect();

        this.cachedSelectableItems = [];
        const foundElements = this.baseElement.querySelectorAll(this.itemSelector);

        foundElements.forEach(element => {
            element.classList.add('selection-item');
            const elementRect = element.getBoundingClientRect();

            const itemDetails = {
                domReference: element,
                absLeft: elementRect.left,
                absTop: elementRect.top,
                absRight: elementRect.right,
                absBottom: elementRect.bottom,
                relativeLeft: elementRect.left - containerRect.left + currentScrollLeft,
                relativeTop: elementRect.top - containerRect.top + currentScrollTop,
                relativeRight: elementRect.left - containerRect.left + currentScrollLeft + elementRect.width,
                relativeBottom: elementRect.top - containerRect.top + currentScrollTop + elementRect.height,
                initialStateSelected: false,
                currentStateSelecting: false,
                currentStateUnselecting: false
            };
            this.itemDataMap.set(element, itemDetails);
            this.cachedSelectableItems.push(itemDetails);
        });
    }

    attachGlobalListeners() {
        this.baseElement.addEventListener('pointerdown', this.handlePointerDown.bind(this));
        document.addEventListener('pointermove', this.handlePointerMove.bind(this));
        document.addEventListener('pointerup', this.handlePointerUp.bind(this));
    }

    handlePointerDown(evt) {
        if (this.dragState.isEngaged || evt.button !== 0) return;

        const containerRect = this.scrollContainer.getBoundingClientRect();
        if (evt.clientX < containerRect.left || evt.clientX > containerRect.right ||
            evt.clientY < containerRect.top || evt.clientY > containerRect.bottom) {
            return;
        }

        evt.preventDefault();

        this.dragState.isEngaged = true;
        this.dragState.lastPointerEvent = evt;

        this.dragState.containerMetrics = {
            offset: { left: containerRect.left, top: containerRect.top },
            visibleWidth: this.scrollContainer.clientWidth,
            visibleHeight: this.scrollContainer.clientHeight,
            fullScrollWidth: this.scrollContainer.scrollWidth,
            fullScrollHeight: this.scrollContainer.scrollHeight
        };

        this.dragState.initialPointerX = evt.clientX - containerRect.left + this.scrollContainer.scrollLeft;
        this.dragState.initialPointerY = evt.clientY - containerRect.top + this.scrollContainer.scrollTop;

        this.cachedSelectableItems.forEach(item => {
            item.initialStateSelected = item.domReference.classList.contains('selected-state');
            item.currentStateSelecting = false;
            item.currentStateUnselecting = false;
            item.domReference.classList.remove('selecting-state', 'unselecting-state');
            if (!evt.metaKey && !evt.ctrlKey && item.initialStateSelected) {
                item.domReference.classList.remove('selected-state');
            }
        });

        this.selectionOverlay.style.display = 'block';
    }

    handlePointerMove(evt) {
        if (!this.dragState.isEngaged) return;

        evt.preventDefault();
        this.dragState.lastPointerEvent = evt;

        const scrollOutcome = this.evaluateScrollNeeds();
        this.manageAutoScrollInterval(scrollOutcome.didScrollOccur);
        this.refreshUserInterface(true);
    }

    evaluateScrollNeeds() {
        const currentScrollLeft = this.scrollContainer.scrollLeft;
        const currentScrollTop = this.scrollContainer.scrollTop;
        const pointerX = this.dragState.lastPointerEvent.clientX;
        const pointerY = this.dragState.lastPointerEvent.clientY;
        const containerOffsetLeft = this.dragState.containerMetrics.offset.left;
        const containerOffsetTop = this.dragState.containerMetrics.offset.top;
        const containerVisibleWidth = this.dragState.containerMetrics.visibleWidth;
        const containerVisibleHeight = this.dragState.containerMetrics.visibleHeight;
        const containerFullScrollWidth = this.dragState.containerMetrics.fullScrollWidth;
        const containerFullScrollHeight = this.dragState.containerMetrics.fullScrollHeight;

        let newScrollLeft = currentScrollLeft;
        let newScrollTop = currentScrollTop;
        let didScroll = false;

        if (pointerX - containerOffsetLeft < this.config.scrollEdgeX && newScrollLeft > 0) {
            newScrollLeft = Math.max(0, newScrollLeft - this.config.scrollMagnitude);
            didScroll = true;
        }
        if (pointerY - containerOffsetTop < this.config.scrollEdgeY && newScrollTop > 0) {
            newScrollTop = Math.max(0, newScrollTop - this.config.scrollMagnitude);
            didScroll = true;
        }
        if (pointerX - containerOffsetLeft > containerVisibleWidth - this.config.scrollEdgeX &&
            containerFullScrollWidth > newScrollLeft + containerVisibleWidth) {
            newScrollLeft = Math.min(
                containerFullScrollWidth - containerVisibleWidth,
                newScrollLeft + this.config.scrollMagnitude
            );
            didScroll = true;
        }
        if (pointerY - containerOffsetTop > containerVisibleHeight - this.config.scrollEdgeY &&
            containerFullScrollHeight > newScrollTop + containerVisibleHeight) {
            newScrollTop = Math.min(
                containerFullScrollHeight - containerVisibleHeight,
                newScrollTop + this.config.scrollMagnitude
            );
            didScroll = true;
        }

        if (didScroll) {
            this.scrollContainer.scrollLeft = newScrollLeft;
            this.scrollContainer.scrollTop = newScrollTop;
        }

        return {
            newScrollLeft: newScrollLeft,
            newScrollTop: newScrollTop,
            didScrollOccur: didScroll
        };
    }

    refreshUserInterface(shouldAdjustLasso) {
        const currentScrollState = this.evaluateScrollNeeds();
        const currentPointer = this.dragState.lastPointerEvent;

        const relativePointerPosition = this.computeRelativeLocation(
            currentPointer.clientX,
            currentPointer.clientY,
            currentScrollState.newScrollLeft,
            currentScrollState.newScrollTop
        );

        const selectionArea = this.deriveSelectionBounds(
            relativePointerPosition.xCoord,
            relativePointerPosition.yCoord
        );

        if (shouldAdjustLasso) {
            this.adjustOverlayVisuals(
                currentScrollState.newScrollLeft,
                currentScrollState.newScrollTop,
                selectionArea.xStart,
                selectionArea.yStart,
                selectionArea.xEnd,
                selectionArea.yEnd
            );
        }

        this.updateSelectionStatus(selectionArea);
    }

    computeRelativeLocation(absoluteX, absoluteY, scrollOffsetX, scrollOffsetY) {
        const containerOffsetLeft = this.dragState.containerMetrics.offset.left;
        const containerOffsetTop = this.dragState.containerMetrics.offset.top;

        return {
            xCoord: absoluteX - containerOffsetLeft + scrollOffsetX,
            yCoord: absoluteY - containerOffsetTop + scrollOffsetY
        };
    }

    deriveSelectionBounds(currentRelativeX, currentRelativeY) {
        const startX = this.dragState.initialPointerX;
        const startY = this.dragState.initialPointerY;

        return {
            xStart: Math.min(currentRelativeX, startX),
            yStart: Math.min(currentRelativeY, startY),
            xEnd: Math.max(currentRelativeX, startX),
            yEnd: Math.max(currentRelativeY, startY)
        };
    }

    adjustOverlayVisuals(currentScrollLeft, currentScrollTop, areaX1, areaY1, areaX2, areaY2) {
        const containerOffsetLeft = this.dragState.containerMetrics.offset.left;
        const containerOffsetTop = this.dragState.containerMetrics.offset.top;
        const containerVisibleWidth = this.dragState.containerMetrics.visibleWidth;
        const containerVisibleHeight = this.dragState.containerMetrics.visibleHeight;

        let visualX1, visualY1, visualX2, visualY2;
        const overlayClasses = [];
        const classIndicators = ['clip-top', 'clip-right', 'clip-bottom', 'clip-left'];

        if (areaX1 - currentScrollLeft < 0) {
            overlayClasses.push('clip-left');
            visualX1 = containerOffsetLeft;
        } else {
            visualX1 = containerOffsetLeft + areaX1 - currentScrollLeft;
        }
        if (areaY1 - currentScrollTop < 0) {
            overlayClasses.push('clip-top');
            visualY1 = containerOffsetTop;
        } else {
            visualY1 = containerOffsetTop + areaY1 - currentScrollTop;
        }
        if (areaX2 - currentScrollLeft > containerVisibleWidth) {
            overlayClasses.push('clip-right');
            visualX2 = containerOffsetLeft + containerVisibleWidth;
        } else {
            visualX2 = containerOffsetLeft + areaX2 - currentScrollLeft;
        }
        if (areaY2 - currentScrollTop > containerVisibleHeight) {
            overlayClasses.push('clip-bottom');
            visualY2 = containerOffsetTop + containerVisibleHeight;
        } else {
            visualY2 = containerOffsetTop + areaY2 - currentScrollTop;
        }

        classIndicators.forEach(cls => {
            if (overlayClasses.includes(cls)) {
                this.selectionOverlay.classList.add(cls);
            } else {
                this.selectionOverlay.classList.remove(cls);
            }
        });

        Object.assign(this.selectionOverlay.style, {
            left: `${visualX1}px`,
            top: `${visualY1}px`,
            width: `${visualX2 - visualX1}px`,
            height: `${visualY2 - visualY1}px`
        });
    }

    updateSelectionStatus(currentSelectionArea) {
        const { xStart, yStart, xEnd, yEnd } = currentSelectionArea;
        const pointerEvent = this.dragState.lastPointerEvent;
        const isModifierActive = pointerEvent.metaKey || pointerEvent.ctrlKey;

        this.cachedSelectableItems.forEach(item => {
            if (item.domReference === this.baseElement) return;

            let isIntersecting = false;

            if (this.config.toleranceMode === 'touch') {
                isIntersecting = !(
                    item.relativeLeft > xEnd ||
                    item.relativeRight < xStart ||
                    item.relativeTop > yEnd ||
                    item.relativeBottom < yStart
                );
            } else if (this.config.toleranceMode === 'fit') {
                isIntersecting = (
                    item.relativeLeft >= xStart &&
                    item.relativeRight <= xEnd &&
                    item.relativeTop >= yStart &&
                    item.relativeBottom <= yEnd
                );
            }

            if (isIntersecting) {
                if (!item.currentStateSelecting) {
                    item.domReference.classList.add('selecting-state');
                    item.domReference.classList.remove('selected-state', 'unselecting-state');
                    item.currentStateSelecting = true;
                    item.currentStateUnselecting = false;
                    this.dispatchEvent('itemSelecting', { element: item.domReference });
                }
            } else {
                if (item.currentStateSelecting) {
                    if (isModifierActive && item.initialStateSelected) {
                        item.domReference.classList.remove('selecting-state');
                        item.domReference.classList.add('selected-state');
                        item.currentStateSelecting = false;
                    } else {
                        item.domReference.classList.remove('selecting-state');
                        item.currentStateSelecting = false;
                        if (item.initialStateSelected) {
                            item.domReference.classList.add('unselecting-state');
                            item.currentStateUnselecting = true;
                            this.dispatchEvent('itemUnselecting', { element: item.domReference });
                        }
                    }
                } else if (item.domReference.classList.contains('selected-state') && !isModifierActive && !item.initialStateSelected) {
                    item.domReference.classList.remove('selected-state');
                    item.domReference.classList.add('unselecting-state');
                    item.currentStateUnselecting = true;
                    this.dispatchEvent('itemUnselecting', { element: item.domReference });
                }
            }
        });
    }

    manageAutoScrollInterval(shouldContinueScrolling) {
        if (shouldContinueScrolling && this.dragState.scrollingIdentifier === null) {
            this.dragState.scrollingIdentifier = setInterval(() => {
                this.refreshUserInterface(false);
            }, this.config.scrollCadence);
        } else if (!shouldContinueScrolling && this.dragState.scrollingIdentifier !== null) {
            this.haltAutoScroll();
        }
    }

    haltAutoScroll() {
        if (this.dragState.scrollingIdentifier) {
            clearInterval(this.dragState.scrollingIdentifier);
            this.dragState.scrollingIdentifier = null;
        }
    }

    handlePointerUp(evt) {
        if (!this.dragState.isEngaged) return;

        this.haltAutoScroll();
        this.dragState.isEngaged = false;
        this.selectionOverlay.style.display = 'none';

        this.cachedSelectableItems.forEach(item => {
            if (item.currentStateSelecting) {
                item.domReference.classList.remove('selecting-state');
                item.domReference.classList.add('selected-state');
                item.currentStateSelecting = false;
                this.dispatchEvent('itemSelected', { element: item.domReference });
            } else if (item.currentStateUnselecting) {
                item.domReference.classList.remove('unselecting-state');
                item.currentStateUnselecting = false;
                this.dispatchEvent('itemDeselected', { element: item.domReference });
            }
        });

        this.dispatchEvent('selectionEnded', { finalEvent: evt });
    }

    dispatchEvent(eventName, detail) {
        const customEvent = new CustomEvent(eventName, { bubbles: true, detail: detail });
        this.baseElement.dispatchEvent(customEvent);
    }

    destroy() {
        this.haltAutoScroll();
        this.baseElement.classList.remove('selection-host');
        this.selectionOverlay.remove();
        this.baseElement.removeEventListener('pointerdown', this.handlePointerDown.bind(this));
        document.removeEventListener('pointermove', this.handlePointerMove.bind(this));
        document.removeEventListener('pointerup', this.handlePointerUp.bind(this));
        this.cachedSelectableItems.forEach(item => {
            item.domReference.classList.remove('selection-item', 'selected-state', 'selecting-state', 'unselecting-state');
            this.itemDataMap.delete(item.domReference);
        });
        this.cachedSelectableItems = [];
    }
}