const interactionTiming = {
    DOUBLE_TAP_THRESHOLD_MS: 200,
    SIGNIFICANT_MOVE_PX: 10
};

const platformCapabilities = (() => {
    const agentString = navigator.userAgent;
    const isAndroidDevice = agentString.includes('Android');
    const isIOSDevice = /iP(ad|hone|od)/.test(agentString);
    const isIOSVersion4 = isIOSDevice && (/OS 4_\d(_\d)?/).test(agentString);
    const isIOSBadTarget = isIOSDevice && (/OS ([6-9]|\d{2})_\d/).test(agentString);

    return {
        isAndroid: isAndroidDevice,
        isIOS: isIOSDevice,
        isLegacyIOS: isIOSVersion4,
        isTargetRecalculatedIOS: isIOSBadTarget
    };
})();

const elementAnalysis = {
    needsNativeInteraction: (domNode, platformInfo) => {
        const nodeTag = domNode.nodeName.toLowerCase();
        const specificChecks = {
            'button': () => domNode.disabled || (platformInfo.isIOS && domNode.type === 'file'),
            'input': () => domNode.disabled || (platformInfo.isIOS && domNode.type === 'file'),
            'label': () => true,
            'video': () => true,
        };
        if (specificChecks[nodeTag]) return specificChecks[nodeTag]();
        return domNode.classList.contains('needsclick');
    },
    requiresProgrammaticFocus: (domNode) => {
        const nodeTag = domNode.nodeName.toLowerCase();
        const specificChecks = {
            'textarea': () => true,
            'select': () => true,
            'input': () => {
                const nonFocusInputTypes = ['button', 'checkbox', 'file', 'image', 'radio', 'submit'];
                return !domNode.disabled && !nonFocusInputTypes.includes(domNode.type);
            },
        };
        if (specificChecks[nodeTag]) return specificChecks[nodeTag]();
        return domNode.classList.contains('needsfocus');
    }
};

