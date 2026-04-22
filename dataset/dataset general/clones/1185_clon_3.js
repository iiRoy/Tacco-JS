/**
 * @license MIT License (see LICENSE.txt)
 * @description A utility to eliminate 300ms click delays on touch-enabled browsers.
 * @version 1.0.0-alpha
 * @copyright 2024 Innovate Solutions Inc.
 */

/*
 * This module enhances touch interactions by providing a fast-tap mechanism,
 * bypassing the default browser delay on touch-based devices.
 */


/**
 * Initiates touch response management on the designated root element.
 *
 * @constructor
 * @param {Element} interactionRoot The DOM element to monitor for touch events.
 */
function InputResponseManager(interactionRoot) {
    'use strict';

    const instanceRef = this; // Capture 'this' for internal method binding.
    let priorClickHandler; // Stores any pre-existing onclick handler on the root.

    // --- Internal State Properties ---

    /**
     * Flags if a touch interaction sequence is currently being tracked.
     * @type {boolean}
     */
    this.isTouchInteractionActive = false;

    /**
     * Timestamp (ms) when the current touch interaction began.
     * @type {number}
     */
    this.interactionStartTime = 0;

    /**
     * The DOM element that was initially touched.
     * @type {EventTarget|null}
     */
    this.currentInteractionTarget = null;

    /**
     * X-coordinate of the touch start event.
     * @type {number}
     */
    this.initialTouchX = 0;

    /**
     * Y-coordinate of the touch start event.
     * @type {number}
     */
    this.initialTouchY = 0;

    /**
     * Unique identifier of the last processed touch point.
     * @type {number}
     */
    this.lastTrackedTouchId = 0;

    /**
     * The main DOM element this manager is observing.
     * @type {Element}
     */
    this.interactionLayer = interactionRoot;

    /**
     * Time of the last synthetic click dispatched. Used to prevent double-taps.
     * @type {number}
     */
    this.lastSyntheticClickTime = 0;

    // --- Configuration Constants ---
    const TAP_TIMEOUT_MS = 200; // Threshold for fast double-tap prevention.
    const TOUCH_MOVE_THRESHOLD = 10; // Pixels a touch can move before being considered a scroll/drag.
    const FOCUS_DELAY_THRESHOLD = 100; // ms before a focus is considered 'natural' on iOS.


    // --- Input Validation ---
    if (!(interactionRoot instanceof Element)) {
        throw new TypeError('The provided interaction root must be a valid DOM Element.');
    }

    // --- Bound Event Handlers ---
    // These ensure 'this' context refers to the InputResponseManager instance.
    this.handleSyntheticClick = () => InputResponseManager.prototype.handleSyntheticClick.apply(instanceRef, arguments);
    this.processMouseEvent = () => InputResponseManager.prototype.processMouseEvent.apply(instanceRef, arguments);
    this.handleTouchBegin = () => InputResponseManager.prototype.handleTouchBegin.apply(instanceRef, arguments);
    this.handleTouchEnd = () => InputResponseManager.prototype.handleTouchEnd.apply(instanceRef, arguments);
    this.handleTouchAbort = () => InputResponseManager.prototype.handleTouchAbort.apply(instanceRef, arguments);


    // --- Device Capability Checks ---
    // Skip setup if touch events are not supported by the browser.
    if (typeof window.ontouchstart === 'undefined') {
        return; // No need for touch optimization on non-touch devices.
    }

    // --- Event Listener Setup ---
    if (this.isAndroidDevice) {
        // Android often needs mouse events managed to prevent phantom clicks.
        interactionRoot.addEventListener('mouseover', this.processMouseEvent, true);
        interactionRoot.addEventListener('mousedown', this.processMouseEvent, true);
        interactionRoot.addEventListener('mouseup', this.processMouseEvent, true);
    }

    interactionRoot.addEventListener('click', this.handleSyntheticClick, true); // Capture phase to intervene early.
    interactionRoot.addEventListener('touchstart', this.handleTouchBegin, false);
    interactionRoot.addEventListener('touchend', this.handleTouchEnd, false);
    interactionRoot.addEventListener('touchcancel', this.handleTouchAbort, false);

    // --- Polyfill for `stopImmediatePropagation` on older browsers (e.g., Android 2) ---
    // This ensures our synthetic click can prevent other click handlers from firing.
    if (!Event.prototype.stopImmediatePropagation) {
        const originalAdd = Element.prototype.addEventListener;
        const originalRemove = Element.prototype.removeEventListener;

        // Override addEventListener for 'click' events.
        Element.prototype.addEventListener = function(type, handler, options) {
            if (type === 'click') {
                // Wrap the original handler to check for propagationStopped flag.
                const wrappedHandler = handler.hijacked || (handler.hijacked = function(evt) {
                    if (!evt.propagationStopped) {
                        handler(evt);
                    }
                });
                originalAdd.call(this, type, wrappedHandler, options);
            } else {
                originalAdd.call(this, type, handler, options);
            }
        };

        // Override removeEventListener for 'click' events.
        Element.prototype.removeEventListener = function(type, handler, options) {
            if (type === 'click') {
                originalRemove.call(this, type, handler.hijacked || handler, options);
            } else {
                originalRemove.call(this, type, handler, options);
            }
        };
    }

    // --- Handle existing `onclick` attribute ---
    // If an `onclick` attribute is present, it would fire before our captured `handleSyntheticClick`.
    // We move it to an event listener to ensure consistent event order.
    if (typeof interactionRoot.onclick === 'function') {
        priorClickHandler = interactionRoot.onclick;
        interactionRoot.addEventListener('click', (evt) => {
            if (priorClickHandler) {
                priorClickHandler(evt);
            }
        }, false);
        interactionRoot.onclick = null; // Clear the attribute to prevent double firing.
    }
}

