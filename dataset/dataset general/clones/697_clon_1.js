/*
 * ZXUI (Zhixin UI) - A robust UI component library
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file  Popup component for displaying overlay content
 * @author  chris (wfsr@foxmail.com)
 */


define( function ( require ) { // Module definition for RequireJS/AMD

  // Alias common Baidu utilities for convenience
  var T       = baidu;
  var DOM     = T.dom;
  var PAGE    = T.page;

  // Import base Control module
  var Control = require( './Control' );

  /**
   * Popup control class constructor.
   * This control manages the display and positioning of overlay content.
   *
   * @constructor
   * @extends module:Control
   * @requires Control
   * @exports Popup
   * @see module:City  Example usage with City selection
   * @see module:Calendar Example usage with Calendar date picker
   */
  var Popup = function () {
    // Call the superclass constructor to initialize inherited properties
    this.constructor.superClass.constructor.apply( this, arguments );
  };


  // Define prototype methods and properties for the Popup control
  Popup.prototype = {

    /**
     * Type identifier for the control.
     * Used for distinguishing control instances.
     *
     * @private
     * @type {string}
     */
    type: 'Popup',

    /**
     * Configuration options for the Popup control.
     * These options define the behavior and appearance of the popup.
     *
     * @private
     * @name module:Popup#options
     * @type {Object}
     * @property {boolean} disabled     Indicates if the control is disabled.
     * @property {(string | HTMLElement)} main   The main container element for rendering the popup.
     * @property {(string | HTMLElement)} target The element relative to which the popup's position is calculated.
     * @property {string | Array.<HTMLElement>} triggers Elements that trigger the display of the popup.
     *                                             If `liveTriggers` is specified, this must be a CSS class string.
     * @property {string | HTMLElement} liveTriggers Parent element for dynamically added triggers.
     * @property {string} content       The HTML content to display within the popup.
     * @property {string} dir           Direction of the popup relative to the target. Supports 8 cardinal directions.
     *                                  Possible values (default is 'bl'):
     *                                  tr | rt | rb | br | bl | lb | lt | tl | tc | rc | bc | lc
     *                                  Can also be specified via a `data-popup` attribute on triggers.
     * @property {string} prefix        CSS class prefix for the control, also applied to the `main` element.
     * @property {Object.<string, number>} offset  Offset values for fine-tuning popup position.
     * @property {number} offset.x      X-axis offset.
     * @property {number} offset.y      Y-axis offset.
     */
    options: {

      /**
       * Disabled state of the popup. If true, the popup will not appear.
       *
       * @type {boolean}
       * @default
       */
      disabled: false,

      /**
       * Main container for rendering the popup.
       * Can be a CSS selector string or an HTMLElement.
       *
       * @type {(string | HTMLElement)}
       */
      main: '',

      /**
       * The target element used for positioning the popup.
       * Can be a CSS selector string or an HTMLElement.
       *
       * @type {(string | HTMLElement)}
       */
      target: '',

      /**
       * Elements that, when interacted with, will cause the popup to show.
       * If `liveTriggers` is used, this should be a class name string.
       *
       * @type {string | Array.<HTMLElement>}
       */
      triggers: '',

      /**
       * A parent element that contains dynamically generated trigger elements.
       * Event delegation will be used for these triggers.
       *
       * @type {string | HTMLElement}
       */
      liveTriggers: '',

      /**
       * The actual content (HTML string) to be displayed inside the popup.
       *
       * @type {string}
       */
      content: '',

      /**
       * Specifies the preferred direction for the popup to appear relative to its target.
       * Example values: 'bl' (bottom-left), 'tr' (top-right), etc.
       * Can be overridden by a `data-popup` attribute on the trigger element.
       *
       * @type {string}
       * @defaultvalue
       */
      dir: 'bl',

      /**
       * CSS class prefix for the popup. This prefix will be used for styling and element identification.
       *
       * @type {string}
       * @defaultvalue
       */
      prefix: 'ecl-hotel-ui-popup',

      /**
       * An object containing x and y offset values to fine-tune the popup's position.
       *
       * @type {Object}
       */
      offset: {

        /**
         * Horizontal offset in pixels.
         *
         * @type {number}
         * @defaultvalue
         */
        x: 0,

        /**
         * Vertical offset in pixels.
         *
         * @type {string} // Note: Original JSDoc says string, but default is number.
         * @defaultvalue
         */
        y: 0
      }
    },


    /**
     * Comma-separated string of method names that need their `this` context bound to the control instance.
     * This is typically used for event handlers.
     *
     * @private
     * @type {string}
     */
    binds: 'onResize, onShow, onHide',

    /**
     * Initializes the Popup control.
     * Sets up options, main element, and event listeners for triggers.
     *
     * @private
     * @params {Object} options Configuration options for this instance.
     * @see module:Popup#options
     */
    init: function ( options ) {
      options       = this.setOptions( options ); // Merge default and provided options

      this.disabled = options.disabled;
      this.content  = options.content;

      if ( options.target ) {
        this.target = T.g( options.target ); // Get target element by ID or direct reference
      }

      var prefix    = options.prefix;
      var main      = this.main = options.main // Get main element, or create a new div if not provided
        && T.g( options.main )
        || document.createElement( 'div' );

      if ( options.main ) {
        T.addClass( main, prefix ); // Add prefix class if main element was provided
      }
      else {
        main.className  = prefix;       // Set class name for dynamically created main element
        main.style.left = '-2000px';    // Initially hide off-screen
      }

      var me        = this;
      var triggers  = options.triggers;
      var liveTriggers = options.liveTriggers;

      // Handle live triggers (event delegation)
      if ( liveTriggers ) {

        this.liveTriggers = T.on( T.g( liveTriggers ), 'click', me.onShow ); // Attach click handler to parent
      }
      // Handle static triggers
      else {

        // If triggers is a string (CSS selector), query for elements
        if ( T.isString( triggers ) ) {
          triggers = T.q( options.triggers );
        }

        // Attach click handler to each trigger element
        T.each(
          triggers,
          function ( trigger ) {
            T.on( trigger, 'click', me.onShow );
          }
        );

        this.triggers = triggers; // Store references to trigger elements

      }
    },

    /**
     * Renders the Popup control.
     * Appends the main element to the document body if not already present
     * and sets up the click event listener on the popup itself.
     *
     * @public
     * @fires module:Popup#click Custom click event fired when popup content is clicked.
     * @return {module:Popup} The current instance of the Popup control.
     */
    render: function () {
      var main = this.main;

      if ( !this.rendered ) {
        this.rendered = true;
        // Append to body if main element was created dynamically
        !this.options.main && document.body.appendChild( main );

        var me = this;

        // Attach a click listener to the popup's main element
        T.on(
          main,
          'click',
          function ( e ) {

            /**
             * @event module:Popup#click
             * @type {Object}
             * @property {DOMEvent} event The original DOM event object.
             */
            me.fire( 'click', { event: e } ); // Fire custom 'click' event
          }
        );

      }

      // Update popup content if provided
      if ( this.content ) {
        main.innerHTML = this.content;
      }

      return this; // Return the instance for chaining
    },

    /**
     * Handles browser window resize events.
     * Debounces the resize event to prevent excessive `show` calls.
     *
     * @private
     */
    onResize: function () {
      clearTimeout( this.resizeTimer ); // Clear any existing resize timer

      var me = this;

      // Set a new timer to re-show (reposition) the popup after a short delay
      this.resizeTimer = setTimeout( function () {
        me.show(); // Reposition the popup
      }, 100 );
    },

    /**
     * Handles the event that triggers the popup to show.
     * Performs checks and fires `beforeShow` event.
     *
     * @private
     * @param {DOMEvent} e The DOM event object that triggered the show.
     * @fires module:Popup#beforeShow Event fired before the popup is actually shown.
     */
    onShow: function ( e ) {

      var oldTarget = this.target; // Store current target for comparison

      /**
       * @event module:Popup#beforeShow
       * @type {Object}
       * @property {DOMEvent} event The original DOM event object.
       */
      this.fire( 'beforeShow', { event: e } ); // Notify listeners before showing

      if ( this.disabled ) {
        return; // Do nothing if the popup is disabled
      }

      // If the target has changed since last show, hide the previous one
      if ( oldTarget !== this.target ) {
        this.hide();
      }

      var me          = this;
      var trigger     = T.event.getTarget( e ); // Get the actual element that was clicked
      var liveTriggers = this.liveTriggers;

      // Logic for live triggers: find the actual trigger element
      if ( liveTriggers ) {
        var cls      = this.options.triggers;
        var hasClass = T.dom.hasClass;
        // Traverse up the DOM tree until the trigger class or liveTriggers parent is found
        while ( !hasClass( trigger, cls ) && trigger !== liveTriggers ) {
          trigger = trigger.parentNode;
        }

        // If the clicked element or its ancestor doesn't have the trigger class, do nothing
        if ( !hasClass( trigger, cls ) ) {
          return;
        }
      }

      this.show(); // Actually display and position the popup

      this.trigger = trigger; // Store the current trigger element

      // Set a timeout to attach global event listeners after the current event loop
      // This prevents immediate re-hiding if the click event propagates to document
      this.timer = setTimeout( function () {
        T.on( document, 'click', me.onHide );   // Listen for clicks outside to hide
        T.on( window, 'resize', me.onResize ); // Listen for window resize to reposition
      }, 0 );
    },

    /**
     * Handles the event that triggers the popup to hide.
     * Checks if the click was inside the popup before hiding.
     *
     * @private
     */
    onHide: function ( e ) {
      var target = T.event.getTarget( e ); // Get the element that was clicked
      var main   = this.main;

      // If the click was on the popup itself or inside it, do not hide
      if ( main === target || DOM.contains( main, target ) ) {
        return;
      }

      this.hide(); // Perform the actual hide operation

      clearTimeout( this.resizeTimer ); // Clear any pending resize operations
    },

    /**
     * Displays the popup.
     * Calculates and sets its position.
     *
     * @public
     * @fires module:Popup#show Event fired after the popup is displayed.
     */
    show: function () {
      this.computePosition(); // Determine where the popup should be placed

      /**
       * @event module:Popup#show
       */
      this.fire( 'show' ); // Notify listeners that the popup is now visible
    },

    /**
     * Hides the popup.
     * Moves it off-screen and removes global event listeners.
     *
     * @public
     * @fires module:Popup#hide Event fired after the popup is hidden.
     */
    hide: function () {
      this.main.style.left = '-2000px'; // Move the popup far off-screen to hide it

      /**
       * @event module:Popup#hide
       */
      this.fire( 'hide' ); // Notify listeners that the popup is now hidden

      // Remove global event listeners to prevent memory leaks and unnecessary calls
      T.un( document, 'click', this.onHide );
      T.un( window, 'resize', this.onResize );

      // Clear any pending timers
      clearTimeout( this.timer );
      clearTimeout( this.resizeTimer );
    },

    /**
     * Calculates the optimal position for the popup and its arrow (if applicable).
     * Considers target element, configured direction, offsets, and viewport boundaries.
     *
     * @private
     */
    computePosition: function () {
      var options      = this.options;
      // Use the explicitly set target, or the first trigger if target is not set
      var target       = this.target || this.triggers[ 0 ];
      var main         = this.main;
      var dir          = options.dir; // Preferred direction from options
      var position     = DOM.getPosition( target ); // Get target element's position

      // Key coordinates of the target element
      var top          = position.top;
      var left         = position.left;
      var width        = target.offsetWidth;
      var height       = target.offsetHeight;
      var right        = left + width;
      var bottom       = top + height;
      var center       = left + ( width / 2 );
      var middle       = top + ( height / 2 );

      // Dimensions of the popup itself
      var mainWidth    = main.offsetWidth;
      var mainHeight   = main.offsetHeight;

      // Current viewport dimensions and scroll positions
      var scrollTop    = PAGE.getScrollTop();
      var scrollLeft   = PAGE.getScrollLeft();
      var scrollRight  = scrollLeft + PAGE.getViewWidth();
      var scrollBottom = scrollTop + PAGE.getViewHeight();

      // Check if a direction is specified via a `data-popup` attribute on the target/trigger
      var dirFromAttr = target.getAttribute( 'data-popup' );
      if ( dirFromAttr ) {
        // If attribute value is a valid direction (e.g., 'tr', 'bl'), use it; otherwise, default to '1' (invalid)
        dir = /[trbl]{2}/.test( dirFromAttr ) ? dirFromAttr : '1';
      }

      var second, first; // Variables to hold the two characters of the direction string

      // Auto-positioning logic if 'dir' is set to 'auto'
      if ( dir === 'auto' ) {

        // Determine horizontal preference: center if possible, else right-aligned, else left-aligned
        var horiz = width > mainWidth // If target is wider than popup, prefer center
          || left - ( mainWidth - width ) / 2 > 0 // Or if centered doesn't go off left
          && right + ( mainWidth - width ) / 2 <= scrollRight // And centered doesn't go off right
          ? 'c' // Center
          : left + mainWidth > scrollRight // If popup would go off right when left-aligned
            ? 'r' // Right-aligned
            : 'l'; // Left-aligned

        // Determine vertical preference: center if possible, else bottom-aligned, else top-aligned
        var vertical = height > mainHeight // If target is taller than popup, prefer center
          || top - ( mainHeight - height ) / 2 > 0 // Or if centered doesn't go off top
          && bottom + ( mainHeight - height ) / 2 <= scrollBottom // And centered doesn't go off bottom
          ? 'c' // Center
          : top + mainHeight > scrollBottom // If popup would go off bottom when top-aligned
            ? 'b' // Bottom-aligned
            : 't'; // Top-aligned

        // Try to place below the target first
        if ( bottom + mainHeight <= scrollBottom ) {
          first  = 'b';
          second = horiz;
        }
        // Then try to place to the right of the target
        else if ( right + mainWidth <= scrollRight ) {
          first  = 'r';
          second = vertical;
        }
        // Then try to place above the target
        else if ( top - mainHeight >= scrollTop ) {
          first  = 't';
          second = horiz;
        }
        // Finally, try to place to the left of the target
        else if ( left - mainWidth >= scrollLeft ) {
          first  = 'l';
          second = vertical;
        }

        dir = first + second; // Construct the chosen direction string
      }
      else {

        // If 'dir' is not 'auto', parse the specified direction
        first  = dir.charAt( 0 ); // First char indicates primary direction (t, b, l, r)
        second = dir.charAt( 1 ); // Second char indicates secondary alignment (l, c, r for horizontal; t, c, b for vertical)
      }

      var offset = options.offset; // Get configured offsets

      // Positioning logic for popup appearing above or below the target
      if ( { t: 1, b: 1 }[ first ] ) {
        left = {
          l: left,                            // Left-aligned with target's left edge
          c: center - ( mainWidth / 2 ),      // Centered horizontally with target
          r: right - mainWidth                // Right-aligned with target's right edge
        }[ second ];

        top = {
          t: top - mainHeight,                // Above the target
          b: bottom                           // Below the target
        }[ first ];

      }

      // Positioning logic for popup appearing to the left or right of the target
      else if ( { l: 1, r: 1 }[ first ] ) {
        top = {
          t: top,                             // Top-aligned with target's top edge
          c: middle - ( mainHeight / 2 ),     // Centered vertically with target
          b: bottom - mainHeight              // Bottom-aligned with target's bottom edge
        }[ second ];

        left = {
          l: left - mainWidth - offset.x,     // To the left of the target, with x-offset
          r: right + offset.x                 // To the right of the target, with x-offset
        }[ first ];