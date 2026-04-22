/**
 * @class SimpleOverlay
 * @version 2.0.0
 * @author New Dev
 */
class SimpleOverlay {
  
  /**
   * Initializes a new overlay instance.
   * @param {Object} [configOptions] - User-defined settings.
   */
  constructor(configOptions) {
    
    // Default internal configuration parameters.
    this.opts = {
      mainDialog : '.dialog-box',
      dialogWrapper : '.dialog-content-area',
      dialogBody : '.dialog-body-section',
      triggerOpen : '[data-action="show-overlay"]',
      triggerClose : '[data-action="hide-overlay"]',
      documentBody : 'body',
      activeClass : 'overlay-active',
      initClass : 'simple-overlay-loaded',
      closeOnOuterClick : true,
      escapeKey : 27,
      useTransitions : true,
      transitionEventName : null,
      beforeShowCallback : function() {},
      beforeHideCallback : function() {},
      onShowCallback : function() {},
      onHideCallback : function() {}
    };
    
    // Apply any provided user options.
    this.configureSettings(configOptions);
    this.hasError = false;
    this.isDisplayed = false;
    this.activeElement = null;
    
    // Bind public methods to the instance.
    this.show = this.displayOverlay.bind(this);
    this.hide = this.concealOverlay.bind(this);
    
    // Detect the appropriate transition end event name.
    this.opts.transitionEventName = this.detectTransitionEvent();
    
    // Set up references to key DOM elements.
    this.domRefs = this.initializeDomElements();
    
    // Proceed if no errors were found during DOM setup.
    if (!this.hasError) {
      this.addInitializationClass();
      this.setupEventListeners().attach();
    } else {
      console.error('Configuration issues detected. Please resolve them.');
    }
    
  }
  
  /**
   * Merges user options with default settings.
   * @param {Object} userOptions - Custom settings object.
   */
  configureSettings(userOptions) {
    if (typeof userOptions === 'object' && userOptions !== null) {
      for (let key in userOptions) {
        if (userOptions.hasOwnProperty(key)) {
          this.opts[key] = userOptions[key];
        }
      }
    }
  }
  
  /**
   * Determines the correct browser-specific transition end event name.
   * @returns {string|undefined} The name of the transition end event or undefined if transitions are disabled.
   */
  detectTransitionEvent() {
    if (this.opts.useTransitions === false) return;
    
    const tempElement = document.createElement('div');
    const transitionPrefixes = {
      'transition':'transitionend',
      'OTransition':'otransitionend',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };
    
    for (let prefix in transitionPrefixes) {
      if (transitionPrefixes.hasOwnProperty(prefix) && tempElement.style[prefix] !== undefined) {
        return transitionPrefixes[prefix];
      }
    }
  }
  
  /**
   * Retrieves a single DOM element based on a CSS selector.
   * Logs an error if the element is not found.
   * @param {String} cssSelector - The CSS selector string.
   * @param {Node} [parentNode] - The parent node to search within. Defaults to `document`.
   * @returns {Node|null} The found DOM node or null if not found.
   */
  getDomElement(cssSelector, parentNode) {
    const searchContext = parentNode || document;
    const foundElement = searchContext.querySelector(cssSelector);
    
    if (!foundElement) {
      this.hasError = true;
      return console.error(`Element matching "${cssSelector}" not found.`);
    }
    return foundElement;
  }
  
  /**
   * Gathers and stores references to essential DOM nodes.
   * @returns {Object} An object containing references to DOM elements.
   */
  initializeDomElements() {
    const elements = {};
    elements.mainOverlay = this.getDomElement(this.opts.mainDialog);
    elements.pageBody = this.getDomElement(this.opts.documentBody);
    elements.innerContainer = this.getDomElement(this.opts.dialogWrapper, elements.mainOverlay);
    elements.contentContainer = this.getDomElement(this.opts.dialogBody, elements.mainOverlay);
    return elements;
  }
  
  /**
   * Adds the initial loaded CSS class to the body.
   */
  addInitializationClass() {
    this.applyClass(this.domRefs.pageBody, this.opts.initClass);
  }
  
  /**
   * Adds a CSS class to a specified HTML element.
   * @param {HTMLElement} element - The target HTML element.
   * @param {String} styleClass - The class name to add.
   */
  applyClass(element, styleClass) {
    if (!(element instanceof HTMLElement)) return;
    
    let currentClasses = element.className.split(' ');
    if (currentClasses.indexOf(styleClass) === -1) {
      currentClasses.push(styleClass);
    }
    element.className = currentClasses.join(' ');
  }
  