// --- Device Feature Detection ---

/**
 * Checks if the current device is running Android.
 * @type {boolean}
 */
InputResponseManager.prototype.isAndroidDevice = /Android/i.test(navigator.userAgent);

/**
 * Checks if the current device is running iOS.
 * @type {boolean}
 */
InputResponseManager.prototype.isIOSDevice = /iP(ad|hone|od)/i.test(navigator.userAgent);

/**
 * Checks for a specific legacy iOS version (e.g., iOS 4) with known touch issues.
 * @type {boolean}
 */
InputResponseManager.prototype.isLegacyIOS = InputResponseManager.prototype.isIOSDevice && (/OS 4_\d(_\d)?/i).test(navigator.userAgent);

/**
 * Checks for iOS versions with a known bug where `event.target` can be incorrect during scrolls/transitions.
 * @type {boolean}
 */
InputResponseManager.prototype.isIOSWithTargetBug = InputResponseManager.prototype.isIOSDevice && (/OS ([6-9]|\d{2})_\d/i).test(navigator.userAgent);


// --- Utility Methods ---

/**
 * Helper to get the lowercase tag name of an element.
 * @param {Element} element The element to check.
 * @returns {string} The lowercase tag name.
 */
function getElementTagName(element) {
    return element.tagName ? element.tagName.toLowerCase() : '';
}

/**
 * Determines if a given element inherently requires a native click event (not a synthetic one).
 * This is often due to browser-specific behaviors or input types.
 *
 * @param {EventTarget|Element} targetNode The target DOM element.
 * @returns {boolean} True if the element needs a native click.
 */
InputResponseManager.prototype.shouldTriggerNativeClick = function(targetNode) {
    'use strict';
    const nodeTag = getElementTagName(targetNode);

    switch (nodeTag) {
        case 'button':
        case 'input':
            // iOS devices have issues with file input types and synthetic clicks.
            if (this.isIOSDevice && targetNode.type === 'file') {
                return true;
            }
            // Disabled inputs shouldn't receive synthetic clicks.
            return targetNode.disabled;
        case 'label':
        case 'video':
            return true; // These elements generally benefit from native click behavior.
        default:
            // Check for a custom CSS class indicating native click requirement.
            return (/\bneedsclick\b/).test(targetNode.className);
    }
};

/**
 * Determines if an element requires programmatic focus to simulate a native click behavior (e.g., for text inputs).
 *
 * @param {EventTarget|Element} targetNode The target DOM element.
 * @returns {boolean} True if the element needs `focus()` called.
 */
InputResponseManager.prototype.requiresInputFocus = function(targetNode) {
    'use strict';
    const nodeTag = getElementTagName(targetNode);

    switch (nodeTag) {
        case 'textarea':
        case 'select':
            return true;
        case 'input':
            switch (targetNode.type) {
                case 'button':
                case 'checkbox':
                case 'file':
                case 'image':
                case 'radio':
                case 'submit':
                    return false; // These input types don't need explicit focus.
                default:
                    // Text-like inputs need focus, unless disabled.
                    return !targetNode.disabled;
            }
        default:
            // Check for a custom CSS class indicating focus requirement.
            return (/\bneedsfocus\b/).test(targetNode.className);
    }
};

