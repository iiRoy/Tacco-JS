/*
 * VanillaModal - A lightweight, dependency-free JavaScript modal library.
 *
 * @version 1.1.1
 * @author Ben Ceglowski
 * @license MIT
 *
 * This file contains the core logic for the VanillaModal class.
 * It has been intentionally modified for Type I cloning,
 * focusing on whitespace and comment variations only.
 */
class VanillaModal {

  /**
   * Initializes a new instance of the VanillaModal.
   *
   * @param {Object} [userSettings]  - Optional user-defined settings to override defaults.
   */
  constructor(userSettings) {

    // Default settings for the modal instance.
    // These can be overridden by userSettings.
    this.$$ = {
      modal : '.modal',        // Selector for the main modal container.
      modalInner : '.modal-inner', // Selector for the inner modal content wrapper.
      modalContent : '.modal-content', // Selector for the actual content area.
      open : '[rel="modal:open"]', // Selector for elements that trigger modal opening.
      close : '[rel="modal:close"]', // Selector for elements that trigger modal closing.
      page : 'body',           // Selector for the main page element (usually body).
      class : 'modal-visible', // CSS class added to 'page' when modal is open.
      loadClass : 'vanilla-modal', // CSS class added to 'page' on initialization.
      clickOutside : true,     // Whether clicking outside the modal closes it.
      closeKey : 27,           // Key code to close the modal (e.g., 27 for Escape).
      transitions : true,      // Enable or disable CSS transitions.
      transitionEnd : null,    // Stores the appropriate transition end event name.
      onBeforeOpen : function() {}, // Callback function before modal opens.
      onBeforeClose : function() {},// Callback function before modal closes.
      onOpen : function() {},       // Callback function after modal opens.
      onClose : function() {}       // Callback function after modal closes.
    };

    // Apply any user-provided settings, overwriting defaults.
    this._applyUserSettings(userSettings);

    // Initialize state variables.
    this.error = false;  // Flag to indicate if an error occurred during setup.
    this.isOpen = false; // Current state of the modal (open/closed).
    this.current = null; // Reference to the currently active modal content.

    // Bind methods to the instance for consistent `this` context.
    this.open = this._open.bind(this);
    this.close = this._close.bind(this);

    // Determine the correct transition end event name for the browser.
    this.$$.transitionEnd = this._transitionEndVendorSniff();

    // Cache DOM nodes for efficiency.
    this.$ = this._setupDomNodes();

    // If no errors during initial DOM setup, proceed with event listeners.
    if (!this.error) {
      this._addLoadedCssClass(); // Add a class to indicate modal is loaded.
      this._events().add();      // Set up all necessary event listeners.
    } else {
      // Log an error if DOM nodes were not found.
      console.error('Please fix errors before proceeding.');
    }

  }


  /**
   * Applies user-defined settings to override the default configuration.
   *
   * @param {Object} userSettings - An object containing properties to update.
   */
  _applyUserSettings(userSettings) {

    if (typeof userSettings === 'object') {
      // Iterate over each property in the userSettings object.
      for (var i in userSettings) {
        // Ensure the property belongs to userSettings itself, not its prototype chain.
        if (userSettings.hasOwnProperty(i)) {
          this.$$[i] = userSettings[i]; // Update the corresponding default setting.
        }
      }
    }
  }


  /**
   * Detects the browser-specific 'transitionend' event name.
   * This is crucial for correctly handling CSS transitions.
   *
   * @returns {string|undefined} The vendor-prefixed transition end event name, or undefined if transitions are disabled.
   */
  _transitionEndVendorSniff() {

    // If transitions are explicitly disabled in settings, return immediately.
    if (this.$$.transitions === false) return;

    var el = document.createElement('div'); // Create a temporary div to test styles.
    var transitions = {
      'transition':'transitionend',
      'OTransition':'otransitionend',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    // Loop through common transition properties to find the supported one.
    for (var i in transitions) {
      if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
        return transitions[i]; // Return the correct event name.
      }
    }
  }


