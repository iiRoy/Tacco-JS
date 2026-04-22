/*
 * jQuery aSimpleTour - A simple web tour plugin
 *
 * @description Provides an interactive tour experience for web pages.
 * @author alvaro.veliz@gmail.com - Original author.
 * @servedby perkins (http://p.erkins.com) - Hosting/Serving information.
 *
 * Dependencies:
 * - jQuery library (required for core functionality)
 * - jQuery scrollTo plugin (for smooth scrolling to elements)
 *
 * Inspiration:
 * This implementation is conceptually based on the "Website Tour" tutorial
 * by Manoela Lic (https://twitter.com/#!/crnacura) found on Codrops:
 * http://tympanus.net/codrops/2010/12/21/website-tour/
 *
 * License: MIT or GPL (to be confirmed, usually implied for plugins of this nature)
 */

// Encapsulate the plugin within an Immediately Invoked Function Expression (IIFE)
// to prevent global scope pollution and ensure jQuery is available as '$'.
( function( $ ) {

  // Default settings for the tour plugin. These can be overridden by user options.
  var settings = {
    data               : [],               // Array of tour steps, each an object with step details.
    autoStart          : false,            // If true, the tour starts automatically on initialization.
    controlsPosition   : 'TR',             // Position of the tour controls (TopRight, TopLeft, BottomRight, BottomLeft).
    welcomeMessage     : '<h2>Tour</h2><p>Welcome to the Tour Plugin</p>', // Initial message displayed in controls.
    buttons            : {                 // Text labels for control buttons.
      next             : 'Next',           // Label for the 'Next' button.
      prev             : 'Previous',       // Label for the 'Previous' button.
      start            : 'Start',          // Label for the 'Start' button (initial 'Next' button state).
      end              : 'End'             // Label for the 'End' button.
    },
    controlsColors     : {                 // CSS colors for the tour controls container.
      background       : 'rgba(8, 68, 142, 0.80)', // Background color with transparency.
      color            : '#fff'            // Text color.
    },
    tooltipColors      : {                 // CSS colors for the tour tooltip.
      background       : 'rgba(0, 0, 0, 0.70)',    // Background color with transparency.
      color            : '#fff'                     // Text color.
    }
  };

  // Declare global variables used within the plugin scope.
  var options, step, steps;       // options: merged settings; step: current tour step index; steps: total number of steps.
  var ew, eh, el, et;             // ew: element width; eh: element height; el: element left; et: element top.
  var started = false;            // Flag to indicate if the tour has started.
  var direction = 'f';            // 'f' for forward (next), 'b' for backward (previous).

  // Create the jQuery tooltip element. It's initially hidden.
  var $tooltip    = $( '<div>', {
                      id           : 'tourtip',        // Unique ID for the tooltip.
                      className    : 'tourtip',        // Class name for styling.
                      html         : ''                // Initial empty HTML content.
                    } ).css( {
                      'display'       : 'none',        // Hidden by default.
                      'padding'       : '10px 20px',   // Padding inside the tooltip.
                      'position'      : 'absolute',    // Positioned absolutely on the page.
                      'font-family'   : 'sans-serif',  // Font style.
                      'border-radius' : '5px',         // Rounded corners.
                      'font-size'     : '12px',        // Font size.
                      'box-sizing'    : 'border-box'   // Include padding and border in element's total width and height.
                    } );

  // Define the core methods of the aSimpleTour plugin.
  var methods = {

    // Initialization method.
    init : function( opts ) {
      // Check if the tour has not already been started.
      if ( started == false ) {
        started = true; // Set the flag to true to prevent re-initialization.
        // Merge default settings with user-provided options.
        options = $.extend( settings, opts );
        
        // Construct the HTML for the tour controls.
        // Note: Using string concatenation for multi-line HTML.
        controls = '<div id="tourControls">' +
          '<div id="tourText">' + options.welcomeMessage + '</div>' +
          '<div id="tourButtons">' +
            '<button id="tourPrev" style="display:none">' + options.buttons.prev + '</button>' +
            '<button id="tourNext">' + options.buttons.start + '</button>' +
            '<a href="javascript:void(0);" id="tourEnd" style="display:none; color: #fff; text-decoration: underline; font-size: 12px; float: right">' + options.buttons.end + '</a>' +
          '</div>' +
        '</div>';

        // Define base CSS for the controls.
        $controlsCss = {
          'display'    : 'block',
          'position'   : 'fixed',
          'width'      : '200px',
          'padding'    : '10px 20px',
          'border-radius' : '10px',
          'font-family' : 'sans-serif'
        };
        // Create the controls element, apply base CSS, then apply user-defined colors.
        $controls = $( controls ).css( $controlsCss ).css( options.controlsColors );
        // Get the specific position CSS based on options.controlsPosition.
        $cpos = methods.getControlPosition( options.controlsPosition );
        // Apply the position CSS to the controls.
        $controls.css( $cpos );
        // Append the controls to the body.
        $( 'body' ).append( $controls );

        // Apply user-defined tooltip colors.
        $tooltip.css( options.tooltipColors );

        step = -1; // Initialize step counter (pre-start).
        steps = options.data.length; // Total number of steps in the tour.
        $( 'body' ).prepend( $tooltip ); // Add the tooltip to the body (prepended to be on top).
      }
    },

    // Advances the tour to the next step.
    next : function() {
      direction = 'f'; // Set direction to forward.
      step++;          // Increment the step counter.

      // If all steps are completed, destroy the tour.
      if ( step == steps ) {
        methods.destroy();
      }
      else {
        $tooltip.hide(); // Hide the current tooltip before showing the next.
        stepData = options.data[ step ]; // Get data for the current step.

        // Update button visibility and text for subsequent steps.
        if ( step <= steps ) {
          $( '#tourPrev' ).show();                      // Show 'Previous' button.
          $( '#tourEnd' ).show();                        // Show 'End' button.
          $( '#tourNext' ).show().html( options.buttons.next ); // Show 'Next' button and set its text.
        }

        methods.setTooltip( stepData ); // Display the tooltip for the current step.
      }
    },

    // Moves the tour to the previous step.
    prev : function() {
      direction = 'b'; // Set direction to backward.

      $tooltip.hide(); // Hide the current tooltip.

      // If not at the very beginning, ensure 'Next' button is visible.
      if ( step < steps ) {
        $( '#tourNext' ).show().html( options.buttons.next );
      }

      // If moving back to the very first step (or before step 0).
      if ( step <= 0 ) {
        $( '#tourPrev' ).hide();                          // Hide 'Previous' button.
        $( '#tourEnd' ).hide();                            // Hide 'End' button.
        $( '#tourNext' ).html( options.buttons.start );   // Change 'Next' to 'Start'.
        step--;                                          // Decrement step (can go to -1).
      }
      else {
        step--; // Decrement step for regular backward movement.
        stepData = options.data[ step ]; // Get data for the previous step.

        methods.setTooltip( stepData ); // Display the tooltip for the previous step.
      }
    },

    // Sets and displays the tooltip for a given step.
    setTooltip : function( stepData ) {
      $element = $( stepData.element ); // The target element for the current step.

      // If a specific controls position is defined for this step, update it.
      if ( stepData.controlsPosition ) {
        methods.setControlsPosition( stepData.controlsPosition );
      }

      // If the step has a tooltip message.
      if ( stepData.tooltip ) {
        $tooltip.html( stepData.tooltip ); // Set the tooltip's HTML content.
        // Determine the text to display in the main tour controls area.
        text = ( typeof stepData.text != 'undefined' ) ? stepData.text : stepData.tooltip;
        $( '#tourText' ).html( text ); // Update the tour text.
        
        // Determine the tooltip's position relative to the target element.
        tooltipPos = ( typeof stepData.position == 'undefined' ) ? 'BL' : stepData.position;
        $pos = methods.getTooltipPosition( tooltipPos, $element ); // Calculate actual pixel position.
        
        // Apply the calculated position and show the tooltip.
        $tooltip.css( { 'top': $pos.top + 'px', 'left': $pos.left + 'px' } );
        $tooltip.show( 'fast' );  // Show with a fast animation.

        // Scroll the page to the tooltip, with an offset.
        $.scrollTo( $tooltip, 400, { offset : -100 } );
      }


      // Execute a callback function if defined for the step.
      if ( typeof stepData.callback != 'undefined' ) {
        if ( stepData.callback == 'click' ) {
          // Regex to check if the href is a full URL or a URL slug.
          urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          urlslugRegex = /^[a-z0-9-]+$/;

          // If the element's href is a valid URL or slug, navigate to it.
          if ( urlRegex.test( $element.attr( 'href' ) ) || urlslugRegex.test( $element.attr( 'href' ) ) ) {
            location.href = $element.attr( 'href' );
          }
          else {
            $element.trigger( 'click' ); // Otherwise, trigger a click event on the element.
          }
        }
        else {
          // If the callback is a custom function name (string), evaluate and call it.
          // Note: Using eval() can be a security risk if input is not controlled.
          if ( typeof eval( stepData.callback ) == 'function' ) {
            eval( stepData.callback );
          }
        }
      }

      // If 'next' is true in stepData, automatically advance or go back.
      if ( stepData.next === true ) {
        if ( direction == 'f' ) {
          methods.next();  // Go to the next step.
        }
        else {
          methods.prev(); // Go to the previous step.
        }
      }

    },

    // Updates the position of the tour controls.
    setControlsPosition : function( pos ) {
      chtml = $controls.html(); // Store current HTML content of controls.
      $controls.remove();       // Remove existing controls from DOM.
      $controls = $( controls ).html( chtml ); // Recreate controls with stored HTML.
      // Reapply base CSS and colors.
      $controls = $controls.css( $controlsCss ).css( options.controlsColors );
      position = methods.getControlPosition( pos ); // Get new position CSS.
      $controls.css( position ); // Apply new position.
      $( 'body' ).append( $controls ); // Re-append controls to the body.
    },

    // Calculates the absolute position for the tooltip based on target element and desired position.
    getTooltipPosition : function( pos, $e ) {
      // Get dimensions and offset of the target element.
      ew = $element.outerWidth();
      eh = $element.outerHeight();
      el = $element.offset().left;
      et = $element.offset().top;
      // Get dimensions of the tooltip (including padding).
      tw = $tooltip.width() + parseInt( $tooltip.css( 'padding-left' ) ) + parseInt( $tooltip.css( 'padding-right' ) );
      th = $tooltip.height() + parseInt( $tooltip.css( 'padding-top' ) ) +  + parseInt( $tooltip.css( 'padding-bottom' ) );

      $( '.tourArrow' ).remove(); // Remove any existing arrows.
      tbg = $tooltip.css( 'background-color' ); // Get tooltip background color for arrow border.

      // Define arrow elements.
      $upArrow = $( '<div class="tourArrow"></div>' ).css( { 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-left' : '5px solid transparent', 'border-right' : '5px solid transparent', 'border-bottom' : '5px solid ' + tbg } );
      $downArrow = $( '<div class="tourArrow"></div>' ).css( { 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-left' : '5px solid transparent', 'border-right' : '5px solid transparent', 'border-top' : '5px solid ' + tbg } );
      $rightArrow = $( '<div class="tourArrow"></div>' ).css( { 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-top' : '5px solid transparent', 'border-bottom' : '5px solid transparent', 'border-left' : '5px solid ' + tbg } );
      $leftArrow = $( '<div class="tourArrow"></div>' ).css( { 'position' : 'absolute', 'display' : 'block', 'width' : '0', 'height' : '0', 'border-top' : '5px solid transparent', 'border-bottom' : '5px solid transparent', 'border-right' : '5px solid ' + tbg } );

      // Calculate position based on 'pos' parameter.
      switch ( pos ) {
        case 'BL' : // Bottom Left
          position = { 'left'  : el, 'top' : et + eh + 10 };
          $upArrow.css( { top: '-5px', left: '48%' } );
          $tooltip.prepend( $upArrow );
          break;

        case 'BR' : // Bottom Right
          position = { 'left'  : el + ew - tw, 'top' : et + eh + 10 };
          $upArrow.css( { top: '-5px', left: '48%' } );
          $tooltip.prepend( $upArrow );
          break;

        case 'TL' : // Top Left
          position = { 'left'  : el, 'top' : ( et - th ) -10 };
          $downArrow.css( { top: th, left: '48%' } );
          $tooltip.append( $downArrow );
          break;

        case 'TR' : // Top Right
          position = { 'left'  : ( el + ew ) - tw, 'top' : et - th -10 };
          $downArrow.css( { top: th, left: '48%' } );
          $tooltip.append( $downArrow );
          break;

        case 'RT' : // Right Top
          position = { 'left'  : el + ew + 10, 'top' : et };
          $leftArrow.css( { left: '-5px' } );
          $tooltip.prepend( $leftArrow );
          break;

        case 'RB' : // Right Bottom
          position = { 'left'  : el + ew + 10, 'top' : et + eh - th };
          $leftArrow.css( { left: '-5px' } );
          $tooltip.prepend( $leftArrow );
          break;

        case 'LT' : // Left Top
          position = { 'left'  : ( el - tw ) - 10, 'top' : et };
          $rightArrow.css( { right: '-5px' } );
          $tooltip.prepend( $rightArrow );
          break;

        case 'LB' : // Left Bottom
          position = { 'left'  : ( el - tw ) - 10, 'top' : et + eh - th};
          $rightArrow.css( { right: '-5px' } );
          $tooltip.prepend( $rightArrow );
          break;

        case 'B'  : // Bottom Center
          position = { 'left'  : el + ew/2 - tw/2, 'top' : ( et + eh ) + 10 };
          $upArrow.css( { top: '-5px', left: '48%' } );
          $tooltip.prepend( $upArrow );
          break;

        case 'L'  : // Left Center
          position = { 'left'  : ( el - tw ) - 10, 'top' : et + eh/2 - th/2 };
          $rightArrow.css( { right: '-5px' } );
          $tooltip.prepend( $rightArrow );
          break;

        case 'T'  : // Top Center
          position = { 'left'  : el + ew/2 - tw/2, 'top' : ( et - th ) - 10 };
          $downArrow.css( { top: th, left: '48%' } );
          $tooltip.append( $downArrow );
          break;

        case 'R'  : // Right Center
          position = { 'left'  : ( el + ew ) + 10, 'top' : et + eh/2 - th/2 };
          $leftArrow.css( { left: '-5px' } );
          $tooltip.prepend( $leftArrow );
          break;
      }
      return position; // Return the calculated position object.
    },

    // Returns CSS properties for control positioning based on a predefined string.
    getControlPosition: function( pos ) {
      switch ( pos ) {
        case 'TR': // Top Right
          pos = { 'top' : '10px', 'right' : '10px' };
          break;

        case 'TL': // Top Left
          pos = { 'top' : '10px', 'left' : '10px' };
          break;

        case 'BL': // Bottom Left
          pos = { 'bottom' : '10px', 'left' : '10px' };
          break;

        case 'BR': // Bottom Right
          pos = { 'bottom' : '10px', 'right' : '10px' };
          break;
      }
      return pos; // Return the CSS position object.
    },

    // Destroys the tour, removing all elements and resetting state.
    destroy : function() {
      $( '#tourControls' ).remove(); // Remove the tour controls.
      $( '#tourtip' ).remove();       // Remove the tooltip.
      // Reset tooltip state (though it's already removed, good practice).
      $tooltip.css( { 'display' : 'none' } ).html( '' );
      step = -1;     // Reset step counter.
      started = false; // Reset started flag.
    }
  };

  // Attach event handlers for tour control buttons using event delegation.
  // This ensures handlers work even if controls are re-created.

  $( document ).on( 'click', "#tourNext", function() {
    methods.next(); // Call the next method when 'tourNext' is clicked.
  } );

  $( document ).on( 'click', "#tourPrev", function() {
    methods.prev(); // Call the prev method when 'tourPrev' is clicked.
  } );

  $( document ).on( 'click', "#tourEnd", function() {
    methods.destroy(); // Call the destroy method when 'tourEnd' is clicked.
  } );

  // jQuery plugin definition.
  // Allows calling methods like $(selector).aSimpleTour('methodName', args)
  // or $(selector).aSimpleTour({ options }).
  $.fn.aSimpleTour = function( method ) {
    // Check if the requested method exists in our 'methods' object.
    if ( methods[ method ] ) {
      // If it exists, call it using apply, passing 'this' (the jQuery object)
      // as context and slicing off the method name from arguments.
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } 
    // If no method name is provided, or if the first argument is an object,
    // assume it's an initialization call.
    else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments ); // Call the init method.
    } 
    // If an unknown method name is provided.
    else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.aSimpleTour' );
    }   
  };

} )( jQuery ); // Pass jQuery object to the IIFE.

// Provide a direct access alias for convenience, useful for starting a tour
// without needing to select an element, e.g., $.aSimpleTour({ options }).
$.aSimpleTour = function( opts ) {
  $.fn.aSimpleTour( opts );
};