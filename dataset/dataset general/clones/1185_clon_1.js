/* This is a Type I clone of the original FastClick code.
 * It maintains identical functionality and token sequence,
 * but varies whitespace and comments extensively for visual difference.
 */

// Original JSDoc block rephrased and reformatted.
// FastClick: A JavaScript polyfill to eliminate 300ms click delays on touch UIs.
// Version: 0.6.1 - Standard: ftlabs-jsv2
// Copyright: The Financial Times Limited (All Rights Reserved)
// License: MIT (see accompanying LICENSE.txt for full details)


// JSLint directives are now single-line comments.
// jslint browser:true, node:true
// global define, Event, Node


/**
 * Initializes FastClick listeners on the specified DOM element.
 *
 * @constructor
 * @param {Element} layer The DOM element to attach listeners to.
 */
function FastClick( layer )
{
    'use strict'
    var oldOnClick
    ,   self = this
    ;

    // Indicates if a click sequence is currently being monitored.
    this.trackingClick = false;


    /* Timestamp of when the current click tracking session began.
     * Stored as a number representing milliseconds.
     */
    this.trackingClickStart = 0;


    // The DOM element that is currently being tracked for a potential click event.
    this.targetElement = null;


    // X-coordinate of the touchstart event.
    this.touchStartX = 0;


    // Y-coordinate of the touchstart event.
    this.touchStartY = 0;


    /* Identifier of the most recent touch event,
     * typically from the Touch.identifier property. */
    this.lastTouchIdentifier = 0;


    // Reference to the FastClick layer (the DOM element it operates on).
    this.layer = layer;

    if ( !layer || !layer.nodeType ) {
        throw new TypeError('Layer parameter must be a valid document node.');
    }

    // Bind prototype methods to the instance for event listeners.
    this.onClick = function() {
        return FastClick.prototype.onClick.apply(self, arguments);
    };

    this.onMouse = function() {
        return FastClick.prototype.onMouse.apply(self, arguments);
    };

    this.onTouchStart = function() {
        return FastClick.prototype.onTouchStart.apply(self, arguments);
    };

    this.onTouchEnd = function() {
        return FastClick.prototype.onTouchEnd.apply(self, arguments);
    };

    this.onTouchCancel = function() {
        return FastClick.prototype.onTouchCancel.apply(self, arguments);
    };

    // If touch events are not supported, FastClick is not needed.
    if ( typeof window.ontouchstart === 'undefined' ) {
        return;
    }

    // Attach event handlers based on device characteristics.
    if ( this.deviceIsAndroid ) {
        layer.addEventListener( 'mouseover' , this.onMouse , true );
        layer.addEventListener( 'mousedown' , this.onMouse , true );
        layer.addEventListener( 'mouseup'   , this.onMouse , true );
    }

    layer.addEventListener( 'click'       , this.onClick       , true  );
    layer.addEventListener( 'touchstart'  , this.onTouchStart  , false );
    layer.addEventListener( 'touchend'    , this.onTouchEnd    , false );
    layer.addEventListener( 'touchcancel' , this.onTouchCancel , false );

    // This section handles a workaround for browsers that lack Event#stopImmediatePropagation.
    // Specifically targets Android 2, ensuring click events don't bubble up when cancelled.
    if ( !Event.prototype.stopImmediatePropagation ) {
        layer.removeEventListener = function( type , callback , capture ) {
            var rmv = Node.prototype.removeEventListener;
            if ( type === 'click' ) {
                rmv.call(layer, type, callback.hijacked || callback, capture);
            } else {
                rmv.call(layer, type, callback, capture);
            }
        };

        layer.addEventListener = function( type , callback , capture ) {
            var adv = Node.prototype.addEventListener;
            if ( type === 'click' ) {
                adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                    if ( !event.propagationStopped ) {
                        callback(event);
                    }
                }), capture);
            } else {
                adv.call(layer, type, callback, capture);
            }
        };
    }

    /* If an 'onclick' handler is already defined on the layer,
     * FastClick's handler might fire first.
     * We capture the existing handler and re-attach it as a listener
     * to ensure proper execution order.
     */
    if ( typeof layer.onclick === 'function' ) {

        // Special handling for Android browser pre-3.2:
        // A new function reference is needed when re-attaching.
        oldOnClick = layer.onclick;
        layer.addEventListener('click', function(event) {
            oldOnClick(event);
        }, false);
        layer.onclick = null; // Clear the original inline handler.
    }
}


