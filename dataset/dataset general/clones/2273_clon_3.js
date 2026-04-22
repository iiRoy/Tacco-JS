/**
 * @class OverlayManager
 * @version 2.0.0
 * @author Renovated by CloneGenius
 * @license MIT
 */
class OverlayManager {

  /**
   * Initializes the OverlayManager.
   * @param {Object} [configParams] - User-defined configuration options.
   */
  constructor(configParams) {

    // Default configuration settings
    this._config = {
      dialogSelector: '.modal',
      contentWrapperSelector: '.modal-inner',
      mainContentAreaSelector: '.modal-content',
      triggerSelector: '[rel="modal:open"]',
      closeBtnSelector: '[rel="modal:close"]',
      bodyElementSelector: 'body',
      activeClass: 'modal-visible',
      initialClass: 'overlay-ready',
      dismissOnClickOutside: true,
      escapeKey: 'Escape', // Changed from key code to key string
      enableTransitions: true,
      beforeShowCallback: () => {},
      beforeHideCallback: () => {},
      onShowCallback: () => {},
      onHideCallback: () => {}
    };

    // Apply user settings, merging with defaults
    this._mergeOptions(configParams);

    this.isErrorState = false; // Tracks if any initial setup errors occurred
    this.isCurrentlyOpen = false;
    this.activeElement = null; // The DOM element currently displayed as the modal content
    this._previousFocusElement = null; // Stores element focused before modal opened

    // Bind public methods for external use
    this.showDialog = this._handleDialogDisplay.bind(this);
    this.hideDialog = this._handleDialogConceal.bind(this);

    // Determine the browser's transition end event name
    this._config.transitionEventName = this._detectTransitionEvent();

    // Set up references to key DOM elements
    this._domRefs = this._initializeDomReferences();

    // If initial DOM setup was successful, proceed with event listeners
    if (!this.isErrorState && document.body) {
      this._applyInitializationClass();
      this._eventHandlers = this._manageEventListeners();
      this._eventHandlers.attach();
    } else {
      console.warn('OverlayManager: Initial setup failed. Check selectors or document readiness.');
    }
  }

  /**
   * Merges user-provided options with default settings.
   * @param {Object} userOptions - Options provided by the user.
   */
  _mergeOptions(userOptions) {
    if (typeof userOptions === 'object' && userOptions !== null) {
      Object.assign(this._config, userOptions);
    }
  }