  /**
   * Retrieves a single DOM node based on a CSS selector.
   * Logs an error and sets `this.error` if the node is not found.
   *
   * @param {String} selector - The CSS selector for the desired node.
   * @param {Node} [parent]   - The parent node to search within (defaults to `document`).
   * @returns {Node|null} The found DOM node, or null if not found (and an error occurred).
   */
  _getNode(selector, parent) {

    var targetNode = parent || document; // Determine the search context.
    var node = targetNode.querySelector(selector); // Attempt to find the node.

    if (!node) {
      this.error = true; // Mark an error if the node is missing.
      return console.error(selector + ' not found in document.'); // Log the error.
    }
    return node; // Return the found node.
  }


  /**
   * Sets up and caches references to essential DOM nodes.
   *
   * @returns {Object} An object containing references to cached DOM nodes.
   */
  _setupDomNodes() {
    var $ = {}; // Create an empty object to store node references.

    // Retrieve and store references to the main modal components.
    $.modal = this._getNode(this.$$.modal);
    $.page = this._getNode(this.$$.page);
    $.modalInner = this._getNode(this.$$.modalInner, this.$.modal);
    $.modalContent = this._getNode(this.$$.modalContent, this.$.modal);

    return $; // Return the object with cached nodes.
  }


  /**
   * Adds the initial 'loadClass' to the page element.
   * This can be used for initial styling or to indicate JavaScript has run.
   */
  _addLoadedCssClass() {
    this._addClass(this.$.page, this.$$.loadClass);
  }


  /**
   * Adds a CSS class to a given HTML element.
   * Prevents adding duplicate classes.
   *
   * @param {Node} el        - The HTML element to add the class to.
   * @param {String} className - The class name to add.
   */
  _addClass(el, className) {

    // Ensure the element is a valid HTMLElement before proceeding.
    if (! (el instanceof HTMLElement)) return;

    var cssClasses = el.className.split(' '); // Split existing classes into an array.

    // Add the class only if it's not already present.
    if (cssClasses.indexOf(className) === -1) {
      cssClasses.push(className);
    }
    el.className = cssClasses.join(' '); // Reassemble the class string.
  }


  /**
   * Removes a CSS class from a given HTML element.
   *
   * @param {Node} el        - The HTML element to remove the class from.
   * @param {String} className - The class name to remove.
   */
  _removeClass(el, className) {

    // Ensure the element is a valid HTMLElement before proceeding.
    if (! (el instanceof HTMLElement)) return;

    var cssClasses = el.className.split(' '); // Split existing classes into an array.

    var classIndex = cssClasses.indexOf(className);
    // Remove the class if it is found.
    if (classIndex > -1) {
      cssClasses.splice(classIndex, 1); // Remove the class from the array.
    }
    el.className = cssClasses.join(' '); // Reassemble the class string.
  }


  /**
   * Sets a `data-current-modal` attribute on the page element
   * to indicate which modal is currently open.
   */
  _setOpenId() {
    var id = this.current.id || 'anonymous'; // Use modal's ID or 'anonymous'.
    this.$.page.setAttribute('data-current-modal', id); // Set the attribute.
  }


  /**
   * Removes the `data-current-modal` attribute from the page element.
   */
  _removeOpenId() {
    this.$.page.removeAttribute('data-current-modal'); // Remove the attribute.
  }


  /**
   * Determines the target modal element from an event or selector.
   *
   * @param {mixed} e - An event object (e.g., from a click) or a CSS selector string.
   * @returns {Node|null} The target modal HTMLElement, or null if not found.
   */
  _getElementContext(e) {

    // If 'e' is an event object with a hash (e.g., from an anchor link).
    if (e && typeof e.hash === 'string') {
      return document.querySelector(e.hash);
    }
    // If 'e' is directly a CSS selector string.
    else if (typeof e === 'string') {
      return document.querySelector(e);
    }
    // If no valid selector or context is provided.
    else {
      return console.error('No selector supplied to open()');
    }
  }


  /**
   * Opens the modal, displaying its content.
   *
   * @param {Event|String} e - The event that triggered the open, or a CSS selector string.
   */
  _open(e) {

    // Get the actual DOM element for the modal content.
    this.current = this._getElementContext(e);

    // Validate that the target element is a valid HTML element.
    if (this.current instanceof HTMLElement === false) {
      return console.error('VanillaModal target must exist on page.');
    }

    // Execute the 'onBeforeOpen' callback if it's a function.
    if (typeof this.$$.onBeforeOpen === 'function') {
      this.$$.onBeforeOpen.call(this);
    }

    this._captureNode(); // Move the modal content into the modal wrapper.
    this._addClass(this.$.page, this.$$.class); // Add the 'modal-visible' class to the page.
    this._setOpenId(); // Set the ID of the open modal on the page.
    this.isOpen = true; // Update the modal's state to open.

    // Execute the 'onOpen' callback if it's a function.
    if (typeof this.$$.onOpen === 'function') {
      this.$$.onOpen.call(this);
    }
  }