/**
 * Determines if the device is Android, requiring specific handling.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * Determines if the device is iOS, requiring specific handling.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * Checks for iOS 4, which has unique requirements for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * Checks for iOS versions 6.0 and above, which may incorrectly report the target element.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Evaluates whether a native click event is necessary for the given element.
 *
 * @param {EventTarget|Element} target Target DOM element.
 * @returns {boolean} True if the element needs a native click, false otherwise.
 */
FastClick.prototype.needsClick = function(target) {
    'use strict';
    switch ( target.nodeName.toLowerCase() ) {
        case 'button':
        case 'input':
            // iOS 6 has a bug with file inputs; they need real clicks.
            if ( this.deviceIsIOS && target.type === 'file' ) {
                return true;
            }

            // Disabled inputs should not receive synthetic clicks.
            return target.disabled;
        case 'label':
        case 'video':
            return true;
        default:
            // Custom elements can opt-in to native clicks via a 'needsclick' class.
            return (/\bneedsclick\b/).test(target.className);
    }
};


/**
 * Determines if an element requires a focus call to simulate a native click.
 *
 * @param {EventTarget|Element} target The DOM element to check.
 * @returns {boolean} True if focus is needed, false otherwise.
 */
FastClick.prototype.needsFocus = function( target ) {
    'use strict';
    switch ( target.nodeName.toLowerCase() ) {
        case 'textarea':
        case 'select':
            return true;
        case 'input':
            switch ( target.type ) {
                case 'button':
                case 'checkbox':
                case 'file':
                case 'image':
                case 'radio':
                case 'submit':
                    return false;
            }

            // No need to try focusing disabled inputs.
            return !target.disabled;
        default:
            // Elements with 'needsfocus' class also require focus.
            return (/\bneedsfocus\b/).test(target.className);
    }
};


/**
 * Dispatches a synthetic click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement The element to click.
 * @param {Event} event The original touch event.
 */
FastClick.prototype.sendClick = function( targetElement , event ) {
    'use strict';
    var clickEvent
    ,   touch
    ;

    // On certain Android devices, the active element must be blurred
    // for the synthetic click to register (#24).
    if ( document.activeElement && document.activeElement !== targetElement ) {
        document.activeElement.blur();
    }

    touch = event.changedTouches[0];

    // Create and dispatch a MouseEvents click event.
    clickEvent = document.createEvent('MouseEvents');
    clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
    clickEvent.forwardedTouchEvent = true; // Custom property to identify FastClick-generated events.
    targetElement.dispatchEvent(clickEvent);
};


/**
 * Focuses the given element, handling iOS-specific selection range.
 *
 * @param {EventTarget|Element} targetElement The element to focus.
 */
FastClick.prototype.focus = function( targetElement ) {
    'use strict';
    var length;

    if ( this.deviceIsIOS && targetElement.setSelectionRange ) {
        length = targetElement.value.length;
        targetElement.setSelectionRange(length, length);
    } else {
        targetElement.focus();
    }
};


/**
 * Checks if the target element is inside a scrollable layer and updates its scroll state.
 *
 * @param {EventTarget|Element} targetElement The element to check.
 */
FastClick.prototype.updateScrollParent = function( targetElement ) {
    'use strict';
    var scrollParent
    ,   parentElement
    ;

    scrollParent = targetElement.fastClickScrollParent;

    // Re-evaluate scroll parent if not found or if the target moved.
    if ( !scrollParent || !scrollParent.contains(targetElement) ) {
        parentElement = targetElement;
        do {
            if ( parentElement.scrollHeight > parentElement.offsetHeight ) {
                scrollParent = parentElement;
                targetElement.fastClickScrollParent = parentElement;
                break;
            }

            parentElement = parentElement.parentElement;
        } while ( parentElement );
    }

    // Keep track of the last scroll position if a scroll parent exists.
    if ( scrollParent ) {
        scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
    }
};


/**
 * Extracts the appropriate target element from an event's eventTarget.
 * Handles cases where eventTarget might be a text node.
 *
 * @param {EventTarget} eventTarget The original event target.
 * @returns {Element|EventTarget} The actual DOM element to target.
 */
FastClick.prototype.getTargetElementFromEventTarget = function( eventTarget ) {
    'use strict';

    // Older browsers (e.g., Safari on iOS 4.1) may report text nodes as event targets.
    if ( eventTarget.nodeType === Node.TEXT_NODE ) {
        return eventTarget.parentNode;
    }

    return eventTarget;
};