  /**
   * Removes a CSS class from a specified HTML element.
   * @param {HTMLElement} element - The target HTML element.
   * @param {String} styleClass - The class name to remove.
   */
  removeClass(element, styleClass) {
    if (!(element instanceof HTMLElement)) return;
    
    let existingClasses = element.className.split(' ');
    if (existingClasses.indexOf(styleClass) > -1) {
      existingClasses.splice(existingClasses.indexOf(styleClass), 1);
    }
    element.className = existingClasses.join(' ');
  }
  
  /**
   * Sets a data attribute on the page body to identify the currently open overlay.
   */
  setOverlayIdentifier() {
    const identifier = this.activeElement.id || 'unnamed-overlay';
    this.domRefs.pageBody.setAttribute('data-current-overlay', identifier);
  }
  
  /**
   * Removes the data attribute identifying the current overlay from the page body.
   */
  removeOverlayIdentifier() {
    this.domRefs.pageBody.removeAttribute('data-current-overlay');
  }
  
  /**
   * Resolves the target HTML element to be displayed in the overlay.
   * @param {Event|String} eventOrSelector - An event object or a CSS selector string.
   * @returns {HTMLElement|null} The resolved HTML element or null if invalid.
   */
  resolveTargetElement(eventOrSelector) {
    if (eventOrSelector && typeof eventOrSelector.hash === 'string') {
      return document.querySelector(eventOrSelector.hash);
    } else if (typeof eventOrSelector === 'string') {
      return document.querySelector(eventOrSelector);
    } else {
      return console.error('No valid selector or event provided to display method.');
    }
  }
  
  /**
   * Displays the overlay.
   * @param {Event|String} eventOrTarget - Event object or selector string for the content to display.
   */
  displayOverlay(eventOrTarget) {
    this.activeElement = this.resolveTargetElement(eventOrTarget);
    
    if (!(this.activeElement instanceof HTMLElement)) {
        return console.error('Overlay target must be a valid HTML element.');
    }
    
    if (typeof this.opts.beforeShowCallback === 'function') {
      this.opts.beforeShowCallback.call(this);
    }
    
    this.transferContentToOverlay();
    this.applyClass(this.domRefs.pageBody, this.opts.activeClass);
    this.setOverlayIdentifier();
    this.isDisplayed = true;
    
    if (typeof this.opts.onShowCallback === 'function') {
      this.opts.onShowCallback.call(this);
    }
  }
  
  /**
   * Checks if CSS transitions are applied to the main overlay element.
   * @returns {boolean} True if transitions are detected, false otherwise.
   */
  checkForCssTransitions() {
    const computedStyles = window.getComputedStyle(this.domRefs.mainOverlay, null);
    const durationProperties = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];
    
    const transitionDetected = durationProperties.filter(property => {
      if (typeof computedStyles[property] === 'string' && parseFloat(computedStyles[property]) > 0) {
        return true;
      }
    });
    
