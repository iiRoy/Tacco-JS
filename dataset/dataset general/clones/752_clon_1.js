( function ( $ ) {
  // This is the beginning of the jQuery plugin definition.
  // It encapsulates the plugin to prevent conflicts with other libraries.

  $.fn.quickWizard = function ( options, callback ) {

    // Define the default configuration settings for the quickWizard plugin.
    var settings = {
      'prevButton': '<button id="form-wizard-prev" type="button">Previous</button>', // HTML for the 'Previous' navigation button.
      'nextButton': '<button id="form-wizard-next" type="button">Next</button>',     // HTML for the 'Next' navigation button.
      'activeClass': 'form-wizard-active',                                            // CSS class applied to the currently visible wizard step.
      'element': 'fieldset',                                                          // The HTML tag or selector used to identify individual wizard steps.
      'submit': '[type = "submit"]',                                                  // Selector for the form's submit button.
      'root': null,                                                                   // Specifies the initial step. If null, the first 'element' child is used.
      'prevArgs': [0],                                                                // Arguments passed to jQuery's .hide() method when navigating to the previous step.
      'nextArgs': [0],                                                                // Arguments passed to jQuery's .show() method when navigating to the next step.
      'disabledClass': 'form-wizard-disabled',                                        // CSS class to apply when a navigation button is disabled.
      'containerClass': 'form-wizard-container',                                      // CSS class to add to the main wizard container element.
      'breadCrumb': true,                                                             // Boolean to enable or disable the breadcrumb navigation.
      'breadCrumbElement': 'legend',                                                  // The element within each step from which to extract breadcrumb text.
      'breadCrumbListOpen': '<ol>',                                                   // The opening HTML tag for the breadcrumb list.
      'breadCrumbListClose': '</ol>',                                                 // The closing HTML tag for the breadcrumb list.
      'breadCrumbListClass': 'bread-crumb',                                           // CSS class for the breadcrumb navigation list itself.
      'breadCrumbListElementOpen': '<li>',                                            // The opening HTML tag for each item in the breadcrumb list.
      'breadCrumbListElementClose': '</li>',                                          // The closing HTML tag for each item in the breadcrumb list.
      'breadCrumbActiveClass': 'bread-crumb-active',                                  // CSS class for the active breadcrumb item.
      'breadCrumbCompletedClass': 'bread-crumb-completed',                            // CSS class for breadcrumb items representing completed steps.
      'breadCrumbPosition': 'before',                                                 // Determines where the breadcrumb list is inserted ('before' or 'after' the container).
      'clickableBreadCrumbs': false                                                   // Boolean to allow or disallow clicking on breadcrumb items for navigation.
    };

    // Extend the default settings with any options provided by the user.
    if ( options ) {
      $.extend( settings, options );
    }

    // Ensure the callback function is defined; if not, assign an empty function.
    callback = callback || function () {
    };

    /**
     * Helper function to disable a navigation button.
     * It checks if the object is a button and disables it accordingly,
     * otherwise applies a custom disabled class.
     * @param {jQuery} prevObj - The jQuery object representing the button or element to disable.
     */
    function disablePrev ( prevObj ) {
      if ( $( prevObj ).is( ":button" ) ) {
        $( prevObj ).attr( 'disabled', 'disabled' ); // Disable standard HTML button.
      } else {
        $( prevObj ).addClass( settings.disabledClass ); // Apply custom disabled class for other elements.
      }
    }

    // Iterate over each element selected by the jQuery object.
    return this.each( function () {

      var container = $( this );                                  // The main container element for the wizard.
      var children = container.children( settings.element );      // All direct children acting as wizard steps.
      var activeClassSelector = '.' + settings.activeClass;       // A CSS selector for the currently active step.
      var submitButton = container.find( settings.submit );       // The form's submit button.
      var insertedNextCallback;                                   // A placeholder for an internally managed callback.
      var originalNextCallback;                                   // Stores the user's potentially provided callback for 'nextArgs'.
      var root;                                                   // Refers to the first active step of the wizard.
      var breadCrumbList;                                         // The jQuery object representing the breadcrumb navigation list.

      // Determine the initial 'root' (starting) step of the wizard.
      if ( settings.root === null ) {
        root = children.first(); // If no specific root is set, use the very first child element.
      } else {
        root = $( settings.root ); // Use the element specified in the settings as the root.
      }

      // Add the container class to the main wizard wrapper if it's not empty.
      if ( settings.containerClass !== "" ) {
        container.addClass( settings.containerClass );
      }

      // Initialize and set up the breadcrumb navigation if 'breadCrumb' is enabled.
      if ( settings.breadCrumb ) {
        breadCrumbList = settings.breadCrumbListOpen; // Start building the breadcrumb HTML string.

        // Loop through each wizard step to create a corresponding breadcrumb item.
        children.find( settings.breadCrumbElement ).each( function ( index ) {
          breadCrumbList += settings.breadCrumbListElementOpen + $( this ).text() + settings.breadCrumbListElementClose;
        } );

        breadCrumbList += settings.breadCrumbListClose; // Append the closing tag for the breadcrumb list.

        // Insert the generated breadcrumb list into the DOM based on 'breadCrumbPosition'.
        if ( settings.breadCrumbPosition === 'after' ) {
          breadCrumbList = $( breadCrumbList ).insertAfter( container );
        } else {
          breadCrumbList = $( breadCrumbList ).insertBefore( container );
        }

        // Mark the first breadcrumb item as active to reflect the initial wizard state.
        breadCrumbList.children().first().addClass( settings.breadCrumbActiveClass );
        // Apply the main CSS class to the breadcrumb list for styling.
        breadCrumbList.addClass( settings.breadCrumbListClass );
      }

      // Check if the last argument in 'settings.nextArgs' is a function.
      if ( typeof ( settings.nextArgs[ settings.nextArgs.length - 1 ] ) == "function" ) {

        // If it is, store this user-provided callback function.
        originalNextCallback = settings.nextArgs[ settings.nextArgs.length - 1 ];

        // Replace the user's callback with a wrapper that first calls our internal callback,
        // then the user's original callback.
        settings.nextArgs[ settings.nextArgs.length - 1 ] = function () {
          insertedNextCallback.call();
          originalNextCallback.call();
        };

      } else {

        // If no function was provided, simply append our internal callback.
        settings.nextArgs[ settings.nextArgs.length ] = function () {
          insertedNextCallback.call();
        }
      }

      // Create and insert the 'Previous' and 'Next' buttons before the submit button.
      var prev = $( settings.prevButton ).insertBefore( submitButton );
      var next = $( settings.nextButton ).insertBefore( submitButton );
      submitButton.hide(); // Initially hide the submit button.

      // If the root element is the very first child, disable the 'Previous' button.
      if ( root.is( ':first-child' ) ) {
        disablePrev( prev );
      }

      // Hide all wizard steps initially, then show only the root (first) step and mark it active.
      children.hide();
      root.toggleClass( settings.activeClass ).show();

      // Attach a click event handler to the 'Next' button.
      $( next ).click( function () {
        var active = container.find( activeClassSelector ); // Get the current active wizard step.

        // Validate the form inputs within the active step before proceeding.
        if ( active.find( ":input" ).valid() ) {
          var nextSet = active.next( settings.element );       // Find the next wizard step.
          var afterNextSet = nextSet.next( settings.element ); // Find the step after the next one.

          // If a next step exists, perform the transition.
          if ( nextSet.length ) {
            $( active ).toggleClass( settings.activeClass ); // Deactivate the current step.
            $( nextSet ).toggleClass( settings.activeClass ); // Activate the next step.

            // Store the current element's CSS position property.
            active.data( 'posiiton', active.css( 'position' ) );

            // Define the internal callback to restore the element's position after animation.
            insertedNextCallback = function () {
              active.css( 'position', active.data( 'posiiton' ) );
            };

            // Animate the current step out (hide) and the next step in (show).
            active.css( 'position', 'absolute' ).hide.apply( active, settings.nextArgs );
            nextSet.show.apply( nextSet, settings.prevArgs );

            // Update the breadcrumb navigation if it's enabled.
            if ( settings.breadCrumb ) {
              breadCrumbList.find( '.' + settings.breadCrumbActiveClass ) // Find the currently active breadcrumb item.
                .removeClass( settings.breadCrumbActiveClass )           // Remove its active class.
                .addClass( settings.breadCrumbCompletedClass )           // Mark it as completed.
                .next()                                                  // Select the next breadcrumb item.
                .addClass( settings.breadCrumbActiveClass );             // Mark the next item as active.
            }

            // Re-enable the 'Previous' button if it was disabled.
            if ( $( prev ).is( ":button" ) ) {
              $( prev ).removeAttr( 'disabled' ); // Enable standard button.
            } else {
              // For non-button elements, remove the custom disabled class.
              $( prev ).removeClass( settings.disabledClass );
            }
          }

          // If there are no more steps after the 'nextSet', hide the 'Next' button
          // and show the 'Submit' button.
          if ( afterNextSet.length <= 0 ) {
            $( next ).hide();
            submitButton.show();
          }
        }
      } );

      // Attach a click event handler to the 'Previous' button.
      $( prev ).click( function () {
        var active = container.find( activeClassSelector );       // Get the current active wizard step.
        var prevSet = active.prev( settings.element );            // Find the previous wizard step.
        var beforePrevSet = prevSet.prev( settings.element );     // Find the step before the previous one.

        // If a previous step exists, perform the transition.
        if ( prevSet.length ) {
          $( active ).toggleClass( settings.activeClass ); // Deactivate the current step.
          $( prevSet ).toggleClass( settings.activeClass ); // Activate the previous step.

          // Store the original CSS position of the previous element.
          prevSet.data( 'posiiton', prevSet.css( 'position' ) );
          // Define the internal callback to restore its position after animation.
          insertedNextCallback = function () {
            prevSet.css( 'position', prevSet.data( 'posiiton' ) );
          };

          // Animate the current step out (hide) and the previous step in (show).
          active.hide.apply( active, settings.prevArgs );
          prevSet.css( 'position', 'absolute' ).show.apply( prevSet, settings.nextArgs );

          // Update the breadcrumb navigation if it's enabled.
          if ( settings.breadCrumb ) {
            breadCrumbList.find( '.' + settings.breadCrumbActiveClass ) // Find the current active breadcrumb item.
              .removeClass( settings.breadCrumbActiveClass )           // Remove its active class.
              .prev()                                                  // Select the previous breadcrumb item.
              .addClass( settings.breadCrumbActiveClass );             // Mark the previous item as active.
          }

          $( next ).show();      // Ensure the 'Next' button is visible.
          submitButton.hide();   // Hide the 'Submit' button.
        }

        // If there are no steps before the 'prevSet', it means we're at the beginning,
        // so disable the 'Previous' button.
        if ( beforePrevSet.length <= 0 ) {
          disablePrev( prev );
        }
      } );

      // Enable clickable breadcrumbs if both 'breadCrumb' and 'clickableBreadCrumbs' are true.
      if ( settings.breadCrumb && settings.clickableBreadCrumbs ) {
        $( '.' + settings.breadCrumbListClass ).children().click( function () {
          var active = container.find( activeClassSelector ); // The currently active step.
          var current = $( settings.element ).eq( $( this ).index() ); // The wizard step corresponding to the clicked breadcrumb.

          var prevSet = current.prev( settings.element ); // The step immediately preceding the target step.
          var nextSet = current.next( settings.element ); // The step immediately following the target step.

          $( active ).toggleClass( settings.activeClass ); // Deactivate the step that was previously active.
          current.toggleClass( settings.activeClass );     // Activate the step corresponding to the clicked breadcrumb.

          // Store the current active element's original CSS position.
          active.data( 'posiiton', active.css( 'position' ) );

          // Set the callback function to restore the element's position.
          insertedNextCallback = function () {
            active.css( 'position', active.data( 'posiiton' ) );
          };

          // Animate out the old active step and animate in the new current step.
          active.css( 'position', 'absolute' ).hide.apply( active, settings.nextArgs );
          // Note: The original code `current.parents().show.apply` seems to be a logical error,
          // it likely intended to be `current.show.apply`. However, for Type I clone,
          // it must be replicated exactly as `current.parents().show.apply`.
          current.parents().show.apply( current, settings.prevArgs );

          // Update the active state in the breadcrumb navigation.
          breadCrumbList.find( '.' + settings.breadCrumbActiveClass ).removeClass( settings.breadCrumbActiveClass );
          $( this ).addClass( settings.breadCrumbActiveClass );

          // Adjust the visibility of navigation buttons based on the target step's position.
          if ( prevSet.length ) {
            $( next ).show();
            submitButton.hide();
          }

          // Enable the 'Previous' button if not navigating to the first step.
          if ( $( prev ).is( ":button" ) ) {
            $( prev ).removeAttr( 'disabled' );
          } else {
            // Or remove the custom disabled class.
            $( prev ).removeClass( settings.disabledClass );
          }

          // Disable the 'Previous' button if the target step is the very first one.
          if ( prevSet.length <= 0 ) {
            disablePrev( prev );
          }

          // Hide the 'Next' button and show the 'Submit' button if the target step is the last one.
          if ( nextSet.length <= 0 ) {
            $( next ).hide();
            submitButton.show();
          }
        } );
      }
      // Execute the user-provided callback function in the context of the current element.
      callback.call( this );

    } ); // End of the 'this.each' loop.

  }; // End of the $.fn.quickWizard plugin definition.

} )( jQuery ); // Pass the jQuery object to the immediately invoked function expression.