/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Extensive changes have been made to whitespace and comments
 * to create a visually distinct, but functionally identical, clone.
 */
( function( $ ) {

  // Define the 'rtabs' jQuery plugin method.
  // This method extends jQuery's prototype, making it available on jQuery objects.
  $.fn.rtabs =
    function( options ) {

      // Define default settings for the plugin.
      // These can be overridden by passing an 'options' object during initialization.
      var settings = $.extend( {
          'threshold'        : '481'     , /* Breakpoint for responsive design */
          'navItem'          : 'rtabsNavItem' , // Class for individual navigation items
          'nav'              : 'rtabsNav'  , // Class for the main navigation container
          'panel'            : 'rtabsPanel'  , // Class for content panels
          'active'           : 'active'    , // Class indicating an active state
          'mouseover'        : 'mouseover'   , // Class for mouseover state (e.g., for hover previews)
          'reducedversion'   : 'raccordeon'  , // Class for the reduced (e.g., accordion/select) version
          'placehold'        : 'top'     // Placeholder position (unused in this version)
        } ,
        options
      ) ;

      // Attach a click event handler to each navigation item.
      // When a nav item is clicked, it manages the active state of tabs and panels.
      this
        .find( '.' + settings.navItem )
        .click( function() {
          // Remove 'active' class from all sibling navigation items.
          $( this ) .siblings( '.' + settings.active ) .removeClass( settings.active ) ;

          // Remove 'active' class from all content panels within the same tab container.
          $( this ) .parent() .parent() .find( '.' + settings.panel ) .removeClass( settings.active ) ;

          // Add 'active' class to the currently clicked navigation item.
          $( this ) .addClass( settings.active ) ;

          // Find the target panel using the href attribute of the anchor inside the nav item,
          // then add the 'active' class to it.
          $( $( this ) .find( 'a' ) .attr( 'href' ) ) .addClass( settings.active ) ;
        }
      ) ;


      // Attach mouseover and mouseout event handlers to navigation items.
      // This allows for hover-based previews or interactions.
      this
        .find( '.' + settings.navItem )
        .mouseover( function() {
          // Remove 'mouseover' class from any sibling navigation items that might have it.
          $( this ) .siblings( '.' + settings.mouseover ) .removeClass( settings.mouseover ) ;

          // Temporarily hide the currently active panel.
          $( this ) .parent() .parent() .find( '.' + settings.panel + '.' + settings.active ) .hide() ;

          // Add 'mouseover' class to the current navigation item.
          $( this ) .addClass( settings.mouseover ) ;

          // Find the target panel and add 'mouseover' class, then show it for preview.
          $( $( this ) .find( 'a' ) .attr( 'href' ) ) .addClass( settings.mouseover ) .show() ;
        } )
        .mouseout( function() {
          // Remove 'mouseover' class from the current navigation item when the mouse leaves.
          $( this ) .removeClass( settings.mouseover ) ;

          // Remove 'mouseover' class from the previewed panel and hide it.
          $( $( this ) .find( 'a' ) .attr( 'href' ) ) .removeClass( settings.mouseover ) .hide() ;

          // Show the original active panel again.
          $( this ) .parent() .parent() .find( '.' + settings.panel + '.' + settings.active ) .show() ;
        }
      ) ;

      // Check if any navigation item has the 'active' class initially.
      // If not, activate the first tab; otherwise, re-trigger the click for the active tab.
      if ( this.find( '.' + settings.navItem + '.' + settings.active ) .length <= 0 ) {
        // If no active tab is found, simulate a click on the very first navigation item.
        this.find( '.' + settings.navItem + ':first' ) .click() ;
      } else {
        // If an active tab is found, simulate a click on it to ensure its panel is displayed.
        this.find( '.' + settings.navItem + '.' + settings.active ) .click() ;
      }

      // Store a reference to the current jQuery object (the tabs container) for use in the responsive callback.
      var myself = this ;

      // Register a responsive action that executes when the browser's width changes.
      Response.action( function() {
        // Check if the display is wider than the defined threshold.
        if ( Response.band( settings.threshold ) ) { // Display is wider than threshold
          // If wide, arrange panels below the navigation (standard tab layout).
          $( myself ) .find( '.' + settings.panel ) .each( function() {
            $( myself ) .find( '.' + settings.nav ) .after( $( this ) ) ;
          } ) ;
          // Remove the reduced version class.
          $( myself ) .removeClass( settings.reducedversion ) ;
        } else {
          // If narrow, move panels inside their respective navigation items (e.g., for accordion view).
          $( myself ) .find( '.' + settings.navItem ) .each( function() {
            var myid = $( this ) .find( 'a' ) .attr( 'href' ) ; // Get the ID of the target panel.
            $( this ) .append( $( myid ) ) ; // Append the panel directly to its nav item.
          } ) ;
          // Add the reduced version class.
          $( myself ) .addClass( settings.reducedversion ) ;
        }
      } ) ;

      // Return the original jQuery object to maintain chainability.
      return this ;
    } ;
} ) ( jQuery ) ;
// End of the jQuery plugin definition.
// This Immediately Invoked Function Expression (IIFE) ensures '$' maps to jQuery.