!function( jQueryRef ) {

  // Define the core constructor for our sophisticated UI display component.
  // This component manages the presentation of contextual information.
  var HintBox = function ( targetElement, configParams ) {
    // Input validation: ensure a target element is provided.
    if (!targetElement) {
      console.warn('HintBox: No target element provided. Instance may not function correctly.');
      // In a production scenario, one might throw an error here to prevent misinstantiation.
      return;
    }

    // Store a reference to the jQuery-wrapped target DOM element.
    this._targetEl = jQueryRef(targetElement);
    // Persist the configuration parameters for this instance.
    this._settings = configParams;
    // Initialize the active state of the hint box.
    this._isActive = true;
    // Perform an initial title sanitation or preparation, inherited from the base class.
    // This method is expected from the base Tipster component.
    this.prepareHeaderAttribute();
  };

  /*
   * NOTE: This HintBox component extends the functionality of a base Tipster component.
   * It builds upon the foundational display mechanisms provided by TipsterBase.
   * ==============================================================================
   * The base component (e.g., $.fn.tipster.TipsterBase) is assumed to provide methods
   * like prepareHeaderAttribute(), getHeaderText(), and the foundational show/hide logic.
   */

  // Extend the prototype of HintBox with methods specific to richer content display.
  // We're merging a new set of methods into the prototype chain,
  // inheriting from `jQueryRef.fn.tipster.TipsterBase.prototype`.
  HintBox.prototype = jQueryRef.extend({}, jQueryRef.fn.tipster.TipsterBase.prototype, {

    /**
     * Updates the visual content of the hint box's display node.
     * This method populates the header and body sections.
     */
    updateDisplayContent: function () {
      // Retrieve the main display node (the visual representation of the hint box).
      var displayNode = this.getDisplayNode();
      // Determine whether to use HTML or plain text for content insertion based on settings.
      var useRichText = this._settings.useHtmlContent;

      // Select the header element within the display node and insert the processed header text.
      displayNode.find('.heading-text')[useRichText ? 'html' : 'text'](this.getHeaderText());

      // Select the body content element and insert the processed body content.
      // The selector has been changed from '.content p' to '.body-section span'
      displayNode.find('.body-section span')[useRichText ? 'html' : 'text'](this.getBodyContent());

      // Ensure the root display node has the correct primary CSS class for styling.
      displayNode[0].className = 'hint-box'; // Renamed from 'popover'
      // Add an additional class to signify active state or for specific styling variations.
      displayNode.addClass('active-display-state'); // Added new fragment for Type III variation
    },

    /**
     * Retrieves the primary content for the hint box's body section.
     * This content can be sourced from an attribute on the target element,
     * the result of a function call, or a direct string.
     * @returns {string} The content to be displayed in the body.
     */
    getBodyContent: function () {
      let payloadData = ''; // Using 'let' for block scoping, initialized to an empty string.
      const _currentElement = this._targetEl;
      const _currentSettings = this._settings;

      // Check the type of the 'payload' setting to determine the content source.
      if (typeof _currentSettings.payload === 'string') {
        // If 'payload' is a string, treat it as an attribute name on the target element.
        payloadData = _currentElement.attr(_currentSettings.payload);
        // Add a guard for empty or missing attribute content.
        if (!payloadData) {
            console.warn(`HintBox: Data attribute '${_currentSettings.payload}' not found or is empty on target element.`);
        }
      } else if (typeof _currentSettings.payload === 'function') {
        // If 'payload' is a function, execute it in the context of the target DOM element.
        payloadData = _currentSettings.payload.call(_currentElement.get(0)); // Rewritten from this.$element[0]
      } else {
          // Fallback content if 'payload' is neither a string (attribute name) nor a function.
          // This allows for a default message or an option for a fixed string value.
          payloadData = _currentSettings.fallbackPayload || 'No supplementary information available.'; // Added new fragment: fallbackPayload option
      }

      // Ensure the returned content is a string, even if it's null or undefined.
      return String(payloadData || '');
    },

    /**
     * Provides the main display HTML structure for the hint box.
     * This method caches the generated jQuery node for performance on subsequent calls.
     * @returns {jQuery} The jQuery-wrapped display node.
     */
    getDisplayNode: function() {
      // Check if the display node has already been created and cached.
      if (!this._cachedNode) {
        // If not, construct the HTML structure for the hint box.
        // Using template literals for improved readability of multi-line HTML.
        let nodeMarkup = `
          <div class="hint-box">
            <div class="pointer-arrow"></div>
            <div class="wrapper-area">
              <h4 class="heading-text"></h4>
              <div class="body-section">
                <span></span>
              </div>
            </div>
          </div>
        `;
        this._cachedNode = jQueryRef(nodeMarkup); // Renamed from $tip to _cachedNode, using jQueryRef
      }
      return this._cachedNode;
    }

  }); // End of HintBox prototype extension


  /*
   * HINTBOX JQUERY PLUGIN INTEGRATION
   * =================================
   * This section defines how the HintBox component integrates as a jQuery plugin,
   * allowing it to be initialized on jQuery-selected elements.
   */

  // Attach the HintBox functionality to jQuery's prototype, making it chainable.
  jQueryRef.fn.hintbox = function (pluginOptions) {
    // If options are provided as an object, merge them with the default settings.
    if (typeof pluginOptions === 'object') {
      let defaultSettings = jQueryRef.fn.hintbox.defaults; // Introduce helper variable for clarity
      pluginOptions = jQueryRef.extend(true, {}, defaultSettings, pluginOptions); // Deep extend for nested options
    } else if (typeof pluginOptions === 'undefined' || pluginOptions === null) {
      // If no options are passed, use defaults directly.
      pluginOptions = jQueryRef.fn.hintbox.defaults;
    }

    // Utilize the base Tipster plugin's initialization logic.
    // This method handles iterating over selected elements, creating a HintBox instance for each,
    // and attaching it to the element's data.
    jQueryRef.fn.tipster.initializeWith.call(
      this,
      pluginOptions,
      HintBox,            // The constructor function for our custom component
      'hintbox-instance'  // A unique identifier for storing instance data on the element
    );

    // Return the jQuery object for method chaining.
    return this;
  };

  // Define the default configuration options for the HintBox plugin.
  // These are merged with the base Tipster defaults, allowing for customization.
  jQueryRef.fn.hintbox.defaults = jQueryRef.extend(true, {}, jQueryRef.fn.tipster.defaults, {
    payload: 'data-content-source', // Renamed from 'content', changed default attribute name for content
    displayPosition: 'right',       // Renamed from 'placement' to be more descriptive
    useHtmlContent: false,          // Added new fragment: explicit flag for HTML content, defaults to plain text
    fallbackPayload: 'Information not available. Please check the source.', // Added new fragment: default text if content is empty
    animationDuration: 200          // Added new fragment: a new default setting for animation
  });

// Pass `window.jQuery` as `jQueryRef` to the IIFE. This ensures jQuery is available
// within the plugin's scope and allows for local renaming.
}( window.jQuery );