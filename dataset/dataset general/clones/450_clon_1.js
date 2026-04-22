/*
 * jQuery UI Timepicker 0.2.9
 *
 * Copyright 2010-2011, Francois Gelinas
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://fgelinas.com/code/timepicker
 *
 * Dependencies:
 *  jquery.ui.core.js - Essential for basic jQuery UI functionality.
 *  jquery.ui.position.js - Required only if advanced positioning settings are employed.
 *
 * Change log version 0.1.0 - The magnificent T-Rex was strategically repositioned here!
 *
 * Behold, the ancient guardian of this JavaScript file:
 *
                                                  ____
       ___                                      .-~. /_"-._
      `-._~-.                                  / /_ "~o\  :Y
          \  \                                / : \~x.  ` ')
           ]  Y                              /  |  Y< ~-.__j
          /   !                        _.--~T : l  l<  /.-~
         /   /                 ____.--~ .   ` l /~\ \<|Y
        /   /             .-~~"        /| .    ',-~\ \L|
       /   /             /     .^   \ Y~Y \.^>/l_   "--'
      /   Y           .-"(  .  l__  j_j l_/ /~_.-~    .
     Y    l          /    \  )    ~~~." / `/"~ / \.__/l_
     |     \     _.-"      ~-{__     l  :  l._Z~-.___.--~
     |      ~---~           /   ~~"---\_  ' __[>
     l  .                _.^   ___     _>-y~
      \  \     .      .-~   .-~   ~>--"  /
       \  ~---"            /     ./  _.-'
        "-.,_____.,_  _.--~\     _.-~
                    ~~     (   _}       -Row
                           `. ~(
                             )  \
                            /,`--'~\--'~\
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                             ->T-Rex<-
 *
 * End of T-Rex ASCII art. Now, back to the code!
 */