/**
 * Dispatches a synthetic click event to the specified element.
 * This simulates a native click but includes a flag to identify it as synthetic.
 *
 * @param {EventTarget|Element} targetNode The element to receive the click.
 * @param {Event} originalEvent The original touch event that triggered this.
 */
InputResponseManager.prototype.dispatchSyntheticClick = function(targetNode, originalEvent) {
    'use strict';
    let syntheticClickEvent;
    const currentTouchPoint = originalEvent.changedTouches[0];

    // On some Androids, an active element needs to be blurred for the synthetic click to register.
    if (document.activeElement && document.activeElement !== targetNode) {
        document.activeElement.blur();
    }

    // Create a MouseEvent for a click.
    syntheticClickEvent = document.createEvent('MouseEvents');
    syntheticClickEvent.initMouseEvent(
        'click', true, true, window, 1,
        currentTouchPoint.screenX, currentTouchPoint.screenY,
        currentTouchPoint.clientX, currentTouchPoint.clientY,
        false, false, false, false, 0, null
    );

    // Mark this as a synthetic event for internal tracking/prevention.
    syntheticClickEvent.forwardedTouchEvent = true;
    targetNode.dispatchEvent(syntheticClickEvent);
};

/**
 * Programmatically applies focus to an element. Handles iOS-specific selection range.
 *
 * @param {EventTarget|Element} targetNode The element to focus.
 */
InputResponseManager.prototype.applyFocus = function(targetNode) {
    'use strict';
    if (this.isIOSDevice && targetNode.setSelectionRange) {
        // For iOS, setting selection range can prevent the keyboard from auto-closing.
        const contentLen = targetNode.value ? targetNode.value.length : 0;
        targetNode.setSelectionRange(contentLen, contentLen);
    } else {
        targetNode.focus();
    }
};

/**
 * Examines if the target element is within a scrollable container. If so, stores the container
 * and its scroll position to detect subsequent scrolls.
 *
 * @param {EventTarget|Element} targetNode The element to check.
 */
InputResponseManager.prototype.updateScrollBoundary = function(targetNode) {
    'use strict';
    let activeScrollParent = targetNode.fastClickScrollParent;
    let ancestorNode = targetNode;

    // Re-evaluate scroll parent if it's not set or if the target has moved.
    if (!activeScrollParent || !activeScrollParent.contains(targetNode)) {
        activeScrollParent = null; // Reset
        do {
            if (ancestorNode.scrollHeight > ancestorNode.offsetHeight) {
                // Found a scrollable parent.
                activeScrollParent = ancestorNode;
                targetNode.fastClickScrollParent = ancestorNode; // Cache on target for quick lookup.
                break;
            }
            ancestorNode = ancestorNode.parentElement;
        } while (ancestorNode);
    }

    // If a scrollable parent was found, record its current scroll position.
    if (activeScrollParent) {
        activeScrollParent.fastClickLastScrollTop = activeScrollParent.scrollTop;
    }
};

/**
 * Extracts the actual target element from an event's target.
 * Handles cases where event.target might be a text node.
 *
 * @param {EventTarget} eventTarget The raw event target.
 * @returns {Element|EventTarget} The effective DOM element.
 */
InputResponseManager.prototype.extractInteractionTarget = function(eventTarget) {
    'use strict';
    // If the target is a text node, return its parent element.
    if (eventTarget.nodeType === Node.TEXT_NODE) {
        return eventTarget.parentNode;
    }
    return eventTarget;
};

/**
 * Attempts to find the control element associated with a given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelNode The label element.
 * @returns {Element|null} The associated control element, or null if not found.
 */