function createTouchAccelerator(baseElement) {
    'use strict';

    if (!baseElement || !baseElement.nodeType) {
        throw new TypeError('Base element must be a document node');
    }

    let gestureActive = false;
    let gestureBeginTime = 0;
    let initialTouchOrigin = null;
    let initialTouchCoordX = 0;
    let initialTouchCoordY = 0;
    let lastTouchIdentifierValue = 0;
    let blockNextClickEvent = false;
    let lastClickTimestamp = 0;

    let originalElementAddListener = baseElement.addEventListener;
    let originalElementRemoveListener = baseElement.removeEventListener;
    let customEventRelay = null;

    const resolveEventTargetNode = (rawTarget) => {
        return rawTarget.nodeType === Node.TEXT_NODE ? rawTarget.parentNode : rawTarget;
    };

    const dispatchSimulatedClick = (targetNode, sourceEvent) => {
        if (document.activeElement && document.activeElement !== targetNode) {
            document.activeElement.blur();
        }

        const primaryTouch = sourceEvent.changedTouches[0];
        const clickSimulationEvent = document.createEvent('MouseEvents');
        clickSimulationEvent.initMouseEvent('click', true, true, window, 1,
            primaryTouch.screenX, primaryTouch.screenY, primaryTouch.clientX, primaryTouch.clientY,
            false, false, false, false, 0, null);
        clickSimulationEvent.forwardedTouchEvent = true;
        targetNode.dispatchEvent(clickSimulationEvent);
    };

    const applyFocusToElement = (targetNode) => {
        if (platformCapabilities.isIOS && targetNode.setSelectionRange) {
            const currentContentLength = targetNode.value.length;
            targetNode.setSelectionRange(currentContentLength, currentContentLength);
        } else {
            targetNode.focus();
        }
    };

    const findAssociatedFormControl = (labelNode) => {
        if (labelNode.control !== undefined) {
            return labelNode.control;
        }
        if (labelNode.htmlFor) {
            return document.getElementById(labelNode.htmlFor);
        }
        return labelNode.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };

    const locateScrollableParent = (startNode) => {
        let cachedScrollParent = startNode.accelScrollParent;

        const findRecursive = (currentNode) => {
            if (!currentNode || currentNode === baseElement.ownerDocument) return null;
            if (currentNode.scrollHeight > currentNode.offsetHeight) {
                return currentNode;
            }
            return findRecursive(currentNode.parentElement);
        };

        if (!cachedScrollParent || !cachedScrollParent.contains(startNode)) {
            cachedScrollParent = findRecursive(startNode);
            if (cachedScrollParent) {
                startNode.accelScrollParent = cachedScrollParent;
            }
        }

        if (cachedScrollParent) {
            cachedScrollParent.accelLastScrollTop = cachedScrollParent.scrollTop;
        }
    };

    const onTouchBegin = (event) => {
        const currentTarget = resolveEventTargetNode(event.target);
        const firstActiveTouch = event.targetTouches[0];

        if (platformCapabilities.isIOS) {
            const currentSelection = window.getSelection();
            if (currentSelection.rangeCount && !currentSelection.isCollapsed) {
                return true;
            }

            if (!platformCapabilities.isLegacyIOS) {
                if (firstActiveTouch.identifier === lastTouchIdentifierValue) {
                    event.preventDefault();
                    return false;
                }
                lastTouchIdentifierValue = firstActiveTouch.identifier;
                locateScrollableParent(currentTarget);
            }
        }

        gestureActive = true;
        gestureBeginTime = event.timeStamp;
        initialTouchOrigin = currentTarget;
        initialTouchCoordX = firstActiveTouch.pageX;
        initialTouchCoordY = firstActiveTouch.pageY;

        if ((event.timeStamp - lastClickTimestamp) < interactionTiming.DOUBLE_TAP_THRESHOLD_MS) {
            event.preventDefault();
        }
        return true;
    };

    const hasTouchMovedExcessively = (event) => {
        const currentTouch = event.changedTouches[0];
        return Math.abs(currentTouch.pageX - initialTouchCoordX) > interactionTiming.SIGNIFICANT_MOVE_PX ||
               Math.abs(currentTouch.pageY - initialTouchCoordY) > interactionTiming.SIGNIFICANT_MOVE_PX;
    };

    const onTouchComplete = (event) => {
        let finalTargetElement,
            gestureStartMoment = gestureBeginTime,
            targetNodeTag,
            elementScrollParent,
            touchPoint;

        if (hasTouchMovedExcessively(event)) {
            gestureActive = false;
            initialTouchOrigin = null;
        }

        if (!gestureActive) {
            return true;
        }

        if ((event.timeStamp - lastClickTimestamp) < interactionTiming.DOUBLE_TAP_THRESHOLD_MS) {
            blockNextClickEvent = true;
            return true;
        }

        lastClickTimestamp = event.timeStamp;
        gestureActive = false;
        gestureBeginTime = 0;

        finalTargetElement = initialTouchOrigin;

        if (platformCapabilities.isTargetRecalculatedIOS) {
            touchPoint = event.changedTouches[0];
            finalTargetElement = document.elementFromPoint(touchPoint.pageX - window.pageXOffset, touchPoint.pageY - window.pageYOffset);
        }

        targetNodeTag = finalTargetElement.tagName.toLowerCase();
        if (targetNodeTag === 'label') {
            const linkedControl = findAssociatedFormControl(finalTargetElement);
            if (linkedControl) {
                applyFocusToElement(finalTargetElement);
                if (platformCapabilities.isAndroid) {
                    return false;
                }
                finalTargetElement = linkedControl;
            }
        } else if (elementAnalysis.requiresProgrammaticFocus(finalTargetElement)) {
            if ((event.timeStamp - gestureStartMoment) > 100 || (platformCapabilities.isIOS && window.top !== window && targetNodeTag === 'input')) {
                return true;
            }
            applyFocusToElement(finalTargetElement);
            dispatchSimulatedClick(finalTargetElement, event);
            return false;
        }

        if (elementAnalysis.needsNativeInteraction(finalTargetElement, platformCapabilities)) {
            return true;
        }

        elementScrollParent = finalTargetElement.accelScrollParent;
        if (elementScrollParent && elementScrollParent.accelLastScrollTop !== elementScrollParent.scrollTop) {
            return true;
        }

        dispatchSimulatedClick(finalTargetElement, event);
        event.preventDefault();
        return false;
    };

    const onTouchCancelled = () => {
        gestureActive = false;
        initialTouchOrigin = null;
    };

    const onPointerActivity = (event) => {
        if (platformCapabilities.isAndroid && event.type.startsWith('mouse')) {
            event.preventDefault();
        }
    };

    const onSyntheticClickTrigger = (event) => {
        if (blockNextClickEvent) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.propagationStopped = true;
            blockNextClickEvent = false;
            return false;
        }
        return true;
    };

    if (typeof window.ontouchstart === 'undefined') {
        return {
            terminate: () => {}
        };
    }

    const activeListeners = [];
    const attachEventHandler = (element, eventName, handler, capturePhase) => {
        element.addEventListener(eventName, handler, capturePhase);
        activeListeners.push({ element, eventName, handler, capturePhase });
    };

    if (!Event.prototype.stopImmediatePropagation) {
        // Implement the polyfill for stopImmediatePropagation on this specific element
        const hijackedClickCallbacks = new WeakMap();

        baseElement.addEventListener = (eventName, callbackFunction, useCapture) => {
            if (eventName === 'click') {
                let hijacked = hijackedClickCallbacks.get(callbackFunction);
                if (!hijacked) {
                    hijacked = (ev) => {
                        if (!ev.propagationStopped) {
                            callbackFunction(ev);
                        }
                    };
                    hijackedClickCallbacks.set(callbackFunction, hijacked);
                }
                originalElementAddListener.call(baseElement, eventName, hijacked, useCapture);
            } else {
                originalElementAddListener.call(baseElement, eventName, callbackFunction, useCapture);
            }
        };

        baseElement.removeEventListener = (eventName, callbackFunction, useCapture) => {
            if (eventName === 'click') {
                const hijacked = hijackedClickCallbacks.get(callbackFunction);
                if (hijacked) {
                    originalElementRemoveListener.call(baseElement, eventName, hijacked, useCapture);
                    hijackedClickCallbacks.delete(callbackFunction);
                } else {
                    originalElementRemoveListener.call(baseElement, eventName, callbackFunction, useCapture);
                }
            } else {
                originalElementRemoveListener.call(baseElement, eventName, callbackFunction, useCapture);
            }
        };

        customEventRelay = {
            restore: () => {
                baseElement.addEventListener = originalElementAddListener;
                baseElement.removeEventListener = originalElementRemoveListener;
            }
        };
    }

    if (platformCapabilities.isAndroid) {
        attachEventHandler(baseElement, 'mouseover', onPointerActivity, true);
        attachEventHandler(baseElement, 'mousedown', onPointerActivity, true);
        attachEventHandler(baseElement, 'mouseup', onPointerActivity, true);
    }

    attachEventHandler(baseElement, 'click', onSyntheticClickTrigger, true);
    attachEventHandler(baseElement, 'touchstart', onTouchBegin, false);
    attachEventHandler(baseElement, 'touchend', onTouchComplete, false);
    attachEventHandler(baseElement, 'touchcancel', onTouchCancelled, false);

    if (typeof baseElement.onclick === 'function') {
        const existingClickHandler = baseElement.onclick;
        attachEventHandler(baseElement, 'click', (event) => {
            existingClickHandler(event);
        }, false);
        baseElement.onclick = null;
    }

    return {
        terminate: () => {
            activeListeners.forEach(({ element, eventName, handler, capturePhase }) => {
                element.removeEventListener(eventName, handler, capturePhase);
            });
            if (customEventRelay) {
                customEventRelay.restore();
            }
        }
    };
}