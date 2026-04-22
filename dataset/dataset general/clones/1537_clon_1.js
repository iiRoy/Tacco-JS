/*
 * This script provides functionality for a sliding navigation menu,
 * inspired by a Facebook-style page slide menu.
 * Original source: https://github.com/aldomatic/FB-Style-Page-Slide-Menu
 */
  $( function ()
  {
    // Flag to track the current state of the menu (opened or closed).
    var menuOpened = false ;

    // Duration for the animation in milliseconds.
    var menuDelay  = 300   ;


    // Event handler for the navigation button click.
    $( ".btn-navbar" ) . click ( function ()
    {
      // Calculate the width of the navigation menu.
      var menuWidth = $ ( '.nav-collapse .nav' ) . width ( ) ;

      // Check if the menu is currently closed.
      if ( menuOpened != true )
      {
        // Animate the navigation collapse element to expand.
        $ ( ".nav-collapse" ) . animate (
          {
            width: menuWidth + "px"
          } ,
          menuDelay
        ) ;

        // Animate the body to slide out, revealing the menu.
        $ ( "body" ) . animate (
          {
            marginLeft : menuWidth + "px" ,
            marginRight: "-" + menuWidth + "px"
          } ,
          menuDelay ,
          function ( )
          {
            // Update the menu state after animation completes.
            menuOpened = true
          }
        ) ;

        // Prevent default link behavior.
        return false ;
      }
      else
      {
        // Animate the navigation collapse element to collapse.
        $ ( ".nav-collapse" ) . animate (
          {
            width : 0
          } ,
          menuDelay ,
          function ( )
          {
            // Reset the width style after animation to allow CSS to take over.
            $ ( this ) . css ( "width" , "" ) ;
          }
        ) ;

        // Animate the body to slide back, hiding the menu.
        $ ( "body" ) . animate (
          {
            marginLeft : "0px" ,
            marginRight: "0px"
          } ,
          menuDelay ,
          function ( )
          {
            // Update the menu state after animation completes.
            menuOpened = false
          }
        ) ;

        // Prevent default link behavior.
        return false ;
      }
    } ) ;
  } ) ;