    return (transitionDetected.length > 0);
  }
    
  /**
   * Hides the currently displayed overlay.
   * @param {Event} [eventObject] - The event that triggered the hide action.
   */
  concealOverlay(eventObject) {
    if (typeof this.opts.beforeHideCallback === 'function') {
      this.opts.beforeHideCallback.call(this);
    }
    
    this.removeClass(this.domRefs.pageBody, this.opts.activeClass);
    const hasCssTransitions = this.checkForCssTransitions();
    
    if (this.opts.useTransitions && this.opts.transitionEventName && hasCssTransitions) {
      this.concealOverlayWithTransition();
    } else {
      this.concealOverlayImmediately();
    }
  }
  
  /**
   * Hides the overlay without waiting for a transition to complete.
   */
  concealOverlayImmediately() {
    this.removeOverlayIdentifier();
    this.restoreContentFromOverlay();
    this.isDisplayed = false;
    this.activeElement = null;
    
    if (typeof this.opts.onHideCallback === 'function') {
      this.opts.onHideCallback.call(this);
    }
  }
  
  /**
   * Hides the overlay, waiting for the CSS transition to finish.
   */
  concealOverlayWithTransition() {
    const transitionEndHandler = () => {
      this.domRefs.mainOverlay.removeEventListener(this.opts.transitionEventName, transitionEndHandler);
      this.concealOverlayImmediately();
    };
    this.domRefs.mainOverlay.addEventListener(this.opts.transitionEventName, transitionEndHandler);
  }
  
  /**
   * Moves the content from the target element into the overlay's content area.
   */
  transferContentToOverlay() {
    while (this.activeElement.childNodes.length > 0) {
      this.domRefs.contentContainer.appendChild(this.activeElement.childNodes[0]);
    }
  }
  
  /**
   * Moves the content back from the overlay's content area to the original target element.
   */
  restoreContentFromOverlay() {
    while (this.domRefs.contentContainer.childNodes.length > 0) {
      this.activeElement.appendChild(this.domRefs.contentContainer.childNodes[0]);
    }
  }
  
  /**
   * Handles keyboard events, specifically the escape key for closing the overlay.
   * @param {KeyboardEvent} keyboardEvent - The keyboard event object.
   */
  handleEscapeKey(keyboardEvent) {
    if (typeof this.opts.escapeKey !== 'number') return;
    
    if (keyboardEvent.which === this.opts.escapeKey && this.isDisplayed === true) {
      keyboardEvent.preventDefault();
      this.hide();
    }
  }
  
  /**
   * Handles click events outside the inner overlay content to close it.
   * @param {MouseEvent} mouseEvent - The mouse event object.
   */
  handleOuterClick(mouseEvent) {
    if (this.opts.closeOnOuterClick !== true) return;
    
    let clickedElement = mouseEvent.target;
    while(clickedElement !== document.body) {
      if (clickedElement === this.domRefs.innerContainer) return;
      clickedElement = clickedElement.parentNode;
    }
    this.hide();
  }
  
  /**
   * Finds an ancestor element matching a given CSS selector.
   * @param {Event} eventObject - The event object.
   * @param {String} cssSelector - The CSS selector to match.
   * @returns {HTMLElement|null} The matching ancestor element or null.
   */
  findMatchingAncestor(eventObject, cssSelector) {
    let targetElement = eventObject.target;
    const potentialMatches = (targetElement.document || targetElement.ownerDocument).querySelectorAll(cssSelector);
    
    for (let i = 0; i < potentialMatches.length; i++) {
      let currentChild = targetElement;
      while (currentChild !== document.body) {
        if (currentChild === potentialMatches[i]) return currentChild;
        currentChild = currentChild.parentNode;
      }
    }
    return null;
  }
  
  /**
   * Delegates click events to open the overlay based on a selector.
   * @param {MouseEvent} eventObject - The mouse event object.
   */
  delegateOpenEvent(eventObject) {
    const matchedTrigger = this.findMatchingAncestor(eventObject, this.opts.triggerOpen);
    if (matchedTrigger) {
      eventObject.preventDefault();
      return this.show(matchedTrigger);
    }
  }
  
  /**
   * Delegates click events to close the overlay based on a selector.
   * @param {MouseEvent} eventObject - The mouse event object.
   */
  delegateCloseEvent(eventObject) {
    if (this.findMatchingAncestor(eventObject, this.opts.triggerClose)) {
      eventObject.preventDefault();
      return this.hide();
    }
  }
  
  /**
   * Manages the attachment and detachment of event listeners.
   * @private
   * @returns {Object} An object with methods to attach and detach listeners.
   */
  setupEventListeners() {
    
    const keyPressHandler = this.handleEscapeKey.bind(this);
    const clickOutsideHandler = this.handleOuterClick.bind(this);
    const delegatedOpen = this.delegateOpenEvent.bind(this);
    const delegatedClose = this.delegateCloseEvent.bind(this);
    
    const attachListeners = function() {
      this.domRefs.mainOverlay.addEventListener('click', clickOutsideHandler);
      document.addEventListener('keydown', keyPressHandler);
      document.addEventListener('click', delegatedOpen);
      document.addEventListener('click', delegatedClose);
    };
  
    // Public method to remove all event listeners and hide the overlay.
    this.cleanup = function() {
      this.hide();
      this.domRefs.mainOverlay.removeEventListener('click', clickOutsideHandler);
      document.removeEventListener('keydown', keyPressHandler);
      document.removeEventListener('click', delegatedOpen);
      document.removeEventListener('click', delegatedClose);
    };
    
    return {
      attach : attachListeners.bind(this)
    };
    
  }
   
}

// Module export for various environments (AMD, CommonJS, browser global).
(function() {
  if (typeof define === 'function' && define.amd) {
    define('SimpleOverlay', function () {
      return SimpleOverlay;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleOverlay;
  } else {
    window.SimpleOverlay = SimpleOverlay;
  }
})();