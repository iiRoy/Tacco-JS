"use strict";

(function ($, win, doc, nothing) {

  // Configuration for the Email Address Hinting component
  var suggestorName = "addrhint";
  var standardOptions = {
    hintClass: "eac-tip",
    emailHosts: [
      "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
      "icloud.com", "msn.com", "live.com", "verizon.net", "sbcglobal.net",
      "att.net", "comcast.net", "googlemail.com", "mac.com", "me.com",
      "yahoo.co.uk", "hotmail.co.uk", "facebook.com", "gmx.com", "protonmail.com"
    ],
    typingDelay: 200
  };

  /**
   * Core logic for the Email Address Hinting component.
   * Manages the input field, suggestion display, and auto-completion.
   * @param {HTMLElement} inputElement - The DOM element to enhance.
   * @param {Object} componentConfig - User-defined configuration settings.
   */
  function AddressHintProvider(inputElement, componentConfig) {
    // Ensure jQuery object for the input element
    this.targetInput = $(inputElement);
    // Merge default and user-provided configurations
    this.currentConfig = $.extend(true, {}, standardOptions, componentConfig);
    // Store original defaults for potential reset or reference
    this.baseConfig = standardOptions;
    // Cache the list of email domains
    this.hostList = this.currentConfig.emailHosts;

    // Internal state variables
    this.currentInputValue = "";
    this.currentHint = "";
    this.typingTimer = null; // For throttling

    // Initialize the component's UI and event listeners
    this.setupComponent();
  }

  // Prototype methods for the AddressHintProvider
  AddressHintProvider.prototype = {

    /**
     * Sets up the visual components and event handling for the input field.
     */
    setupComponent: function () {
      // Guard clause: ensure the target input is valid
      if (this.targetInput.length === 0) {
        console.warn("AddressHintProvider: Target input element not found.");
        return;
      }

      // Calculate horizontal padding/border for positioning
      this.inputHorizontalOffset = (this.targetInput.outerWidth(true) - this.targetInput.width()) / 2;
      // Calculate vertical padding/border for suggestion height
      const verticalPadding = (this.targetInput.outerHeight(true) - this.targetInput.height()) / 2;

      // Wrap the target input in a new container for positioning purposes
      const initialDisplay = this.targetInput.css("display");
      const wrapperElement = $("<div class='eac-input-wrapper' />").css({
        display: initialDisplay,
        position: "relative",
        fontSize: this.targetInput.css("fontSize")
      });
      this.targetInput.wrap(wrapperElement);

      // Create a hidden span to measure the width of the current input value
      this.currentValueDisplay = $("<span class='eac-current-value' />").css({
        visibility: "hidden",
        position: "absolute",
        display: "inline-block",
        fontFamily: this.targetInput.css("fontFamily"),
        fontWeight: this.targetInput.css("fontWeight"),
        letterSpacing: this.targetInput.css("letterSpacing"),
        whiteSpace: "pre"
      }).insertAfter(this.targetInput);

      // Create the suggestion overlay element
      this.suggestionDisplay = $("<span class='" + this.currentConfig.hintClass + "' />").css({
        display: "block",
        boxSizing: "content-box",
        lineHeight: this.targetInput.css('lineHeight'),
        paddingTop: `${verticalPadding}px`,
        paddingBottom: `${verticalPadding}px`,
        fontFamily: this.targetInput.css("fontFamily"),
        fontWeight: this.targetInput.css("fontWeight"),
        letterSpacing: this.targetInput.css("letterSpacing"),
        position: "absolute",
        top: 0,
        left: 0
      }).insertAfter(this.targetInput);

      // Attach event listeners to the input field and suggestion overlay
      this.bindEvents();
    },

    /**
     * Binds all necessary event handlers to the input and suggestion elements.
     */
    bindEvents: function() {
      // Keyup event for updating suggestions, with throttling
      this.targetInput.on("keyup.addrhint", (eventObj) => {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
          this.updateSuggestionDisplay(eventObj);
        }, this.currentConfig.typingDelay);
      });

      // Keydown event for auto-completion on Tab or Right Arrow
      this.targetInput.on("keydown.addrhint", (eventObj) => {
        const keyCode = eventObj.which || eventObj.keyCode;
        if (keyCode === 39 || keyCode === 9) {
          this.commitSuggestion();
          if (this.currentHint.length > 0 && keyCode === 9) {
            eventObj.preventDefault();
          }
        }
      });

      // Mousedown/touchstart on the suggestion overlay to commit
      this.suggestionDisplay.on("mousedown.addrhint touchstart.addrhint", (eventObj) => {
        eventObj.preventDefault();
        this.commitSuggestion();
      });

      // Blur event to clear suggestion when focus leaves the input
      this.targetInput.on("blur.addrhint", () => {
        this.clearSuggestion();
      });

      // Focus event to re-evaluate suggestion if input already has value
      this.targetInput.on("focus.addrhint", () => {
        this.updateSuggestionDisplay();
      });
    },

    /**
     * Determines the most relevant email domain hint based on the current input.
     * @param {string} currentInput - The full text from the input field.
     * @returns {string} The suggested domain part, or an empty string if no match.
     */
    determineHint: function (currentInput) {
      const atIndex = currentInput.lastIndexOf("@");
      if (atIndex < 0) {
        return "";
      }

      const partialHost = currentInput.substring(atIndex + 1);
      if (partialHost.length === 0) {
        return "";
      }

      // Find the first domain that starts with the partial host
      for (let i = 0; i < this.hostList.length; i++) {
        const domain = this.hostList[i];
        if (domain.startsWith(partialHost)) {
          return domain.substring(partialHost.length);
        }
      }

      return "";
    },

    /**
     * Fills the input field with the current suggestion and clears the overlay.
     */
    commitSuggestion: function () {
      if (this.currentHint.length === 0) {
        return false;
      }
      this.targetInput.val(this.currentInputValue + this.currentHint);
      this.clearSuggestion();
      this.targetInput.trigger("change");
    },

    /**
     * Clears the displayed suggestion and internal state.
     */
    clearSuggestion: function() {
      this.suggestionDisplay.text("");
      this.currentValueDisplay.text("");
      this.currentHint = "";
      this.currentInputValue = "";
      clearTimeout(this.typingTimer);
    },

    /**
     * Updates the displayed suggestion based on the current input field value.
     * This method is a handler for the keyup event.
     * @param {Event} [eventObj] - The keyup event object (optional).
     */
    updateSuggestionDisplay: function (eventObj) {
      this.currentInputValue = this.targetInput.val();
      this.currentHint = this.determineHint(this.currentInputValue);

      // If no hint, clear display
      if (this.currentHint.length === 0) {
        this.suggestionDisplay.text("");
        this.currentValueDisplay.text("");
        return;
      }

      // Update the suggestion overlay text
      this.suggestionDisplay.text(this.currentHint);
      this.currentValueDisplay.text(this.currentInputValue);

      // Calculate width of the current input value to position the suggestion
      const textWidth = this.currentValueDisplay.width();

      // Position the suggestion overlay
      if (this.targetInput.outerWidth() > textWidth) {
        this.suggestionDisplay.css('left', this.inputHorizontalOffset + textWidth + "px");
      } else {
        // If text overflows, suggestion should start from the input's left edge
        this.suggestionDisplay.css('left', this.inputHorizontalOffset + "px");
      }

      // If an event object is provided, prevent its default action if a hint is present
      if (eventObj && eventObj.preventDefault) {
        eventObj.preventDefault();
      }
    },

    /**
     * Destroys the component, removing event listeners and added DOM elements.
     */
    destroy: function() {
      // Unbind all namespaced events
      this.targetInput.off(".addrhint");
      this.suggestionDisplay.off(".addrhint");

      // Unwrap the input field from its wrapper
      this.targetInput.unwrap();

      // Remove the created elements
      this.currentValueDisplay.remove();
      this.suggestionDisplay.remove();

      // Clear any pending timers
      clearTimeout(this.typingTimer);

      // Remove data associated with the element
      $.removeData(this.targetInput[0], `enh_${suggestorName}`);
    }
  };

  // jQuery plugin definition
  // Checks if jQuery is loaded to prevent errors
  if (typeof $.fn === nothing) {
    console.error("AddressHintProvider requires jQuery to be loaded.");
    return;
  }

  // Attach the plugin to jQuery's prototype
  $.fn[suggestorName] = function (configSettings) {
    return this.each(function () {
      // Prevent multiple instantiations on the same element
      if (!$.data(this, `enh_${suggestorName}`)) {
        $.data(this, `enh_${suggestorName}`, new AddressHintProvider(this, configSettings));
      }
    });
  };

})(jQuery, window, document, void 0);