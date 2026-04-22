/* This JSLint directive configures linting for the file.
 * It allows unused parameters (unparam), assumes a browser environment,
 * and sets the indentation to 4 spaces.
 */
/* jslint unparam: true, browser: true, indent: 4 */

;( function ( $, window, document, undefined ) {
  'use strict'; /* Enforces strict mode for cleaner code and fewer errors */


  // Foundation library extension: Reveal modal component.
  // This component handles displaying and hiding modal dialogs.
  Foundation.libs.reveal = {

    name: 'reveal', // The official name of this Foundation component.

    version : '4.2.0', // Current version of the Reveal component.

    locked : false, // Flag to prevent multiple modal interactions at once.

    settings : {
      animation: 'fadeAndPop',        // Type of animation for opening/closing modals.
      animationSpeed: 250,            // Duration of the animation in milliseconds.
      closeOnBackgroundClick: true,   // Determines if clicking the overlay closes the modal.
      closeOnEsc: true,               // Determines if pressing ESC closes the modal.
      dismissModalClass: 'close-reveal-modal', // CSS class for elements that close the modal.
      bgClass: 'reveal-modal-bg',     // CSS class for the modal background overlay.
      open: function(){},             // Callback function executed before a modal opens.
      opened: function(){},           // Callback function executed after a modal has opened.
      close: function(){},            // Callback function executed before a modal closes.
      closed: function(){},           // Callback function executed after a modal has closed.
      bg : $( '.reveal-modal-bg' ),   // jQuery object for the modal background.
      css : {                         // CSS properties for modal states.
        open : {
          'opacity': 0,
          'visibility': 'visible',
          'display' : 'block'
        },
        close : {
          'opacity': 1,
          'visibility': 'hidden',
          'display': 'none'
        }
      }
    },


    /**
     * Initializes the Reveal component.
     * @param {object} scope - The scope of the Foundation instance.
     * @param {string|object} method - The method to call or settings object.
     * @param {object} options - Additional options.
     */
    init : function ( scope, method, options ) {
      // Inherit methods from Foundation core.
      Foundation.inherit( this, 'data_options delay' );

      // Handle different initialization scenarios based on arguments.
      if ( typeof method === 'object' ) {
        // If 'method' is an object, extend default settings with it.
        $.extend( true, this.settings, method );
      }
      else if ( typeof options !== 'undefined' ) {
        // If 'options' is defined, extend default settings with it.
        $.extend( true, this.settings, options );
      }


      // If 'method' is not a string, initialize events.
      if ( typeof method != 'string' ) {
        this.events();

        return this.settings.init; // Return initial settings.
      }
      else {
        // If 'method' is a string, call the corresponding method.
        return this[ method ].call( this, options );
      }
    },


    /**
     * Binds all necessary event handlers for the Reveal component.
     */
    events : function () {
      var self = this; // Cache 'this' for use in callbacks.

      $( this.scope )
        // Unbind any previous reveal event handlers to prevent duplicates.
        .off( '.fndtn.reveal' )

        // Handle clicks on elements that trigger modal opening.
        .on( 'click.fndtn.reveal', '[data-reveal-id]', function ( e ) {
          e.preventDefault(); // Prevent default link behavior.

          // Proceed only if the modal system is not currently locked.
          if ( !self.locked ) {
            var element = $( this ),
                ajax = element.data( 'reveal-ajax' ); // Check for AJAX content.

            self.locked = true; // Lock the system.

            // Determine if content is loaded via AJAX or is already in the DOM.
            if ( typeof ajax === 'undefined' ) {
              self.open.call( self, element ); // Open modal with existing content.
            }
            else {
              // Construct the URL for AJAX content.
              var url = ajax === true ? element.attr( 'href' ) : ajax;

              self.open.call( self, element, { url: url } ); // Open modal with AJAX content.
            }
          }
        })

        // Handle clicks/touches on elements that close the modal.
        .on( 'click.fndtn.reveal touchend.click.fndtn.reveal', this.close_targets(), function ( e ) {
          e.preventDefault(); // Prevent default action.

          // If not locked, proceed with closing.
          if ( !self.locked ) {
            // Merge current settings with data-options from the active modal.
            var settings = $.extend( {}, self.settings, self.data_options( $( '.reveal-modal.open' ) ) );

            // Check if click was on background and background click is disabled.
            if ( $( e.target )[ 0 ] === $( '.' + settings.bgClass )[ 0 ] && !settings.closeOnBackgroundClick ) {
              return; // Do not close if conditions met.
            }

            self.locked = true; // Lock the system.
            // Close the closest modal ancestor.
            self.close.call( self, $( this ).closest( '.reveal-modal' ) );
          }
        })

        // Custom event handlers for modal lifecycle.
        .on( 'open.fndtn.reveal', '.reveal-modal', this.settings.open )
        .on( 'opened.fndtn.reveal', '.reveal-modal', this.settings.opened )
        .on( 'opened.fndtn.reveal', '.reveal-modal', this.open_video )
        .on( 'close.fndtn.reveal', '.reveal-modal', this.settings.close )
        .on( 'closed.fndtn.reveal', '.reveal-modal', this.settings.closed )
        .on( 'closed.fndtn.reveal', '.reveal-modal', this.close_video );


      // Bind keyup event to the body for Escape key handling.
      $( 'body' ).bind( 'keyup.reveal', function ( event ) {
        var open_modal = $( '.reveal-modal.open' ), // Get the currently open modal.
            // Extend settings with data-options from the open modal.
            settings = $.extend( {}, self.settings, self.data_options( open_modal ) );

        // If Escape key is pressed and closeOnEsc is enabled.
        if ( event.which === 27 && settings.closeOnEsc ) { // 27 is the keycode for the Escape key.
          open_modal.foundation( 'reveal', 'close' ); // Trigger close on the modal.
        }
      });

      return true;
    },


    /**
     * Opens a modal dialog.
     * @param {jQuery|object} target - The element that triggered the modal, or the modal itself.
     * @param {object} ajax_settings - Settings for AJAX content loading.
     */
    open : function ( target, ajax_settings ) {

      var modal; // Declare modal variable upfront.

      // Determine the modal element based on the 'target' argument.
      if ( target ) {
        if ( typeof target.selector !== 'undefined' ) {
          // If target is a jQuery object with a selector, get modal by its ID.
          modal = $( '#' + target.data( 'reveal-id' ) );
        }
        else {
          // If target is not a jQuery object, assume it's the modal itself
          // or a settings object, and use the component's scope.
          modal = $( this.scope );
          ajax_settings = target; // If target is not selector, it might be ajax_settings.
        }
      }
      else {
        // If no target, use the component's default scope as the modal.
        modal = $( this.scope );
      }


      // Only proceed if the modal is not already open.
      if ( !modal.hasClass( 'open' ) ) {
        var open_modal = $( '.reveal-modal.open' ); // Find any currently open modals.

        // Cache modal's initial top position and calculated offset.
        if ( typeof modal.data( 'css-top' ) === 'undefined' ) {
          modal.data( 'css-top', parseInt( modal.css( 'top' ), 10 ) )
            .data( 'offset', this.cache_offset( modal ) );
        }

        modal.trigger( 'open' ); // Trigger the 'open' event.

        // If no other modals are open, toggle the background.
        if ( open_modal.length < 1 ) {
          this.toggle_bg( modal );
        }

        // Check if content needs to be loaded via AJAX.
        if ( typeof ajax_settings === 'undefined' || !ajax_settings.url ) {
          // If not AJAX, hide any other open modals and show this one.
          this.hide( open_modal, this.settings.css.close );
          this.show( modal, this.settings.css.open );
        }
        else {
          // If AJAX, set up the success callback for loading content.
          var self = this,
              old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;

          $.extend( ajax_settings, {
            success: function ( data, textStatus, jqXHR ) {
              // Call original success callback if it existed.
              if ( $.isFunction( old_success ) ) {
                old_success( data, textStatus, jqXHR );
              }

              modal.html( data ); // Insert AJAX content into the modal.
              $( modal ).foundation( 'section', 'reflow' ); // Reflow Foundation components within new content.

              // Hide previous modals and show the new AJAX modal.
              self.hide( open_modal, self.settings.css.close );
              self.show( modal, self.settings.css.open );
            }
          });

          $.ajax( ajax_settings ); // Execute the AJAX request.
        }
      }
    },


    /**
     * Closes a modal dialog.
     * @param {jQuery} modal - The modal element to close.
     */
    close : function ( modal ) {

      // Ensure 'modal' is a jQuery object, or default to the component's scope.
      var modal = modal && modal.length ? modal : $( this.scope ),
          open_modals = $( '.reveal-modal.open' ); // Get all currently open modals.

      // Only proceed if there are open modals.
      if ( open_modals.length > 0 ) {
        this.locked = true; // Lock the system during close animation.
        modal.trigger( 'close' ); // Trigger the 'close' event.
        this.toggle_bg( modal ); // Toggle the background overlay.
        this.hide( open_modals, this.settings.css.close ); // Hide the modal(s).
      }
    },


    /**
     * Returns a selector string for elements that should close the modal.
     * Includes dismissModalClass and optionally bgClass based on settings.
     * @returns {string} The selector string.
     */
    close_targets : function () {
      var base = '.' + this.settings.dismissModalClass;

      // If closeOnBackgroundClick is enabled, add the background class to targets.
      if ( this.settings.closeOnBackgroundClick ) {
        return base + ', .' + this.settings.bgClass;
      }

      return base; // Otherwise, return only the dismiss class target.
    },


    /**
     * Toggles the visibility of the modal background overlay.
     * Creates the background if it doesn't exist.
     * @param {jQuery} modal - The modal element.
     */
    toggle_bg : function ( modal ) {
      // Create the background element if it doesn't exist in the DOM.
      if ( $( '.reveal-modal-bg' ).length === 0 ) {
        this.settings.bg = $( '<div />', { 'class': this.settings.bgClass } )
          .appendTo( 'body' );
      }

      // If the background is visible, hide it; otherwise, show it.
      if ( this.settings.bg.filter( ':visible' ).length > 0 ) {
        this.hide( this.settings.bg );
      }
      else {
        this.show( this.settings.bg );
      }
    },


    /**
     * Shows an element, applying animations if specified.
     * @param {jQuery} el - The element to show (modal or background).
     * @param {object} css - CSS properties for modal animation.
     */
    show : function ( el, css ) {
      // If 'css' is provided, it means we are showing a modal.
      if ( css ) {
        // Handle 'pop' animation.
        if ( /pop/i.test( this.settings.animation ) ) {
          css.top = $( window ).scrollTop() - el.data( 'offset' ) + 'px'; // Initial top for pop effect.
          var end_css = {
            top: $( window ).scrollTop() + el.data( 'css-top' ) + 'px', // Final top position.
            opacity: 1
          };

          return this.delay( function () {
            return el
              .css( css ) // Apply initial CSS.
              .animate( end_css, this.settings.animationSpeed, 'linear', function () {
                this.locked = false; // Unlock system after animation.
                el.trigger( 'opened' ); // Trigger 'opened' event.
              }.bind( this ) )
              .addClass( 'open' ); // Add 'open' class.
          }.bind( this ), this.settings.animationSpeed / 2 ); // Delay half animation speed.
        }

        // Handle 'fade' animation.
        if ( /fade/i.test( this.settings.animation ) ) {
          var end_css = { opacity: 1 }; // Final opacity for fade.

          return this.delay( function () {
            return el
              .css( css ) // Apply initial CSS.
              .animate( end_css, this.settings.animationSpeed, 'linear', function () {
                this.locked = false; // Unlock system.
                el.trigger( 'opened' ); // Trigger 'opened' event.
              }.bind( this ) )
              .addClass( 'open' ); // Add 'open' class.
          }.bind( this ), this.settings.animationSpeed / 2 ); // Delay.
        }

        // Default: no animation, just show and set CSS.
        return el.css( css ).show().css( { opacity: 1 } ).addClass( 'open' ).trigger( 'opened' );
      }

      // If 'css' is not provided, we are showing the background.
      // Check if background should animate with fade.
      if ( /fade/i.test( this.settings.animation ) ) {
        return el.fadeIn( this.settings.animationSpeed / 2 ); // Fade in background.
      }

      return el.show(); // Default: just show background.
    },


    /**
     * Hides an element, applying animations if specified.
     * @param {jQuery} el - The element to hide (modal or background).
     * @param {object} css - CSS properties for modal animation.
     */
    hide : function ( el, css ) {
      // If 'css' is provided, we are hiding a modal.
      if ( css ) {
        // Handle 'pop' animation.
        if ( /pop/i.test( this.settings.animation ) ) {
          var end_css = {
            top: -$( window ).scrollTop() - el.data( 'offset' ) + 'px', // Final top position for pop out.
            opacity: 0
          };

          return this.delay( function () {
            return el
              .animate( end_css, this.settings.animationSpeed, 'linear', function () {
                this.locked = false; // Unlock system.
                el.css( css ).trigger( 'closed' ); // Apply final CSS and trigger 'closed'.
              }.bind( this ) )
              .removeClass( 'open' ); // Remove 'open' class.
          }.bind( this ), this.settings.animationSpeed / 2 ); // Delay.
        }

        // Handle 'fade' animation.
        if ( /fade/i.test( this.settings.animation ) ) {
          var end_css = { opacity: 0 }; // Final opacity for fade out.

          return this.delay( function () {
            return el
              .animate( end_css, this.settings.animationSpeed, 'linear', function () {
                this.locked = false; // Unlock system.
                el.css( css ).trigger( 'closed' ); // Apply final CSS and trigger 'closed'.
              }.bind( this ) )
              .removeClass( 'open' ); // Remove 'open' class.
          }.bind( this ), this.settings.animationSpeed / 2 ); // Delay.
        }

        // Default: no animation, just hide and set CSS.
        return el.hide().css( css ).removeClass( 'open' ).trigger( 'closed' );
      }

      // If 'css' is not provided, we are hiding the background.
      // Check if background should animate with fade.
      if ( /fade/i.test( this.settings.animation ) ) {
        return el.fadeOut( this.settings.animationSpeed / 2 ); // Fade out background.
      }

      return el.hide(); // Default: just hide background.
    },


    /**
     * Stops and resets video players within the modal when it closes.
     * @param {Event} e - The event object.
     */
    close_video : function ( e ) {
      var video = $( this ).find( '.flex-video' ), // Find flex-video containers.
          iframe = video.find( 'iframe' ); // Find iframes within them.

      if ( iframe.length > 0 ) {
        iframe.attr( 'data-src', iframe[ 0 ].src ); // Store current src in data-src.
        iframe.attr( 'src', 'about:blank' ); // Set src to about:blank to stop video.
        video.hide(); // Hide the video container.
      }
    },


    /**
     * Resumes video playback within the modal when it opens.
     * @param {Event} e - The event object.
     */
    open_video : function ( e ) {
      var video = $( this ).find( '.flex-video' ), // Find flex-video containers.
          iframe = video.find( 'iframe' ); // Find iframes within them.

      if ( iframe.length > 0 ) {
        var data_src = iframe.attr( 'data-src' ); // Get stored data-src.
        if ( typeof data_src === 'string' ) {
          iframe[ 0 ].src = iframe.attr( 'data-src' ); // Restore src from data-src.
        }
        else {
          var src = iframe[ 0 ].src; // Get current src.
          iframe[ 0 ].src = undefined; // Clear src.
          iframe[ 0 ].src = src; // Re-set src to force reload/play.
        }
        video.show(); // Show the video container.
      }
    },


    /**
     * Calculates and caches the modal's offset for animation purposes.
     * @param {jQuery} modal - The modal element.
     * @returns {number} The calculated offset.
     */
    cache_offset : function ( modal ) {
      // Temporarily show modal to get dimensions, then hide.
      var offset = modal.show().height() + parseInt( modal.css( 'top' ), 10 );

      modal.hide();

      return offset;
    },


    /**
     * Removes all event handlers bound by this component.
     */
    off : function () {
      $( this.scope ).off( '.fndtn.reveal' ); // Unbind all reveal events.
    },


    /**
     * Placeholder for reflow method (might be used by other components).
     */
    reflow : function () {}
  };
}( Foundation.zj, this, this.document, undefined ) ); // IIFE parameters: jQuery, window, document, undefined.