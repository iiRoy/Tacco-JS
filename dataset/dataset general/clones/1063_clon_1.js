/*
 * jQuery Bootstrap News Box v1.0.1
 *
 * Copyright 2014, Dragan Mitrovic
 * email: gagi270683@gmail.com
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * This file contains the core logic for the Bootstrap News Box plugin.
 * It provides functionality for displaying news items in a ticker-like fashion.
 */


// Utility function to provide Object.create polyfill for older browsers.
// This ensures that object inheritance works consistently across different environments.
if ( typeof Object.create !== 'function' )
{
  // Douglas Crockford's inheritance function implementation.
  // It creates a new object with the specified prototype object.
  Object.create = function ( obj )
  {
    /* Internal constructor function for setting up the prototype chain. */
    function F() { }

    /* Set the prototype of the temporary constructor to the desired object. */
    F.prototype = obj;

    /* Return a new instance of F, which now inherits from obj. */
    return new F();
  };
}


/*
 * Self-executing anonymous function (IIFE) to encapsulate the plugin's code.
 * This prevents polluting the global namespace and ensures 'undefined' is truly undefined.
 *
 * @param {object} $        - The jQuery object.
 * @param {object} w        - The window object.
 * @param {object} d        - The document object.
 * @param {undefined} undefined - Ensures 'undefined' is truly undefined.
 */
