/*
 * @copyright  The Financial Times Limited [All Rights Reserved]
 * @license    MIT License (see LICENSE.txt)
 * @preserve   QuickTap: a polyfill to eliminate click latency on touch-enabled browsers.
 * @version    0.6.1
 * @codingstandard ftlabs-jsv2
 */

/* jslint browser:true, node:true */
/* global define, Event, Node */

/**
 * Creates instances of fast-tapping event listeners on a given DOM element.
 *
 * @constructor
 * @param {Element} surface The DOM element to attach listeners to.
 */
function QuickTap(surface) {
    'use strict';
    var prevTapHandler, instance = this;

    /**
     * Indicates if a touch-based tap interaction is currently in progress.
     *
     * @type boolean
     */
    this.isTapActive = false;

    /**
     * The timestamp marking the beginning of the current tap tracking session.
     *
     * @type number
     */
    this.tapStartTime = 0;

    /**
     * The specific element being monitored for a tap action.
     *
     * @type EventTarget
     */
    this.focusedElement = null;

    /**
     * The X-coordinate recorded at the start of a touch event.
     *
     * @type number
     */
    this.initialTouchX = 0;

    /**
     * The Y-coordinate recorded at the start of a touch event.
     *
     * @type number
     */
    this.initialTouchY = 0;

    /**
     * The unique identifier of the most recent touch, sourced from Touch.identifier.
     *
     * @type number
     */
    this.lastFingerId = 0;

    /**
     * The designated DOM element for this QuickTap instance.
     *
     * @type Element
     */
    this.surface = surface;

    if (!surface || !surface.nodeType) {
        throw new TypeError('The provided surface must be a valid document node.');
    }

    /** @type function() */
    this.onElementTap = function() { return QuickTap.prototype.onElementTap.apply(instance, arguments); };

    /** @type function() */
    this.onPointerEvent = function() { return QuickTap.prototype.onPointerEvent.apply(instance, arguments); };

    /** @type function() */
    this.onFingerDown = function() { return QuickTap.prototype.onFingerDown.apply(instance, arguments); };

    /** @type function() */
    this.onFingerUp = function() { return QuickTap.prototype.onFingerUp.apply(instance, arguments); };

    /** @type function() */
    this.onFingerCancel = function() { return QuickTap.prototype.onFingerCancel.apply(instance, arguments); };

    // If the browser does not support touch events, QuickTap is not necessary.
    if (typeof window.ontouchstart === 'undefined') {
        return;
    }

    // Configure and set up event handlers as required by the platform.
    if (this.isAndroidDevice) {
        surface.addEventListener('mouseover', this.onPointerEvent, true);
        surface.addEventListener('mousedown', this.onPointerEvent, true);
        surface.addEventListener('mouseup', this.onPointerEvent, true);
    }

    surface.addEventListener('click', this.onElementTap, true);
    surface.addEventListener('touchstart', this.onFingerDown, false);
    surface.addEventListener('touchend', this.onFingerUp, false);
    surface.addEventListener('touchcancel', this.onFingerCancel, false);

    // This workaround addresses browsers (e.g., Android 2) that lack support for Event#stopImmediatePropagation,
    // which QuickTap normally uses to prevent click events from bubbling up to other registered callbacks.
    if (!Event.prototype.stopImmediatePropagation) {
        surface.removeEventListener = function(evtType, cbFunction, useCapture) {
            var originalRemove = Node.prototype.removeEventListener;
            if (evtType === 'click') {
                originalRemove.call(surface, evtType, cbFunction.hijacked || cbFunction, useCapture);
            } else {
                originalRemove.call(surface, evtType, cbFunction, useCapture);
            }
        };

        surface.addEventListener = function(evtType, cbFunction, useCapture) {
            var originalAdd = Node.prototype.addEventListener;
            if (evtType === 'click') {
                originalAdd.call(surface, evtType, cbFunction.hijacked || (cbFunction.hijacked = function(evt) {
                    if (!evt.propagationStopped) {
                        cbFunction(evt);
                    }
                }), useCapture);
            } else {
                originalAdd.call(surface, evtType, cbFunction, useCapture);
            }
        };
    }

    // If an 'onclick' handler is already defined on the element, it would fire before QuickTap's handler.
    // To correct this, we extract the user-defined handler and re-attach it as a standard event listener.
    if (typeof surface.onclick === 'function') {

        // For Android browsers (at least 3.2), passing the direct reference from layer.onclick to addEventListener
        // does not work. A new function reference is required.
        prevTapHandler = surface.onclick;
        surface.addEventListener('click', function(evt) {
            prevTapHandler(evt);
        }, false);
        surface.onclick = null;
    }
}