  /**
   * Detects the appropriate 'transitionend' event name for the browser.
   * @returns {string|undefined} The transition end event name, or undefined if transitions are disabled.
   */
  _detectTransitionEvent() {
    if (!this._config.enableTransitions) return;

    const testElement = document.createElement('div');
    const transitionEventMap = {
      'transition': 'transitionend',
      'OTransition': 'otransitionend',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (const [prop, eventName] of Object.entries(transitionEventMap)) {
      if (testElement.style[prop] !== undefined) {
        return eventName;
      }
    }
    return undefined; // No transition support detected
  }

  /**
   * Finds a single DOM element using a CSS selector.
   * @param {string} elementSelector - The CSS selector for the element.
   * @param {HTMLElement} [contextNode=document] - The parent element to search within.
   * @returns {HTMLElement|null} The found element, or null if not found.
   */
  _findDomElement(elementSelector, contextNode = document) {
    const foundNode = contextNode.querySelector(elementSelector);
    if (!foundNode) {
      this.isErrorState = true;
      console.warn(`OverlayManager: Element "${elementSelector}" not found within context.`, contextNode);
      return null;
    }
    return foundNode;
  }

  /**
   * Sets up references to essential DOM nodes used by the manager.
   * @returns {Object} An object containing references to DOM elements.
   */
  _initializeDomReferences() {
    const domElements = {};
    domElements.dialog = this._findDomElement(this._config.dialogSelector);
    domElements.body = this._findDomElement(this._config.bodyElementSelector);

    // Only search for inner elements if the main dialog exists
    if (domElements.dialog) {
      domElements.contentWrapper = this._findDomElement(this._config.contentWrapperSelector, domElements.dialog);
      domElements.mainContentArea = this._findDomElement(this._config.mainContentAreaSelector, domElements.dialog);
    } else {
      this.isErrorState = true;
      console.error('OverlayManager: Main dialog element not found. Cannot proceed.');
    }
    return domElements;
  }

  /**
   * Adds an initial class to the page body to signify the manager is loaded.
   */
  _applyInitializationClass() {
    if (this._domRefs.body) {
      this._domRefs.body.classList.add(this._config.initialClass);
    }
  }

  /**
   * Adds a CSS class to a given HTML element.
   * @param {HTMLElement} element - The element to add the class to.
   * @param {string} className - The class name to add.
   */
  _addCssClass(element, className) {
    if (element instanceof HTMLElement) {
      element.classList.add(className);
    }
  }

  /**
   * Removes a CSS class from a given HTML element.
   * @param {HTMLElement} element - The element to remove the class from.
   * @param {string} className - The class name to remove.
   */
  _removeCssClass(element, className) {
    if (element instanceof HTMLElement) {
      element.classList.remove(className);
    }
  }

  /**
   * Tags the page body with a data attribute indicating the current active dialog.
   */
  _tagActiveDialog() {
    if (this._domRefs.body && this.activeElement) {
      const dialogId = this.activeElement.id || 'anonymous-dialog';
      this._domRefs.body.setAttribute('data-active-overlay', dialogId);
    }
  }

  /**
   * Removes the data attribute from the page body.
   */
  _untagActiveDialog() {
    if (this._domRefs.body) {
      this._domRefs.body.removeAttribute('data-active-overlay');
    }
  }

  /**
   * Resolves the target dialog element based on an event or selector.
   * @param {Event|string} triggerOrSelector - The event object or a CSS selector string.
   * @returns {HTMLElement|null} The resolved dialog element, or null if not found.
   */
  _resolveDialogTarget(triggerOrSelector) {
    let targetSelector = null;
    if (triggerOrSelector instanceof Event && triggerOrSelector.currentTarget) {
      targetSelector = triggerOrSelector.currentTarget.hash;
    } else if (typeof triggerOrSelector === 'string') {
      targetSelector = triggerOrSelector;
    }

    if (!targetSelector) {
      console.warn('OverlayManager: No valid selector or event provided to resolve dialog target.');
      return null;
    }

    const dialogTarget = document.querySelector(targetSelector);
    if (!(dialogTarget instanceof HTMLElement)) {
      console.warn(`OverlayManager: Dialog target "${targetSelector}" not found or is not an HTMLElement.`);
      return null;
    }
    return dialogTarget;
  }

  /**
   * Triggers a callback function if it's defined and a function.
   * @param {Function} callback - The callback function to trigger.
   * @param {Array} [args=[]] - Arguments to pass to the callback.
   */
  _triggerCallback(callback, args = []) {
    if (typeof callback === 'function') {
      callback.apply(this, args);
    }
  }

  /**
   * Stores the currently focused element before opening the dialog.
   */
  _cacheFocus() {
    this._previousFocusElement = document.activeElement;
  }

  /**
   * Restores focus to the element that was focused before the dialog opened.
   */
  _restoreFocus() {
    if (this._previousFocusElement && typeof this._previousFocusElement.focus === 'function') {
      this._previousFocusElement.focus();
    }
    this._previousFocusElement = null;
  }

  /**
   * Displays the dialog. This is the public 'open' method.
   * @param {Event|string} eventOrTarget - The event object or a CSS selector for the dialog content.
   */
  _handleDialogDisplay(eventOrTarget) {
    if (this.isCurrentlyOpen) return; // Prevent opening if already open

    this.activeElement = this._resolveDialogTarget(eventOrTarget);
    if (!this.activeElement) {
      console.warn('OverlayManager: Could not resolve valid dialog target for display.');
      return;
    }

    this._triggerCallback(this._config.beforeShowCallback);

    this._cacheFocus();
    this._transferContentToDialog(); // Move content into the modal structure
    this._addCssClass(this._domRefs.body, this._config.activeClass);
    this._tagActiveDialog();
    this.isCurrentlyOpen = true;

    // Set focus to the modal or its first focusable element (optional, but good for accessibility)
    if (this._domRefs.dialog) {
      setTimeout(() => this._domRefs.dialog.focus(), 0);
    }

    this._triggerCallback(this._config.onShowCallback);
  }

  /**
   * Checks if CSS transitions are active on the main dialog element.
   * @returns {boolean} True if transitions are active, false otherwise.
   */
  _checkCssTransitions() {
    if (!this._config.enableTransitions || !this._domRefs.dialog) return false;

    const computedStyle = window.getComputedStyle(this._domRefs.dialog);
    const transitionProperties = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];

    return transitionProperties.some(prop => {
      const duration = computedStyle[prop];
      return typeof duration === 'string' && parseFloat(duration) > 0;
    });
  }