( function ( $, undefined ) {

  // Extend the jQuery UI namespace to include the timepicker component.
  $.extend( $.ui, { timepicker: { version: "0.2.9" } } );


  // Define a constant for the key used to store timepicker instance data.
  var PROP_NAME = 'timepicker';

  // Generate a unique identifier for timepicker instances, based on the current timestamp.
  var tpuuid = new Date().getTime();


  /*
   * Timepicker Manager Class Definition.
   *
   * This class acts as a central singleton instance, accessed via `$.timepicker`.
   * It is responsible for managing global settings and interactions for all
   * timepicker instances across the page, enabling multiple distinct configurations.
   */
  function Timepicker() {

    // Debugging flag: set to `true` to enable console logging for development purposes.
    this.debug = true;

    // Reference to the timepicker instance that is currently active or focused.
    this._curInst = null;

    // A boolean flag indicating whether the current timepicker instance is displayed inline.
    this._isInline = false;

    // An array to keep track of input elements that have associated timepickers
    // but are currently disabled.
    this._disabledInputs = [];

    // A boolean flag indicating if the popup timepicker dialog is currently visible.
    this._timepickerShowing = false;

    // A boolean flag indicating if the timepicker is rendered within a jQuery UI dialog.
    this._inDialog = false;

    // The CSS class name applied to the main container when the timepicker is in a dialog.
    this._dialogClass = 'ui-timepicker-dialog';

    // The ID attribute for the primary timepicker division element in the DOM.
    this._mainDivId = 'ui-timepicker-div';

    // The CSS class name applied to inline timepicker containers.
    this._inlineClass = 'ui-timepicker-inline';

    // The CSS class name used to highlight the currently selected hour or minute in the UI.
    this._currentClass = 'ui-timepicker-current';

    // The CSS class name for hover effects on day cells (primarily inherited from Datepicker,
    // though less relevant for Timepicker itself).
    this._dayOverClass = 'ui-timepicker-days-cell-over';


    // Stores various regional settings, indexed by their language codes.
    this.regional = [];

    // Default regional settings (English).
    this.regional[''] = {
      hourText: 'Hour',           // Display text for the hours selection section.
      minuteText: 'Minute',       // Display text for the minutes selection section.
      amPmText: ['AM', 'PM'],     // Array of text labels for AM/PM periods.
      closeButtonText: 'Done',    // Text for the confirmation button (e.g., "OK" or "Done").
      nowButtonText: 'Now',       // Text for the button that sets the current time.
      deselectButtonText: 'Deselect'  // Text for the button that clears the selected time.
    };


    // Global default options for all timepicker instances.
    this._defaults = {
      showOn: 'focus',    // Specifies when the timepicker should appear: 'focus', 'button', or 'both'.
      button: null,                   // The HTML element that will trigger the timepicker popup.
      showAnim: 'fadeIn',             // The name of a jQuery animation effect to use when showing the popup.
      showOptions: {},                // Additional options to pass to the animation effect.
      appendText: '',                 // Text to display next to the input box, often used for format hints.

      beforeShow: null,               // A callback function executed just before the timepicker is displayed.
      onSelect: null,                 // A callback function invoked when an hour or minute is selected.
      onClose: null,                  // A callback function invoked when the timepicker is closed.

      timeSeparator: ':',             // The character used to separate hours and minutes (e.g., "10:30").
      periodSeparator: ' ',           // The character separating the time from the AM/PM period (e.g., "10 AM").
      showPeriod: false,              // Boolean: determines whether to display AM/PM with the selected time.
      showPeriodLabels: true,         // Boolean: determines whether to display AM/PM labels within the timepicker UI.
      showLeadingZero: true,          // Boolean: if `true`, a leading zero is added to hours less than 10 (e.g., "09").
      showMinutesLeadingZero: true,   // Boolean: if `true`, a leading zero is added to minutes less than 10 (e.g., ":05").
      altField: '',                   // A CSS selector for an alternative input field to store the selected time.
      defaultTime: 'now',             // The default time to use when the input field is empty or for inline pickers.
                                      // Can be 'now' for the current time, or '' for no highlighted time.
      myPosition: 'left top',         // The position of the dialog relative to the input element.
                                      // Consult jQuery UI Position utility documentation for more info.
      atPosition: 'left bottom',      // The position of the input element to align with.
                                      // Note: if the position utility is not loaded, defaults to 'left top' relative to 'left bottom'.

      // --- NEW: Added on 2011-02-03 ---
      onHourShow: null,         // A callback function for enabling/disabling individual hours.
                                // Example: function(hour) { return hour % 2 === 0; }
      onMinuteShow: null,             // A callback function for enabling/disabling individual minutes.
                                // Example: function(hour,minute) { return minute % 15 === 0; }

      hours: {
        starts: 0,                  // The first hour to be displayed in the hour selection grid (0-23).
        ends: 23                    // The last hour to be displayed in the hour selection grid (0-23).
      },
      minutes: {
        starts: 0,                  // The first minute to be displayed (0-59).
        ends: 55,                   // The last minute to be displayed (0-59).
        interval: 5                 // The interval (step) between displayed minutes.
      },
      rows: 4,                        // The number of rows for the hour/minute selection tables. Minimum 2.

      // --- Updates from version 0.2.4 (2011-08-05) ---
      showHours: true,                // Boolean: determines whether to display the hours selection section.
      showMinutes: true,              // Boolean: determines whether to display the minutes selection section.
      optionalMinutes: false,         // Boolean: if `true`, allows parsing inputs of whole hours with minutes omitted.

      // --- Button configurations ---
      showCloseButton: false,         // Boolean: if `true`, an "OK" or "Done" button is shown to confirm the edit.
      showNowButton: false,           // Boolean: if `true`, a "Now" button is displayed to set the current time.
      showDeselectButton: false       // Boolean: if `true`, a "Deselect" button is displayed to clear the selected time.

    };
    // Merge the default regional settings into the main default options.
    $.extend( this._defaults, this.regional[''] );

    // Initialize the main timepicker division element, setting its ID, classes, and initial hidden state.
    this.tpDiv = $( '<div id="' + this._mainDivId + '" class="ui-timepicker ui-widget ui-helper-clearfix ui-corner-all " style="display: none"></div>' );
  }


  // Extend the Timepicker prototype with public and private methods.
  $.extend( Timepicker.prototype, {

    /*
     * The CSS class name added to input elements that have been successfully
     * initialized as a timepicker instance.
     */
    markerClassName: 'hasTimepicker',


    /*
     * Debugging logger utility method.
     * Messages are logged to the console only if the `this.debug` flag is set to `true`.
     */
    log: function () {
      if ( this.debug ) {
        console.log.apply( '', arguments );
      }
    },


    /*
     * Returns the main timepicker widget's DOM element.
     * This method provides access to the top-level container of the timepicker UI.
     */
    _widgetTimepicker: function () {
      return this.tpDiv;
    },


    /*
     * Overrides the default settings for all future and current instances
     * of the time picker.
     *
     * @param  {object} settings  An anonymous object containing new settings to apply as defaults.
     * @return {object} The timepicker manager instance (`this`) for method chaining.
     */
    setDefaults: function ( settings ) {
      // Merges the new settings into the existing defaults. The `extendRemove` utility
      // handles removing properties if they are explicitly set to `undefined` in `settings`.
      extendRemove( this._defaults, settings || {} );
      return this;
    },


    /*
     * Attaches the time picker functionality to a specified DOM target.
     * The target can be an `<input>`, `<div>`, or `<span>` element.
     *
     * @param  {HTMLElement} target    The DOM element to attach the timepicker to.
     * @param  {object}      settings  Specific settings for this particular timepicker instance.
     */
    _attachTimepicker: function ( target, settings ) {

      // First, check for any inline settings defined directly on the target element
      // using attributes prefixed with 'time:'.
      var inlineSettings = null;
      for ( var attrName in this._defaults ) {
        var attrValue = target.getAttribute( 'time:' + attrName );
        if ( attrValue ) {
          inlineSettings = inlineSettings || {};
          try {
            // Attempt to evaluate the attribute value as JavaScript (e.g., for booleans, numbers).
            inlineSettings[ attrName ] = eval( attrValue );
          } catch ( err ) {
            // If evaluation fails (e.g., not valid JS), treat the value as a plain string.
            inlineSettings[ attrName ] = attrValue;
          }
        }
      }

      // Determine the node name of the target to check if it's an inline element type.
      var nodeName = target.nodeName.toLowerCase();
      var inline = ( nodeName == 'div' || nodeName == 'span' );

      // Assign a unique ID to the target element if it doesn't already possess one.
      if ( !target.id ) {
        this.uuid += 1;
        target.id = 'tp' + this.uuid;
      }

      // Create a new timepicker instance object for this target.
      var inst = this._newInst( $( target ), inline );

      // Merge the settings: global defaults, provided instance-specific settings, and any inline settings.
      inst.settings = $.extend( {}, settings || {}, inlineSettings || {} );

      // Depending on the target element type, connect it as an input-based timepicker
      // or initialize it as an inline timepicker.
      if ( nodeName == 'input' ) {
        this._connectTimepicker( target, inst );
        // Initialize the instance's internal hour and minute values from the input field's current value.
        this._setTimeFromField( inst );
      } else if ( inline ) {
        this._inlineTimepicker( target, inst );
      }
    },


    /*
     * Creates and returns a new timepicker instance object.
     *
     * @param {jQuery}  target  The jQuery object representing the target element.
     * @param {boolean} inline  A flag indicating whether the timepicker is inline (true) or a popup (false).
     * @returns {object} A newly created timepicker instance object with its properties initialized.
     */
    _newInst: function ( target, inline ) {
      // Escape any jQuery meta characters present in the target's ID to ensure it can be
      // safely used as a valid selector later.
      var id = target[0].id.replace( /([^A-Za-z0-9_-])/g, '\\\\$1' );

      return {
        id: id,            // The ID of the target element.
        input: target,     // The jQuery object for the associated target element.
        inline: inline,    // Boolean flag: true if inline, false if popup.
        tpDiv: ( !inline ? this.tpDiv : // The main presentation div for the timepicker.
          $( '<div class="' + this._inlineClass + ' ui-timepicker ui-widget  ui-helper-clearfix"></div>' ) )
      };
    },


    /*
     * Connects the time picker functionality to an input field.
     * This involves applying a marker class, binding essential event handlers,
     * and storing the timepicker instance data on the target element.
     *
     * @param {HTMLElement} target  The input field DOM element to connect.
     * @param {object}      inst    The timepicker instance object associated with this target.
     */
    _connectTimepicker: function ( target, inst ) {
      var input = $( target );

      // Initialize `inst.append` and `inst.trigger` as empty jQuery objects.
      inst.append = $( [] );
      inst.trigger = $( [] );

      // If the input element already has the marker class, it means it's already
      // configured as a timepicker, so we exit to prevent re-initialization.
      if ( input.hasClass( this.markerClassName ) ) {
        return;
      }

      // Set up any append text or trigger buttons based on the instance's settings.
      this._attachments( input, inst );

      // Add the marker class and bind essential keyboard and custom data events.
      input.addClass( this.markerClassName )
        .keydown( this._doKeyDown ) // Handle keydown for navigation and closing.
        .keyup( this._doKeyUp )     // Handle keyup for updating time from input.
        .bind( "setData.timepicker", function ( event, key, value ) {
          // Custom event handler to set a specific setting for the instance.
          inst.settings[ key ] = value;
        } )
        .bind( "getData.timepicker", function ( event, key ) {
          // Custom event handler to retrieve a specific setting from the instance.
          // Note: `this` refers to the input element here, so we must use `$.timepicker._get`.
          return $.timepicker._get( inst, key );
        } );

      // Store the timepicker instance data directly on the target DOM element using jQuery's data method.
      $.data( target, PROP_NAME, inst );
    },


    /*
     * Handles keydown events on the timepicker input field.
     * This method manages closing the timepicker on Tab or Escape, selecting on Enter,
     * and displaying the timepicker via a Ctrl+Home key combination.
     *
     * @param {Event} event  The keyboard event object.
     */
    _doKeyDown: function ( event ) {
      var inst = $.timepicker._getInst( event.target );
      var handled = true;
      inst._keyEvent = true; // Set a flag to indicate that a keyboard event is currently active.

      if ( $.timepicker._timepickerShowing ) {
        switch ( event.keyCode ) {
          case 9: // TAB key
            $.timepicker._hideTimepicker(); // Hide the timepicker dialog.
            handled = false; // Allow the browser's default tab behavior (focus change).
            break; // Exit the switch statement.
          case 13: // ENTER key
            $.timepicker._updateSelectedValue( inst ); // Update the input field with the currently selected value.
            $.timepicker._hideTimepicker(); // Hide the timepicker dialog.

            return false; // Crucially, prevent the default action of the Enter key (e.g., form submission).

            break; // Exit the switch statement.
          case 27: // ESCAPE key
            $.timepicker._hideTimepicker(); // Hide the timepicker dialog without selecting a value.
            break; // Exit the switch statement.
          default:
            handled = false; // For any other key press, do not prevent the default browser behavior.
        }
      }
      // If the timepicker is not currently showing, check for the Ctrl+Home key combination to open it.
      else if ( event.keyCode == 36 && event.ctrlKey ) { // Ctrl+Home
        $.timepicker._showTimepicker( this ); // Display the timepicker.
      }
      else {
        handled = false; // No special handling for other keys when the timepicker is hidden.
      }

      // If the event was specifically handled by the timepicker's logic,
      // prevent its default action and stop its propagation through the DOM.
      if ( handled ) {
        event.preventDefault();
        event.stopPropagation();
      }
    },


    /*
     * Updates the selected time based on the input field's value during keyUp events.
     * This method was introduced in version 0.0.5 of the timepicker plugin.
     *
     * @param {Event} event  The keyboard event object.
     */
    _doKeyUp: function ( event ) {
      var inst = $.timepicker._getInst( event.target );
      $.timepicker._setTimeFromField( inst ); // Parse and set the time from the input field's current value.
      $.timepicker._updateTimepicker( inst ); // Refresh the timepicker UI to reflect any changes.
    },


    /*
     * Manages the creation and binding of additional elements like `appendText` and
     * trigger buttons associated with the timepicker input field.
     *
     * @param {jQuery} input  The jQuery object wrapping the input field.
     * @param {object} inst   The timepicker instance object.
     */
    _attachments: function ( input, inst ) {
      var appendText = this._get( inst, 'appendText' );
      var isRTL = this._get( inst, 'isRTL' );

      // Remove any previously appended text span to prevent duplication if called multiple times.
      if ( inst.append ) {
        inst.append.remove();
      }

      // If `appendText` is defined in the settings, create and insert the span element.
      if ( appendText ) {
        inst.append = $( '<span class="' + this._appendClass + '">' + appendText + '</span>' );
        input[ isRTL ? 'before' : 'after' ]( inst.append ); // Position based on RTL setting.
      }

      // Unbind existing focus and click handlers to prevent multiple event bindings.
      input.unbind( 'focus.timepicker', this._showTimepicker );
      input.unbind( 'click.timepicker', this._adjustZIndex );

      // Remove any previously attached trigger button.
      if ( inst.trigger ) {
        inst.trigger.remove();
      }

      var showOn = this._get( inst, 'showOn' );

      // Bind events to show the timepicker when the input gains focus or is clicked.
      if ( showOn == 'focus' || showOn == 'both' ) {
        input.bind( "focus.timepicker", this._showTimepicker );
        input.bind( "click.timepicker", this._adjustZIndex ); // Adjust z-index on click to ensure visibility.
      }

      // Bind events to show the timepicker when a specific button element is clicked.
      if ( showOn == 'button' || showOn == 'both' ) {
        var button = this._get( inst, 'button' );
        $( button ).bind( "click.timepicker", function () {
          // If the timepicker is already showing for this specific input, hide it (toggle behavior).
          if ( $.timepicker._timepickerShowing && $.timepicker._lastInput == input[0] ) {
            $.timepicker._hideTimepicker();
          }
          // Otherwise, if the input is not disabled, display the timepicker.
          else if ( !inst.input.is( ':disabled' ) ) {
            $.timepicker._showTimepicker( input[0] );
          }
          return false; // Prevent the default action of the button (e.g., form submission).
        } );
      }
    },


    /*
     * Attaches an inline time picker to a `<div>` or `<span>` element.
     * The timepicker UI will be rendered directly within this container,
     * rather than as a popup dialog.
     *
     * @param {HTMLElement} target  The `<div>` or `<span>` DOM element to attach to.
     * @param {object}      inst    The timepicker instance object.
     */
    _inlineTimepicker: function ( target, inst ) {
      var divSpan = $( target );

      // If the element already has the marker class, it indicates that it's already
      // initialized as an inline timepicker, so we exit to prevent re-initialization.
      if ( divSpan.hasClass( this.markerClassName ) ) {
        return;
      }

      // Add the marker class, append the timepicker's main div, and bind custom data events.
      divSpan.addClass( this.markerClassName )
        .append( inst.tpDiv )
        .bind( "setData.timepicker", function ( event, key, value ) {
          inst.settings[ key ] = value;
        } )
        .bind( "getData.timepicker", function ( event, key ) {
          // Use `$.timepicker._get` as `this` refers to the `divSpan` element within this context.
          return $.timepicker._get( inst, key );
        } );

      // Store the timepicker instance data on the target element using jQuery's data method.
      $.data( target, PROP_NAME, inst );

      // Initialize the time from the associated field and then update the UI.
      this._setTimeFromField( inst );
      this._updateTimepicker( inst );
      inst.tpDiv.show(); // Make the inline timepicker visible in the DOM.
    },


    /*
     * Adjusts the z-index of the timepicker dialog to ensure it appears on top
     * of other overlapping elements on the page.
     *
     * @param {HTMLElement|Event} input  The input element associated with the timepicker,
     *                                   or the event object that triggered this call.
     */
    _adjustZIndex: function ( input ) {
      // Extract the actual DOM element from an event object if `input` is an event.
      input = input.target || input;
      var inst = $.timepicker._getInst( input );
      // Set the timepicker's z-index to be one higher than the effective z-index of its input.
      inst.tpDiv.css( 'zIndex', $.timepicker._getZIndex( input ) + 1 );
    },


    /*
     * Displays the time picker dialog for a given input field.
     * This comprehensive method handles positioning, animation, and UI updates.
     *
     * @param {HTMLElement|Event} input  The input field element, or the event object that triggered the display.
     */
    _showTimepicker: function ( input ) {
      // Normalize the `input` parameter to always be the actual DOM element.
      input = input.target || input;
      // If the trigger was a button or image, find the associated input field.
      if ( input.nodeName.toLowerCase() != 'input' ) {
        input = $( 'input', input.parentNode )[0];
      }

      // Prevent showing the timepicker if it's disabled or if it's already
      // displayed for the same input field.
      if ( $.timepicker._isDisabledTimepicker( input ) || $.timepicker._lastInput == input ) {
        return;
      }

      // Fix for v0.0.8: Ensure any currently open timepicker is hidden before displaying a new one.
      $.timepicker._hideTimepicker();

      var inst = $.timepicker._getInst( input );

      // If a different timepicker instance was previously active, stop its ongoing animations.
      if ( $.timepicker._curInst && $.timepicker._curInst != inst ) {
        $.timepicker._curInst.tpDiv.stop( true, true );
      }

      var beforeShow = $.timepicker._get( inst, 'beforeShow' );
      // Execute the `beforeShow` callback function. Any settings returned by this callback
      // will be merged into the instance's current settings.
      extendRemove( inst.settings, ( beforeShow ? beforeShow.apply( input, [input, inst] ) : {} ) );

      inst.lastVal = null; // Clear the last recorded value for change detection.
      $.timepicker._lastInput = input; // Keep track of the input element that opened the timepicker.

      $.timepicker._setTimeFromField( inst ); // Populate the timepicker with the current value from the input field.

      // If the timepicker is in a dialog context, clear the input value temporarily
      // to hide the cursor during interaction with the picker.
      if ( $.timepicker._inDialog ) {
        input.value = '';
      }

      // Calculate the default position if it hasn't been explicitly set.
      if ( !$.timepicker._pos ) {
        $.timepicker._pos = $.timepicker._findPos( input );
        $.timepicker._pos[1] += input.offsetHeight; // Position the timepicker directly below the input field.
      }

      // Determine if any parent element of the input has `position: fixed`.
      var isFixed = false;
      $( input ).parents().each( function () {
        isFixed |= $( this ).css( 'position' ) == 'fixed';
        return !isFixed; // Stop iteration once a fixed-positioned parent is found.
      } );

      // Apply a specific correction for the Opera browser when dealing with
      // fixed positioning and page scrolling.
      if ( isFixed && $.browser.opera ) {
        $.timepicker._pos[0] -= document.documentElement.scrollLeft;
        $.timepicker._pos[1] -= document.documentElement.scrollTop;
      }

      var offset = { left: $.timepicker._pos[0], top: $.timepicker._pos[1] };

      $.timepicker._pos = null; // Clear the temporary position storage after use.

      // Set initial CSS properties for sizing calculations off-screen to prevent visual flicker.
      inst.tpDiv.css( { position: 'absolute', display: 'block', top: '-1000px' } );
      $.timepicker._updateTimepicker( inst ); // Generate or refresh the timepicker's HTML content.


      // Position the timepicker using the jQuery UI Position utility if it's available
      // and the timepicker is not in inline mode.
      if ( ( !inst.inline ) && ( typeof $.ui.position == 'object' ) ) {
        inst.tpDiv.position( {
          of: inst.input, // Position the timepicker relative to the input element.
          my: $.timepicker._get( inst, 'myPosition' ), // Specifies the timepicker's corner to align.
          at: $.timepicker._get( inst, 'atPosition' ), // Specifies the input element's corner to align with.
          // offset: $( "#offset" ).val(), // Optional: custom offset values.
          // using: using, // Optional: callback for custom positioning logic.
          collision: 'flip' // Defines collision detection strategy.
        } );
        var offset = inst.tpDiv.offset(); // Retrieve the actual calculated offset after positioning.
        $.timepicker._pos = [ offset.top, offset.left ];
      }


      // Reset flags indicating if hours or minutes were clicked during the current interaction.
      inst._hoursClicked = false;
      inst._minutesClicked = false;

      // Perform a final adjustment of the position and width before displaying the timepicker.
      offset = $.timepicker._checkOffset( inst, offset, isFixed );
      inst.tpDiv.css( {
        position: ( $.timepicker._inDialog && $.blockUI ? 'static' : ( isFixed ? 'fixed' : 'absolute' ) ),
        display: 'none', // Keep the element hidden until the animation starts.
        left: offset.left + 'px',
        top: offset.top + 'px'
      } );

      // If the timepicker is not in inline mode, proceed with animation and final display.
      if ( !inst.inline ) {
        var showAnim = $.timepicker._get( inst, 'showAnim' );
        var duration = $.timepicker._get( inst, 'duration' );

        var postProcess = function () {
          $.timepicker._timepickerShowing = true; // Mark the timepicker as visible.
          var borders = $.timepicker._getBorders( inst.tpDiv );
          // For older IE browsers (IE6-), adjust the iframe cover to prevent select elements
          // from showing through the timepicker dialog.
          inst.tpDiv.find( 'iframe.ui-timepicker-cover' )
            .css( {
              left: -borders[0],
              top: -borders[1],
              width: inst.tpDiv.outerWidth(),
              height: inst.tpDiv.outerHeight()
            } );
        };

        // Important: A fix for the zIndex problem (hopefully permanent) - FG - v 0.2.9
        $.timepicker._adjustZIndex( input );
        // The original line below was commented out, so we maintain that status.
        //inst.tpDiv.css('zIndex', $.timepicker._getZIndex(input) +1);

        // Utilize jQuery UI effects for showing if available, otherwise fall back to standard jQuery show.
        if ( $.effects && $.effects[ showAnim ] ) {
          inst.tpDiv.show( showAnim, $.timepicker._get( inst, 'showOptions' ), duration, postProcess );
        }
        else {
          inst.tpDiv[ showAnim || 'show' ]( ( showAnim ? duration : null ), postProcess );
        }

        // If no animation or duration is specified, execute the post-processing steps immediately.
        if ( !showAnim || !duration ) {
          postProcess();
        }

        // If the input field is visible and not disabled, set focus to it.
        if ( inst.input.is( ':visible' ) && !inst.input.is( ':disabled' ) ) {
          inst.input.focus();
        }
        $.timepicker._curInst = inst; // Set this instance as the currently active one.
      }
    },


    /*
     * This function is a direct replication of the zIndex calculation logic from
     * jQuery UI core version 1.8.x. It's included here within the timepicker
     * to ensure backward compatibility regarding z-index management.
     * The function traverses the DOM tree upwards from the target element
     * to find the highest z-index among positioned parent elements.
     *
     * @param {HTMLElement} target  The DOM element for which to determine the z-index context.
     * @returns {number} The calculated z-index value, or 0 if no relevant z-index is found.
     */
    _getZIndex: function ( target ) {
      var elem = $( target ), position, value;
      while ( elem.length && elem[ 0 ] !== document ) {
        position = elem.css( "position" );
        if ( position === "absolute" || position === "relative" || position === "fixed" ) {
          value = parseInt( elem.css( "zIndex" ), 10 );
          if ( !isNaN( value ) && value !== 0 ) {
            return value;
          }
        }
        elem = elem.parent(); // Move up to the parent element in the DOM tree.
      }
      return 0; // Return 0 as a default if no relevant z-index is found among ancestors.
    },


    /*
     * Updates the timepicker's display by regenerating its HTML content
     * and then re-binding all necessary event handlers to the new elements.
     *
     * @param {object} inst  The timepicker instance object.
     */
    _updateTimepicker: function ( inst ) {
      // Clear any existing content within the timepicker div and then append the newly generated HTML.
      inst.tpDiv.empty().append( this._generateHTML( inst ) );
      // Rebind all interactive events to the newly created DOM elements to ensure functionality.
      this._rebindDialogEvents( inst );
    },


    /*
     * Rebinds all click, double-click, and hover events for the timepicker dialog elements.
     * This step is crucial and must be performed after the HTML content of the timepicker
     * has been regenerated or updated.
     *
     * @param {object} inst  The timepicker instance object.
     */
    _rebindDialogEvents: function ( inst ) {
      var borders = $.timepicker._getBorders( inst.tpDiv ),
        self = this; // Cache a reference to `this` (the Timepicker manager) for use within event handlers.

      inst.tpDiv
        .find( 'iframe.ui-timepicker-cover' ) // Target the IE6- iframe cover element.
        .css( {
          left: -borders[0],
          top: -borders[1],
          width: inst.tpDiv.outerWidth(),
          height: inst.tpDiv.outerHeight()
        } )
        .end() // End the current set of matched elements, reverting to the previous set (inst.tpDiv).

      // Bind click and double-click events for the minute selection cells.
      // Binding these events after HTML append is generally more performant, especially in older IE browsers.
        .find( '.ui-timepicker-minute-cell' )
        .unbind() // Remove any previously attached event handlers to prevent duplicate bindings.
        .bind( "click", { fromDoubleClick: false }, $.proxy( $.timepicker.selectMinutes, this ) )
        .bind( "dblclick", { fromDoubleClick: true }, $.proxy( $.timepicker.selectMinutes, this ) )
        .end() // Revert to the previous set of matched elements.

      // Bind click and double-click events for the hour selection cells.
        .find( '.ui-timepicker-hour-cell' )
        .unbind() // Remove any existing handlers.
        .bind( "click", { fromDoubleClick: false }, $.proxy( $.timepicker.selectHours, this ) )
        .bind( "dblclick", { fromDoubleClick: true }, $.proxy( $.timepicker.selectHours, this ) )
        .end() // Revert.

      // Bind mouseout and mouseover events for all anchor tags within the timepicker UI.
        .find( '.ui-timepicker td a' )
        .unbind() // Remove existing handlers.
        .bind( 'mouseout', function () {
          $( this ).removeClass( 'ui-state-hover' ); // Remove the general hover state class.
          // Remove specific hover classes for navigation buttons if they apply.
          if ( this.className.indexOf( 'ui-timepicker-prev' ) != -1 ) {
            $( this ).removeClass( 'ui-timepicker-prev-hover' );
          }
          if ( this.className.indexOf( 'ui-timepicker-next' ) != -1 ) {
            $( this ).removeClass( 'ui-timepicker-next-hover' );
          }
        } )
        .bind( 'mouseover', function () {
          // Apply hover state only if the timepicker's associated input is not disabled.
          if ( !self._isDisabledTimepicker( inst.inline ? inst.tpDiv.parent()[0] : inst.input[0] ) ) {
            // Remove hover class from all other calendar links to ensure only one is highlighted at a time.
            $( this ).parents( '.ui-timepicker-calendar' ).find( 'a' ).removeClass( 'ui-state-hover' );
            $( this ).addClass( 'ui-state-hover' ); // Add the hover class to the current element.
            // Add specific hover classes for navigation buttons if they apply.
            if ( this.className.indexOf( 'ui-timepicker-prev' ) != -1 ) {
              $( this ).addClass( 'ui-timepicker-prev-hover' );
            }
            if ( this.className.indexOf( 'ui-timepicker-next' ) != -1 ) {
              $( this ).addClass( 'ui-timepicker-next-hover' );
            }
          }
        } )
        .end() // Revert.

      // Trigger a mouseover event on any initially hovered day cells (if any, though less common for timepicker).
        .find( '.' + this._dayOverClass + ' a' )
        .trigger( 'mouseover' )
        .end() // Revert.

      // Bind the click event for the 'Now' button, which sets the current time.
        .find( '.ui-timepicker-now' ).bind( "click", function ( e ) {
          $.timepicker.selectNow( e );
        } ).end() // Revert.

      // Bind the click event for the 'Deselect' button, which clears the selected time.
        .find( '.ui-timepicker-deselect' ).bind( "click", function ( e ) {
          $.timepicker.deselectTime( e );
        } ).end() // Revert.

      // Bind the click event for the 'Close' button, which hides the timepicker dialog.
        .find( '.ui-timepicker-close' ).bind( "click", function ( e ) {
          $.timepicker._hideTimepicker();
        } ).end(); // Revert.
    },


    /*
     * Generates the complete HTML string representation of the timepicker UI.
     * This method constructs the entire user interface, including the hours grid,
     * minutes grid, AM/PM labels, and control buttons, based on the instance's settings.
     *
     * @param {object} inst  The timepicker instance object.
     * @returns {string} The HTML string that represents the timepicker UI.
     */
    _generateHTML: function ( inst ) {

      var h, m, row, col, html, hoursHtml, minutesHtml = '', // Declare variables for loop counters, HTML strings, etc.
        showPeriod = ( this._get( inst, 'showPeriod' ) == true ), // Check if the AM/PM period should be displayed with the selected time.
        showPeriodLabels = ( this._get( inst, 'showPeriodLabels' ) == true ); // Check if AM/PM labels should be visible within the timepicker UI itself.