/**
 * Identifies if the current device is Android, requiring specific handling.
 *
 * @type boolean
 */
QuickTap.prototype.isAndroidDevice = navigator.userAgent.indexOf('Android') > 0;


/**
 * Identifies if the current device is iOS, requiring specific handling.
 *
 * @type boolean
 */
QuickTap.prototype.isIOSDevice = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * Identifies if the current device is iOS version 4, requiring specific exceptions.
 *
 * @type boolean
 */
QuickTap.prototype.isIOS4Version = QuickTap.prototype.isIOSDevice && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * Identifies if the current device is iOS 6.0 or later, where target element detection
 * may need manual adjustment.
 *
 * @type boolean
 */
QuickTap.prototype.isIOSWithBadTargetDetection = QuickTap.prototype.isIOSDevice && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determines whether a given DOM element requires a native click event.
 *
 * @param {EventTarget|Element} elementToCheck The target DOM element.
 * @returns {boolean} True if the element necessitates a native click behavior.
 */
QuickTap.prototype.requiresSimulatedClick = function(elementToCheck) {
    'use strict';
    switch (elementToCheck.nodeName.toLowerCase()) {
        case 'button':
        case 'input':
            // On iOS 6, file inputs require actual clicks due to a known browser defect (issue #68).
            if (this.isIOSDevice && elementToCheck.type === 'file') {
                return true;
            }

            // Disabled input fields should not receive synthetic clicks (issue #62).
            return elementToCheck.disabled;
        case 'label':
        case 'video':
            return true;
        default:
            return (/\bneedsclick\b/).test(elementToCheck.className);
    }
};


/**
 * Determines if an element requires a direct focus call to simulate a native click.
 *
 * @param {EventTarget|Element} elementToCheck The target DOM element.
 * @returns {boolean} True if the element needs a `focus()` call to mimic a native click.
 */
QuickTap.prototype.requiresFocusCall = function(elementToCheck) {
    'use strict';
    switch (elementToCheck.nodeName.toLowerCase()) {
        case 'textarea':
        case 'select':
            return true;
        case 'input':
            switch (elementToCheck.type) {
                case 'button':
                case 'checkbox':
                case 'file':
                case 'image':
                case 'radio':
                case 'submit':
                    return false;
            }

            // There's no benefit in trying to focus a disabled input field.
            return !elementToCheck.disabled;
        default:
            return (/\bneedsfocus\b/).test(elementToCheck.className);
    }
};


/**
 * Dispatches a synthetic click event to the specified element.
 *
 * @param {EventTarget|Element} focusedElement The element to send the click to.
 * @param {Event} evt The original touch event.
 */
QuickTap.prototype.dispatchSyntheticClick = function(focusedElement, evt) {
    'use strict';
    var syntheticClickEvt, finger;

    // On some Android devices, the currently active element must be blurred first; otherwise,
    // the synthetic click will have no effect (#24).
    if (document.activeElement && document.activeElement !== focusedElement) {
        document.activeElement.blur();
    }

    finger = evt.changedTouches[0];

    // Create a synthesized click event, including an additional attribute for tracking.
    syntheticClickEvt = document.createEvent('MouseEvents');
    syntheticClickEvt.initMouseEvent('click', true, true, window, 1, finger.screenX, finger.screenY, finger.clientX, finger.clientY, false, false, false, false, 0, null);
    syntheticClickEvt.forwardedTouchEvent = true;
    focusedElement.dispatchEvent(syntheticClickEvt);
};


