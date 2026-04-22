( function ( jQ ) {
  'use strict'; /* Apply strict parsing rules for this script block */

  jQ.fn.megaDrawer = function ( userOpts ) {
    // Reference to the DOM element that activated this plugin functionality
    const activatorRef = this;

    // Define default configuration and merge with user-provided settings
    const moduleSettings = jQ.extend({
      'drawerSelector': '#menu', // CSS selector for the sliding drawer panel
      'contentShifter': '.push', // CSS selector for the main content area to be pushed
      'placementDir': 'left', // Direction from which the drawer will slide in (e.g., 'left', 'right')
      'drawerSize': '15.625em', // Width/height of the drawer panel
      'animDuration': '300', // Animation speed in milliseconds
      'initialStatus': 'closed', // Initial state of the drawer ('open' or 'closed')
      'activeClass': 'active', // CSS class to apply to the activator when the drawer is open
      'dismissOnClick': false // Allow closing the drawer by clicking outside
    }, userOpts ); // Merge user options over defaults

    // The central data storage for the drawer's current operational state
    const appModel = {
      'currentStatus': moduleSettings.initialStatus // Initialize with the configured starting status
    };

    // Manages interactions between the UI (view) and the data (model)
    const interactionManager = {
      // Sets up the initial user interface elements
      initialize: function () {
        renderModule.initializeUI();
      },
      // Toggles the drawer's state between open and closed
      updateStatus: function () {
        if ( appModel.currentStatus === 'closed' ) {
          appModel.currentStatus = 'open';
        } else {
          appModel.currentStatus = 'closed';
        }
      },
      // Provides the current state of the drawer
      retrieveStatus: function () {
        return appModel.currentStatus;
      }
    };

    // Handles all visual aspects and DOM manipulations
    const renderModule = {
      initializeUI: function () {
        // Cache jQuery objects for performance
        this.$drawerPanel = jQ( moduleSettings.drawerSelector );
        this.$shifterElem = jQ( moduleSettings.contentShifter );
        this.panelWidthVal = moduleSettings.drawerSize;

        // Configuration for positioning the drawer off-screen initially
        const hiddenStyle = {
          'position': 'fixed',
          'top': '0',
          'bottom': '0',
          'height': '100%'
        };

        // Dynamically set the off-screen position based on the 'placementDir' setting
        hiddenStyle[ moduleSettings.placementDir ] = '-' + moduleSettings.drawerSize;
        hiddenStyle.width = moduleSettings.drawerSize;

        // Apply initial hidden styles if the drawer starts closed
        if ( moduleSettings.initialStatus === 'closed' ) {
          this.$drawerPanel.css( hiddenStyle );
          this.$shifterElem.css( moduleSettings.placementDir, '0' );
        }

        /*
         * Define CSS properties for smooth sliding transitions.
         * This includes vendor prefixes for broader browser compatibility.
         */
        const transitionStyles = {
          '-webkit-transition': moduleSettings.placementDir + ' ' + moduleSettings.animDuration + 'ms ease',
          '-moz-transition': moduleSettings.placementDir + ' ' + moduleSettings.animDuration + 'ms ease',
          '-ms-transition': moduleSettings.placementDir + ' ' + moduleSettings.animDuration + 'ms ease',
          '-o-transition': moduleSettings.placementDir + ' ' + moduleSettings.animDuration + 'ms ease',
          'transition': moduleSettings.placementDir + ' ' + moduleSettings.animDuration + 'ms ease'
        };

        // Apply the transition styles to both the drawer and the content shifter
        this.$drawerPanel.css( transitionStyles );
        this.$shifterElem.css( transitionStyles );

        // Attach event listeners to the activator element for opening/closing the drawer
        activatorRef.on( 'click.megaDrawer touchstart.megaDrawer', function ( domEvent ) {
          domEvent.preventDefault(); // Prevent default link behavior
          if ( interactionManager.retrieveStatus() === 'open' ) {
            renderModule.concealDrawer(); // Close the drawer if it's open
          } else {
            renderModule.revealDrawer(); // Open the drawer if it's closed
          }
        } );

        // Implement the 'dismissOnClick' feature for closing the drawer by clicking outside
        if ( moduleSettings.dismissOnClick ) {
          jQ( 'body' ).on( 'click.megaDrawer', function ( domEvent ) {
            // Check if the click target is NOT within the activator or the drawer itself
            if ( !jQ( domEvent.target ).parents().andSelf().is( activatorRef ) && interactionManager.retrieveStatus() === 'open' ) {
              renderModule.concealDrawer(); // Close the drawer
            }
          } );
        }
      },

      // Function to visually open the drawer panel
      revealDrawer: function () {
        interactionManager.updateStatus(); // Update the internal state to 'open'
        this.$drawerPanel.css( moduleSettings.placementDir, '0' ); // Move drawer into view
        this.$shifterElem.css( moduleSettings.placementDir, this.panelWidthVal ); // Push content
        activatorRef.addClass( moduleSettings.activeClass ); // Add active class to activator
      },

      // Function to visually close the drawer panel
      concealDrawer: function () {
        interactionManager.updateStatus(); // Update the internal state to 'closed'
        this.$drawerPanel.css( moduleSettings.placementDir, '-' + this.panelWidthVal ); // Move drawer off-screen
        this.$shifterElem.css( moduleSettings.placementDir, '0' ); // Reset content position
        activatorRef.removeClass( moduleSettings.activeClass ); // Remove active class from activator
      }
    };

    // Initiate the module by calling the controller's initialization method
    interactionManager.initialize();
  };

}( jQuery ) );