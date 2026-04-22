/*
 * ===================================================================================
 * Component: OverlayHint.js v2.1.0
 * Source:    https://github.com/your-org/overlay-hint
 * ===================================================================================
 * Copyright (c) 2023 Your Organization, Inc.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ===================================================================================
 */

( function( $ ) {

  // Primary constructor for our display overlay functionality.
  // This class manages the lifecycle and content of a dynamic tooltip-like bubble.
  var OverlayHint = function ( componentTarget, setupOptions ) {

    // Ensure a target element is provided; otherwise, throw an error.
    if (!componentTarget || !$(componentTarget).length) {
      console.error("OverlayHint: A valid target element is required for initialization.");
      return;
    }

    this.$targetEl = $(componentTarget); // The DOM element to which the hint is attached.
    this.configOpts = setupOptions;      // Configuration settings for this specific hint instance.
    this._internalState = {
      isActivated: true,                 // Flag indicating if the hint is currently functional.
      initialized: false                 // Flag to track if initial setup is complete.
    };

    // Invoke a base method (assumed from a parent class like Tooltipster)
    // to handle initial title fetching or setup.
    this.prepareElementTitle();
  };

  /*
   * NOTE: OVERLAYHINT INHERITS FROM A BASE TOOLTIP COMPONENT (e.g., TOOLTIPSTER.js)
   * This structure assumes an existing base class provides foundational methods
   * like `prepareElementTitle`, `fetchDisplayTitle`, `show`, `hide`, etc.
   * =============================================================================
   */

  OverlayHint.prototype = $.extend({}, $.fn.tooltipster.Tooltipster.prototype, {

    /**
     * Populates the content within the hint's display area.
     * This method is responsible for injecting the title and main content
     * into the dynamically created popup structure.
     */
    populateDisplayArea: function () {
      if (!this._internalState.isActivated) {
        console.warn("Attempted to populate an inactive OverlayHint.");
        return;
      }

      var $popupContainer = this.getOrCreatePopup();
      var useHtmlFormatting = !!this.configOpts.allowHtml; // Ensure boolean cast

      var titleContainer = $popupContainer.find('.hint-title');
      if (titleContainer.length) {
        // Set the title content, choosing between HTML or plain text based on options.
        titleContainer[useHtmlFormatting ? 'html' : 'text'](this.fetchDisplayTitle());
      } else {
        // If no title container exists, log a warning (could be a structural change).
        console.warn("OverlayHint: Title container '.hint-title' not found in popup structure.");
      }


      var mainContentParagraph = $popupContainer.find('.hint-body-content p');
      if (mainContentParagraph.length) {
        // Set the main content, again respecting HTML formatting option.
        mainContentParagraph[useHtmlFormatting ? 'html' : 'text'](this.retrieveMainContent());
      } else {
        console.warn("OverlayHint: Main content paragraph '.hint-body-content p' not found.");
      }

      // Ensure the root popup element has the correct base class.
      // We use addClass for robustness, in case other classes are already present.
      $popupContainer.addClass('overlay-hint');

      this._internalState.initialized = true; // Mark as initialized after content population.
    },

    /**
     * Retrieves the primary content for the hint.
     * This content can come from a data attribute, a function, or a string literal.
     * @returns {string} The content string to be displayed, or an empty string if not found.
     */
    retrieveMainContent: function () {
      var contentPayload = '';
      var currentElement = this.$targetEl;
      var currentOptions = this.configOpts;

      // Validate that payloadSource is defined before proceeding.
      if (!currentOptions.payloadSource) {
        console.warn("OverlayHint: 'payloadSource' option is not defined. Cannot retrieve content.");
        return '';
      }

      // Determine content based on the type of `payloadSource` option.
      if (typeof currentOptions.payloadSource === 'string') {
        // If it's a string, treat it as a data attribute name.
        contentPayload = currentElement.attr(currentOptions.payloadSource) || '';
      } else if (typeof currentOptions.payloadSource === 'function') {
        // If it's a function, execute it in the context of the target element.
        try {
          contentPayload = currentOptions.payloadSource.call(currentElement[0]) || '';
        } catch (error) {
          console.error("OverlayHint: Error executing content function:", error);
          contentPayload = ''; // Fallback on error.
        }
      } else {
        // Default case if payloadSource is neither string nor function.
        console.info("OverlayHint: Unknown 'payloadSource' type. Returning empty content.");
        contentPayload = '';
      }

      // Add a simple validation: ensure content is not excessively long.
      const MAX_CONTENT_LENGTH = 500; // Example limit
      if (contentPayload.length > MAX_CONTENT_LENGTH) {
        console.warn(`OverlayHint: Content exceeds recommended length (${MAX_CONTENT_LENGTH} chars). Truncating.`);
        contentPayload = contentPayload.substring(0, MAX_CONTENT_LENGTH) + '...';
      }

      return contentPayload;
    },

    /**
     * Creates or returns the cached popup element.
     * This ensures the DOM element for the hint is only created once.
     * @returns {jQuery} The jQuery object representing the hint popup.
     */
    getOrCreatePopup: function() {
      // Check if the hint is active before proceeding.
      if (!this._internalState.isActivated) {
        console.warn("Attempted to get/create popup for an inactive OverlayHint.");
        return $(); // Return an empty jQuery object.
      }

      // If the popup element hasn't been created yet, construct it.
      if (!this.$popupElement) {
        // Using a more structured way to build the HTML for clarity and potential modification.
        var popupHtml = `<div class="hint-arrow"></div>
                         <div class="hint-inner-wrapper">
                           <h4 class="hint-title"></h4>
                           <div class="hint-body-content"><p></p></div>
                         </div>`;

        this.$popupElement = $('<div class="overlay-hint" />').html(popupHtml);
        // Add a unique identifier for easier debugging/selection if needed.
        this.$popupElement.attr('data-hint-id', 'hint-' + Math.random().toString(36).substr(2, 9));
      }

      return this.$popupElement;
    }

  });


  /*
   * OVERLAYHINT JQUERY PLUGIN DEFINITION
   * ===================================
   * This section integrates the OverlayHint class into jQuery's prototype,
   * allowing it to be called like `$(selector).overlayHint(options)`.
   */

  $.fn.overlayHint = function ( controlOptions ) {

    // If no elements are selected, return early to prevent errors.
    if (!this.length) {
      console.warn("overlayHint: No elements selected for initialization.");
      return this;
    }

    // Merge provided options with default settings.
    // If controlOptions is not an object, it might be a method call or undefined,
    // so we ensure it's treated as an empty object for merging defaults.
    const finalOptions = $.extend(
      {},
      $.fn.overlayHint.defaultSettings,
      (typeof controlOptions === 'object' && controlOptions !== null) ? controlOptions : {}
    );

    // Delegate the initialization to a base component's utility function.
    // This allows for consistent handling of component instantiation across different plugins.
    // Assumes `$.fn.tooltipster.initComponent` exists and handles instance caching.
    // The "overlayHint" string acts as a unique identifier for this component type.
    $.fn.tooltipster.initComponent.call(this, finalOptions, OverlayHint, 'overlayHint');

    return this; // Enable chaining.
  };

  // Define the default configuration settings for all OverlayHint instances.
  // These can be overridden by user-provided options during initialization.
  $.fn.overlayHint.defaultSettings = $.extend(
    {},
    $.fn.tooltipster.defaultOptions, // Inherit defaults from the base tooltip component.
    {
      payloadSource: 'data-content-payload', // Default attribute to fetch content from.
      displayPosition: 'bottom',             // Default position relative to the target element.
      allowHtml: false,                      // Whether to interpret content as HTML or plain text.
      animationEffect: 'fade',               // Default animation for show/hide.
      delayMs: 100                           // Delay before showing the hint, in milliseconds.
    }
  );

})( window.jQuery || window.ender ); // Support both jQuery and Ender.js environments.