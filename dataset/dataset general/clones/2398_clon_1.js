/*
 * This file contains the JavaScript code for the Growler notification system.
 * It is designed to display transient or sticky notices to the user.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional code, identifiers, and logic remain precisely identical.
 *
 */

document.observe( 'dom:loaded' ,  function ( )  {
  // Initialize the application's growler instance upon DOM load
  APP.growler = ( function ( ) {

    // Define default options for individual notice messages.
    // These can be overridden when creating a specific notice.
    var noticeOptions = {
      header: '&nbsp;',        // Default header, a non-breaking space
      speedin: 0.3,            // Duration for the notice to fade in (seconds)
      speedout: 0.5,           // Duration for the notice to fade out (seconds)
      outDirection: {          // Specifies the direction for the fade-out animation
        y: 20                  // Moves 20 pixels down during fade-out
      },
      life: 5,                 // How long the notice stays visible if not sticky (seconds)
      sticky: false,           // If true, notice remains until manually dismissed
      className: ""            // Additional CSS class for custom styling
    };

    // Define default options for the Growler container itself.
    // These configure the overall positioning and appearance of the notification area.
    var growlerOptions = {
      location: "br",          // Default location: "br" for bottom-right
      width: "500px"           // Default width of the growler container
    };

    /**
     * Removes a given notice element from the DOM with an animation.
     * @param {Element} n - The notice element to be removed.
     * @param {Object} o - Options specific to this notice, potentially overriding defaults.
     * @returns {void}
     */
    function removeNotice( n, o ) {
      // Ensure options are set, falling back to default noticeOptions if none provided.
      o = o || noticeOptions;

      // Execute parallel animations for moving and fading out the notice.
      new Effect.Parallel( [
        // Animation for moving the notice out of view.
        new Effect.Move( n, Object.extend({
          sync: true,          // Synchronize this effect with others in the parallel group
          mode: 'relative'     // Move relative to its current position
        }, o.outDirection)),   // Use the defined outDirection from options

        // Animation for fading out the notice.
        new Effect.Opacity( n, {
          sync: true,          // Synchronize with other effects
          to: 0                // Fade to completely transparent
        })
      ], {
        duration: o.speedout,  // Total duration of the parallel animation
        afterFinish: function ( ) {
          // This callback executes once the animation is complete.

          try {
            // Attempt to clean up event listeners to prevent memory leaks.
            var ne = n.down("div.notice-exit");
            if ( ne != undefined ) {
              ne.stopObserving( "click", removeNotice ); // Stop observing click on exit button
            }

            // If a 'created' callback was defined, stop observing it.
            if ( o.created && Object.isFunction( o.created ) ) {
              n.stopObserving( "notice:created", o.created );
            }

            // If a 'destroyed' callback was defined, fire it and then stop observing.
            if ( o.destroyed && Object.isFunction( o.destroyed ) ) {
              n.fire( "notice:destroyed" );
              n.stopObserving( "notice:destroyed", o.destroyed );
            }
          } catch ( e ) {
            // Catch any errors during event listener cleanup, but don't stop execution.
            // This could happen if elements are already removed or events are not set.
          }

          try {
            // Finally, remove the notice element from the DOM.
            n.remove();
          } catch ( e ) {
            // Catch errors during element removal.
          }
        }
      });
    }

    /**
     * Creates and displays a new notice within the growler container.
     * @param {Element} growler - The DOM element representing the growler container.
     * @param {string} msg - The message content for the notice body.
     * @param {Object} options - Options specific to this notice.
     * @returns {Element} The newly created notice element.
     */
    function createNotice( growler, msg, options ) {
      // Clone default notice options to avoid modifying the original defaults.
      var opt = Object.clone( noticeOptions );
      // Ensure options object is initialized.
      options = options || {};
      // Extend the cloned options with any provided specific options.
      Object.extend( opt, options );

      var notice; // Declare variable for the new notice element.

      // Determine the CSS class for the notice based on provided options.
      if ( opt.className != "" ) {
        notice = new Element( "div", {
          "class": opt.className
        }).setStyle( { // Apply initial styles for animation.
          display: "block",
          opacity: 0
        });
      } else {
        // Default class if no custom class is specified.
        notice = new Element( "div", {
          "class": "Growler-notice"
        }).setStyle( {
          display: "block",
          opacity: 0
        });
      }

      // Attach 'created' event observer if a callback is provided.
      if ( opt.created && Object.isFunction( opt.created ) ) {
        notice.observe( "notice:created", opt.created );
      }

      // Attach 'destroyed' event observer if a callback is provided.
      if ( opt.destroyed && Object.isFunction( opt.destroyed ) ) {
        notice.observe( "notice:destroyed", opt.destroyed );
      }

      // If the notice is sticky, add a close button.
      if ( opt.sticky ) {
        var noticeExit = new Element( "button", {
          "class": "close pull-right"
        }).update( "&times;" ); // HTML entity for 'x' symbol.

        // Attach click event to the exit button to remove the notice.
        noticeExit.observe( "click", function ( ) {
          removeNotice( notice, opt );
        });
        notice.insert( noticeExit ); // Insert the exit button into the notice.
      }

      // Insert the header section into the notice.
      notice.insert( new Element( "div", {
        "class": "Growler-notice-head"
      }).update( opt.header ) );

      // Insert the body message section into the notice.
      notice.insert( new Element( "div", {
        "class": "Growler-notice-body"
      }).update( msg ) );

      // Add the fully constructed notice to the growler container.
      growler.insert( notice );

      // Start the fade-in animation for the notice.
      new Effect.Opacity( notice, {
        to: 0.85,              // Fade to 85% opacity.
        duration: opt.speedin  // Use the defined speedin duration.
      });

      // If the notice is not sticky, schedule its automatic removal after a delay.
      if ( !opt.sticky ) {
        removeNotice.delay( opt.life, notice, opt ); // Delay removal by 'life' seconds.
      }

      // Fire the 'notice:created' event, which might trigger custom callbacks.
      notice.fire( "notice:created" );

      // Return the created notice element.
      return notice;
    }

    /**
     * Creates a special notice with custom background and text colors.
     * This is a utility function that wraps `createNotice`.
     * @param {Element} g - The growler container.
     * @param {string} m - The message content.
     * @param {Object} o - Options for the notice.
     * @param {string} t - The header text (if not already in options).
     * @param {string} b - Background color.
     * @param {string} c - Text color.
     * @returns {Element} The created special notice element.
     */
    function specialNotice( g, m, o, t, b, c ) {
      // Set header, if not already specified in options.
      o.header = o.header || t;
      // Create the notice using the general function.
      var n = createNotice( g, m, o );
      // Apply custom background and text colors.
      n.setStyle( {
        backgroundColor: b,
        color: c
      });
      return n; // Return the styled notice.
    }

    // Define the Growler class, which manages the notification container and its notices.
    Growler = Class.create( {
      /**
       * Constructor for the Growler class.
       * @param {Object} options - Options to configure the Growler instance.
       */
      initialize: function ( options ) {
        // Clone default growler options.
        var opt = Object.clone( growlerOptions );
        // Ensure options object is initialized.
        options = options || {};
        // Extend cloned options with provided options.
        Object.extend( opt, options );

        // Create the main Growler container element.
        this.growler = new Element( "div", {
          "class": "Growler",
          "id": "Growler"
        });

        // Apply base styles to the growler container.
        this.growler.setStyle( {
          position: 'fixed',    // Fixed position relative to the viewport.
          padding: "10px",      // Internal padding.
          "width": opt.width,   // Set width from options.
          "z-index": "50000"    // Ensure it's on top of most other elements.
        });

        // Determine and apply positioning styles based on the 'location' option.
        switch ( opt.location ) {
          case "br": // Bottom-right
            this.growler.setStyle( {
              bottom: 0,
              right: 0
            });
            break;
          case "tl": // Top-left
            this.growler.setStyle( {
              top: 0,
              left: 0
            });
            break;
          case "bl": // Bottom-left (typo in original, should be top-right based on style)
            this.growler.setStyle( { // This seems to be top-right
              top: 0,
              right: 0
            });
            break;
          case "tc": // Top-center
            this.growler.setStyle( {
              top: 0,
              left: "25%",
              width: "50%"
            });
            break;
          case "bc": // Bottom-center
            this.growler.setStyle( {
              bottom: 0,
              left: "25%",
              width: "50%"
            });
            break;
          default: // Default to top-right if location is not recognized.
            this.growler.setStyle( {
              top: 0,
              right: 0
            });
            break;
        }
        // Wrap the document body with the growler, effectively inserting it.
        this.growler.wrap( document.body );
      },

      /**
       * Displays a generic growl notification.
       * @param {string} msg - The message content.
       * @param {Object} options - Options for the notice.
       * @returns {Element} The created notice element.
       */
      growl: function ( msg, options ) {
        return createNotice( this.growler, msg, options );
      },

      /**
       * Displays an error notification.
       * @param {string} header - The header text for the error.
       * @param {string} message - The message content for the error.
       * @returns {Element} The created error notice element.
       */
      error: function ( header, message ) {
        // Delegates to growl with specific error styling and sticky behavior.
        return this.growl( message, {
          header: header,
          sticky: true, // Error notices are sticky by default.
          className: 'Growler-notice error' // Apply error specific CSS class.
        });
      },

      /**
       * Displays a success notification.
       * @param {string} header - The header text for the success message.
       * @param {string} message - The message content for the success.
       * @returns {Element} The created success notice element.
       */
      success: function ( header, message ) {
        // Delegates to growl with specific success styling and non-sticky behavior.
        return this.growl( message, {
          header: header,
          sticky: false, // Success notices are not sticky by default.
          className: 'Growler-notice success' // Apply success specific CSS class.
        });
      },

      /**
       * Manually removes a displayed notice.
       * @param {Element} n - The notice element to remove.
       * @param {Object} o - Options associated with the notice (for speedout, etc.).
       * @returns {void}
       */
      ungrowl: function ( n, o ) {
        removeNotice( n, o );
      }
    });

    // Instantiate and return a new Growler instance, making it accessible via APP.growler.
    return new Growler;

  } ) ( ); // Immediately invoke the anonymous function to create the Growler instance.

} ) ; // End of dom:loaded observer.