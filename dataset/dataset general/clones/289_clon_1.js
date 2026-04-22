// Ultimate Burger Menu Plugin
// Copyright (c) 2014 Thomas Rambaud - http://thomasrambaud.com
// This JavaScript code is provided under a license that requires
// its use without any modifications, including these introductory comments.
// All rights reserved.
( function ( $ )
{
  // Define the burgerMenu plugin as a jQuery function.
  $.fn.burgerMenu = function ( options )
  {
    // Merge default settings with user-provided options.
    var settings = $.extend(
    {
      buttonBg: 'white', // Default background color for the button
      buttonWidth: '50px', // Default width for the button
      buttonHeight: '50px', // Default height for the button
      linkSelector: 'li a', // Selector for navigation links
      linkText: function ( $a ) { return $a.text() }, // Function to get link text
      linkAccept: function ( $a, eq, $links ) { return true; }, // Function to filter links
      fixed: true, // Should the menu be fixed position?
      zIndex: 100, // Z-index for the menu components
      top: 0, // Top position for the button
      buttonMargin: 10, // Margin between multiple buttons
      lineColor: 'black', // Color of the burger lines
      lineWidth: '30px', // Width of the burger lines
      lineHeight: '5px', // Height of the burger lines
      lineMargin: '5px', // Margin between burger lines
      hideInitialNav: true, // Hide the original navigation on breakpoint
      menuWidth: '100%', // Width of the opened menu
      menuHeight: 'auto', // Height of the opened menu
      menuBackground: 'white', // Background color of the menu
      menuBorder: '1px solid black', // Border style for the menu
      linkColor: 'black', // Color of menu links
      linkBackground: 'white', // Background of menu links
      linkPadding: '10px 10px', // Padding for menu links
      linkTextDecoration: 'none', // Text decoration for menu links
      linkBorderBottom: '1px solid black', // Border at the bottom of menu links
      linkNoBorderOnLast: true, // Remove bottom border for the last link
      position: 'left', // Position of the menu (left or right)
      keepButtonNextToMenu: false, // Should the button move with the menu?
      animateSpeed: 0, // Animation speed in milliseconds
      hideOnBodyClick: true, // Hide menu when clicking outside
      showFromWidth: 0, // Min window width to show burger menu
      showUntilWidth: 640, // Max window width to show burger menu
      translate: false, // Translate the body when menu opens
      overlay: false, // Overlay background color when menu opens
      customContent: false, // Custom content to display in the menu
      customButton: false // Custom content for the button
    },
    options
    );


    // Helper function to generate the burger menu button DOM element.
    function createButton ( eq )
    {
      // Create the main button div with dynamic classes.
      var $button = $( '<div class="burger-menu-button burger-menu-button-' + eq + '"></div>' ),
          // Define CSS properties for the button.
          buttonCss =
          {
            background: settings.buttonBg,         // Button background color.
            width: settings.buttonWidth,           // Button width.
            height: settings.buttonHeight,         // Button height.
            zIndex: settings.zIndex,               // Z-index for layering.
            position: settings.fixed ? 'fixed' : 'absolute', // Positioning.
            top: settings.top,                     // Top offset.
            cursor: 'pointer'                      // Cursor style.
          };

      // Calculate the position (left/right) of the button,
      // accounting for multiple instances.
      buttonCss[ settings.position ] = ( parseInt( settings.buttonWidth ) + parseInt( settings.buttonMargin ) ) * eq;

      // Apply the calculated CSS to the button.
      $button.css( buttonCss );

      // Check if a custom button content is provided.
      if ( settings.customButton == false )
      {
        // If not, generate the default three lines.
        $button.append( createButtonLine( 0 ) );
        $button.append( createButtonLine( 1 ) );
        $button.append( createButtonLine( 2 ) );
      }
      else
      {
        // Otherwise, append the custom button content.
        $button.append( settings.customButton );
      }

      // Return the constructed button element.
      return $button;
    }


    // Helper function to create individual lines within the burger button.
    function createButtonLine ( eq )
    {
      // Construct a span element for the line with dynamic class.
      // Apply inline CSS for positioning and appearance.
      var $line = $( '<span class="burger-menu-line burger-menu-line-' + eq + '"></span>' ) . css(
      {
        position: 'absolute',                                                                                                          // Absolute positioning for lines.
        backgroundColor: settings.lineColor,                                                                                           // Line color.
        height: settings.lineHeight,                                                                                                   // Line height.
        width: settings.lineWidth,                                                                                                     // Line width.
        left: ( ( parseInt( settings.buttonWidth ) - parseInt( settings.lineWidth ) ) / 2 ),                                            // Horizontal centering.
        top: ( ( parseInt( settings.buttonHeight ) - ( parseInt( settings.lineHeight ) * 3 + parseInt( settings.lineMargin ) * 2 ) ) / 2 ) + ( parseInt( settings.lineHeight ) + parseInt( settings.lineMargin ) ) * eq, // Vertical positioning for each line.
        display: 'block'                                                                                                               // Ensure block display.
      } );

      // Return the styled line element.
      return $line;
    }


    // Function responsible for generating a menu link element.
    function createMenuLink ( $a, eq, len )
    {
      // Create an anchor tag, set its href, and determine its text content.
      // The link text can be customized via `settings.linkText`.
      var $link = $( '<a>' ) . attr( 'href', $a.attr( 'href' ) ) . text( settings.linkText( $a ) ),
          // Define the default CSS styles for the menu link.
          linkCss =
          {
            color: settings.linkColor,                 // Text color for the link.
            padding: settings.linkPadding,             // Padding around the link text.
            background: settings.linkBackground,       // Background color for the link.
            display: 'block',                          // Make the link a block-level element.
            textDecoration: settings.linkTextDecoration, // Text decoration (e.g., underline).
            borderBottom: settings.linkBorderBottom    // Bottom border for separation.
          };

      // Apply the defined CSS styles to the newly created link.
      $link.css( linkCss );

      // Conditional logic to remove the bottom border on the last link item,
      // if `linkNoBorderOnLast` is true and a border is present.
      if ( settings.borderBottom != 'none' && settings.linkNoBorderOnLast && eq == len - 1 )
      {
        $link.css( 'borderBottom', 'none' ); // Remove the bottom border.
      }

      // Return the fully styled link element.
      return $link;
    }


    // Core function to construct the main menu container.
    function createMenu ( eq, $nav )
    {
      // Initialize the menu div with appropriate classes.
      var $menu = $( '<div class="burger-menu burger-menu-' + eq + '"></div>' ),
          // Define base CSS styles for the menu.
          menuCss =
          {
            height: settings.menuHeight,                                   // Menu height.
            background: settings.menuBackground,                           // Menu background color.
            top: settings.keepButtonNextToMenu ? 0 : parseInt( settings.buttonHeight ) - 1, // Vertical position.
            zIndex: settings.zIndex - 1,                                   // Z-index, slightly below button.
            position: settings.fixed ? 'fixed' : 'absolute',               // Positioning strategy.
            border: settings.menuBorder,                                   // Menu border style.
            boxSizing: 'border-box'                                        // Box model.
          },
          // Find all relevant links within the initial navigation element.
          $links = $nav.find( settings.linkSelector );

      // Set the initial off-screen position for the menu (left or right).
      menuCss[ settings.position ] = '-' + settings.menuWidth;
      // Dynamically calculate and set the menu's width.
      menuCss.width = getMenuWidth();

      // Apply the accumulated CSS to the menu,
      // and remove the border on the side where it's positioned.
      $menu.css( menuCss ) . css( 'border-' + ( settings.position ), 'none' );

      // Check if custom content should be used for the menu.
      if ( settings.customContent == false )
      {
        // If no custom content, iterate through found links.
        $links.each( function ( eq )
        {
          // Apply the `linkAccept` filter to decide which links to include.
          if ( settings.linkAccept( $( this ), eq, $links ) )
          {
            // Create and append a styled menu link for each accepted item.
            $menu.append( createMenuLink( $( this ), eq, $links.length ) );
          }
        } );
      }
      else
      {
        // If custom content is provided, append it directly.
        $menu.append( settings.customContent );
      }

      // Return the assembled menu element.
      return $menu;
    }


    // Calculates the effective width of the menu.
    function getMenuWidth ()
    {
      // Determine if the button should remain adjacent to the menu.
      if ( settings.keepButtonNextToMenu )
      {
        // If the menu width is defined as a percentage.
        if ( settings.menuWidth.indexOf( '%' ) > -1 )
        {
          // Calculate percentage-based width, then subtract button width.
          return ( ( ( $( window ).width() * ( parseInt( settings.menuWidth ) / 100 ) ) ) - parseInt( settings.buttonWidth ) ) + 'px';
        }
        else
        {
          // Subtract button width from a fixed menu width.
          return ( parseInt( settings.menuWidth ) - parseInt( settings.buttonWidth ) ) + 'px';
        }
      }
      else
      {
        // If button does not move, return the menu width as specified.
        return settings.menuWidth;
      }
    }


    // Variable to keep track of the last menu that was shown.
    var lastMenuShown = null;

    // Function to control the visibility and animation of the menu.
    function showHideMenu ( $menu, hide, $button )
    {
      // Initialize animation objects for menu, body, and button.
      var menuAnimation = {},
          bodyAnimation = {},
          buttonAnimation = {},
          menuWidth = getMenuWidth(); // Get the current menu width.

      // If the `translate` setting is enabled, animate the body.
      if ( settings.translate )
      {
        // Determine the body's new position (translated or reset).
        bodyAnimation[ settings.position ] = ( hide ? 0 : menuWidth );
        // Animate the body's position.
        $( 'body' ) . animate( bodyAnimation, settings.animateSpeed );
      }

      // Animate the menu's position to show or hide it.
      menuAnimation[ settings.position ] = ( hide ? '-' + menuWidth : 0 );
      $menu.animate( menuAnimation, settings.animateSpeed );

      // If the button should stay next to the menu, animate the button's position as well.
      if ( settings.keepButtonNextToMenu )
      {
        buttonAnimation[ settings.position ] = ( hide ? 0 : menuWidth );
        $button.animate( buttonAnimation, settings.animateSpeed );
      }

      // Handle the overlay functionality.
      if ( settings.overlay !== false )
      {
        if ( !hide )
        {
          // If showing the menu, create and animate the overlay.
          $( 'body' ) . append(
            $( '<div>' ) . attr( 'class', 'burger-menu-overlay' ) . css(
            {
              opacity: 0,             // Start invisible.
              background: settings.overlay, // Overlay background color.
              width: '100%',          // Full width.
              height: '100%',         // Full height.
              position: 'fixed',      // Fixed position.
              zIndex: settings.zIndex - 2, // Below menu and button.
              top: 0,
              left: 0
            } ) . animate(
            {
              opacity: 0.5            // Fade to semi-transparent.
            },
            settings.animateSpeed
            )
          );
        }
        else
        {
          // If hiding the menu, fade out and remove the overlay.
          $( '.burger-menu-overlay' ) . animate(
          {
            opacity: 0
          },
          function ()
          {
            $( this ) . remove(); // Remove from DOM after animation.
          }
          );
        }
      }

      // Manage the `lastMenuShown` variable to ensure only one menu is open at a time.
      if ( !hide )
      {
        // If a new menu is being shown, hide the previously shown one.
        if ( lastMenuShown != null )
        {
          showHideMenu( lastMenuShown, true );
        }
        lastMenuShown = $menu; // Update to the current menu.
      }
      else
      {
        lastMenuShown = null; // No menu is currently shown.
      }
    }


    // Iterate over each selected element to apply the burger menu functionality.
    return this.each( function ( eq )
    {
      // Cache the current element, create its button and menu.
      var $this = $( this ),
          $button = createButton( eq ),
          $menu = createMenu( eq, $this ),

          // Helper function to hide the menu if it's currently active.
          hideMenuIfVisible = function ()
          {
            if ( $button.hasClass( 'burger-menu-active' ) )
            {
              $button.trigger( 'click' ); // Simulate a click to toggle.
            }
          },

          // Helper function to manage visibility based on window width breakpoints.
          ensureVisibleOnlyInBreakpoint = function ( w )
          {
            if ( w >= settings.showFromWidth && w <= settings.showUntilWidth )
            {
              // If within breakpoint, show button and menu.
              $button.show();
              $menu.show();

              // Conditionally hide the original navigation.
              if ( settings.hideInitialNav )
              {
                $this.hide();
              }
            }
            else
            {
              // If outside breakpoint, hide button and menu.
              $button.hide();
              $menu.hide();

              // Conditionally show the original navigation.
              if ( settings.hideInitialNav )
              {
                $this.show();
              }
            }
          };

      // Attach click event handler to the burger button.
      $button.on( 'click', function ( e )
      {
        // Determine if the menu should be hidden (it's currently active).
        var hide = $button.hasClass( 'burger-menu-active' );
        // Show or hide the menu and toggle the active class on the button.
        showHideMenu( $menu, hide, $button );
        $button.toggleClass( 'burger-menu-active' );
      } );

      // Append the generated button and menu to the document body.
      $( 'body' ) . append( $button, $menu );

      // Attach a resize event listener to the window.
      $( window ) . on( 'resize', function ()
      {
        // When resized, hide the menu if it was visible.
        hideMenuIfVisible();

        // Recalculate menu width and reposition it off-screen to adapt to new window size.
        var menuWidth = getMenuWidth(),
            menuCss = { width: menuWidth };
        menuCss[ settings.position ] = '-' + menuWidth;
        $menu.css( menuCss );

        // Re-evaluate visibility based on current window width.
        ensureVisibleOnlyInBreakpoint( $( this ) . width() );
      } ) . trigger( 'resize' ); // Trigger resize immediately on load.

      // Initial check for breakpoint visibility.
      ensureVisibleOnlyInBreakpoint( $( window ) . width() );

      // Implement hide-on-body-click functionality if enabled.
      if ( settings.hideOnBodyClick )
      {
        $( 'body' ) . on( 'click', function ( event )
        {
          var $target = $( event.target );
          // Check if the click target is outside the burger menu and button.
          if ( !$target.hasClass( 'burger-menu-button' ) && !$target.hasClass( 'burger-menu' ) &&
               $target.parents( '.burger-menu' ) . length === 0 && $target.parents( '.burger-menu-button' ) . length === 0 )
          {
            // If outside, hide the menu.
            hideMenuIfVisible();
          }
        } );
      }

      // Apply body styles if translation animation is enabled.
      if ( settings.translate )
      {
        // Prevent horizontal scrollbar and enable relative positioning for animation.
        $( 'body' ) . css(
        {
          'overflow-x': 'hidden',
          'position': 'relative'
        } );
      }
    } );
  };
} )( jQuery );