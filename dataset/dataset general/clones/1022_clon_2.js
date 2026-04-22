/*
 * PanelNavigator
 *
 * Attribution:
 * Based on concepts from https://github.com/torkiljohnsen/swipe
 *
 * Distributed under both MIT and GNU GPL licenses
 */

( function( currentJQuery ) {
  var PanelNavigator = function( hostElement, staticRegion, customParams ) {
    // Define special commands for navigation
    const CMD_FORWARD = 'moveForward';
    const CMD_BACKWARD = 'moveBackward';
    const CMD_HOME_VIEW = 'showHome';
    const CMD_RESET_VIEW = 'resetPosition';

    // Reference to the current instance of the module
    var moduleInstance = this;
    // The main content area that responds to touch gestures
    var mainContentArea = currentJQuery( hostElement );
    // The fixed navigation bar or header element
    var staticNavSection = currentJQuery( staticRegion );
    // Default configuration values for the module
    var initialSettings = {
      transitionDuration: 180, // Time in milliseconds for panel animation
      animationEffect: 'swing', // Easing function for animations. Standard jQuery supports 'linear' and 'swing'.
      minGestureDistance: 25, // Minimum pixel distance for a recognized swipe
      rightButtonSelector: '#nextBtn', // Selector for the 'next' button
      leftButtonSelector: '#prevBtn', // Selector for the 'previous' button
    };

    // Store the active configuration for this instance
    moduleInstance.configuration = {};

    // Initializes the module with default or provided settings
    var initializeModule = function() {
      // Merge default settings with any user-provided parameters
      moduleInstance.configuration = currentJQuery.extend( initialSettings, customParams || {} );
      // Set up the initial interaction state variables
      moduleInstance.interactionState = {
        activeTouchCount: 0, // Number of concurrent touch points
        initialTouchPointX: 0, // X-coordinate of the first touch
        initialTouchPointY: 0, // Y-coordinate of the first touch
        horizontalDisplacement: 0, // Total horizontal movement during a swipe
        contentPanelPosition: undefined, // Position of the content area before interaction
        currentTouchPointX: 0,
        currentTouchPointY: 0,
        isVerticalScroll: undefined, // Flag to differentiate between horizontal swipe and vertical scroll
      };

      // Determine view setup based on screen width
      if ( document.body.clientWidth > 500 ) {
        setupMultiPaneView();
      } else {
        setupSinglePaneView();
      }
    };

    // Sets up the view for multiple, side-by-side content panels
    var setupMultiPaneView = function() {
      // Constant for panel class and ID prefix
      const SECTION_CLASS = "content-section";

      // Calculate the width for each individual panel
      var sectionWidth = Math.min( 800, currentJQuery( document ).width() );
      var totalContentWidth = 0; // Accumulates the total width of all sections
      var hyperlinkActions = {}; // Maps hrefs to click handlers

      // Iterate through navigation links to create corresponding content panels
      staticNavSection.find( "ul a" ).each( function( idx ) {
        var targetLink = undefined;
        var sectionClickHandler = undefined;
        var newSection = undefined;

        // Special handler for the 'index.html' link
        hyperlinkActions[ "index.html" ] = function( interactionEvent ) {
          interactionEvent.preventDefault();
          transitionView( CMD_HOME_VIEW );
        };

        // Create a new content section and append it to the main content area
        newSection = currentJQuery( "<div class='" + SECTION_CLASS + "' id='" + SECTION_CLASS + idx + "'></div>" )
          .appendTo( mainContentArea )
          .css( "width", sectionWidth )
          .css( "left", totalContentWidth );
        totalContentWidth += newSection.outerWidth(); // Update total width

        // Retrieve the href from the navigation link
        targetLink = currentJQuery( this ).attr( 'href' );
        // Load content into the new section via AJAX
        currentJQuery.get( targetLink,
          function( rawHtml ) {
            var processedHtml = currentJQuery( rawHtml );
            currentJQuery( newSection ).html( processedHtml );
            rebindHyperlinks( processedHtml, hyperlinkActions ); // Rebind links within loaded content
          }
        );

        // Define the click handler for the navigation link
        sectionClickHandler = function( interactionEvent ) {
          interactionEvent.preventDefault();
          transitionView( '#' + SECTION_CLASS + idx );
        };

        // Attach the click handler to the navigation link
        currentJQuery( this ).on( { 'click': sectionClickHandler } );
        // Store the handler in the map for later use
        hyperlinkActions[ targetLink ] = sectionClickHandler;
      } );

      // Set the total width of the main content area to accommodate all panels
      mainContentArea.css( "width", totalContentWidth );
      // Navigate to the home view initially
      transitionView( CMD_HOME_VIEW );
      // Attach touch event listeners to the main content area
      bindInteractionHandlers( mainContentArea );
    };

    // Sets up the view for a single, dynamically loaded content panel
    var setupSinglePaneView = function() {
      // Constant for panel class and ID prefix
      const SECTION_CLASS = "single-panel";

      var totalContentWidth = 0;
      var hyperlinkActions = {};
      var primaryPanel = undefined;

      // Create the primary content panel
      primaryPanel = currentJQuery( "<div class='" + SECTION_CLASS + "' id='" + SECTION_CLASS + "'>" )
        .appendTo( mainContentArea )
        .css( "width", currentJQuery( document ).width() )
        .css( "left", 0 )
        .css( "height", currentJQuery( document ).height() );
      totalContentWidth += primaryPanel.outerWidth();

      // Iterate through navigation links to define their behavior
      staticNavSection.find( "ul a" ).each( function( idx ) {
        var targetLink = undefined;
        var sectionClickHandler = undefined;

        // Special handler for the 'index.html' link
        hyperlinkActions[ "index.html" ] = function( interactionEvent ) {
          interactionEvent.preventDefault();
          transitionView( CMD_HOME_VIEW );
        };

        targetLink = currentJQuery( this ).attr( 'href' );
        // Define the click handler for each navigation link
        sectionClickHandler = function( interactionEvent ) {
          interactionEvent.preventDefault();
          currentJQuery( primaryPanel ).html( "<p>Loading content…</p>" ); // Show loading message
          currentJQuery.get( targetLink,
            function( rawHtml ) {
              currentJQuery( primaryPanel ).scrollTop( 0 ); // Scroll to top after loading
              var processedHtml = currentJQuery( rawHtml );
              currentJQuery( primaryPanel ).html( processedHtml );
              rebindHyperlinks( processedHtml, hyperlinkActions ); // Rebind links within loaded content
              // Workaround for Android viewport issues
              if ( navigator.userAgent.match( /Android/i ) ) {
                window.scrollTo( 0, 1 );
              }
            } );
          transitionView( '#' + SECTION_CLASS ); // Transition to the single panel view
        };

        // Attach the click handler
        currentJQuery( this ).on( { 'click': sectionClickHandler } );
        hyperlinkActions[ targetLink ] = sectionClickHandler; // Store handler
      } );

      // Set the width for the main content area
      mainContentArea.css( "width", totalContentWidth );
      transitionView( CMD_HOME_VIEW ); // Initial navigation to home view
      bindInteractionHandlers( mainContentArea ); // Attach touch handlers

      // Load the content for the first navigation link initially
      var initialHref = currentJQuery( staticNavSection.find( "ul a" )[ 0 ] ).attr( 'href' );
      currentJQuery.get( initialHref, function( rawHtml ) {
        var processedHtml = currentJQuery( rawHtml );
        currentJQuery( primaryPanel ).html( processedHtml );
        rebindHyperlinks( processedHtml, hyperlinkActions );
        transitionView( '#' + SECTION_CLASS ); // Ensure view is correctly set
        // Android viewport fix
        if ( navigator.userAgent.match( /Android/i ) ) {
          window.scrollTo( 0, 1 );
        }
      } );
    };

    // Binds all necessary touch and pointer event listeners to a given display element
    var bindInteractionHandlers = function( displayElement ) {
      // Standard touch event listeners for modern browsers
      displayElement.on( {
        'touchstart': function( interactionEvent ) {
          // Note: .originalEvent is used to access native touch properties in jQuery
          // https://stackoverflow.com/questions/671498/jquery-live-removing-iphone-touch-event-attributes
          handleTouchBegin( interactionEvent.originalEvent );
        },
        'touchmove': function( interactionEvent ) {
          handleTouchProgress( interactionEvent.originalEvent );
        },
        'touchcancel': function( interactionEvent ) {
          handleTouchInterruption( interactionEvent.originalEvent );
        },
        'touchend': function( interactionEvent ) {
          handleTouchEnd( interactionEvent.originalEvent );
        }
      } );

      // Microsoft Pointer Events support for Windows devices
      if ( window.navigator.msPointerEnabled ) {
        displayElement.on( {
          'MSPointerCancel': function( interactionEvent ) {
            handleTouchInterruption( interactionEvent.originalEvent );
          },
          'MSPointerDown': function( interactionEvent ) {
            handleTouchBegin( interactionEvent.originalEvent );
          },
          'MSPointerMove': function( interactionEvent ) {
            handleTouchProgress( interactionEvent.originalEvent );
          },
          'MSPointerOut': function( interactionEvent ) {
            handleTouchInterruption( interactionEvent.originalEvent );
          },
          'MSPointerUp': function( interactionEvent ) {
            handleTouchEnd( interactionEvent.originalEvent );
          }
        } );
      }
    };

    // Handles the start of a touch interaction
    var handleTouchBegin = function( interactionEvent ) {
      var currentStatus = moduleInstance.interactionState;

      // Record the total number of fingers currently touching the screen
      currentStatus.activeTouchCount = interactionEvent.touches.length;

      // Only proceed if a single finger is used (for swipe, not multi-touch gestures)
      if ( currentStatus.activeTouchCount === 1 ) {
        // Reset state variables for the new swipe gesture
        currentStatus.isVerticalScroll = undefined;
        currentStatus.horizontalDisplacement = 0;
        currentStatus.initialTouchPointX = interactionEvent.touches[ 0 ].pageX;
        currentStatus.initialTouchPointY = interactionEvent.touches[ 0 ].pageY;
        // Capture the content area's current X position before movement
        currentStatus.contentPanelPosition = mainContentArea.position().left;
      } else {
        // If more than one finger, cancel the swipe attempt
        handleTouchInterruption( interactionEvent );
      }
    };

    // Handles the ongoing movement during a touch interaction
    var handleTouchProgress = function( interactionEvent ) {
      var currentStatus = moduleInstance.interactionState;
      var newPanelPosition = 0;

      // Only process if a single finger is involved in the swipe
      if ( currentStatus.activeTouchCount === 1 ) {
        currentStatus.currentTouchPointX = interactionEvent.touches[ 0 ].pageX;
        currentStatus.currentTouchPointY = interactionEvent.touches[ 0 ].pageY;

        // Calculate horizontal and vertical displacement
        currentStatus.horizontalDisplacement = currentStatus.currentTouchPointX - currentStatus.initialTouchPointX;
        var verticalDisplacement = currentStatus.currentTouchPointY - currentStatus.initialTouchPointY;

        // Determine if the primary intention is scrolling or swiping
        if ( typeof currentStatus.isVerticalScroll === 'undefined' ) {
          currentStatus.isVerticalScroll = !!( currentStatus.isVerticalScroll || Math.abs( currentStatus.horizontalDisplacement ) < Math.abs( verticalDisplacement ) );
        }

        // If it's a horizontal swipe (not vertical scroll), move the element
        if ( !currentStatus.isVerticalScroll ) {
          interactionEvent.preventDefault(); // Prevent default browser scrolling
          newPanelPosition = currentStatus.contentPanelPosition + currentStatus.horizontalDisplacement;

          // Update the content area's position to follow the finger
          mainContentArea.css( 'left', newPanelPosition );
        }
      } else {
        // If not a single finger, cancel the current interaction
        handleTouchInterruption( interactionEvent );
      }
    };

    // Handles the end of a touch interaction
    var handleTouchEnd = function( interactionEvent ) {
      var currentStatus = moduleInstance.interactionState;

      // Check if it was a valid horizontal swipe gesture with a single finger
      if ( !currentStatus.isVerticalScroll && currentStatus.horizontalDisplacement !== 0 &&
        currentStatus.activeTouchCount === 1 && currentStatus.currentTouchPointX !== 0 ) {

        // Check if the swipe distance exceeds the minimum threshold
        if ( Math.abs( currentStatus.horizontalDisplacement ) > initialSettings.minGestureDistance ) {
          // Transition to the next or previous panel based on swipe direction
          if ( currentStatus.horizontalDisplacement > 0 ) {
            transitionView( CMD_BACKWARD ); // Swiped right
          } else {
            transitionView( CMD_FORWARD ); // Swiped left
          }
        } else {
          // Swipe was too short, revert to the original position
          transitionView( CMD_RESET_VIEW );
        }
      } else {
        // If invalid swipe, cancel the interaction
        handleTouchInterruption( interactionEvent );
      }
    };

    // Handles the cancellation or interruption of a touch interaction
    var handleTouchInterruption = function( interactionEvent ) {
      var currentStatus = moduleInstance.interactionState;

      // If the element moved from its original position, snap it back
      if ( currentStatus.contentPanelPosition !== currentStatus.currentTouchPointX ) {
        transitionView( CMD_RESET_VIEW );
      }

      // Reset current touch point coordinates
      moduleInstance.interactionState = currentJQuery.extend( currentStatus, {
        currentTouchPointX: 0,
        currentTouchPointY: 0
      } );
    };

    // Manages the transition of the content area to a new view/panel
    var transitionView = function( navigationCommand ) {
      // There are several possible commands for panel movement:
      // 'moveForward': Advance to the next available panel
      // 'moveBackward': Go back to the previous available panel
      // 'showHome': Display the initial navigation view
      // 'resetPosition': Return to the position where the touch began
      // Or a specific panel selector (e.g., '#panel0')

      var allPanels = currentJQuery( 'div.content-section' );
      var targetLeftPanel = undefined; // Reference to the panel that will become the leftmost visible
      var targetRightPanel = undefined; // Reference to the panel to the right of the leftmost visible
      var currentOffset = mainContentArea.offset().left; // Current X offset of the content area

      // Determine the currently visible panel(s) based on the offset
      if ( currentOffset > 0 ) { // If the navigation is visible (offset > 0)
        targetRightPanel = currentJQuery( allPanels )[ 0 ]; // First panel is to the right
      } else {
        // Iterate through panels to find which one is currently at the left edge or just off-screen
        for ( var k = 0; k < allPanels.length; k++ ) {
          currentOffset += currentJQuery( allPanels[ k ] ).outerWidth();
          if ( currentOffset > 10 ) { // Find the panel whose right edge is past a small threshold
            targetLeftPanel = allPanels[ k ];
            targetRightPanel = allPanels[ k + 1 ];
            break;
          }
        }
      }

      // Execute the appropriate action based on the navigation command
      switch ( navigationCommand ) {
        case CMD_BACKWARD:
          // Move to the previous panel if one exists
          if ( typeof targetLeftPanel !== 'undefined' ) {
            animateToPosition( mainContentArea, -1 * currentJQuery( targetLeftPanel ).position().left );
            break;
          }
        case CMD_HOME_VIEW:
          // Move to the home/navigation view (usually position 0 or offset by nav width)
          animateToPosition( mainContentArea, staticNavSection.outerWidth() + staticNavSection.position().left );
          break;
        case CMD_FORWARD:
          // Move to the next panel if one exists
          if ( typeof targetRightPanel !== 'undefined' ) {
            animateToPosition( mainContentArea, -1 * currentJQuery( targetRightPanel ).position().left );
          }
          break;
        case CMD_RESET_VIEW:
          // Return to the position where the touch gesture was initiated
          animateToPosition( mainContentArea, moduleInstance.interactionState.contentPanelPosition );
          break;
        default:
          // If a specific panel ID/selector is provided, move to that panel
          targetLeftPanel = currentJQuery( navigationCommand );
          if ( typeof targetLeftPanel !== 'undefined' ) {
            animateToPosition( mainContentArea, -1 * currentJQuery( targetLeftPanel ).position().left );
          }
      }
    };

    // Animates the display layer to a specified final X-position
    var animateToPosition = function( displayLayer, finalPosition ) {
      // Perform the animation using jQuery's animate function
      return mainContentArea.animate( { left: finalPosition },
        moduleInstance.configuration.transitionDuration,
        moduleInstance.configuration.animationEffect,
        function() {
          // Update the stored element position after the animation completes
          moduleInstance.interactionState.contentPanelPosition = finalPosition;
        } );
    };

    // Rebinds click handlers for hyperlinks within a given HTML fragment
    var rebindHyperlinks = function( htmlFragment, linkActionMap ) {
      currentJQuery.each( linkActionMap, function( hyperlinkRef, clickCallback ) {
        // Find all 'a' tags within the fragment that match the hyperlink reference
        var matchingLinks = currentJQuery( htmlFragment ).find( 'a[href="' + hyperlinkRef + '"]' );
        // Attach the stored click handler to these links
        matchingLinks.on( { 'click': clickCallback } );
      } );
    };

    // Initial call to set up the module when an instance is created
    initializeModule();
  };

  // Extend jQuery's prototype to add the 'panelNavigator' plugin
  currentJQuery.fn.panelNavigator = function( staticRegion, customParams ) {
    // Iterate over each selected element to apply the plugin
    return this.each( function() {
      var currentElement = currentJQuery( this );

      // If the element already has a plugin instance, skip it
      if ( currentElement.data( 'panelNavigator' ) ) {
        return;
      }

      // Create a new instance of PanelNavigator
      var panelManager = new PanelNavigator( this, staticRegion, customParams );

      // Store the plugin instance in the element's data for future reference
      currentElement.data( 'panelNavigator', panelManager );
    } );
  };
} )( jQuery );