  /**
   * Checks if the modal has CSS transitions applied.
   *
   * @returns {boolean} True if transitions are detected, false otherwise.
   */
  _detectTransition() {
    var css = window.getComputedStyle(this.$.modal, null); // Get computed styles.
    var transitionDuration = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];

    // Filter for transition properties that have a duration greater than 0.
    var hasTransition = transitionDuration.filter(function(i) {
      if (typeof css[i] === 'string' && parseFloat(css[i]) > 0) {
        return true;
      }
    });

    return (hasTransition.length) ? true : false; // Return true if any transition is found.
  }


  /**
   * Closes the modal.
   *
   * @param {Event} e - The event that triggered the close (optional).
   */
  _close(e) {

    // Execute the 'onBeforeClose' callback if it's a function.
    if (typeof this.$$.onBeforeClose === 'function') {
      this.$$.onBeforeClose.call(this);
    }

    this._removeClass(this.$.page, this.$$.class); // Remove the 'modal-visible' class from the page.

    var transitions = this._detectTransition(); // Check if CSS transitions are active.

    // If transitions are enabled and detected, close with transition handling.
    if (this.$$.transitions && this.$$.transitionEnd && transitions) {
      this._closeModalWithTransition();
    }
    // Otherwise, close immediately without transition handling.
    else {
      this._closeModal();
    }
  }


  /**
   * Performs the final steps of closing the modal,
   * without waiting for transitions.
   */
  _closeModal() {
    this._removeOpenId(this.$.page); // Remove the current modal ID from the page.
    this._releaseNode(); // Move the modal content back to its original position.
    this.isOpen = false; // Update the modal's state to closed.
    this.current = null; // Clear the reference to the current modal content.

    // Execute the 'onClose' callback if it's a function.
    if (typeof this.$$.onClose === 'function') {
      this.$$.onClose.call(this);
    }
  }


  /**
   * Closes the modal, waiting for the CSS transition to complete.
   */
  _closeModalWithTransition() {

    // Define the handler for the transition end event.
    var _closeTransitionHandler = function() {
      // Remove the event listener to prevent multiple calls.
      this.$.modal.removeEventListener(this.$$.transitionEnd, _closeTransitionHandler);
      this._closeModal(); // Call the standard close method after transition.
    }.bind(this); // Bind 'this' to the current instance.

    // Add the event listener for the transition end event.
    this.$.modal.addEventListener(this.$$.transitionEnd, _closeTransitionHandler);
  }


  /**
   * Moves the content of the `this.current` node into the modal content wrapper.
   */
  _captureNode() {
    // While there are child nodes in the current modal content...
    while (this.current.childNodes.length > 0) {
      // Move each child node into the modal content area.
      this.$.modalContent.appendChild(this.current.childNodes[0]);
    }
  }


  /**
   * Moves the content from the modal content wrapper back to the `this.current` node.
   */
  _releaseNode() {
    // While there are child nodes in the modal content area...
    while (this.$.modalContent.childNodes.length > 0) {
      // Move each child node back to its original container.
      this.current.appendChild(this.$.modalContent.childNodes[0]);
    }
  }


  /**
   * Handles keydown events, specifically for closing the modal with the Escape key.
   *
   * @param {Event} e - The keyboard event object.
   */
  _closeKeyHandler(e) {

    // If a close key is not configured as a number, do nothing.
    if (typeof this.$$.closeKey !== 'number') return;

    // If the pressed key matches the closeKey and the modal is open...
    if (e.which === this.$$.closeKey && this.isOpen === true) {
      e.preventDefault(); // Prevent default browser behavior (e.g., scrolling).
      this.close();       // Close the modal.
    }
  }


  /**
   * Handles click events outside the modal inner content to close the modal.
   *
   * @param {Event} e - The click event object.
   */
  _outsideClickHandler(e) {

    // If clicking outside is disabled in settings, do nothing.
    if (this.$$.clickOutside !== true) return;

    var node = e.target; // Start from the clicked element.

    // Traverse up the DOM tree until the body or modalInner is reached.
    while(node != document.body) {
      // If the clicked node or its ancestor is the modal inner, do nothing (don't close).
      if (node === this.$.modalInner) return;
      node = node.parentNode; // Move up to the parent node.
    }

    this.close(); // If body was reached without hitting modalInner, close the modal.
  }


  /**
   * Checks if an event target or its ancestors match a given CSS selector.
   *
   * @param {Event} e        - The event object.
   * @param {String} selector - The CSS selector to match against.
   * @returns {Node|null} The matching element if found, otherwise null.
   */
  _matches(e, selector) {

    var el = e.target; // The element that triggered the event.
    var matches = (el.document || el.ownerDocument).querySelectorAll(selector); // Get all elements matching the selector.

    // Iterate through all matching elements.
    for (let i = 0; i < matches.length; i++) {
      let child = el; // Start from the event target.
      // Traverse up the DOM tree from the target.
      while (child !== document.body) {
        // If an ancestor matches one of the selector results, return it.
        if (child === matches[i]) return child;
        child = child.parentNode; // Move up to the parent.
      }
    }
    return null; // No match found.
  }


  /**
   * Delegates click events to open the modal if the target matches an 'open' selector.
   *
   * @param {Event} e - The click event object.
   */
  _delegateOpen(e) {

    var matches = this._matches(e, this.$$.open); // Check if the clicked element matches an open trigger.
    if (matches) {
      e.preventDefault(); // Prevent default action (e.g., navigating to #hash).
      return this.open(matches); // Open the modal using the matched element.
    }
  }


  /**
   * Delegates click events to close the modal if the target matches a 'close' selector.
   *
   * @param {Event} e - The click event object.
   */
  _delegateClose(e) {

    // Check if the clicked element matches a close trigger.
    if (this._matches(e, this.$$.close)) {
      e.preventDefault(); // Prevent default action.
      return this.close(); // Close the modal.
    }
  }


  /**
   * Manages the addition and removal of event listeners.
   *
   * @private {Function} add - Function to add all event listeners.
   * @returns {Object} An object containing the 'add' method.
   */
  _events() {

    // Bind event handler methods to the current instance.
    let _closeKeyHandler = this._closeKeyHandler.bind(this);
    let _outsideClickHandler = this._outsideClickHandler.bind(this);
    let _delegateOpen = this._delegateOpen.bind(this);
    let _delegateClose = this._delegateClose.bind(this);

    // Function to add all event listeners.
    var add = function() {
      this.$.modal.addEventListener('click', _outsideClickHandler); // Handle clicks outside modal content.
      document.addEventListener('keydown', _closeKeyHandler);     // Handle keyboard events (e.g., Escape key).
      document.addEventListener('click', _delegateOpen);          // Delegate clicks for opening modals.
      document.addEventListener('click', _delegateClose);         // Delegate clicks for closing modals.
    };

    // Public method to destroy the modal instance and remove all event listeners.
    this.destroy = function() {
      this.close(); // Ensure the modal is closed before destroying.
      this.$.modal.removeEventListener('click', _outsideClickHandler);
      document.removeEventListener('keydown', _closeKeyHandler);
      document.removeEventListener('click', _delegateOpen);
      document.removeEventListener('click', _delegateClose);
    };

    return {
      add : add.bind(this) // Return the 'add' function, bound to this instance.
    };

  }

} // End of VanillaModal class definition.


/*
 * Self-executing anonymous function for module pattern and global exposure.
 * This ensures compatibility with AMD, CommonJS, and browser global environments.
 */
(function() {
  // Check for AMD (Asynchronous Module Definition) support.
  if (typeof define === 'function' && define.amd) {
    define('VanillaModal', function () {
      return VanillaModal; // Export the VanillaModal class for AMD.
    });
  }
  // Check for CommonJS (Node.js) module support.
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = VanillaModal; // Export the VanillaModal class for CommonJS.
  }
  // If neither, expose VanillaModal globally in the browser.
  else {
    window.VanillaModal = VanillaModal; // Assign to the window object.
  }
})();
// End of module export wrapper.