  /**
   * Conceals the dialog. This is the public 'close' method.
   * @param {Event} [eventObj] - The event object that triggered the close.
   */
  _handleDialogConceal(eventObj) {
    if (!this.isCurrentlyOpen) return; // Prevent closing if already closed

    // Optionally prevent default if event provided, e.g., for link clicks
    if (eventObj && typeof eventObj.preventDefault === 'function') {
      eventObj.preventDefault();
    }

    this._triggerCallback(this._config.beforeHideCallback);

    this._removeCssClass(this._domRefs.body, this._config.activeClass);

    const hasActiveTransitions = this._checkCssTransitions();
    if (this._config.enableTransitions && this._config.transitionEventName && hasActiveTransitions) {
      this._concealWithTransition();
    } else {
      this._finalizeDialogConceal();
    }
  }

  /**
   * Finalizes the dialog concealment process (after transition or immediately).
   */
  _finalizeDialogConceal() {
    this._untagActiveDialog();
    this._restoreContentFromDialog(); // Move content back to its original place
    this.isCurrentlyOpen = false;
    this.activeElement = null;
    this._restoreFocus();
    this._triggerCallback(this._config.onHideCallback);
  }

  /**
   * Closes the dialog with a CSS transition.
   */
  _concealWithTransition() {
    if (!this._domRefs.dialog || !this._config.transitionEventName) {
      this._finalizeDialogConceal(); // Fallback if no dialog or transition name
      return;
    }

    const dialogTransitionEndCallback = () => {
      this._domRefs.dialog.removeEventListener(this._config.transitionEventName, dialogTransitionEndCallback);
      this._finalizeDialogConceal();
    };
    this._domRefs.dialog.addEventListener(this._config.transitionEventName, dialogTransitionEndCallback, { once: true });
  }

