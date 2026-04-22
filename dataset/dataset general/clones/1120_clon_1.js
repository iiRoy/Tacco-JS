/*
 * This file contains the Fastuts.js jQuery plugin implementation.
 * It provides a guided tour functionality for web pages.
 * @author Guilherme Augusto Madaleno <guimadaleno@me.com>
 * @version 0.9 - This version has been intentionally reformatted for visual variation.
 */

$.fn.fastuts = function( options )
{

  // Begin defining the default configuration options for the plugin.
  var opt =
  {

    // Main selector for elements that should be part of the tour.
    selector: $(this).selector.replace( '.', '' ).replace( '#', '' ),

    // General settings for the tour behavior.
    settings:
    {
      allowKeys:    (options && options.settings && options.settings.allowKeys) ? options.settings.allowKeys : true, // Enable keyboard navigation (left/right arrows).
      autoScroll:   (options && options.settings && options.settings.autoScroll) ? options.settings.autoScroll : true, // Automatically scroll to the active element.
      spacing:      (options && options.settings && options.settings.spacing) ? options.settings.spacing : '40px', // Padding around the highlighted element.
      time:         (options && options.settings && options.settings.time) ? options.settings.time : 0.3, // Transition time for animations.
      minHeight:    (options && options.settings && options.settings.minHeight) ? options.settings.minHeight : 400  // Minimum window height required for the tour.
    },

    // Configuration for the overlay that covers the rest of the page.
    overlay:
    {
      class:          (options && options.overlay && options.overlay.class) ? options.overlay.class : 'fastuts-overlay', // CSS class for the overlay.
      color:          (options && options.overlay && options.overlay.color) ? options.overlay.color : 'rgba(0,0,0,0.8)', // Background color of the overlay.
      allowEscapeKey: (options && options.overlay && options.overlay.allowEscapeKey) ? options.overlay.allowEscapeKey : true, // Allow closing with the Escape key.
      onClose:        (options && options.overlay && options.overlay.onClose && $.type(options.overlay.onClose) === 'function') ? options.overlay.onClose : false // Callback function executed when the overlay is closed.
    },

    // Settings for the navigation buttons (Close, Previous, Next).
    buttons:
    {

      close:
      {
        class:      'fastuts-button-close', // CSS class for the close button.
        text:       (options && options.buttons && options.buttons.close && options.buttons.close.text) ? options.buttons.close.text : 'Close', // Text for the close button.
        callback:   (options && options.buttons && options.buttons.close && options.buttons.close.callback && $.type(options.buttons.close.callback) === 'function') ? options.buttons.close.callback : false // Callback on close button click.
      },

      prev:
      {
        class:      'fastuts-button-prev', // CSS class for the previous button.
        text:       (options && options.buttons && options.buttons.prev && options.buttons.prev.text) ? options.buttons.prev.text : '&#10094;', // Text for the previous button (left arrow).
        callback:   (options && options.buttons && options.buttons.prev && options.buttons.prev.callback && $.type(options.buttons.prev.callback) === 'function') ? options.buttons.prev.callback : false // Callback on previous button click.
      },

      next:
      {
        class:      'fastuts-button-next', // CSS class for the next button.
        text:       (options && options.buttons && options.buttons.next && options.buttons.next.text) ? options.buttons.next.text : '&#10095;', // Text for the next button (right arrow).
        callback:   (options && options.buttons && options.buttons.next && options.buttons.next.callback && $.type(options.buttons.next.callback) === 'function') ? options.buttons.next.callback : false // Callback on next button click.
      }

    },

    // Collection of CSS classes used internally by Fastuts.
    classes:
    {

      // Classes for the tooltip arrow positioning.
      arrows:
      {
        top:      "fastuts-tooltip-arrow-top",
        right:    "fastuts-tooltip-arrow-right",
        bottom:   "fastuts-tooltip-arrow-bottom",
        left:     "fastuts-tooltip-arrow-left"
      },

      // Classes for the various content parts of the tooltip.
      content:
      {
        buttons:  "fastuts-buttons",
        holder:   "fastuts-holder",
        text:     "fastuts-text",
        tooltip:  "fastuts-tooltip"
      }

    },

    // Data attributes used by Fastuts to store state and configuration on elements.
    attributes:
    {
      order:              "data-fastuts-order", // Attribute to define the order of tour steps.
      previousElPosition: "data-fastuts-previous-element-position", // Stores the original CSS position of an element.
      previousPosition:   "data-fastuts-previous-position", // Stores the original CSS position of a fixed element.
      previousZIndex:     "data-fastuts-previous-zindex", // Stores the original z-index of an element.
      tip:                (options && options.attributes && options.attributes.tip) ? options.attributes.tip : "data-fastuts-tip" // Attribute containing the tooltip text.
    },

    // Callback function to be executed when the tour is ready to start.
    onReady: (options && options.onReady && $.type(options.onReady) === 'function') ? options.onReady : false,

    // ID for the main holder element that contains the tour UI.
    holder: "fastuts-main-holder",

    // Internal function variables and state management for Fastuts.
    fn:
    {
      alignTimer:   false, // Timer for aligning elements.
      block:        false, // Current block being displayed.
      el:           this, // The jQuery object representing the elements to tour.
      elAttrCount:  0, // Count of elements with the 'order' attribute.
      elCurPos:     0, // Current position style of the element.
      elHeight:     "", // Height of the current element.
      elLeft:       "", // Left position of the current element.
      elLoc:        "", // Offset of the current element.
      elMargin:     "", // Calculated margin based on spacing.
      elNum:        [], // Array to store elements in their defined order.
      elPos:        "", // Original position style of the element.
      elSize:       0, // Total number of tour elements.
      elTop:        "", // Top position of the current element.
      elWidth:      "", // Width of the current element.
      elWindowLeft: "", // Left boundary of the element relative to the window.
      elWindowRight: "", // Right boundary of the element relative to the window.
      elWindowTop:  "", // Top boundary of the element relative to the window.
      elZIndex:     0, // Original z-index of the current element.
      indexTimer:   false, // Timer for z-index manipulation.
      holderCSS:    false, // CSS properties for the holder.
      holderIndex:  1, // Current step index in the tour (1-based).
      index:        0 // Current step index in the tour (0-based).
    }
  };

  // Core functions of the Fastuts plugin.
  var fn =
  {
    init: function() // Initializes the Fastuts tour.
    {

      // Check if the window height meets the minimum requirement.
      if ( $(window).height() <= opt.settings.minHeight )
      {
        console.log( 'Fastuts cannot be loaded. Mininum height of ' + opt.settings.minHeight + 'px required.' );
      }
      else
      {

        // Iterate over all selected elements to count tour steps.
        $(opt.fn.el).each( function()
        {

          // Increment elSize if element has the tour selector class and tip attribute.
          if ( $(this).hasClass( opt.selector ) && $(this).attr( opt.attributes.tip ) )
          {
            opt.fn.elSize++;
          }

          // Increment elAttrCount if element has the 'order' attribute.
          if ( $(this).attr( opt.attributes.order ) )
          {
            opt.fn.elAttrCount++;
          }

        });

        // If 'order' attributes are used, reorder the elements array.
        if ( opt.fn.elAttrCount && opt.fn.elSize )
        {

          var currentNumber = 0; // Temporary variable for the current order number.

          $(opt.fn.el).each( function()
          {
            // Parse the order attribute and store the element in the correct position.
            currentNumber = ( parseInt( $(this).attr( opt.attributes.order ) ) - 1 );
            opt.fn.elNum[ currentNumber ] = this;
          });

          opt.fn.el = opt.fn.elNum; // Update the main elements array.

        }

        // Remove any existing tour holder before appending a new one.
        $( "#" + opt.holder ).remove();

        // Append the main tour structure to the body.
        $('body').append( '<div id="' + opt.holder + '" class="' + opt.holder + '" style="display: none;"><div class="' + opt.overlay.class + '"></div><div class="' + opt.classes.content.holder + '"><div class="' + opt.classes.content.tooltip + '"><div class="' + opt.classes.content.text + '"></div><div class="' + opt.classes.content.buttons + '"><a href="#" class="' + opt.buttons.close.class + '">' + opt.buttons.close.text + '</a><a href="#" class="' + opt.buttons.prev.class + '">' + opt.buttons.prev.text + '</a><a href="#" class="' + opt.buttons.next.class + '">' + opt.buttons.next.text + '</a></div></div></div></div>' );

        // If there are tour elements, proceed with displaying the first one.
        if ( opt.fn.elSize )
        {

          // Check if the first element is valid for the tour.
          if ( $(opt.fn.el[(opt.fn.holderIndex - 1)]).attr( opt.attributes.tip ) && $(opt.fn.el[(opt.fn.holderIndex - 1)]).hasClass( opt.selector ) )
          {

            // Display the initial block and update button states.
            fn.displayBlock( opt.fn.el[(opt.fn.holderIndex - 1)] );
            fn.displayButtons( 1, opt.fn.elSize );

            // Execute the onReady callback if provided.
            if ( opt.onReady )
            {
              opt.onReady();
            }

            // Event listener for the previous button.
            $( "." + opt.buttons.prev.class ).off( 'click' ).on( 'click', function()
            {

              fn.prevBlock( function()
              {

                if ( opt.buttons.prev.callback )
                {
                  opt.buttons.prev.callback( opt.fn.index, opt.fn.el );
                }

              });

              return false; // Prevent default link behavior.

            });

            // Event listener for the next button.
            $( "." + opt.buttons.next.class ).off( 'click' ).on( 'click', function()
            {

              fn.nextBlock( function()
              {

                if ( opt.buttons.next.callback )
                {
                  opt.buttons.next.callback( opt.fn.index, opt.fn.el );
                }

              });

              return false; // Prevent default link behavior.

            });

            // If keyboard navigation is allowed, set up keyup listeners.
            if ( opt.settings.allowKeys == true )
            {

              $( document ).keyup( function( e )
              {

                // Handle left arrow key for previous block.
                if ( e.keyCode == 37 )
                {

                  fn.prevBlock( function()
                  {

                    if ( opt.buttons.prev.callback )
                    {
                      opt.buttons.prev.callback( opt.fn.index, opt.fn.el );
                    }

                    return false; // Stop further event propagation.

                  });

                }
                // Handle right arrow key for next block.
                else if ( e.keyCode == 39 )
                {

                  fn.nextBlock( function()
                  {

                    if ( opt.buttons.next.callback )
                    {
                      opt.buttons.next.callback( opt.fn.index, opt.fn.el );
                    }

                    return false; // Stop further event propagation.

                  });

                }

              });
            }

            // Event listener for the close button.
            $( "." + opt.buttons.close.class ).off( 'click' ).on( 'click', function( event )
            {

              // If a close callback exists and returns true, hide the tour.
              if ( opt.buttons.close.callback && opt.buttons.close.callback() )
              {
                fn.hide();
                return false;
              }
              else // Otherwise, just hide it.
              {
                fn.hide();
                return false;
              }

            });

            // If escape key closing is allowed, set up a keyup listener.
            if ( opt.overlay.allowEscapeKey == true )
            {

              $( document ).keyup( function( e )
              {

                if ( e.keyCode == 27 ) // Check for Escape key (keyCode 27).
                {

                  if ( opt.overlay.onClose ) // Execute overlay onClose callback if exists.
                  {
                    opt.overlay.onClose();
                  }

                  fn.hide(); // Hide the tour.

                }

              });

            }

            // Event listener for clicking the overlay to close the tour.
            $( '.' + opt.overlay.class ).off( 'click' ).on( 'click', function()
            {

              if ( opt.overlay.onClose ) // Execute overlay onClose callback if exists.
              {
                opt.overlay.onClose();
              }

              fn.hide(); // Hide the tour.

              return false; // Prevent default link behavior.

            });

            // Fade in the main tour holder.
            $( "#" + opt.holder ).fadeIn( 200 );

          }

        }

      }

    },

    // Function to display a specific tour block (element and its tooltip).
    displayBlock: function ( block )
    {

      // Only proceed if the block is a valid tour element.
      if ( $(block).html() && $(block).hasClass( opt.selector ) && $(block).attr( opt.attributes.tip ) )
      {

        // Retrieve and calculate various positioning and sizing properties of the block.
        opt.fn.elLoc            = $(block).offset();
        opt.fn.elPos            = $(block).css( 'position' );
        // Determine the margin value, defaulting to 40 if spacing is not a valid px string.
        opt.fn.elMargin         = ( opt.settings.spacing && opt.settings.spacing.indexOf() == -1 ) ? parseInt( opt.settings.spacing.replace( "px", '' ) ) : 40;
        opt.fn.elWidth          = parseInt( $(block).css( 'width' ).replace( 'px', '' ) ) + ( opt.fn.elMargin );
        opt.fn.elHeight         = parseInt( $(block).css( 'height' ).replace( 'px', '' ) ) + ( opt.fn.elMargin );
        opt.fn.elTop            = ( opt.fn.elLoc.top - ( opt.fn.elMargin / 2 ) );
        opt.fn.elLeft           = ( opt.fn.elLoc.left - ( opt.fn.elMargin / 2 ) );
        opt.fn.elWindowTop      = ( opt.fn.elTop + opt.fn.elHeight );
        opt.fn.elWindowRight    = ( opt.fn.elLeft + opt.fn.elWidth );
        opt.fn.elWindowLeft     = opt.fn.elLeft;
        opt.fn.alignTimer; // This line seems to be a no-op, likely a leftover from previous logic.

        // Define the CSS properties for the tour holder.
        opt.fn.holderCSS =
        {
          position:           'absolute',
          width:              opt.fn.elWidth + 'px',
          height:             opt.fn.elHeight + 'px',
          top:                opt.fn.elTop + 'px',
          left:               opt.fn.elLeft + 'px',
          webkitTransition:   'all ' + opt.settings.time + 's', // Webkit transition for smooth movement.
          transition:         'all ' + opt.settings.time + 's', // Standard transition.
          backgroundColor:    ( $('body').css('backgroundColor') ) ? $('body').css('backgroundColor') : '#FFFFFF' // Background color, fallbacks to white.
        };

        // Find all fixed-positioned elements and temporarily change them to absolute.
        $('*').filter( function()
        {
          if ( $(this).css('position') == 'fixed' )
          {
            $(this).attr( opt.attributes.previousPosition, 'fixed' ); // Store original position.
            $(this).css( 'position', 'absolute' ); // Change to absolute.
          }
        });

        // Set the tooltip text from the element's attribute.
        $( "." + opt.classes.content.tooltip ).children( '.' + opt.classes.content.text ).html( $(block).attr( opt.attributes.tip ) );

        // Reset z-index for previously highlighted elements.
        $(opt.fn.el).each( function()
        {

          if ( $(this).attr( opt.attributes.previousZIndex ) )
          {
            $(this).css( 'z-index', $(this).attr( opt.attributes.previousZIndex ) );
          }

        });

        // Store the current z-index and position of the block.
        opt.fn.elZIndex = $(block).css( 'z-index' );
        opt.fn.elCurPos = $(block).css( 'position' );

        // If z-index hasn't been saved, save it.
        if ( !$(block).attr( opt.attributes.previousZIndex ) )
        {
          $(block).attr( opt.attributes.previousZIndex, opt.fn.elZIndex );
        }

        // If element position hasn't been saved, save it.
        if ( !$(block).attr( opt.attributes.previousElPosition ) )
        {
          $(block).attr( opt.attributes.previousElPosition, opt.fn.elCurPos );
        }

        // Clear any existing index timer.
        if ( opt.fn.indexTimer )
        {
          clearTimeout( opt.fn.indexTimer );
        }

        // Set a timeout to adjust the z-index and position of the current block.
        opt.fn.indexTimer = setTimeout( function()
        {

          $(block).css
          ({
            zIndex:       '2147483637', // Set a very high z-index to bring it to front.
            position:     ( opt.fn.elCurPos === 'static' ) ? 'relative' : opt.fn.elCurPos // Ensure it's not static for z-index to work.
          }).hide().fadeIn( 200 ); // Fade in the block after adjustments.

        }, ( opt.settings.time * 750 ) ); // Delay based on transition time.

        // Apply CSS for the overlay.
        $( '.' + opt.overlay.class ).css
        ({
          position:           'fixed',
          left:               '0px',
          top:                '0px',
          right:              '0px',
          bottom:             '0px',
          backgroundColor:    ( opt.overlay.color ) ? opt.overlay.color : 'rgba(0,0,0,0.8)'
        });

        // Apply CSS for the main tour holder.
        $( '.' + opt.holder ).css
        ({
          position:           'absolute',
          left:               '0px',
          top:                '0px',
          right:              '0px',
          bottom:             '0px'
        });

        // Determine tooltip position (top or bottom) based on available space.
        if ( opt.fn.elWindowTop >= ( $(window).height() - 200 ) )
        {

          // Position tooltip above the element.
          $( "." + opt.classes.content.tooltip ).removeClass( opt.classes.arrows.top ).addClass( opt.classes.arrows.bottom ).css
          ({
            top: '-' + ( $( "." + opt.classes.content.tooltip ).height() + 20 ) + 'px'
          });

          // Autoscroll to bring the element into view, adjusting for tooltip height.
          if ( opt.settings.autoScroll )
          {
            $( "html, body" ).clearQueue().animate( { scrollTop: ( opt.fn.elTop - ( $( "." + opt.classes.content.tooltip ).height() + 40 ) ) }, 500 );
          }

        }
        else
        {

          // Position tooltip below the element.
          $( "." + opt.classes.content.tooltip ).removeClass( opt.classes.arrows.bottom ).addClass( opt.classes.arrows.top ).css
          ({
            top: ( opt.fn.elHeight + 20 ) + 'px'
          });

          // Autoscroll to bring the element into view.
          if ( opt.settings.autoScroll )
          {
            $( "html, body" ).clearQueue().animate( { scrollTop: ( opt.fn.elTop - 20 ) }, 500 );
          }

        }

        // Determine horizontal tooltip position (left, right, or center).
        if ( opt.fn.elWindowLeft <= 100 )
        {

          // Position tooltip to the left.
          $( "." + opt.classes.content.tooltip ).removeClass( opt.classes.arrows.right ).addClass( opt.classes.arrows.left ).css
          ({
            left:           '0px',
            right:          'auto',
            marginLeft:     'inherit'
          });

        }
        else if ( opt.fn.elWindowRight >= ( $(window).width() - 100 ) )
        {

          // Position tooltip to the right.
          $( "." + opt.classes.content.tooltip ).removeClass( opt.classes.arrows.left ).addClass( opt.classes.arrows.right ).css
          ({
            left:           'auto',
            right:          '0px',
            marginRight:    'inherit'
          });

        }
        else
        {

          // Center the tooltip horizontally.
          $( "." + opt.classes.content.tooltip ).removeClass( opt.classes.arrows.left ).removeClass( opt.classes.arrows.right ).css
          ({
            left:           '50%',
            right:          'auto',
            marginLeft:     '-' + ( $( "." + opt.classes.content.tooltip ).width() / 2 ) + 'px' // Adjust for half its width to truly center.