/**
 * Handles the 'touchstart' event: records position and scroll offset.
 *
 * @param {Event} event The touchstart event.
 * @returns {boolean} Returns true to allow default behavior, false to prevent.
 */
FastClick.prototype.onTouchStart = function( event ) {
    'use strict';
    var targetElement
    ,   touch
    ,   selection
    ;

    targetElement = this.getTargetElementFromEventTarget(event.target);
    touch = event.targetTouches[0];

    if ( this.deviceIsIOS ) {

        // On iOS, only trusted events deselect text (issue #49).
        selection = window.getSelection();
        if ( selection.rangeCount && !selection.isCollapsed ) {
            return true;
        }

        if ( !this.deviceIsIOS4 ) {

            // Workaround for iOS alert/confirm dialogs causing duplicate touch events (#23, #52).
            if ( touch.identifier === this.lastTouchIdentifier ) {
                event.preventDefault();
                return false;
            }

            this.lastTouchIdentifier = touch.identifier;

            // Handle fling scrolls on scrollable layers (issue #42).
            this.updateScrollParent(targetElement);
        }
    }

    this.trackingClick = true;
    this.trackingClickStart = event.timeStamp;
    this.targetElement = targetElement;

    this.touchStartX = touch.pageX;
    this.touchStartY = touch.pageY;

    // Prevent phantom clicks on very fast double-taps (issue #36).
    if ( ( event.timeStamp - this.lastClickTime ) < 200 ) {
        event.preventDefault();
    }

    return true;
};


/**
 * Checks if a touch event has moved beyond a certain threshold since its start.
 *
 * @param {Event} event The touchmove event.
 * @returns {boolean} True if the touch has moved significantly, false otherwise.
 */
FastClick.prototype.touchHasMoved = function( event ) {
    'use strict';
    var touch = event.changedTouches[0];

    // A movement of more than 10 pixels in either direction is considered a "move".
    if ( Math.abs(touch.pageX - this.touchStartX) > 10 || Math.abs(touch.pageY - this.touchStartY) > 10 ) {
        return true;
    }

    return false;
};


/**
 * Locates the control element associated with a given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement The label element.
 * @returns {Element|null} The associated control element, or null if not found.
 */
FastClick.prototype.findControl = function( labelElement ) {
    'use strict';

    // Use the HTML5 'control' attribute if available (modern browsers).
    if ( labelElement.control !== undefined ) {
        return labelElement.control;
    }

    // Use the 'htmlFor' attribute (widely supported).
    if ( labelElement.htmlFor ) {
        return document.getElementById(labelElement.htmlFor);
    }

    // Fallback: search for a labellable descendant element.
    return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * Handles the 'touchend' event, deciding whether to dispatch a click event.
 *
 * @param {Event} event The touchend event.
 * @returns {boolean} True to allow default behavior, false to prevent.
 */
FastClick.prototype.onTouchEnd = function( event ) {
    'use strict';
    var forElement
    ,   trackingClickStart
    ,   targetTagName
    ,   scrollParent
    ,   touch
    ,   targetElement = this.targetElement
    ;

    // If the touch moved too much, cancel click tracking.
    if ( this.touchHasMoved(event) ) {
        this.trackingClick = false;
        this.targetElement = null; // Clear the tracked element.
    }

    if ( !this.trackingClick ) {
        return true;
    }

    // Prevent clicks on very rapid double-taps.
    if ( (event.timeStamp - this.lastClickTime) < 200 ) {
        this.cancelNextClick = true; // Flag to skip the next native click.
        return true;
    }

    this.lastClickTime = event.timeStamp; // Record time of this click.

    trackingClickStart = this.trackingClickStart;
    this.trackingClick = false;
    this.trackingClickStart = 0;

    // Re-detect target element on iOS if necessary due to scrolling/transitions (#57).
    if ( this.deviceIsIOSWithBadTarget ) {
        touch = event.changedTouches[0];
        targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset);
    }

    targetTagName = targetElement.tagName.toLowerCase();
    if ( targetTagName === 'label' ) {
        forElement = this.findControl(targetElement);
        if ( forElement ) {
            this.focus(targetElement); // Focus the label.
            if ( this.deviceIsAndroid ) {
                return false; // Android labels behave differently.
            }

            targetElement = forElement; // Shift target to the control.
        }
    } else if ( this.needsFocus(targetElement) ) {

        // Special handling for focusable elements:
        // Case 1: If touch started long ago, focus will be handled natively.
        // Case 2: iOS iframe input bug (#37).
        if ( (event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input') ) {