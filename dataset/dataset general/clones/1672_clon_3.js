/*! Modal Window Handler - v1.0.0 - 2024-04-23
* https://example.com/modern-modal-handler
* Copyright (c) 2024 Your Name; */
;(function($, window, document, undefined) { // Added window, document, undefined for robustness

/*>>core-module*/
/**
 *
 * Core JavaScript module for managing modal window displays.
 * Implements a single-instance pattern for modal control.
 *
 */

// Central configuration for events and classes
const MODAL_CONFIG = {
    NAMESPACE: 'modl',
    EVENT_SUFFIX: '.modl',
    CLASSES: {
        READY: 'modl-active',
        REMOVING: 'modl-fade-out',
        PREVENT_CLOSE: 'modl-no-dismiss',
        AUTO_CURSOR: 'modl-pointer-auto',
        IE7: 'modl-legacy-ie7',
        CLOSE_BTN_INSIDE: 'modl-close-btn-inner'
    },
    EVENTS: {
        CLOSING: 'Closing',
        PRE_CLOSE: 'BeforeClose',
        POST_CLOSE: 'AfterClose',
        PRE_APPEND: 'BeforeAppend',
        PARSE_MARKUP: 'MarkupParse',
        OPENING: 'Open',
        CONTENT_CHANGE: 'Change',
        RESIZE: 'Resize',
        BUILD_CONTROLS: 'BuildControls'
    }
};

/**
 * Internal module state and instance variables.
 * These are managed by the single instance of `ModalHandler`.
 */
let modalInstance = null; // Holds the single instance of ModalHandler
let ModalHandlerClass = function(){}; // Constructor reference
let isJQueryAvailable = (typeof window.jQuery !== 'undefined'); // Check for jQuery presence
let currentModalType = null; // Stores the type of the currently displayed modal
let accumulatedWrapClasses = ''; // String to build up wrapper classes
let cachedDocumentRef = $(document); // jQuery reference to document
let cachedBodyRef = $(document.body); // jQuery reference to body
let cachedWindowRef = $(window); // jQuery reference to window
let lastContentKind = ''; // Tracks the content type for various adjustments

/**
 * Utility functions for internal module operations.
 */
const _attachEvent = function(eventName, callbackFn) {
    modalInstance.eventEmitter.on(MODAL_CONFIG.NAMESPACE + eventName + MODAL_CONFIG.EVENT_SUFFIX, callbackFn);
};

const _createDOMElement = function(elementClass, parentElement, innerHTMLContent, useRawDOM = false) {
    const newElement = document.createElement('div');
    newElement.className = MODAL_CONFIG.NAMESPACE + '-' + elementClass;

    if (innerHTMLContent) {
        newElement.innerHTML = innerHTMLContent;
    }

    if (!useRawDOM) {
        const jQElement = $(newElement);
        if (parentElement) {
            jQElement.appendTo(parentElement);
        }
        return jQElement;
    } else {
        if (parentElement) {
            parentElement.appendChild(newElement);
        }
        return newElement;
    }
};

const _dispatchModalEvent = function(eventName, eventData) {
    modalInstance.eventEmitter.triggerHandler(MODAL_CONFIG.NAMESPACE + eventName, eventData);

    if (modalInstance.currentSettings && modalInstance.currentSettings.callbacks) {
        // Convert 'EventName' to 'eventName' for callback lookup
        const callbackName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
        const registeredCallback = modalInstance.currentSettings.callbacks[callbackName];
        if (registeredCallback && typeof registeredCallback === 'function') {
            const callbackArgs = Array.isArray(eventData) ? eventData : [eventData];
            registeredCallback.apply(modalInstance, callbackArgs);
        }
    }
};

const _getCloseButton = function(contentType) {
    // Cache close button to avoid re-creation unless content type changes
    if (contentType !== currentModalType || !modalInstance.currentView.closeButtonElement) {
        modalInstance.currentView.closeButtonElement = $(
            modalInstance.currentSettings.closeMarkup.replace('%title%', modalInstance.currentSettings.textClose)
        );
        currentModalType = contentType; // Update the cached type
    }
    return modalInstance.currentView.closeButtonElement;
};

// Ensures the ModalHandler is initialized and a single instance exists
const _ensureHandlerInitialized = function() {
    if (!$.modalHandlerInstance) { // Using a different global property name
        modalInstance = new ModalHandlerClass();
        modalInstance.initializeHandler();
        $.modalHandlerInstance = modalInstance;
    }
};

// Detects CSS transitions support
const _checkTransitionSupport = function() {
    const testElement = document.createElement('p');
    const style = testElement.style;
    const vendors = ['ms', 'O', 'Moz', 'Webkit', '']; // Include empty for standard property

    // Check for standard 'transition' property first
    if (style.transition !== undefined) {
        return true;
    }

    // Check for vendor-prefixed versions
    for (let i = 0; i < vendors.length; i++) {
        if (vendors[i] + 'Transition' in style) {
            return true;
        }
    }

    return false;
};

// Helper for adding classes consistently
const _addPrefixedClasses = function(element, classesString) {
    if (element && classesString) {
        element.addClass(classesString);
    }
};

// Helper for removing classes consistently
const _removePrefixedClasses = function(element, classesString) {
    if (element && classesString) {
        element.removeClass(classesString);
    }
};

/**
 * The main ModalHandler object prototype.
 * All public methods and core logic reside here.
 */
ModalHandlerClass.prototype = {

    constructor: ModalHandlerClass, // Explicitly set constructor

    /**
     * Initializes the modal handler module.
     * This method is called only once when `$.fn.modalHandler` or `$.modalHandler` is first invoked.
     */
    initializeHandler: function() {
        const userAgent = navigator.userAgent;
        const appVersion = navigator.appVersion;

        // Basic browser environment detection
        this.isLegacyIE7 = appVersion.indexOf("MSIE 7.") !== -1;
        this.isLegacyIE8 = appVersion.indexOf("MSIE 8.") !== -1;
        this.isOldIE = this.isLegacyIE7 || this.isLegacyIE8;
        this.isAndroidDevice = (/android/gi).test(userAgent);
        this.isAppleMobile = (/iphone|ipad|ipod/gi).test(userAgent);
        this.hasCSSTransitions = _checkTransitionSupport();

        // Heuristic for potentially problematic mobile environments (fixed positioning)
        this.isLikelyMobile = (this.isAndroidDevice || this.isAppleMobile || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(userAgent));

        cachedBodyRef = $(document.body); // Ensure body is correctly referenced
        cachedDocumentRef = $(document); // Ensure document is correctly referenced

        this.modalCacheStore = {}; // Cache for modal templates
        this.eventEmitter = cachedDocumentRef; // Default event emitter

        // Add a debug flag
        this.debugMode = false; // Can be set via settings
    },

    /**
     * Displays a modal window based on provided configuration data.
     * @param {object} displayConfig - Configuration object for the modal.
     */
    displayModal: function(displayConfig) {
        // Validate input configuration
        if (!displayConfig || typeof displayConfig !== 'object') {
            console.error("ModalHandler: Invalid display configuration provided.");
            return;
        }

        // Normalize items array and set current index
        this._normalizeContentItems(displayConfig);

        // If modal is already open, just update content and return
        if (this.isOpen) {
            this.updateModalContentHTML();
            return;
        }

        this.contentTypes = []; // Reset content types for new modal
        accumulatedWrapClasses = ''; // Reset wrapper classes

        // Determine the event emitter for this modal instance
        if (displayConfig.mainEl && displayConfig.mainEl.length) {
            this.eventEmitter = displayConfig.mainEl.eq(0);
        } else {
            this.eventEmitter = cachedDocumentRef;
        }

        // Handle modal template caching
        if (displayConfig.key) {
            if (!this.modalCacheStore[displayConfig.key]) {
                this.modalCacheStore[displayConfig.key] = {};
            }
            this.currentView = this.modalCacheStore[displayConfig.key];
        } else {
            this.currentView = {};
        }

        // Merge default settings with user-provided settings
        this.currentSettings = $.extend(true, {}, $.modalHandler.defaults, displayConfig);

        // Determine if fixed content positioning should be used
        this.isFixedContent = this.currentSettings.fixedContentPos === 'auto' ?
            !this.isLikelyMobile : this.currentSettings.fixedContentPos;

        // Apply modal-specific settings if `modal` option is true
        if (this.currentSettings.modal) {
            this.currentSettings.closeOnContentClick = false;
            this.currentSettings.closeOnBgClick = false;
            this.currentSettings.showCloseBtn = false;
            this.currentSettings.enableEscapeKey = false;
        }

        // Construct base DOM elements if they don't exist
        this._buildBaseDOM();

        // Create content wrapper and preloader if enabled
        this.contentWrapper = _createDOMElement('content');
        if (this.currentSettings.preloader) {
            this.preloaderElement = _createDOMElement('preloader', this.modalContainer, this.currentSettings.textLoading);
        }

        // Initialize any registered modules (e.g., image, iframe)
        if ($.modalHandler.modules && Array.isArray($.modalHandler.modules)) {
            $.modalHandler.modules.forEach(moduleName => {
                const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
                const initMethod = this['init' + capitalizedName];
                if (typeof initMethod === 'function') {
                    initMethod.call(this);
                }
            });
        }
        _dispatchModalEvent(MODAL_CONFIG.EVENTS.PRE_OPEN);

        // Handle close button rendering
        if (this.currentSettings.showCloseBtn) {
            if (!this.currentSettings.closeBtnInside) {
                this.modalWrapper.append(_getCloseButton());
            } else {
                _attachEvent(MODAL_CONFIG.EVENTS.PARSE_MARKUP, (evt, tmpl, vals, item) => {
                    vals.close_replaceWith = _getCloseButton(item.type);
                });
                accumulatedWrapClasses += ' ' + MODAL_CONFIG.CLASSES.CLOSE_BTN_INSIDE;
            }
        }

        // Apply alignment class if needed
        if (this.currentSettings.alignTop) {
            accumulatedWrapClasses += ' modl-align-top';
        }

        // Set wrapper CSS properties based on fixed content positioning
        if (this.isFixedContent) {
            this.modalWrapper.css({
                overflowY: this.currentSettings.overflowY,
                overflowX: 'hidden' // Always hide horizontal overflow for fixed content
            });
        } else {
            this.modalWrapper.css({
                top: cachedWindowRef.scrollTop(),
                position: 'absolute'
            });
        }

        // Adjust background overlay height if not fixed background or fixed content
        const shouldAdjustBgHeight = this.currentSettings.fixedBgPos === false ||
                                     (this.currentSettings.fixedBgPos === 'auto' && !this.isFixedContent);
        if (shouldAdjustBgHeight) {
            this.bgOverlayElement.css({
                height: cachedDocumentRef.height(),
                position: 'absolute'
            });
        }

        // Bind escape key handler
        if (this.currentSettings.enableEscapeKey) {
            cachedDocumentRef.on('keyup' + MODAL_CONFIG.EVENT_SUFFIX, (e) => {
                if (e.keyCode === 27) { // ESC key
                    this.hideModal();
                }
            });
        }

        // Bind window resize handler
        cachedWindowRef.on('resize' + MODAL_CONFIG.EVENT_SUFFIX, () => {
            this.adjustDimensions();
        });

        // Add auto-cursor class if content click doesn't close modal
        if (!this.currentSettings.closeOnContentClick) {
            accumulatedWrapClasses += ' ' + MODAL_CONFIG.CLASSES.AUTO_CURSOR;
        }

        // Apply accumulated wrapper classes
        if (accumulatedWrapClasses) {
            this.modalWrapper.addClass(accumulatedWrapClasses);
        }

        // Capture initial window height for calculations
        this.windowHeightSnapshot = cachedWindowRef.height();

        // Prepare CSS styles for the HTML element (scrollbar handling)
        const htmlElementStyles = {};
        if (this.isFixedContent) {
            const scrollbarWidth = this._getScrollbarWidth(this.windowHeightSnapshot);
            if (scrollbarWidth) {
                htmlElementStyles.marginRight = scrollbarWidth;
            }
            if (!this.isLegacyIE7) {
                htmlElementStyles.overflow = 'hidden';
            } else {
                // IE7 specific overflow fix for double-scroll issue
                $('body, html').css('overflow', 'hidden');
            }
        }

        // Add main custom classes and IE7 specific class
        let additionalClasses = this.currentSettings.mainClass || '';
        if (this.isLegacyIE7) {
            additionalClasses += ' ' + MODAL_CONFIG.CLASSES.IE7;
        }
        _addPrefixedClasses(this.modalWrapper, additionalClasses);

        // Load and update modal content
        this.updateModalContentHTML();

        _dispatchModalEvent(MODAL_CONFIG.EVENTS.BUILD_CONTROLS);

        // Apply HTML element styles to hide scrollbar
        $('html').css(htmlElementStyles);

        // Append modal elements to the DOM
        this.bgOverlayElement.add(this.modalWrapper).prependTo(document.body);

        // Save reference to the last focused element for accessibility
        this.lastFocusedElement = document.activeElement;

        // Schedule post-DOM-insertion tasks to allow for CSS transitions
        setTimeout(() => {
            if (this.modalContent) {
                _addPrefixedClasses(this.modalWrapper, MODAL_CONFIG.CLASSES.READY);
                this._setFocusToModal(); // Focus inside the modal
            } else {
                // If content not yet loaded, apply ready class to overlay only
                _addPrefixedClasses(this.bgOverlayElement, MODAL_CONFIG.CLASSES.READY);
            }

            // Trap focus within the modal for accessibility
            cachedDocumentRef.on('focusin' + MODAL_CONFIG.EVENT_SUFFIX, this._onFocusTrap);
        }, 16); // ~1 frame delay

        this.isOpen = true; // Mark modal as open
        this.adjustDimensions(this.windowHeightSnapshot);
        _dispatchModalEvent(MODAL_CONFIG.EVENTS.OPENING);

        return displayConfig; // Return original config
    },

    /**
     * Closes the currently open modal.
     */
    hideModal: function() {
        if (!this.isOpen) {
            return; // Nothing to close
        }
        _dispatchModalEvent(MODAL_CONFIG.EVENTS.PRE_CLOSE);

        this.isOpen = false; // Mark as closing

        // Handle CSS transition for removal
        const hasRemovalDelay = this.currentSettings.removalDelay && !this.isOldIE && this.hasCSSTransitions;
        if (hasRemovalDelay) {
            _addPrefixedClasses(this.modalWrapper, MODAL_CONFIG.CLASSES.REMOVING);
            setTimeout(() => {
                this._executeCloseProcess();
            }, this.currentSettings.removalDelay);
        } else {
            this._executeCloseProcess();
        }
    },

    /**
     * Internal helper for the actual modal closing process.
     */
    _executeCloseProcess: function() {
        _dispatchModalEvent(MODAL_CONFIG.EVENTS.CLOSING);

        let classesToClean = MODAL_CONFIG.CLASSES.REMOVING + ' ' + MODAL_CONFIG.CLASSES.READY + ' ';
        if (this.currentSettings.mainClass) {
            classesToClean += this.currentSettings.mainClass + ' ';
        }
        _removePrefixedClasses(this.modalWrapper, classesToClean); // Remove classes from wrapper
        _removePrefixedClasses(this.bgOverlayElement, MODAL_CONFIG.CLASSES.READY); // Remove ready from overlay

        // Detach DOM elements from the document
        this.bgOverlayElement.detach();
        this.modalWrapper.detach();
        this.modalContainer.empty(); // Empty container content

        // Reset HTML/BODY overflow styles
        if (this.isFixedContent) {
            const htmlResetStyles = { marginRight: '' };
            if (this.isLegacyIE7) {
                $('body, html').css('overflow', ''); // IE7 specific
            } else {
                htmlResetStyles.overflow = '';
            }
            $('html').css(htmlResetStyles);
        }

        // Unbind event handlers specific to this modal instance
        cachedDocumentRef.off('keyup' + MODAL_CONFIG.EVENT_SUFFIX + ' focusin' + MODAL_CONFIG.EVENT_SUFFIX);
        this.eventEmitter.off(MODAL_CONFIG.EVENT_SUFFIX);
        cachedWindowRef.off('resize' + MODAL_CONFIG.EVENT_SUFFIX); // Ensure resize is also unbound

        // Clean up DOM element attributes
        this.modalWrapper.attr('class', MODAL_CONFIG.NAMESPACE + '-wrap').removeAttr('style');
        this.bgOverlayElement.attr('class', MODAL_CONFIG.NAMESPACE + '-bg');
        this.modalContainer.attr('class', MODAL_CONFIG.NAMESPACE + '-container');

        // Remove close button if it was dynamically added
        const shouldRemoveCloseBtn = this.currentSettings.showCloseBtn &&
                                     (!this.currentSettings.closeBtnInside || this.currentView[this.currentContentItem.type] === true);
        if (shouldRemoveCloseBtn && this.currentView.closeButtonElement) {
            this.currentView.closeButtonElement.detach();
        }

        // Restore focus to the element that was active before modal opened
        if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
            $(this.lastFocusedElement).focus();
        }

        // Reset internal state variables
        this.currentContentItem = null;
        this.modalContent = null;
        this.currentView = null;
        this.previousHeight = 0;
        lastContentKind = ''; // Reset cached content kind

        _dispatchModalEvent(MODAL_CONFIG.EVENTS.POST_CLOSE);
    },

    /**
     * Adjusts the dimensions of the modal wrapper.
     * @param {number} [inputWindowHeight] - Optional pre-calculated window height.
     */
    adjustDimensions: function(inputWindowHeight) {
        let actualWindowHeight = inputWindowHeight;

        // Apply iOS-specific height adjustment due to browser UI elements
        if (this.isAppleMobile) {
            const zoomFactor = document.documentElement.clientWidth / window.innerWidth;
            const computedHeight = window.innerHeight * zoomFactor;
            this.modalWrapper.css('height', computedHeight);
            actualWindowHeight = computedHeight;
        } else {
            actualWindowHeight = inputWindowHeight || cachedWindowRef.height();
        }
        this.windowHeightSnapshot = actualWindowHeight; // Update snapshot

        // Ensure modal wrapper height matches window height if not fixed content
        if (!this.isFixedContent) {
            this.modalWrapper.css('height', this.windowHeightSnapshot);
        }

        _dispatchModalEvent(MODAL_CONFIG.EVENTS.RESIZE);
    },

    /**
     * Updates the HTML content of the modal based on the current item.
     */
    updateModalContentHTML: function() {
        let currentItem = this.contentItems[this.index];

        // Detach existing content elements to perform modifications without reflows
        this.contentWrapper.detach();
        if (this.modalContent) {
            this.modalContent.detach();
        }

        // Parse item if not already done
        if (!currentItem.parsed) {
            currentItem = this.parseModalElement(this.index);
        }

        const newContentType = currentItem.type;

        // Trigger BeforeChange event with previous and new content types
        const previousContentType = this.currentContentItem ? this.currentContentItem.type : '';
        _dispatchModalEvent(MODAL_CONFIG.EVENTS.CONTENT_CHANGE, [previousContentType, newContentType]);

        this.currentContentItem = currentItem; // Update current item reference
    },

    /**
     * Internal helper to normalize the `items` array and `index` from the display configuration.
     * @param {object} config - The display configuration object.
     */
    _normalizeContentItems: function(config) {
        if (config.isObj === false) {
            this.contentItems = config.items.toArray(); // Convert jQuery collection to array
            this.index = 0;
            const itemsArray = config.items;
            for (let i = 0; i < itemsArray.length; i++) {
                let currentItem = itemsArray[i];
                if (currentItem.parsed) {
                    currentItem = currentItem.el[0];
                }
                if (currentItem === config.el[0]) {
                    this.index = i;
                    break;
                }
            }
        } else {
            this.contentItems = $.isArray(config.items) ? config.items : [config.items];
            this.index = config.index || 0;
        }
        // Ensure index is within bounds
        if (this.index < 0 || this.index >= this.contentItems.length) {
            this.index = 0;
        }
    },

    /**
     * Internal helper to construct the base DOM elements for the modal.
     * These elements are created once and reused.
     */
    _buildBaseDOM: function() {
        if (!this.bgOverlayElement) {
            // Background overlay element
            this.bgOverlayElement = _createDOMElement('bg').on('click' + MODAL_CONFIG.EVENT_SUFFIX, () => {
                // Ensure closeOnBgClick is true and target is not prevent-close
                if (this.currentSettings.closeOnBgClick) {
                    this.hideModal();
                }
            });

            // Main modal wrapper
            this.modalWrapper = _createDOMElement('wrap')
                .attr('tabindex', -1) // Make wrapper focusable
                .on('click' + MODAL_CONFIG.EVENT_SUFFIX, (e) => {
                    // Check if click target is outside content and not a prevent-close element
                    if (this._shouldCloseOnClick(e.target)) {
                        this.hideModal();
                    }
                });

            // Inner container for modal content
            this.modalContainer = _createDOMElement('container', this.modalWrapper);
        }
    },

    /**
     * Checks if the modal should close based on a click target.
     * @param {HTMLElement} targetElement - The element that was clicked.
     * @returns {boolean} - True if the modal should close, false otherwise.
     */
    _shouldCloseOnClick: function(targetElement) {
        if (this.currentSettings.closeOnContentClick) {
            return true; // Always close if setting is true
        }

        // If click is on the wrapper itself, and not on a child that prevents close
        if ($(targetElement).hasClass(MODAL_CONFIG.NAMESPACE + '-wrap') &&
            !$(targetElement).hasClass(MODAL_CONFIG.CLASSES.PREVENT_CLOSE)) {
            return true;
        }
        return false;
    },

    /**
     * Determines the scrollbar width of the document.
     * @param {number} windowHeight - Current window height.
     * @returns {number} - Scrollbar width in pixels, or 0 if no scrollbar.
     */
    _getScrollbarWidth: function(windowHeight) {
        const bodyHeight = cachedBodyRef.height();
        // Check if content height exceeds window height (and body isn't overflow hidden)
        if (bodyHeight > windowHeight && cachedBodyRef.css('overflow') !== 'hidden') {
            const scrollDiv = document.createElement('div');
            scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
            document.body.appendChild(scrollDiv);
            const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        }
        return 0;
    },

    /**
     * Sets focus to the first focusable element within the modal.
     */
    _setFocusToModal: function() {
        if (!this.modalWrapper) return;
        const focusableElements = this.modalWrapper.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]');
        if (focusableElements.length > 0) {
            focusableElements.eq(0).focus();
        } else {
            this.modalWrapper.focus(); // Fallback to focusing the wrapper itself
        }
    },

    /**
     * Focus trap handler to keep focus within the modal.
     * @param {Event} e - The focusin event.
     */
    _onFocusTrap: function(e) {
        if (modalInstance && modalInstance.modalWrapper && !modalInstance.modalWrapper[0].contains(e.target)) {
            modalInstance.modalWrapper.focus(); // Redirect focus back to wrapper
        }
    }
    // Note: parseModalElement is assumed to be defined by a module, or as a default implementation
    // For this clone, we'll add a placeholder that mimics original behavior
    , parseModalElement: function(index) {
        // This is a simplified placeholder, actual implementation would be in modules.
        const item = this.contentItems[index];
        if (item.el) {
            item.type = item.el.attr('data-modal-type') || 'inline'; // Example: get type from data attribute
            item.src = item.el.attr('href') || item.el.attr('data-modal-src');
        } else if (item.src) {
            // Guess type from src
            if (item.src.match(/\.(jpeg|jpg|gif|png)$/i)) {
                item.type = 'image';
            } else if (item.src.indexOf('//') > -1) {
                item.type = 'iframe';
            } else {
                item.type = 'ajax';
            }
        } else {
            item.type = 'inline'; // Default type
        }
        item.parsed = true;
        return item;
    }
};

