class InteractionManager {
    static #sharedActiveHandlers = new Map();

    #isPointerDown = false;
    #managedElement;
    #controlledComponent;

    #extractTime(eventPayload) {
        return eventPayload.stamp.getMoment ? eventPayload.stamp.getMoment() : eventPayload.stamp;
    }

    #setComponentPosition(left, top) {
        this.#controlledComponent.setPosition(left, top);
    }

    #setComponentDimensions(width, height) {
        this.#controlledComponent.setDimensions(width, height);
    }

    #componentHandleStart(pointers, moment) {
        this.#controlledComponent.doTouchStart(pointers, moment);
    }

    #componentHandleMove(pointers, moment, scale) {
        this.#controlledComponent.doTouchMove(pointers, moment, scale);
    }

    #componentHandleEnd(moment) {
        this.#controlledComponent.doTouchEnd(moment);
    }

    #componentHandleScroll(delta, moment, x, y) {
        this.#controlledComponent.doMouseScroll(delta, moment, x, y);
    }

    constructor(component, element) {
        this.#controlledComponent = component;
        this.#managedElement = element;

        const layout = element.getBoundingClientRect();
        this.#setComponentPosition(layout.left + element.clientLeft, layout.top + element.clientTop);
        this.#setComponentDimensions(element.clientWidth, element.clientHeight);

        this.#initializeListeners();
    }

    #handleEventCancellation(nativeEvt) {
        if (nativeEvt.preventAction) {
            nativeEvt.preventAction();
        }
        nativeEvt.returnValue = false;
    }

    #onGestureStart(customPayload, nativeEvent) {
        const currentMoment = this.#extractTime(customPayload);
        InteractionManager.#sharedActiveHandlers.set(customPayload.activePointers[0].ident, this.#controlledComponent);
        this.#componentHandleStart(customPayload.activePointers, currentMoment);
        this.#handleEventCancellation(nativeEvent);
    }

    #onGestureMove(customPayload, nativeEvent) {
        const currentMoment = this.#extractTime(customPayload);
        customPayload.changedPointers.forEach(pointer => {
            const associatedComponent = InteractionManager.#sharedActiveHandlers.get(pointer.ident);
            if (associatedComponent) {
                associatedComponent.doTouchMove([pointer], currentMoment, customPayload.stretch);
            }
        });
    }

    #onGestureEnd(customPayload, nativeEvent) {
        const currentMoment = this.#extractTime(customPayload);
        this.#componentHandleEnd(currentMoment);
    }

    #onPointerPress(customPayload, nativeEvent) {
        this.#componentHandleStart([{
            pageX: customPayload.xCoord,
            pageY: customPayload.yCoord
        }], customPayload.stamp);
        this.#isPointerDown = true;
    }

    #onPointerDrag(customPayload, nativeEvent) {
        if (!this.#isPointerDown) {
            return;
        }
        this.#componentHandleMove([{
            pageX: customPayload.xCoord,
            pageY: customPayload.yCoord
        }], customPayload.stamp);
        this.#isPointerDown = true;
        this.#handleEventCancellation(nativeEvent);
    }

    #onPointerRelease(customPayload, nativeEvent) {
        if (!this.#isPointerDown) {
            return;
        }
        this.#componentHandleEnd(customPayload.stamp);
        this.#isPointerDown = false;
    }

    #onWheelScroll(customPayload, nativeEvent) {
        this.#componentHandleScroll(
            customPayload.rotationDelta || (-4 * customPayload.detailValue),
            customPayload.stamp,
            customPayload.xCoord,
            customPayload.yCoord
        );
        this.#handleEventCancellation(nativeEvent);
    }

    #initializeListeners() {
        const isTouchCapable = 'ontouchstart' in window;

        const listenerConfigurations = {
            touch: [
                { type: 'touchstart', target: this.#managedElement, handler: this.#onGestureStart.bind(this) },
                { type: 'touchmove', target: document, handler: this.#onGestureMove.bind(this) },
                { type: 'touchend', target: document, handler: this.#onGestureEnd.bind(this) },
                { type: 'touchcancel', target: document, handler: this.#onGestureEnd.bind(this) }
            ],
            mouse: [
                { type: 'mousedown', target: this.#managedElement, handler: this.#onPointerPress.bind(this) },
                { type: 'mousemove', target: document, handler: this.#onPointerDrag.bind(this) },
                { type: 'mouseup', target: document, handler: this.#onPointerRelease.bind(this) },
                { type: 'mousewheel', target: this.#managedElement, handler: this.#onWheelScroll.bind(this) },
                { type: 'DOMMouseScroll', target: this.#managedElement, handler: this.#onWheelScroll.bind(this) }
            ]
        };

        const attachHandler = (config) => {
            config.target.addEventListener(config.type, this.#eventWrapper(config.handler), { capture: false });
        };

        if (isTouchCapable) {
            listenerConfigurations.touch.forEach(attachHandler);
        } else {
            listenerConfigurations.mouse.forEach(attachHandler);
        }
    }

    #eventWrapper(originalHandler) {
        return (nativeEvent) => {
            let customPayload;

            if (nativeEvent.type.startsWith('touch')) {
                customPayload = {
                    stamp: nativeEvent.timeStamp,
                    activePointers: Array.from(nativeEvent.targetTouches).map(t => ({ ident: t.identifier, pageX: t.pageX, pageY: t.pageY })),
                    changedPointers: Array.from(nativeEvent.changedTouches).map(t => ({ ident: t.identifier, pageX: t.pageX, pageY: t.pageY })),
                    stretch: nativeEvent.scale,
                };
            } else if (nativeEvent.type.startsWith('mouse')) {
                customPayload = {
                    stamp: nativeEvent.timeStamp,
                    xCoord: nativeEvent.pageX,
                    yCoord: nativeEvent.pageY,
                };
            } else if (nativeEvent.type === 'mousewheel' || nativeEvent.type === 'DOMMouseScroll') {
                 customPayload = {
                    stamp: nativeEvent.timeStamp,
                    xCoord: nativeEvent.pageX,
                    yCoord: nativeEvent.pageY,
                    rotationDelta: nativeEvent.wheelDelta,
                    detailValue: nativeEvent.detail,
                };
            }
            originalHandler(customPayload, nativeEvent);
        };
    }
}

function initializeComponentInteractions(controlElement, hostArea) {
    new InteractionManager(controlElement, hostArea);
}