  /**
   * Transfers the content from the active element into the dialog's main content area.
   */
  _transferContentToDialog() {
    if (!this.activeElement || !this._domRefs.mainContentArea) return;

    // Use a DocumentFragment for more efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    while (this.activeElement.firstChild) {
      fragment.appendChild(this.activeElement.firstChild);
    }
    this._domRefs.mainContentArea.appendChild(fragment);
  }

  /**
   * Restores the content from the dialog's main content area back to the active element.
   */
  _restoreContentFromDialog() {
    if (!this.activeElement || !this._domRefs.mainContentArea) return;

    const fragment = document.createDocumentFragment();
    while (this._domRefs.mainContentArea.firstChild) {
      fragment.appendChild(this._domRefs.mainContentArea.firstChild);
    }
    this.activeElement.appendChild(fragment);
  }

  /**
   * Handles keyboard events for dialog dismissal (e.g., Escape key).
   * @param {KeyboardEvent} keyboardEvent - The keyboard event object.
   */
  _keyboardDismissHandler(keyboardEvent) {
    if (this._config.escapeKey && keyboardEvent.key === this._config.escapeKey && this.isCurrentlyOpen) {
      keyboardEvent.preventDefault();
      this.hideDialog();
    }
  }

  /**
   * Handles clicks outside the dialog content area to dismiss the dialog.
   * @param {MouseEvent} mouseEvent - The mouse event object.
   */
  _overlayClickHandler(mouseEvent) {
    if (!this._config.dismissOnClickOutside || !this.isCurrentlyOpen) return;

    // Check if the click occurred directly on the content wrapper (which is usually the overlay background)
    // and not on its children (which would be the dialog content itself).
    if (mouseEvent.target === this._domRefs.contentWrapper) {
      mouseEvent.preventDefault();
      this.hideDialog();
    }
  }

  /**
   * Finds the closest ancestor element matching a given selector.
   * @param {Event} eventObject - The event object.
   * @param {string} targetSelector - The CSS selector to match.
   * @returns {HTMLElement|null} The matching ancestor element, or null.
   */
  _findMatchingAncestor(eventObject, targetSelector) {
    if (!eventObject || !eventObject.target || !(eventObject.target instanceof HTMLElement)) {
      return null;
    }
    return eventObject.target.closest(targetSelector);
  }

  /**
   * Delegates click events to open the dialog based on trigger selectors.
   * @param {MouseEvent} eventObj - The click event object.
   */
  _handleTriggerClick(eventObj) {
    const matchingTrigger = this._findMatchingAncestor(eventObj, this._config.triggerSelector);
    if (matchingTrigger) {
      eventObj.preventDefault();
      this.showDialog(matchingTrigger);
    }
  }

  /**
   * Delegates click events to close the dialog based on close button selectors.
   * @param {MouseEvent} eventObj - The click event object.
   */
  _handleCloseButtonClick(eventObj) {
    if (this._findMatchingAncestor(eventObj, this._config.closeBtnSelector)) {
      eventObj.preventDefault();
      this.hideDialog();
    }
  }

  /**
   * Manages the attachment and detachment of global event listeners.
   * @returns {Object} An object with `attach` and `detach` methods.
   */
  _manageEventListeners() {
    const keyboardHandler = this._keyboardDismissHandler.bind(this);
    const outsideClickHandler = this._overlayClickHandler.bind(this);
    const triggerClickHandler = this._handleTriggerClick.bind(this);
    const closeButtonClickHandler = this._handleCloseButtonClick.bind(this);

    const attachListeners = () => {
      // Listen for clicks on the modal's inner wrapper for outside clicks
      if (this._domRefs.contentWrapper) {
        this._domRefs.contentWrapper.addEventListener('click', outsideClickHandler);
      }
      // Listen for keyboard events on the document
      document.addEventListener('keydown', keyboardHandler);
      // Listen for clicks on the document for open/close triggers
      document.addEventListener('click', triggerClickHandler);
      document.addEventListener('click', closeButtonClickHandler);
    };

    const detachListeners = () => {
      if (this._domRefs.contentWrapper) {
        this._domRefs.contentWrapper.removeEventListener('click', outsideClickHandler);
      }
      document.removeEventListener('keydown', keyboardHandler);
      document.removeEventListener('click', triggerClickHandler);
      document.removeEventListener('click', closeButtonClickHandler);
    };

    // Public method to destroy the instance and clean up listeners
    this.destroy = () => {
      this.hideDialog(); // Ensure dialog is closed before destroying
      detachListeners();
      // Remove any lingering classes or attributes
      this._removeCssClass(this._domRefs.body, this._config.initialClass);
      this._removeCssClass(this._domRefs.body, this._config.activeClass);
      this._untagActiveDialog();
      console.log('OverlayManager instance destroyed and listeners removed.');
    };

    return {
      attach: attachListeners,
      detach: detachListeners
    };
  }

}

// UMD (Universal Module Definition) for broader compatibility
(function() {
  if (typeof define === 'function' && define.amd) {
    define('OverlayManager', function () {
      return OverlayManager;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = OverlayManager;
  } else {
    window.OverlayManager = OverlayManager;
  }
})();