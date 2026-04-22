/*!
 * Magnific Popup - v0.9.9 - 2013-11-15
 * Project homepage: http://dimsemenov.com/plugins/magnific-popup/
 * Copyright (c) 2013 Dmitry Semenov;
 * Licensed under the MIT license.
 *
 * This file contains the core logic for the Magnific Popup library.
 * It handles the initialization, opening, closing, and updating of the popup.
 */
;
(
    function ($) {

        // Start of Magnific Popup Core Module

        /**
         * The core Magnific Popup module is responsible for managing the popup's state,
         * handling events, and providing utility functions.
         *
         * @namespace mfp
         */


        /**
         * Private static constants used throughout the Magnific Popup library.
         * These constants define event names, CSS class prefixes, and other fixed values.
         */
        var CLOSE_EVENT = 'Close', // Event triggered when the popup is about to close
            BEFORE_CLOSE_EVENT = 'BeforeClose', // Event triggered just before the close animation starts
            AFTER_CLOSE_EVENT = 'AfterClose', // Event triggered after the popup has fully closed
            BEFORE_APPEND_EVENT = 'BeforeAppend', // Event triggered before content is appended to the DOM
            MARKUP_PARSE_EVENT = 'MarkupParse', // Event triggered during markup parsing
            OPEN_EVENT = 'Open', // Event triggered when the popup is opened
            CHANGE_EVENT = 'Change', // Event triggered when the current item in the popup changes
            NS = 'mfp', // Namespace for Magnific Popup related events and classes
            EVENT_NS = '.' + NS, // Event namespace for jQuery events
            READY_CLASS = 'mfp-ready', // CSS class added when the popup is ready to be displayed
            REMOVING_CLASS = 'mfp-removing', // CSS class added during the removal animation
            PREVENT_CLOSE_CLASS = 'mfp-prevent-close'; // CSS class to prevent closing on click


        /**
         * Private variables for internal use within the Magnific Popup instance.
         * These variables store the current state and references to DOM elements.
         */
        var mfp, // The single instance of the MagnificPopup object
            MagnificPopup = function () {
            }, // Constructor for the MagnificPopup object
            _isJQ = !!(window.jQuery), // Flag to check if jQuery is available
            _prevStatus, // Stores the previous status of the popup
            _window = $(window), // jQuery object for the window
            _body, // jQuery object for the document body
            _document, // jQuery object for the document
            _prevContentType, // Stores the type of the previously displayed content
            _wrapClasses, // CSS classes to be added to the popup wrapper
            _currPopupType; // Stores the type of the currently displayed popup


        /**
         * Private helper functions for Magnific Popup.
         * These functions provide common utilities and event handling.
         */


        /**
         * Attaches an event handler to the Magnific Popup event system.
         *
         * @param {string} name - The name of the event (e.g., 'Open', 'Close').
         * @param {function} f - The event handler function.
         */
        var _mfpOn = function (name, f) {
                mfp.ev.on(NS + name + EVENT_NS, f);
            },


            /**
             * Creates and returns a new DOM element with Magnific Popup specific class names.
             *
             * @param {string} className - The specific class name suffix (e.g., 'bg', 'wrap').
             * @param {jQuery|HTMLElement} [appendTo] - The element to append the new element to.
             * @param {string} [html] - Optional HTML content for the new element.
             * @param {boolean} [raw] - If true, returns a raw DOM element instead of a jQuery object.
             * @returns {jQuery|HTMLElement} The created element.
             */
            _getEl = function (className, appendTo, html, raw) {
                var el = document.createElement('div');
                el.className = 'mfp-' + className;
                if (html) {
                    el.innerHTML = html;
                }
                if (!raw) {
                    el = $(el);
                    if (appendTo) {
                        el.appendTo(appendTo);
                    }
                } else if (appendTo) {
                    appendTo.appendChild(el);
                }
                return el;
            },


            /**
             * Triggers a Magnific Popup event, calling both internal handlers and user-defined callbacks.
             *
             * @param {string} e - The event name (e.g., 'Open', 'BeforeClose').
             * @param {Array|*} [data] - Optional data to pass to the event handlers.
             */
            _mfpTrigger = function (e, data) {
                mfp.ev.triggerHandler(NS + e, data);

                if (mfp.st.callbacks) {
                    // Converts "mfpEventName" to "eventName" callback and triggers it if present
                    e = e.charAt(0).toLowerCase() + e.slice(1);
                    if (mfp.st.callbacks[e]) {
                        mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
                    }
                }
            },


            /**
             * Returns the close button element for the popup. Caches the button if already created.
             *
             * @param {string} type - The type of the current popup item.
             * @returns {jQuery} The close button element.
             */
            _getCloseBtn = function (type) {
                if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
                    mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace('%title%', mfp.st.tClose));
                    _currPopupType = type;
                }
                return mfp.currTemplate.closeBtn;
            },


            /**
             * Checks if a Magnific Popup instance has been initialized.
             * If not, it creates and initializes a new instance, then stores it globally.
             */
            _checkInstance = function () {
                if (!$.magnificPopup.instance) {
                    mfp = new MagnificPopup();
                    mfp.init();
                    $.magnificPopup.instance = mfp;
                }
            },


            /**
             * Detects if the browser supports CSS3 transitions.
             * This function uses a feature detection approach, checking for various vendor prefixes.
             *
             * @returns {boolean} True if CSS transitions are supported, false otherwise.
             */
            supportsTransitions = function () {
                var s = document.createElement('p').style, // Create a temporary element to check its style property
                    v = ['ms', 'O', 'Moz', 'Webkit']; // Array of vendor prefixes

                // Check for standard 'transition' property
                if (s['transition'] !== undefined) {
                    return true;
                }

                // Check for vendor-prefixed 'Transition' properties
                while (v.length) {
                    if (v.pop() + 'Transition' in s) {
                        return true;
                    }
                }

                return false; // No transition support detected
            };


        /**
         * Public functions and methods for the MagnificPopup prototype.
         * These methods form the public API of the Magnific Popup instance.
         */
        MagnificPopup.prototype = {

            constructor: MagnificPopup, // Ensure the constructor property points to MagnificPopup

            /**
             * Initializes the Magnific Popup plugin.
             * This method is called only once when `$.fn.magnificPopup` or `$.magnificPopup` is executed for the first time.
             * It detects browser capabilities and sets up global references.
             */
            init: function () {
                var appVersion = navigator.appVersion;

                // Browser detection for specific IE versions and mobile devices
                mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1;
                mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
                mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
                mfp.isAndroid = (/android/gi).test(appVersion);
                mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);

                // Detect CSS transition support
                mfp.supportsTransition = supportsTransitions();

                // Determine if the device is probably mobile, affecting fixed positioning
                mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent));

                // Cache jQuery objects for body and document
                _body = $(document.body);
                _document = $(document);

                // Initialize popup cache
                mfp.popupsCache = {};
            },

            /**
             * Opens the popup with the specified data.
             * This is the primary method to display a Magnific Popup.
             *
             * @param {Object} data - Configuration object for the popup.
             * @param {boolean} [data.isObj=false] - If true, `data.items` is an array of item objects; otherwise, it's a jQuery collection.
             * @param {jQuery} data.items - A jQuery collection of elements or an array of item objects.
             * @param {jQuery} [data.el] - The specific element that triggered the popup (used for determining the initial index).
             * @param {number} [data.index=0] - The initial index of the item to display in a gallery.
             * @param {string} [data.key] - A unique key for caching popup templates.
             * @param {jQuery} [data.mainEl] - The main element to attach events to.
             * @returns {Object} The data object used to open the popup.
             */
            open: function (data) {

                var i; // Loop counter variable

                // Determine the items array and current index
                if (data.isObj === false) {
                    // Convert jQuery collection to array to avoid conflicts later
                    mfp.items = data.items.toArray();

                    mfp.index = 0;
                    var items = data.items,
                        item;
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if (item.parsed) {
                            item = item.el[0];
                        }
                        if (item === data.el[0]) {
                            mfp.index = i;
                            break;
                        }
                    }
                } else {
                    mfp.items = $.isArray(data.items) ? data.items : [data.items];
                    mfp.index = data.index || 0;
                }

                // If popup is already open, just update its content
                if (mfp.isOpen) {
                    mfp.updateItemHTML();
                    return;
                }

                mfp.types = [];
                _wrapClasses = ''; // Reset wrapper classes

                // Set the event target element
                if (data.mainEl && data.mainEl.length) {
                    mfp.ev = data.mainEl.eq(0);
                } else {
                    mfp.ev = _document;
                }

                // Manage popup templates using a key for caching
                if (data.key) {
                    if (!mfp.popupsCache[data.key]) {
                        mfp.popupsCache[data.key] = {};
                    }
                    mfp.currTemplate = mfp.popupsCache[data.key];
                } else {
                    mfp.currTemplate = {};
                }

                // Extend default settings with user-provided options
                mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
                mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

                // Apply modal-specific settings
                if (mfp.st.modal) {
                    mfp.st.closeOnContentClick = false;
                    mfp.st.closeOnBgClick = false;
                    mfp.st.showCloseBtn = false;
                    mfp.st.enableEscapeKey = false;
                }


                // Building markup: main containers are created only once
                if (!mfp.bgOverlay) {

                    // Create and attach the dark background overlay
                    mfp.bgOverlay = _getEl('bg').on('click' + EVENT_NS, function () {
                        mfp.close();
                    });

                    // Create and attach the main wrapper element
                    mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click' + EVENT_NS, function (e) {
                        if (mfp._checkIfClose(e.target)) {
                            mfp.close();
                        }
                    });

                    // Create the content container within the wrapper
                    mfp.container = _getEl('container', mfp.wrap);
                }

                // Create the content element
                mfp.contentContainer = _getEl('content');

                // If preloader is enabled, create it
                if (mfp.st.preloader) {
                    mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
                }


                // Initialize all registered modules
                var modules = $.magnificPopup.modules;
                for (i = 0; i < modules.length; i++) {
                    var n = modules[i];
                    n = n.charAt(0).toUpperCase() + n.slice(1); // Capitalize first letter
                    mfp['init' + n].call(mfp);
                }

                // Trigger 'BeforeOpen' event
                _mfpTrigger('BeforeOpen');


                // Handle close button display
                if (mfp.st.showCloseBtn) {
                    if (!mfp.st.closeBtnInside) {
                        mfp.wrap.append(_getCloseBtn());
                    } else {
                        // If close button is inside, use MarkupParse event to inject it
                        _mfpOn(MARKUP_PARSE_EVENT, function (e, template, values, item) {
                            values.close_replaceWith = _getCloseBtn(item.type);
                        });
                        _wrapClasses += ' mfp-close-btn-in';
                    }
                }

                // Add 'mfp-align-top' class if alignTop is true
                if (mfp.st.alignTop) {
                    _wrapClasses += ' mfp-align-top';
                }


                // Apply CSS for fixed content positioning
                if (mfp.fixedContentPos) {
                    mfp.wrap.css({
                        overflow: mfp.st.overflowY,
                        overflowX: 'hidden',
                        overflowY: mfp.st.overflowY
                    });
                } else {
                    // For non-fixed content, set position to absolute and top to current scroll position
                    mfp.wrap.css({
                        top: _window.scrollTop(),
                        position: 'absolute'
                    });
                }

                // Adjust background overlay height if fixedBgPos is false or auto (and content not fixed)
                if (mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos)) {
                    mfp.bgOverlay.css({
                        height: _document.height(),
                        position: 'absolute'
                    });
                }


                // Enable Escape key to close the popup
                if (mfp.st.enableEscapeKey) {
                    _document.on('keyup' + EVENT_NS, function (e) {
                        if (e.keyCode === 27) { // 27 is the keycode for ESC
                            mfp.close();
                        }
                    });
                }

                // Handle window resize events
                _window.on('resize' + EVENT_NS, function () {
                    mfp.updateSize();
                });


                // Add 'mfp-auto-cursor' class if closeOnContentClick is false
                if (!mfp.st.closeOnContentClick) {
                    _wrapClasses += ' mfp-auto-cursor';
                }

                // Apply collected wrapper classes
                if (_wrapClasses)
                    mfp.wrap.addClass(_wrapClasses);


                // Get window height for later calculations
                var windowHeight = mfp.wH = _window.height();


                var windowStyles = {}; // Object to store CSS styles for the HTML element

                // Adjust body/html styles for fixed content position (to prevent scrollbar issues)
                if (mfp.fixedContentPos) {
                    if (mfp._hasScrollBar(windowHeight)) {
                        var s = mfp._getScrollbarSize();
                        if (s) {
                            windowStyles.marginRight = s;
                        }
                    }
                }

                if (mfp.fixedContentPos) {
                    if (!mfp.isIE7) {
                        windowStyles.overflow = 'hidden';
                    } else {
                        // IE7 double-scroll bug workaround
                        $('body, html').css('overflow', 'hidden');
                    }
                }


                // Add main CSS classes to the Magnific Popup elements
                var classesToadd = mfp.st.mainClass;
                if (mfp.isIE7) {
                    classesToadd += ' mfp-ie7';
                }
                if (classesToadd) {
                    mfp._addClassToMFP(classesToadd);
                }

                // Update the popup's content
                mfp.updateItemHTML();

                // Trigger 'BuildControls' event
                _mfpTrigger('BuildControls');


                // Apply window styles (e.g., scrollbar adjustments)
                $('html').css(windowStyles);

                // Append overlay and wrapper to the document body
                mfp.bgOverlay.add(mfp.wrap).prependTo(document.body);


                // Save the last focused element before opening the popup
                mfp._lastFocusedEl = document.activeElement;

                // Wait for the next cycle to allow CSS transitions to apply
                setTimeout(function () {

                    if (mfp.content) {
                        mfp._addClassToMFP(READY_CLASS); // Add 'mfp-ready' class to content
                        mfp._setFocus(); // Set focus within the popup
                    } else {
                        // If content is not yet defined (e.g., still loading), add class only to BG
                        mfp.bgOverlay.addClass(READY_CLASS);
                    }

                    // Trap the focus within the popup to improve accessibility
                    _document.on('focusin' + EVENT_NS, mfp._onFocusIn);

                }, 16); // A small delay to ensure CSS transitions can kick in

                mfp.isOpen = true; // Mark popup as open
                mfp.updateSize(windowHeight); // Update size after opening
                _mfpTrigger(OPEN_EVENT); // Trigger 'Open' event

                return data; // Return the data object
            },

            /**
             * Closes the currently open popup.
             * If a removal delay is set and transitions are supported, it animates the close.
             */
            close: function () {
                if (!mfp.isOpen) return; // Do nothing if popup is not open

                _mfpTrigger(BEFORE_CLOSE_EVENT); // Trigger 'BeforeClose' event

                mfp.isOpen = false; // Mark popup as closed

                // Handle CSS3 animation for closing
                if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
                    mfp._addClassToMFP(REMOVING_CLASS); // Add 'mfp-removing' class for animation
                    setTimeout(function () {
                        mfp._close(); // Call the actual close helper after delay
                    }, mfp.st.removalDelay);
                } else {
                    mfp._close(); // Close immediately if no animation or no transition support
                }
            },

            /**
             * Helper function for `close()`. Performs the actual cleanup and DOM removal.
             */
            _close: function () {
                _mfpTrigger(CLOSE_EVENT); // Trigger 'Close' event

                var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

                // Detach all popup DOM elements
                mfp.bgOverlay.detach();
                mfp.wrap.detach();
                mfp.container.empty(); // Empty the content container

                // Add mainClass to classes to be removed
                if (mfp.st.mainClass) {
                    classesToRemove += mfp.st.mainClass + ' ';
                }

                // Remove all Magnific Popup specific classes from HTML element
                mfp._removeClassFromMFP(classesToRemove);

                // Restore original HTML element styles if fixed content position was used
                if (mfp.fixedContentPos) {
                    var windowStyles = {marginRight: ''};
                    if (mfp.isIE7) {
                        $('body, html').css('overflow', ''); // IE7 specific overflow fix
                    } else {
                        windowStyles.overflow = '';
                    }
                    $('html').css(windowStyles);
                }

                // Unbind all Magnific Popup specific event handlers
                _document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
                mfp.ev.off(EVENT_NS);

                // Clean up DOM elements by resetting their attributes
                mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
                mfp.bgOverlay.attr('class', 'mfp-bg');
                mfp.container.attr('class', 'mfp-container');

                // Remove close button from target element if it was injected
                if (mfp.st.showCloseBtn &&
                    (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
                    if (mfp.currTemplate.closeBtn)
                        mfp.currTemplate.closeBtn.detach();
                }


                // Restore focus to the element that was focused before the popup opened
                if (mfp._lastFocusedEl) {
                    $(mfp._lastFocusedEl).focus();
                }

                // Reset internal state variables
                mfp.currItem = null;
                mfp.content = null;
                mfp.currTemplate = null;
                mfp.prevHeight = 0;

                _mfpTrigger(AFTER_CLOSE_EVENT); // Trigger 'AfterClose' event
            },

            /**
             * Updates the size of the popup, especially useful on window resize or content changes.
             *
             * @param {number} [winHeight] - Optional, the current window height. If not provided, it will be calculated.
             */
            updateSize: function (winHeight) {

                if (mfp.isIOS) {
                    // Fixes iOS nav bars issue: https://github.com/dimsemenov/Magnific-Popup/issues/2
                    var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
                    var height = window.innerHeight * zoomLevel;
                    mfp.wrap.css('height', height);
                    mfp.wH = height;
                } else {
                    mfp.wH = winHeight || _window.height(); // Use provided height or calculate
                }

                // Fixes #84: popup incorrectly positioned with position:relative on body
                if (!mfp.fixedContentPos) {
                    mfp.wrap.css('height', mfp.wH);
                }

                _mfpTrigger('Resize'); // Trigger 'Resize' event

            },

            /**
             * Updates the HTML content of the popup based on the current item.
             */
            updateItemHTML: function () {
                var item = mfp.items[mfp.index]; // Get the current item

                // Detach current content elements to perform modifications efficiently
                mfp.contentContainer.detach();

                if (mfp.content)
                    mfp.content.detach();

                // Parse the item if it hasn't been parsed yet
                if (!item.parsed) {
                    item = mfp.parseEl(mfp.index);
                }

                var type = item.type; // Get the type of the current item

                // Trigger 'BeforeChange' event with previous and new item types
                _mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
                // BeforeChange event works like so: _mfpOn('BeforeChange', function(e, prevType, newType) { });

                mfp.currItem = item; // Set the current item
            }
        };
    }
)(window.jQuery || window.Zepto);