/**
 * Sets focus on the provided target element.
 *
 * @param {EventTarget|Element} focusedElement The element to focus.
 */
QuickTap.prototype.setElementFocus = function(focusedElement) {
    'use strict';
    var contentLength;

    if (this.isIOSDevice && focusedElement.setSelectionRange) {
        contentLength = focusedElement.value.length;
        focusedElement.setSelectionRange(contentLength, contentLength);
    } else {
        focusedElement.focus();
    }
};


/**
 * Examines if the target element is within a scrollable layer and, if so, marks it.
 *
 * @param {EventTarget|Element} focusedElement The element to check.
 */
QuickTap.prototype.refreshScrollContainer = function(focusedElement) {
    'use strict';
    var currentScrollContainer, ancestorElement;

    currentScrollContainer = focusedElement.quickTapScrollContainer;

    // Determine if the focused element is inside a scrollable area. Re-evaluate if the element
    // has been moved to a different parent.
    if (!currentScrollContainer || !currentScrollContainer.contains(focusedElement)) {
        ancestorElement = focusedElement;
        do {
            if (ancestorElement.scrollHeight > ancestorElement.offsetHeight) {
                currentScrollContainer = ancestorElement;
                focusedElement.quickTapScrollContainer = ancestorElement;
                break;
            }

            ancestorElement = ancestorElement.parentElement;
        } while (ancestorElement);
    }

    // Always update the last known scroll position if a container is found.
    if (currentScrollContainer) {
        currentScrollContainer.quickTapLastScrollPosition = currentScrollContainer.scrollTop;
    }
};


/**
 * Retrieves the actual target element from the event's target property.
 *
 * @param {EventTarget} eventOrigin The original event target.
 * @returns {Element|EventTarget} The resolved DOM element.
 */
QuickTap.prototype.resolveTargetFromEvent = function(eventOrigin) {
    'use strict';

    // In some older browsers (e.g., Safari on iOS 4.1, see issue #56), the event target
    // might be a text node. In such cases, we return its parent node.
    if (eventOrigin.nodeType === Node.TEXT_NODE) {
        return eventOrigin.parentNode;
    }

    return eventOrigin;
};


/**
 * Processes the 'touchstart' event, recording position and scroll offset.
 *
 * @param {Event} evt The touch start event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
QuickTap.prototype.onFingerDown = function(evt) {
    'use strict';
    var focusedElement, finger, textSelection;

    focusedElement = this.resolveTargetFromEvent(evt.target);
    finger = evt.targetTouches[0];

    if (this.isIOSDevice) {
        // On iOS, only trusted events can deselect text (issue #49).
        textSelection = window.getSelection();
        if (textSelection.rangeCount && !textSelection.isCollapsed) {
            return true;
        }

        if (!this.isIOS4Version) {
            // Unintended behavior can occur on iOS if an alert or confirm dialog is triggered
            // from a click event callback (issue #23). Subsequent taps might dispatch new
            // touchstart/touchend events with the same identifier as the original touch.
            // This fix isn't applicable to iOS 4 due to a bug where normal touch events can
            // share identifiers with preceding ones (issue #52).
            if (finger.identifier === this.lastFingerId) {
                evt.preventDefault();
                return false;
            }

            this.lastFingerId = finger.identifier;

            // If the element is within a scrollable layer (using -webkit-overflow-scrolling: touch)
            // and the user performs a fling scroll then stops it with another tap, the 'touchend'
            // event's target will be the element under the finger when the scroll started.
            // QuickTap needs to check if a parent layer scrolled before dispatching a synthetic
            // click to prevent misfires (issue #42).
            this.refreshScrollContainer(focusedElement);
        }
    }

    this.isTapActive = true;
    this.tapStartTime = evt.timeStamp;
    this.focusedElement = focusedElement;

    this.initialTouchX = finger.pageX;
    this.initialTouchY = finger.pageY;

    // Prevents phantom clicks during rapid double-taps (issue #36).
    if ((evt.timeStamp - this.previousClickTimestamp) < 200) {
        evt.preventDefault();
    }

    return true;
};


/**
 * Based on a 'touchmove' event, checks if the touch has moved beyond a defined boundary
 * since its start.
 *
 * @param {Event} evt The touch move event.
 * @returns {boolean} True if the finger has moved significantly.
 */