(function ( $, w, d, undefined ) {

  // The main NewsBox object literal, serving as the prototype for plugin instances.
  var NewsBox = {

    /*
     * Initializes the plugin instance.
     * Caches references, sets up initial state, and prepares the layout.
     *
     * @param {object} options - User-defined options to override defaults.
     * @param {HTMLElement} elem   - The DOM element the plugin is initialized on.
     */
    init: function ( options, elem ) {
      // Cache references to the current instance and its DOM elements.
      var self = this;
      self.elem = elem;
      self.$elem = $( elem );

      // Determine the tag name and class name of the news items.
      self.newsTagName = self.$elem.find( ":first-child" ).prop( 'tagName' );
      self.newsClassName = self.$elem.find( ":first-child" ).attr( 'class' );

      // Initialize animation-related timers and flags.
      self.timer = null;
      self.resizeTimer = null; // Used with window.resize event to debounce.
      self.animationStarted = false; // Flag to prevent multiple animations simultaneously.
      self.isHovered = false; // Flag to track if the news box is being hovered over.


      // Check if options are provided as a string (unsupported).
      if ( typeof options === 'string' ) {
        // Log an error if console is available.
        if ( console ) {
          console.error( "String property override is not supported" );
        }
        // Throw an error to halt execution.
        throw ( "String property override is not supported" );
      } else {
        // Options are an object, so extend default options with user-provided ones.
        self.options = $.extend( {}, $.fn.bootstrapNews.options, options );

        // Prepare the visual layout of the news box.
        self.prepareLayout();


        // Autostart animation if enabled in options.
        if ( self.options.autoplay ) {
          self.animate();
        }

        // Build navigation controls if enabled.
        if ( self.options.navigation ) {
          self.buildNavigation();
        }

        // Allow users to provide a custom callback function.
        if ( typeof self.options.onToDo === 'function' ) {
          self.options.onToDo.apply( self, arguments );
        }

      }
    },

    /*
     * Prepares the layout of the news box, including visibility and height.
     * Also sets up event listeners for mouse interaction and window resizing.
     */
    prepareLayout: function () {
      var self = this;

      // Attach mouseenter event handler for individual news items.
      $( self.elem ).find( '.' + self.newsClassName ).on( 'mouseenter', function () {
        // Reset the animation state, indicating hover.
        self.onReset( true );
      } );

      // Attach mouseout event handler for individual news items.
      $( self.elem ).find( '.' + self.newsClassName ).on( 'mouseout', function () {
        // Reset the animation state, indicating no hover.
        self.onReset( false );
      } );

      // Iterate through news items to set their initial visibility.
      $.map( self.$elem.find( self.newsTagName ), function ( newsItem, index ) {
        if ( index > self.options.newsPerPage - 1 ) {
          // Hide news items beyond the 'newsPerPage' limit.
          $( newsItem ).hide();
        } else {
          // Show news items within the 'newsPerPage' limit.
          $( newsItem ).show();
        }
      } );

      // Adjust 'newsPerPage' if the total number of news items is less than the option.
      if ( self.$elem.find( self.newsTagName ).length < self.options.newsPerPage ) {
        self.options.newsPerPage = self.$elem.find( self.newsTagName ).length;
      }

      // Calculate the total height required for the visible news items.
      var height = 0;

      $.map( self.$elem.find( self.newsTagName ), function ( newsItem, index ) {
        if ( index < self.options.newsPerPage ) {
          // Accumulate height, adding a small margin (10px).
          height = parseInt( height ) + parseInt( $( newsItem ).height() ) + 10;
        }
      } );

      // Apply CSS styles to the news box container for overflow and fixed height.
      $( self.elem ).css( { "overflow-y": "hidden", "height": height } );

      // Recalculate news box height for responsive interfaces on window resize.
      $( w ).resize( function () {
        // Clear any existing resize timer to debounce the event.
        if ( self.resizeTimer !== null ) {
          clearTimeout( self.resizeTimer );
        }
        // Set a new timer to re-prepare the layout after a short delay.
        self.resizeTimer = setTimeout( function () {
          self.prepareLayout();
        }, 200 );
      } );

    },

    /*
     * Locates the parent panel object associated with the news box.
     * This is typically used for placing navigation controls.
     *
     * @returns {jQuery|undefined} The jQuery object of the panel, or undefined if not found.
     */
    findPanelObject: function () {
      var panel = this.$elem;

      // Traverse up the DOM tree until the parent panel is found.
      while ( panel.parent() !== undefined ) {
        panel = panel.parent();
        // Check if the current parent has the 'panel' class.
        if ( panel.parent().hasClass( 'panel' ) ) {
          return panel.parent();
        }
      }

      // Return undefined if no panel is found.
      return undefined;
    },

    /*
     * Builds and appends navigation controls (previous/next buttons) to the panel.
     */
    buildNavigation: function () {
      var panel = this.findPanelObject(); // Get the associated panel.
      if ( panel ) {
        // HTML structure for pagination navigation.
        var nav = '<ul class="pagination pull-right" style="margin: 0px;">' +
          '<li><a href="#" class="prev"><span class="glyphicon glyphicon-chevron-down"></span></a></li>' +
          '<li><a href="#" class="next"><span class="glyphicon glyphicon-chevron-up"></span></a></li>' +
          '</ul><div class="clearfix"></div>';


        // Find the panel footer or create one if it doesn't exist.
        var footer = $( panel ).find( ".panel-footer" )[ 0 ];
        if ( footer ) {
          // Append navigation to an existing footer.
          $( footer ).append( nav );
        } else {
          // Create a new footer and append navigation to it.
          $( panel ).append( '<div class="panel-footer">' + nav + '</div>' );
        }

        var self = this;
        // Attach click event handler for the 'previous' button.
        $( panel ).find( '.prev' ).on( 'click', function ( ev ) {
          ev.preventDefault(); // Prevent default link behavior.
          self.onPrev(); // Call the previous news item handler.
        } );

        // Attach click event handler for the 'next' button.
        $( panel ).find( '.next' ).on( 'click', function ( ev ) {
          ev.preventDefault(); // Prevent default link behavior.
          self.onNext(); // Call the next news item handler.
        } );

      }
    },

    /*
     * Placeholder method for stopping the news ticker.
     * Currently does nothing.
     */
    onStop: function () {
      // This method is intentionally left empty for future expansion.
    },

    /*
     * Pauses the news ticker animation.
     * Sets the 'isHovered' flag and clears the animation timer if autoplay is active.
     */
    onPause: function () {
      var self = this;
      self.isHovered = true; // Indicate that the news box is hovered.
      if ( this.options.autoplay && self.timer ) {
        clearTimeout( self.timer ); // Stop the current animation timer.
      }
    },

    /*
     * Resets or restarts the animation timer based on hover status.
     *
     * @param {boolean} status - True if hovered, false otherwise.
     */
    onReset: function ( status ) {
      var self = this;
      if ( self.timer ) {
        clearTimeout( self.timer ); // Clear any active animation timer.
      }

      if ( self.options.autoplay ) {
        self.isHovered = status; // Update hover status.
        self.animate(); // Restart animation based on the new status.
      }
    },

    /*
     * Initiates the news ticker animation.
     * Sets a timeout to trigger either 'onNext' or 'onPrev' based on direction.
     */
    animate: function () {
      var self = this;
      self.timer = setTimeout( function () {

        // If pauseOnHover is not enabled, ensure isHovered is false for continuous animation.
        if ( !self.options.pauseOnHover ) {
          self.isHovered = false;
        }

        // Proceed with animation only if not hovered.
        if ( !self.isHovered ) {
          if ( self.options.direction === 'up' ) {
            self.onNext(); // Move to the next news item (upwards).
          } else {
            self.onPrev(); // Move to the previous news item (downwards).
          }
        }
      }, self.options.newsTickerInterval ); // Use the configured interval.
    },

    /*
     * Handles displaying the previous news item.
     * Clones the last item, prepends it, slides it down, and removes the last item.
     */
    onPrev: function () {

      var self = this;

      // Prevent animation if one is already in progress.
      if ( self.animationStarted ) {
        return false;
      }

      self.animationStarted = true; // Set flag to indicate animation has started.

      // Create a new HTML string for the cloned last news item.
      var html = '<' + self.newsTagName + ' style="display:none;" class="' + self.newsClassName + '">' + $( self.$elem ).find( self.newsTagName ).last().html() + '</' + self.newsTagName + '>';
      $( self.$elem ).prepend( html ); // Prepend the cloned item to the container.
      $( self.$elem ).find( self.newsTagName ).first().slideDown( self.options.animationSpeed, function () {
        $( self.$elem ).find( self.newsTagName ).last().remove(); // Remove the original last item after slide down.
      } );

      // Slide up the item that is now out of view (the one at newsPerPage + 1 position).
      $( self.$elem ).find( self.newsTagName + ':nth-child(' + parseInt( self.options.newsPerPage + 1 ) + ')' ).slideUp( self.options.animationSpeed, function () {
        self.animationStarted = false; // Reset animation started flag.
        self.onReset( self.isHovered ); // Reset the animation timer.
      } );

      // Re-attach mouseenter event handler for individual news items (necessary if DOM elements change).
      $( self.elem ).find( '.' + self.newsClassName ).on( 'mouseenter', function () {
        self.onReset( true );
      } );

      // Re-attach mouseout event handler for individual news items.
      $( self.elem ).find( '.' + self.newsClassName ).on( 'mouseout', function () {
        self.onReset( false );
      } );
    },

    /*
     * Handles displaying the next news item.
     * Clones the first item, appends it, slides up the original first item,
     * and slides down the newly visible item.
     */
    onNext: function () {
      var self = this;

      // Prevent animation if one is already in progress.
      if ( self.animationStarted ) {
        return false;
      }

      self.animationStarted = true; // Set flag to indicate animation has started.

      // Create a new HTML string for the cloned first news item.
      var html = '<' + self.newsTagName + ' style="display:none;" class=' + self.newsClassName + '>' + $( self.$elem ).find( self.newsTagName ).first().html() + '</' + self.newsTagName + '>';
      $( self.$elem ).append( html ); // Append the cloned item to the container.

      // Slide up the original first item.
      $( self.$elem ).find( self.newsTagName ).first().slideUp( self.options.animationSpeed, function () {
        $( this ).remove(); // Remove the original first item after slide up.
      } );

      // Slide down the item that is now visible (the one at newsPerPage + 1 position).
      $( self.$elem ).find( self.newsTagName + ':nth-child(' + parseInt( self.options.newsPerPage + 1 ) + ')' ).slideDown( self.options.animationSpeed, function () {
        self.animationStarted = false; // Reset animation started flag.
        self.onReset( self.isHovered ); // Reset the animation timer.
      } );

      // Re-attach mouseenter event handler for individual news items (necessary if DOM elements change).
      $( self.elem ).find( '.' + self.newsClassName ).on( 'mouseenter', function () {
        self.onReset( true );
      } );

      // Re-attach mouseout event handler for individual news items.
      $( self.elem ).find( '.' + self.newsClassName ).on( 'mouseout', function () {
        self.onReset( false );
      } );
    }
  };

  /*
   * jQuery plugin definition for bootstrapNews.
   * Allows users to initialize the plugin on a jQuery selection.
   *
   * @param {object} options - Configuration options for the news box.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.bootstrapNews = function ( options ) {
    // Enable multiple DOM object selection (class selector) + enable chaining.
    return this.each( function () {

      // Create a new instance of NewsBox using Object.create for prototypal inheritance.
      var newsBox = Object.create( NewsBox );

      // Initialize the news box instance with options and the current DOM element.
      newsBox.init( options, this );
      // console.log(newsBox); // Debugging line, commented out.

    } );
  };

  // Default options for the bootstrapNews plugin.
  // These can be overridden by user-provided options during initialization.
  $.fn.bootstrapNews.options = {
    newsPerPage: 4,               // Number of news items visible at once.
    navigation: true,             // Whether to display navigation buttons.
    autoplay: true,               // Whether the news ticker should auto-scroll.
    direction: 'up',              // Direction of animation ('up' or 'down').
    animationSpeed: 'normal',     // Speed of the slide animation (e.g., 'slow', 'normal', 'fast', or milliseconds).
    newsTickerInterval: 4000,     // Interval between animations in milliseconds (4 seconds).
    pauseOnHover: true,           // Whether to pause animation when mouse hovers over the news box.
    onStop: null,                 // Callback function when the ticker stops.
    onPause: null,                // Callback function when the ticker pauses.
    onReset: null,                // Callback function when the ticker resets.
    onPrev: null,                 // Callback function when the 'previous' action is triggered.
    onNext: null,                 // Callback function when the 'next' action is triggered.
    onToDo: null                  // Generic callback for custom actions.
  };

})( jQuery, window, document ); // Pass jQuery, window, and document objects to the IIFE.