// Expose the handler globally via jQuery
$.modalHandler = function(config) {
    _ensureHandlerInitialized();
    if (modalInstance.debugMode) {
        console.log("ModalHandler: Initializing with config:", config);
    }
    modalInstance.displayModal(config);
};

// Add a jQuery plugin method for easier integration
$.fn.modalHandler = function(config) {
    _ensureHandlerInitialized();
    if (modalInstance.debugMode) {
        console.log("ModalHandler: Initializing via fn with config:", config);
    }
    const currentConfig = $.extend(true, {}, config, {
        isObj: false,
        items: this,
        el: this // Pass the clicked element for context
    });
    modalInstance.displayModal(currentConfig);
    return this; // Allow chaining
};

// Default settings object, can be overridden by user
$.modalHandler.defaults = {
    disableOn: 0, // No disabling by default
    key: null,
    midClick: false, // Allow middle click
    mainClass: '',
    preloader: true,
    focus: '', // Element to focus on
    closeOnContentClick: false,
    closeOnBgClick: true,
    closeBtnInside: true,
    showCloseBtn: true,
    enableEscapeKey: true,
    modal: false,
    alignTop: false,
    removalDelay: 0,
    fixedContentPos: 'auto',
    fixedBgPos: 'auto',
    overflowY: 'auto',
    callbacks: {},
    textClose: 'Close',
    textLoading: 'Loading...',
    // Markup for the close button
    closeMarkup: '<button title="%title%" type="button" class="modl-close">&#215;</button>',
    // Placeholder for modules array
    modules: []
};

// Public instance reference
$.modalHandler.instance = null;

})(window.jQuery, window, document);