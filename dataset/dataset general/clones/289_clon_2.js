/*
Responsive Navigation Module
copyright 12 October 2023, by Alpha Dev Studios https://alphadev.com
This script is open for use on your web projects under the condition
that this entire code block, including these opening comments, is
retained without modification.
*/
(  function( $ )  {

  $.fn.foldoutNav = function( params ) {
    var config = $.extend( {
      // Styling and dimensions for the activation button
      togglePnlBg: 'white',
      togglePnlWd: '50px',
      togglePnlHt: '50px',
      // Selectors and text extraction for menu items
      navItemSelector: 'li a',
      navItemTxt: function( $anchor ) { return $anchor.text() },
      navItemAllowed: function( $anchor, index, $anchors ) { return true; },
      // Positioning and layering
      fixedPosition: true,
      depthIndex: 100,
      vertOffset: 0,
      togglePnlMargin: 10,
      // Styling for the lines within the toggle button
      stripHue: 'black',
      stripSize: '30px',
      stripDepth: '5px',
      stripGap: '5px',
      // Menu display options
      concealInitialNav: true,
      panelWidth: '100%',
      panelHeight: 'auto',
      panelBackground: 'white',
      panelBorder: '1px solid black',
      // Styling for menu items
      navItemColor: 'black',
      navItemBackground: 'white',
      navItemPadding: '10px 10px',
      navItemTxtDecoration: 'none',
      navItemBtmBorder: '1px solid black',
      navItemNoBtmBdrLast: true,
      // Layout and animation
      placement: 'left',
      keepToggleNextToPanel: false,
      animationSpeed: 0,
      concealOnBodyClick: true,
      // Responsive breakpoints
      displayFromWidth: 0,
      displayUntilWidth: 640,
      // Advanced features
      shiftPageContent: false,
      showOverlay: false,
      customPanelContent: false,
      customToggleButton: false
    }, params );

    // Utility function to construct the navigation toggle button
    function generateToggleElement( indexValue ) {
      // Create the toggle button container and assign its foundational styles
      var $togglePnl = $( '<div class="responsive-nav-toggle responsive-nav-toggle-' + indexValue + '"></div>' ),
          togglePnlStyles = {
            backgroundColor: config.togglePnlBg,
            width: config.togglePnlWd,
            height: config.togglePnlHt,
            zIndex: config.depthIndex,
            position: config.fixedPosition ? 'fixed' : 'absolute',
            top: config.vertOffset,
            cursor: 'pointer'
          };

      // Adjust button placement based on 'placement' setting and multiple instances
      togglePnlStyles[ config.placement ] = ( parseInt( config.togglePnlWd ) + parseInt( config.togglePnlMargin ) ) * indexValue;

      $togglePnl.css( togglePnlStyles );

      if ( config.customToggleButton === false ) {
        // Embed three horizontal stripes to form the classic burger icon
        $togglePnl.append( generateToggleStripe( 0 ) );
        $togglePnl.append( generateToggleStripe( 1 ) );
        $togglePnl.append( generateToggleStripe( 2 ) );
      } else {
        $togglePnl.append( config.customToggleButton );
      }

      return $togglePnl;
    }

    // Secondary function to create individual stripes for the toggle button
    function generateToggleStripe( stripeIndex ) {
      // Instantiate a stripe element and apply its visual properties
      var $stripe = $( '<span class="responsive-nav-stripe responsive-nav-stripe-' + stripeIndex + '"></span>' ).css( {
        position: 'absolute',
        backgroundColor: config.stripHue,
        height: config.stripDepth,
        width: config.stripSize,
        left: ( ( parseInt( config.togglePnlWd ) - parseInt( config.stripSize ) ) / 2 ),
        top: ( ( parseInt( config.togglePnlHt ) - ( parseInt( config.stripDepth ) * 3 + parseInt( config.stripGap ) * 2 ) ) / 2 ) + ( parseInt( config.stripDepth ) + parseInt( config.stripGap ) ) * stripeIndex,
        display: 'block'
      } );

      return $stripe;
    }

    // Function responsible for generating individual links within the navigation panel
    function generatePanelItem( $sourceAnchor, itemIndex, totalItems ) {
      // Create the anchor element for the panel and set its attributes and styles
      // The displayed text can be customized via the 'navItemTxt' configuration function
      var $panelItem = $( '<a>' ).attr( 'href', $sourceAnchor.attr( 'href' ) ).text( config.navItemTxt( $sourceAnchor ) ),
          navItemStyles = {
            color: config.navItemColor,
            padding: config.navItemPadding,
            background: config.navItemBackground,
            display: 'block',
            textDecoration: config.navItemTxtDecoration,
            borderBottom: config.navItemBtmBorder
          };

      $panelItem.css( navItemStyles );

      // Conditionally remove the bottom border for the final item in the list
      if ( config.navItemBtmBorder !== 'none' && config.navItemNoBtmBdrLast && itemIndex === totalItems - 1 ) {
        $panelItem.css( 'borderBottom', 'none' );
      }

      return $panelItem;
    }

    // Core function to assemble the full navigation panel
    function generatePanelContainer( panelIndex, $sourceNav ) {
      // Initialize the panel container and define its structural styles
      var $panel = $( '<div class="responsive-nav-panel responsive-nav-panel-' + panelIndex + '"></div>' ),
          panelStyles = {
            height: config.panelHeight,
            background: config.panelBackground,
            top: config.keepToggleNextToPanel ? 0 : parseInt( config.togglePnlHt ) - 1,
            zIndex: config.depthIndex - 1,
            position: config.fixedPosition ? 'fixed' : 'absolute',
            border: config.panelBorder,
            boxSizing: 'border-box'
          },
          $sourceItems = $sourceNav.find( config.navItemSelector );

      // Position the panel off-screen initially, based on 'placement'
      panelStyles[ config.placement ] = '-' + retrievePanelDimension();
      // Set the calculated width for the panel
      panelStyles.width = retrievePanelDimension();

      // Apply styles to the panel and remove the border on the side matching its 'placement'
      $panel.css( panelStyles ).css( 'border-' + ( config.placement ), 'none' );

      if ( config.customPanelContent === false ) {
        // Iterate through each link found in the original navigation structure
        $sourceItems.each( function( itemIndex ) {
          // For each valid link, create a new panel item and append it
          if ( config.navItemAllowed( $( this ), itemIndex, $sourceItems ) ) {
            $panel.append( generatePanelItem( $( this ), itemIndex, $sourceItems.length ) );
          }
        } );
      } else {
        // Insert custom pre-defined content into the panel
        $panel.append( config.customPanelContent );
      }

      return $panel;
    }

    // Determines the effective width of the navigation panel
    function retrievePanelDimension() {
      // If the toggle button should remain adjacent to the panel
      if ( config.keepToggleNextToPanel ) {
        // Handle percentage-based panel widths
        if ( config.panelWidth.indexOf( '%' ) > -1 ) {
          // Calculate width by subtracting the button's width from the percentage of window width
          return ( ( ( $( window ).width() * ( parseInt( config.panelWidth ) / 100 ) ) ) - parseInt( config.togglePnlWd ) ) + 'px';
        } else {
          // Simply subtract the button's width from the explicitly set panel width
          return ( parseInt( config.panelWidth ) - parseInt( config.togglePnlWd ) ) + 'px';
        }
      } else {
        // Return the panel width as specified in the configuration
        return config.panelWidth;
      }
    }

    // Manages the animation and display state of the navigation panel
    var lastDisplayedPanel = null;
    function togglePanelVisibility( $panelRef, shouldHide, $togglePnlRef ) {
      var panelAnimCfg = {},
          bodyAnimCfg = {},
          toggleAnimCfg = {},
          panelCurrentWidth = retrievePanelDimension();

      // If the entire page content needs to be translated
      if ( config.shiftPageContent ) {
        // Animate the body element to shift its position
        bodyAnimCfg[ config.placement ] = ( shouldHide ? 0 : panelCurrentWidth );
        $( 'body' ).animate( bodyAnimCfg, config.animationSpeed );
      }

      // Animate the panel into or out of view
      panelAnimCfg[ config.placement ] = ( shouldHide ? '-' + panelCurrentWidth : 0 );
      $panelRef.animate( panelAnimCfg, config.animationSpeed );

      // If the toggle button needs to move with the panel
      if ( config.keepToggleNextToPanel ) {
        // Animate the toggle button to maintain its relative position
        toggleAnimCfg[ config.placement ] = ( shouldHide ? 0 : panelCurrentWidth );
        $togglePnlRef.animate( toggleAnimCfg, config.animationSpeed );
      }

      // Display or hide an overlay if configured
      if ( config.showOverlay !== false ) {
        if ( !shouldHide ) {
          // Append and animate a semi-transparent overlay
          $( 'body' ).append( $( '<div>' ).attr( 'class', 'responsive-nav-overlay' ).css( {
            opacity: 0,
            background: config.showOverlay,
            width: '100%',
            height: '100%',
            position: 'fixed',
            zIndex: config.depthIndex - 2,
            top: 0,
            left: 0
          } ).animate( {
            opacity: 0.5
          }, config.animationSpeed ) );
        } else {
          // Fade out and remove the active overlay
          $( '.responsive-nav-overlay' ).animate( {
            opacity: 0
          }, function() {
            $( this ).remove();
          } );
        }
      }

      // Manage the tracking of the last opened panel
      if ( !shouldHide ) {
        if ( lastDisplayedPanel !== null ) {
          togglePanelVisibility( lastDisplayedPanel, true );
        }
        lastDisplayedPanel = $panelRef;
      } else {
        lastDisplayedPanel = null;
      }
    }

    // Process each selected element to initialize the navigation
    return this.each( function( instanceIndex ) {
      var $currentNav = $( this ),
          $togglePnl = generateToggleElement( instanceIndex ),
          $panel = generatePanelContainer( instanceIndex, $currentNav ),
          concealPanelIfActive = function() {
            if ( $togglePnl.hasClass( 'responsive-nav-active' ) ) {
              $togglePnl.trigger( 'click' );
            }
          },
          limitVisibilityToBreakpoint = function( currentWidth ) {
            if ( currentWidth >= config.displayFromWidth && currentWidth <= config.displayUntilWidth ) {
              // Ensure toggle and panel are visible within breakpoint
              $togglePnl.show();
              $panel.show();

              // Optionally hide the original navigation element
              if ( config.concealInitialNav ) {
                $currentNav.hide();
              }
            } else {
              // Conceal toggle and panel outside breakpoint
              $togglePnl.hide();
              $panel.hide();

              // Optionally show the original navigation element
              if ( config.concealInitialNav ) {
                $currentNav.show();
              }
            }
          };

      // Attach event listener to the toggle button
      $togglePnl.on( 'click', function( clickEvent ) {
        var shouldHide = $togglePnl.hasClass( 'responsive-nav-active' );
        // Toggle panel visibility and update button state
        togglePanelVisibility( $panel, shouldHide, $togglePnl );
        $togglePnl.toggleClass( 'responsive-nav-active' );
      } );

      // Append the created toggle button and panel to the document body
      $( 'body' ).append( $togglePnl, $panel );

      // Handle window resize events
      $( window ).on( 'resize', function() {
        // Close the menu if it's open on resize
        concealPanelIfActive();

        // Recalculate and reset panel width for responsiveness
        var panelCurrentWidth = retrievePanelDimension(),
            panelStyles = { width: panelCurrentWidth };
        panelStyles[ config.placement ] = '-' + panelCurrentWidth;
        $panel.css( panelStyles );

        // Re-evaluate visibility based on current window width and breakpoints
        limitVisibilityToBreakpoint( $( this ).width() );
      } ).trigger( 'resize' ); // Trigger immediately to set initial state

      limitVisibilityToBreakpoint( $( window ).width() );

      // Implement hiding the menu when clicking outside its area
      if ( config.concealOnBodyClick ) {
        // Attach a global click listener to the body
        $( 'body' ).on( 'click', function( eventObject ) {
          var $eventTarget = $( eventObject.target );
          // Check if the click originated outside the toggle button or the panel
          if ( !$eventTarget.hasClass( 'responsive-nav-toggle' ) && !$eventTarget.hasClass( 'responsive-nav-panel' ) &&
               $eventTarget.parents( '.responsive-nav-panel' ).length === 0 && $eventTarget.parents( '.responsive-nav-toggle' ).length === 0 ) {
            // If so, hide the navigation panel
            concealPanelIfActive();
          }
        } );
      }

      // Apply necessary body styles if page content shifting is enabled
      if ( config.shiftPageContent ) {
        // Prevent horizontal scrollbar and enable relative positioning for animation
        $( 'body' ).css( {
          'overflow-x': 'hidden',
          'position': 'relative'
        } );
      }
    } );
  };

} )( jQuery );