QuickTap.prototype.fingerMovedSignificantly = function(evt) {
    'use strict';
    var finger = evt.changedTouches[0];

    if (Math.abs(finger.pageX - this.initialTouchX) > 10 || Math.abs(finger.pageY - this.initialTouchY) > 10) {
        return true;
    }

    return false;
};


/**
 * Attempts to locate the associated control element for a given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelNode The label DOM element.
 * @returns {Element|null} The associated control element, or null if none found.
 */
QuickTap.prototype.locateAssociatedControl = function(labelNode) {
    'use strict';

    // Optimized path for modern browsers supporting the HTML5 `control` attribute.
    if (labelNode.control !== undefined) {
        return labelNode.control;
    }

    // All tested touch-enabled browsers support the HTML5 `htmlFor` attribute.
    if (labelNode.htmlFor) {
        return document.getElementById(labelNode.htmlFor);
    }

    // If no 'for' attribute is present, try to find the first labellable descendant element,
    // as defined by HTML5 spec: http://www.w3.org/TR/html5/forms.html#category-label
    return labelNode.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * Handles the 'touchend' event, deciding whether to dispatch a click event immediately.
 *
 * @param {Event} evt The touch end event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
QuickTap.prototype.onFingerUp = function(evt) {
    'use strict';
    var controlledElement, tapStartMoment, elementTagName, currentScrollContainer, finger, focusedElement = this.focusedElement;

    // If the touch has moved significantly, cancel the tap tracking.
    if (this.fingerMovedSignificantly(evt)) {
        this.isTapActive = false;
        this.focusedElement = null;
    }

    if (!this.isTapActive) {
        return true;
    }

    // Prevents phantom clicks during rapid double-taps (issue #36).
    if ((evt.timeStamp - this.previousClickTimestamp) < 200) {
        this.preventNextTap = true;
        return true;
    }

    this.previousClickTimestamp = evt.timeStamp;

    tapStartMoment = this.tapStartTime;
    this.isTapActive = false;
    this.tapStartTime = 0;

    // On some iOS devices, if the layer is transitioning or scrolling, the event's targetElement
    // can be invalid. It must be re-detected manually *after* the initial target check.
    // See issue #57; also reported as rdar://13048589.
    if (this.isIOSWithBadTargetDetection) {
        finger = evt.changedTouches[0];
        focusedElement = document.elementFromPoint(finger.pageX - window.pageXOffset, finger.pageY - window.pageYOffset);
    }

    elementTagName = focusedElement.tagName.toLowerCase();
    if (elementTagName === 'label') {
        controlledElement = this.locateAssociatedControl(focusedElement);
        if (controlledElement) {
            this.setElementFocus(focusedElement);
            if (this.isAndroidDevice) {
                return false;
            }

            focusedElement = controlledElement;
        }
    } else if (this.requiresFocusCall(focusedElement)) {
        // Scenario 1: If the touch began some time ago (estimated ~100ms based on issue #36 tests),
        // focus will already be triggered. We return early and clear the target element reference
        // to allow the subsequent natural click to pass through.
        // Scenario 2: For input elements tapped within an iframe on iOS, without this exception,
        // inputted text would not be visible even if the value attribute updates (issue #37).
        if ((evt.timeStamp - tapStartMoment) > 100 || (this.isIOSDevice && window.top !== window && elementTagName === 'input')) {
            this.focusedElement = null;
            return false;
        }

        this.setElementFocus(focusedElement);
        this.dispatchSyntheticClick(focusedElement, evt);
        return false;
    }

    // Re-check if the parent scroll container has scrolled in the meantime.
    // If it has, then the user was likely scrolling, and a click should be prevented.
    if (focusedElement.quickTapScrollContainer && focusedElement.quickTapScrollContainer.quickTapLastScrollPosition !== focusedElement.quickTapScrollContainer.scrollTop) {
        return true;
    }

    // If a synthetic click is needed, dispatch it.
    if (!this.requiresSimulatedClick(focusedElement)) {
        evt.preventDefault();
        this.dispatchSyntheticClick(focusedElement, evt);
    }

    return true;
};


/**
 * Handles the 'touchcancel' event, which usually indicates an interrupted touch sequence.
 *
 * @returns {boolean} Always returns true to allow default behavior.
 */
QuickTap.prototype.onFingerCancel = function() {
    'use strict';
    this.isTapActive = false;
    this.focusedElement = null;

    return true;
};


/**
 * Handles 'click' events. This is primarily used to prevent duplicate native click events
 * that might occur after a synthetic click has been dispatched.
 *
 * @param {Event} evt The click event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
QuickTap.prototype.onElementTap = function(evt) {
    'use strict';

    // If `preventNextTap` is true, this click event is a duplicate following a synthetic one.
    // Prevent it and reset the flag.
    if (this.preventNextTap) {
        evt.preventDefault();
        evt.stopPropagation();
        this.preventNextTap = false;
        return false;
    }

    // Don't interfere with clicks that weren't initiated by a touch (e.g., from a mouse).
    if (!evt.forwardedTouchEvent) {
        return true;
    }

    // If a click is already being tracked, prevent this one.
    if (!evt.cancelable) {
        return true;
    }

    // This is a native click event that followed a touch event, but QuickTap didn't dispatch
    // a synthetic click. This means the element didn't need a synthetic click, so we allow
    // the native one through.
    evt.stopImmediatePropagation();
    evt.stopPropagation();
    evt.preventDefault();

    return false;
};


/**
 * Handles 'mousedown', 'mouseup', and 'mouseover' events.
 * On Android, these events can fire even during touch interactions.
 *
 * @param {Event} evt The mouse event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
QuickTap.prototype.onPointerEvent = function(evt) {
    'use strict';

    // If a tap is currently active, prevent mouse events to avoid conflicts.
    if (this.isTapActive) {
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    }

    // If the event is a mouseup following a touch, and a next click is being prevented,
    // prevent this mouseup as well.
    if (evt.type === 'mouseup' && this.preventNextTap) {
        evt.preventDefault();
        evt.stopPropagation();
        this.preventNextTap = false;
        return false;
    }

    return true;
};


/**
 * Removes all event listeners and cleans up the QuickTap instance.
 */
QuickTap.prototype.destroy = function() {
    'use strict';
    var surface = this.surface;

    if (this.isAndroidDevice) {
        surface.removeEventListener('mouseover', this.onPointerEvent, true);
        surface.removeEventListener('mousedown', this.onPointerEvent, true);
        surface.removeEventListener('mouseup', this.onPointerEvent, true);
    }

    surface.removeEventListener('click', this.onElementTap, true);
    surface.removeEventListener('touchstart', this.onFingerDown, false);
    surface.removeEventListener('touchend', this.onFingerUp, false);
    surface.removeEventListener('touchcancel', this.onFingerCancel, false);
};


/**
 * Initializes QuickTap on a given DOM element.
 *
 * @param {Element} surface The DOM element to initialize QuickTap on.
 * @returns {QuickTap} A new QuickTap instance.
 */
QuickTap.attach = function(surface) {
    'use strict';
    return new QuickTap(surface);
};