InputResponseManager.prototype.locateAssociatedControl = function(labelNode) {
    'use strict';
    // HTML5 `control` property is the most direct way.
    if (labelNode.control !== undefined) {
        return labelNode.control;
    }

    // Fallback to `htmlFor` attribute.
    if (labelNode.htmlFor) {
        return document.getElementById(labelNode.htmlFor);
    }

    // Last resort: query for common form elements within the label.
    return labelNode.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


// --- Event Handlers ---

/**
 * Handles the 'touchstart' event. Records initial touch position and state.
 *
 * @param {Event} evt The touchstart event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
InputResponseManager.prototype.handleTouchBegin = function(evt) {
    'use strict';
    let effectiveTarget, currentTouchPoint, currentSelection;

    // Prevent propagation if this is a double-tap within the threshold.
    if ((evt.timeStamp - this.lastSyntheticClickTime) < TAP_TIMEOUT_MS) {
        evt.preventDefault();
        return false;
    }

    effectiveTarget = this.extractInteractionTarget(evt.target);
    currentTouchPoint = evt.targetTouches[0];

    if (this.isIOSDevice) {
        // iOS: If text is selected, allow default behavior to deselect it.
        currentSelection = window.getSelection();
        if (currentSelection.rangeCount && !currentSelection.isCollapsed) {
            return true;
        }

        if (!this.isLegacyIOS) {
            // iOS specific: Prevent issues with alerts/confirms causing duplicate touch IDs.
            if (currentTouchPoint.identifier === this.lastTrackedTouchId) {
                if (evt.cancelable) {
                    evt.preventDefault();
                }
                return false;
            }
            this.lastTrackedTouchId = currentTouchPoint.identifier;

            // Update scroll parent to detect scrolling during touch.
            this.updateScrollBoundary(effectiveTarget);
        }
    }

    // Store interaction state.
    this.isTouchInteractionActive = true;
    this.interactionStartTime = evt.timeStamp;
    this.currentInteractionTarget = effectiveTarget;
    this.initialTouchX = currentTouchPoint.pageX;
    this.initialTouchY = currentTouchPoint.pageY;

    return true; // Allow default touchstart behavior.
};

/**
 * Determines if the touch has moved beyond a small threshold, indicating a scroll or drag, not a tap.
 *
 * @param {Event} evt The touchmove or touchend event.
 * @returns {boolean} True if the touch has moved significantly.
 */
InputResponseManager.prototype.hasTouchDisplaced = function(evt) {
    'use strict';
    const currentTouchPoint = evt.changedTouches[0];
    return (Math.abs(currentTouchPoint.pageX - this.initialTouchX) > TOUCH_MOVE_THRESHOLD ||
            Math.abs(currentTouchPoint.pageY - this.initialTouchY) > TOUCH_MOVE_THRESHOLD);
};

/**
 * Handles the 'touchend' event. Decides whether to dispatch a synthetic click.
 *
 * @param {Event} evt The touchend event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
InputResponseManager.prototype.handleTouchEnd = function(evt) {
    'use strict';
    let associatedControl, targetNodeTag, activeScrollParent,
        finalTargetElement = this.currentInteractionTarget;

    // If touch moved significantly, it's not a tap.
    if (this.hasTouchDisplaced(evt)) {
        this.isTouchInteractionActive = false;
        this.currentInteractionTarget = null;
        return true;
    }

    // If no active touch interaction, or if it's too quick for a valid tap.
    if (!this.isTouchInteractionActive || (evt.timeStamp - this.interactionStartTime) < 10) {
        this.isTouchInteractionActive = false;
        this.currentInteractionTarget = null;
        return true;
    }

    // Prevent phantom clicks on fast double-tap sequences.
    if ((evt.timeStamp - this.lastSyntheticClickTime) < TAP_TIMEOUT_MS) {
        if (evt.cancelable) {
            evt.preventDefault();
            evt.stopPropagation(); // Stop further propagation of this "phantom" click.
        }
        return false;
    }

    this.lastSyntheticClickTime = evt.timeStamp; // Record time of this potential click.

    // Reset interaction state.
    this.isTouchInteractionActive = false;
    this.interactionStartTime = 0;

    // On iOS with target bug, re-determine the target element accurately.
    if (this.isIOSWithTargetBug) {
        const currentTouchPoint = evt.changedTouches[0];
        finalTargetElement = document.elementFromPoint(
            currentTouchPoint.pageX - window.pageXOffset,
            currentTouchPoint.pageY - window.pageYOffset
        );
    }

    // Check if the target element is a label.
    targetNodeTag = getElementTagName(finalTargetElement);
    if (targetNodeTag === 'label') {
        associatedControl = this.locateAssociatedControl(finalTargetElement);
        if (associatedControl) {
            this.applyFocus(finalTargetElement); // Focus the label itself.
            if (this.isAndroidDevice) {
                if (evt.cancelable) {
                    evt.preventDefault(); // Android often needs this for labels.
                }
            }
            finalTargetElement = associatedControl; // Now the click should go to the control.
        }
    } else if (this.requiresInputFocus(finalTargetElement)) {
        // If the element needs focus (e.g., text input).
        // Case 1: If touch started long ago, focus might already be handled naturally.
        if ((evt.timeStamp - this.interactionStartTime) > FOCUS_DELAY_THRESHOLD) {
            return true; // Allow default click to handle focus.
        }
        // Case 2: Special handling for iOS iframes for input elements.
        if (this.isIOSDevice && window.top !== window && targetNodeTag === 'input') {
            return true; // Allow native behavior.
        }

        this.applyFocus(finalTargetElement);
        this.dispatchSyntheticClick(finalTargetElement, evt);
        if (evt.cancelable) {
            evt.preventDefault();
        }
        return false; // Handled, prevent native click.
    }

    // If the element requires a native click (e.g., file input on iOS).
    if (this.shouldTriggerNativeClick(finalTargetElement)) {
        return true; // Allow the browser's native click.
    }

    // If a scrollable parent was scrolled since touchstart, it's not a tap on the element.
    activeScrollParent = finalTargetElement.fastClickScrollParent;
    if (activeScrollParent && activeScrollParent.fastClickLastScrollTop !== activeScrollParent.scrollTop) {
        return true; // Allow default behavior (scroll).
    }

    // If none of the above conditions met, dispatch a synthetic click.
    this.dispatchSyntheticClick(finalTargetElement, evt);
    if (evt.cancelable) {
        evt.preventDefault(); // Prevent the browser's 300ms delayed click.
    }
    return false; // Handled, prevent native click.
};

/**
 * Handles 'touchcancel' event. Resets tracking state.
 *
 * @param {Event} evt The touchcancel event.
 */
InputResponseManager.prototype.handleTouchAbort = function(evt) {
    'use strict';
    this.isTouchInteractionActive = false;
    this.currentInteractionTarget = null;
    this.interactionStartTime = 0;
    // No `preventDefault` here; touchcancel indicates the interaction was interrupted by the system.
};

/**
 * Handles the 'click' event. This is captured to prevent unwanted native clicks.
 *
 * @param {Event} evt The click event.
 * @returns {boolean} True to allow, false to prevent.
 */
InputResponseManager.prototype.handleSyntheticClick = function(evt) {
    'use strict';
    // If this click was generated synthetically by us, allow it.
    if (evt.forwardedTouchEvent) {
        return true;
    }

    // If this is a native click that occurred very shortly after a synthetic one, prevent it.
    // This handles the "phantom click" problem.
    if (!this.isTouchInteractionActive && (evt.timeStamp - this.lastSyntheticClickTime) < TAP_TIMEOUT_MS) {
        if (evt.cancelable) {
            evt.stopPropagation(); // Stop further bubbling.
            evt.preventDefault();  // Prevent default action of this native click.
        }
        return false;
    }

    return true; // Allow other clicks to pass through.
};

/**
 * Handles mouse events on Android devices.
 *
 * @param {Event} evt The mouse event.
 */
InputResponseManager.prototype.processMouseEvent = function(evt) {
    'use strict';
    // On Android, if a touch interaction is active, suppress mouse events.
    if (this.isTouchInteractionActive) {
        if (evt.cancelable) {
            evt.preventDefault();
        }
    }
};

/**
 * Public method to destroy the InputResponseManager instance and clean up event listeners.
 */
InputResponseManager.prototype.destroy = function() {
    'use strict';
    const interactionRoot = this.interactionLayer;

    if (this.isAndroidDevice) {
        interactionRoot.removeEventListener('mouseover', this.processMouseEvent, true);
        interactionRoot.removeEventListener('mousedown', this.processMouseEvent, true);
        interactionRoot.removeEventListener('mouseup', this.processMouseEvent, true);
    }

    interactionRoot.removeEventListener('click', this.handleSyntheticClick, true);
    interactionRoot.removeEventListener('touchstart', this.handleTouchBegin, false);
    interactionRoot.removeEventListener('touchend', this.handleTouchEnd, false);
    interactionRoot.removeEventListener('touchcancel', this.handleTouchAbort, false);

    // Reset overridden event listeners if they were modified.
    if (!Event.prototype.stopImmediatePropagation) {
        // Note: Reverting global prototypes can be tricky if multiple instances exist or other libraries modify them.
        // For simplicity, assuming this is the only modifier or careful usage is implied.
        // A more robust solution might involve storing original functions per element or using a WeakMap.
        Element.prototype.addEventListener = Event.prototype.originalAddEventListener;
        Element.prototype.removeEventListener = Event.prototype.originalRemoveEventListener;
        delete Event.prototype.originalAddEventListener;
        delete Event.prototype.originalRemoveEventListener;
    }

    // Clear instance properties.
    this.interactionLayer = null;
    this.isTouchInteractionActive = false;
    this.currentInteractionTarget = null;
    this.interactionStartTime = 0;
    this.initialTouchX = 0;
    this.initialTouchY = 0;
    this.lastTrackedTouchId = 0;
    this.lastSyntheticClickTime = 0;
};