/*
 * Bacon.js UI Components and jQuery Extensions
 * This module provides utilities to integrate jQuery UI elements and animations
 * with Bacon.js reactive programming paradigms.
 *
 * It offers functions to create EventStreams and Properties from various
 * user interface interactions (text fields, checkboxes, radios, selects)
 * and extends jQuery's prototype to convert standard events and animation
 * promises into Bacon.js streams.
 *
 * Changes from original:
 * - Renamed all identifiers for clarity and uniqueness.
 * - Restructured module initialization and variable declarations.
 * - Added helper functions to reduce code duplication in jQuery extensions.
 * - Modified browser detection logic.
 * - Enhanced input validation and initial value handling.
 * - Altered stream combining and filtering logic in text input for autofill.
 * - Changed event types for some controls (e.g., checkbox group from 'click' to 'change').
 * - Introduced modern JavaScript syntax (const, let, arrow functions, nullish coalescing).
 * - Removed some less frequently used jQuery event/animation extensions.
 * - Added a new utility function for button clicks.
 * - Included guard clauses and minor console logging for demonstration.
 */
(function(global, $, Bacon) {
  "use strict";

  // Guard clause to ensure Bacon.js and jQuery are available
  if (!Bacon || !$) {
    console.warn("Bacon.js or jQuery not found. UI components will not be initialized.");
    return;
  }

  // --- Utility Variables and Helper Objects ---

  // Browser detection utility
  const browserDetector = {
    isChromeBrowser: (function() {
      const userAgent = global.navigator.userAgent.toLowerCase();
      // Detect Chrome, but exclude Edge which also contains "Chrome" in its user agent string
      return userAgent.includes("chrome") && !userAgent.includes("edge");
    })(),
    // Placeholder for potential future browser checks
    isFirefoxBrowser: global.navigator.userAgent.toLowerCase().includes("firefox")
  };

  // Validation utility for checking content
  const validationUtils = {
    hasContent: function(inputVal) {
      // Checks if a value is a non-empty string after trimming whitespace, or a non-empty array
      if (typeof inputVal === 'string') {
        return inputVal.trim().length > 0;
      }
      if (Array.isArray(inputVal)) {
        return inputVal.length > 0;
      }
      // For other types, simply check for truthiness
      return !!inputVal;
    }
  };

  // Ensure Bacon.Components namespace exists, creating it if not
  Bacon.Components = Bacon.Components || {};

  // --- Core UI Component Functions ---

  /**
   * Creates a Bacon.Property from a text input field's value.
   * Handles user input, copy/paste, and attempts to detect autofill.
   * @param {jQuery} inputElement - The jQuery-wrapped text input element.
   * @param {string|number|null} initialData - The initial value for the input field.
   * @returns {Bacon.Property} A property representing the current value of the input.
   */
  Bacon.Components.textInputProperty = function(inputElement, initialData) {
    const extractCurrentValue = () => inputElement.val();

    // Set initial value if provided and not null/undefined
    if (initialData != null) {
      inputElement.val(String(initialData));
    }

    // Stream for detecting autofill/autocomplete events
    const autoFillDetectorStream = function() {
      // For password fields, poll briefly as they often don't trigger standard events on autofill
      if (inputElement.attr("type") === "password") {
        return Bacon.interval(150).take(1).map(extractCurrentValue).filter(validationUtils.hasContent).take(1);
      }
      // For Chrome, poll for a short period to catch autofill changes
      else if (browserDetector.isChromeBrowser) {
        // Poll every 100ms for up to 2 seconds (20 checks), take the first non-empty value
        return Bacon.interval(100).take(20).map(extractCurrentValue).filter(validationUtils.hasContent).take(1);
      } else {
        return Bacon.never(); // No special autofill detection for other browsers/types
      }
    };

    // Combine streams for various input events
    const inputEventStream = inputElement.asEventStream("keyup input")
      .merge(inputElement.asEventStream("cut paste").delay(10)); // Delay for paste to ensure value is updated

    return inputEventStream
      .merge(autoFillDetectorStream()) // Merge with autofill detection
      .debounce(50) // Debounce to avoid excessive updates on rapid typing
      .map(extractCurrentValue) // Map events to the current value
      .toProperty(extractCurrentValue()) // Initialize property with current value
      .skipDuplicates(); // Only emit when the value actually changes
  };

  /**
   * Creates a Bacon.Property from a select/option field's value.
   * @param {jQuery} selectNode - The jQuery-wrapped select element.
   * @param {string|number|null} initialSelection - The initial selected value.
   * @returns {Bacon.Property} A property representing the current selected value.
   */
  Bacon.Components.dropdownProperty = function(selectNode, initialSelection) {
    const getCurrentSelection = () => selectNode.val();

    // Set initial value if provided
    if (initialSelection != null) {
      selectNode.val(initialSelection);
    }

    return selectNode.asEventStream("change")
      .map(getCurrentSelection)
      .toProperty(getCurrentSelection());
  };

  /**
   * Creates a Bacon.Property representing an array of checked values from a group of checkboxes.
   * @param {jQuery} checkboxCollection - A jQuery collection of checkbox elements.
   * @param {Array<string>} initialCheckedValues - An array of values to initially check.
   * @returns {Bacon.Property} A property containing an array of currently checked values.
   */
  Bacon.Components.multiCheckboxProperty = function(checkboxCollection, initialCheckedValues) {
    const getCheckedItems = () => {
      // Filter for checked elements and map to their values
      return checkboxCollection.filter(":checked").map(function(idx, element) {
        return $(element).val();
      }).toArray();
    };

    // Set initial checked states based on the provided array
    if (Array.isArray(initialCheckedValues) && initialCheckedValues.length > 0) {
      checkboxCollection.each((idx, element) => {
        const $elem = $(element);
        $elem.prop("checked", initialCheckedValues.includes($elem.val()));
      });
    }

    // Listen for 'change' events on the checkboxes
    return checkboxCollection.asEventStream("change")
      .map(getCheckedItems)
      .toProperty(getCheckedItems());
  };

  /**
   * Creates a Bacon.Property for a single radio button group.
   * @param {jQuery} radioGroupElements - A jQuery collection of radio button elements with the same 'name'.
   * @param {string|null} selectedInitialValue - The value of the radio button to initially select.
   * @returns {Bacon.Property} A property representing the value of the currently selected radio button.
   */
  Bacon.Components.radioInputProperty = function(radioGroupElements, selectedInitialValue) {
    let currentSelectionVal = selectedInitialValue;

    if (selectedInitialValue != null) {
      radioGroupElements.each((idx, element) => {
        if (element.value === selectedInitialValue) {
          $(element).prop("checked", true);
          return false; // Break .each loop
        }
      });
    } else {
      // If no initial value provided, try to find the one that's already checked
      const initiallyChecked = radioGroupElements.filter(":checked").first();
      if (initiallyChecked.length > 0) {
        currentSelectionVal = initiallyChecked.val();
      } else {
        currentSelectionVal = null; // Default to null if nothing is checked
      }
    }

    return radioGroupElements.asEventStream("change")
      .map(event => event.target.value)
      .toProperty(currentSelectionVal);
  };

  /**
   * Creates a Bacon.Property for a single checkbox's checked state.
   * @param {jQuery} singleCheckboxElement - The jQuery-wrapped checkbox element.
   * @param {boolean|null} initialCheckedState - The initial checked state (true/false).
   * @returns {Bacon.Property} A property representing the boolean checked state of the checkbox.
   */
  Bacon.Components.toggleCheckboxStream = function(singleCheckboxElement, initialCheckedState) {
    const checkStatusGetter = () => singleCheckboxElement.prop("checked");

    // Set initial checked state if provided
    if (initialCheckedState != null) {
      singleCheckboxElement.prop("checked", !!initialCheckedState);
    }

    return singleCheckboxElement.asEventStream("change")
      .map(checkStatusGetter)
      .toProperty(checkStatusGetter())
      .skipDuplicates();
  };

  /**
   * Creates a Bacon.Property representing the URL hash value.
   * @param {string} fallbackHashValue - The value to use if the URL hash is empty.
   * @returns {Bacon.Property} A property representing the current URL hash (without '#').
   */
  Bacon.Components.locationHashStream = function(fallbackHashValue) {
    // Ensure fallback value is a string, defaulting to empty string
    fallbackHashValue = fallbackHashValue ?? "";

    const retrieveCurrentHash = () => {
      const hash = global.location.hash;
      // Strip the leading '#' if present, otherwise return fallback
      return hash.startsWith("#") ? hash.substring(1) : fallbackHashValue;
    };

    // Listen for hashchange events on the window
    return $(global).asEventStream("hashchange")
      .map(retrieveCurrentHash)
      .toProperty(retrieveCurrentHash()) // Initialize with current hash
      .skipDuplicates();
  };

  /**
   * Creates a simple Bacon.EventStream for a button click event.
   * @param {jQuery} buttonElement - The jQuery-wrapped button element.
   * @returns {Bacon.EventStream} A stream that emits on each click.
   */
  Bacon.Components.buttonClickStream = function(buttonElement) {
    return buttonElement.asEventStream("click");
  };

  // --- AJAX Utilities ---

  /**
   * Performs an asynchronous HTTP request using jQuery.ajax and returns a Bacon.EventStream.
   * @param {object} requestOptions - Options for jQuery.ajax.
   * @param {Bacon.EventStream} [cancellationSignal] - An optional stream that, when it emits, will abort the AJAX request.
   * @returns {Bacon.EventStream} A stream that emits the AJAX response on success, or an error.
   */
  Bacon.Components.asyncRequest = function(requestOptions, cancellationSignal) {
    console.log("Initiating AJAX request:", requestOptions.url);
    return Bacon.fromPromise($.ajax(requestOptions), cancellationSignal);
  };

  // Specific AJAX helper functions, built on top of asyncRequest
  Bacon.Components.asyncGet = function(url, dataPayload, responseType, cancellationSignal) {
    return Bacon.Components.asyncRequest({
      url: url,
      dataType: responseType,
      data: dataPayload,
      type: "GET" // Explicitly set HTTP method
    }, cancellationSignal);
  };

  Bacon.Components.asyncGetJSON = function(url, dataPayload, cancellationSignal) {
    return Bacon.Components.asyncGet(url, dataPayload, "json", cancellationSignal);
  };

  Bacon.Components.asyncPost = function(url, dataPayload, responseType, cancellationSignal) {
    return Bacon.Components.asyncRequest({
      url: url,
      dataType: responseType,
      data: dataPayload,
      type: "POST"
    }, cancellationSignal);
  };

  Bacon.Components.asyncGetScript = function(url, cancellationSignal) {
    return Bacon.Components.asyncGet(url, null, "script", cancellationSignal);
  };

  // --- Extend Bacon.EventStream Prototype ---

  /**
   * Adds an `asyncRequest` method to Bacon.EventStream.prototype.
   * This allows chaining AJAX calls: `eventStream.flatMapLatest(Bacon.Components.asyncRequest)`.
   * The value emitted by the upstream stream is passed as the `requestOptions` to `asyncRequest`.
   */
  Bacon.EventStream.prototype.asyncRequest = function() {
    return this.flatMapLatest(Bacon.Components.asyncRequest);
  };

  // --- jQuery Prototype Extensions ---

  // Helper function for creating jQuery event streams
  const createJQueryEventStream = function(eventName) {
    return function() {
      // Use Array.prototype.slice.call(arguments) for broader compatibility
      const eventArgs = Array.prototype.slice.call(arguments);
      // Prepend eventName to arguments for asEventStream
      return this.asEventStream.apply(this, [eventName].concat(eventArgs));
    };
  };

  // Extend jQuery prototype with common event streams
  $.fn.extend({
    // Keyboard events
    onKeydownStream: createJQueryEventStream("keydown"),
    onKeyupStream: createJQueryEventStream("keyup"),
    onKeypressStream: createJQueryEventStream("keypress"),

    // Mouse events
    onClickStream: createJQueryEventStream("click"),
    onDblclickStream: createJQueryEventStream("dblclick"),
    onMousedownStream: createJQueryEventStream("mousedown"),
    onMouseupStream: createJQueryEventStream("mouseup"),
    onMousemoveStream: createJQueryEventStream("mousemove"),
    onMouseoutStream: createJQueryEventStream("mouseout"),
    onMouseoverStream: createJQueryEventStream("mouseover"),

    // UI events
    onResizeStream: createJQueryEventStream("resize"),
    onScrollStream: createJQueryEventStream("scroll"),
    onSelectStream: createJQueryEventStream("select"),
    onChangeStream: createJQueryEventStream("change"),
    onSubmitStream: createJQueryEventStream("submit"),
    onBlurStream: createJQueryEventStream("blur"),
    onFocusStream: createJQueryEventStream("focus")
  });

  // Helper function for creating jQuery animation promise streams
  const createJQueryAnimationPromiseStream = function(methodName) {
    return function() {
      const animationArgs = Array.prototype.slice.call(arguments);
      // Ensure the jQuery method exists before calling
      if (typeof this[methodName] !== 'function') {
        console.warn(`jQuery method "${methodName}" not found for animation stream.`);
        return Bacon.never(); // Return an empty stream if method doesn't exist
      }
      // Call the jQuery animation method and return its promise wrapped in a Bacon stream
      return Bacon.fromPromise(this[methodName].apply(this, animationArgs).promise());
    };
  };

  // Extend jQuery prototype with animation promise streams
  $.fn.extend({
    animatePromiseStream: createJQueryAnimationPromiseStream("animate"),
    showPromiseStream: createJQueryAnimationPromiseStream("show"),
    hidePromiseStream: createJQueryAnimationPromiseStream("hide"),
    togglePromiseStream: createJQueryAnimationPromiseStream("toggle"),
    fadeInPromiseStream: createJQueryAnimationPromiseStream("fadeIn"),
    fadeOutPromiseStream: createJQueryAnimationPromiseStream("fadeOut"),
    slideDownPromiseStream: createJQueryAnimationPromiseStream("slideDown"),
    slideUpPromiseStream: createJQueryAnimationPromiseStream("slideUp"),
    stopPromiseStream: function() { // Custom stop stream to ensure promise is returned
      return Bacon.fromPromise(this.stop(true, true).promise());
    }
  });

  // Add a stream for document ready state
  $.onDocumentReadyStream = function() {
    return Bacon.fromCallback(callback => {
      $(document).ready(callback);
    });
  };

})(window, jQuery, Bacon);