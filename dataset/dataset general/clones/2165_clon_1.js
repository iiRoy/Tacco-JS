// This file contains the Angular.js breakpoint directive.
// It's designed to help build responsive web applications by
// dynamically adding CSS classes to an element based on
// the current window width and predefined breakpoints.
//
// Project home: http://snapjay.github.com/angularjs-breakpoint/
//
// Usage: Apply this as an attribute to your body tag, for example:
// <body breakpoint="{1250:'break1250', 1000:'break1000',1120:'break1120'}">
//
// The values are made available on the scope for easy access:
// {{breakpoint.class}}      => The currently active breakpoint CSS class.
// {{breakpoint.windowSize}} => The current width of the browser window.
//
// Version: 0.0.1 - Initial release.
// Author: Snapjay
// License: MIT (or similar, not specified in original, assuming for example)
var breakpointApp = angular .module('breakpointApp' , [ ] ) ;


// The core directive definition for 'breakpoint'.
// It injects $window and $rootScope services for DOM manipulation and event broadcasting.
breakpointApp .directive ( 'breakpoint' , [ '$window' , '$rootScope' , function ( $window , $rootScope ) {

  // The directive's configuration object.
  return {

    // Restrict the directive to be used only as an attribute.
    restrict : "A" ,

    // The link function is where the directive logic resides.
    // It's executed after the template has been compiled and linked.
    link : function ( scope , element , attr ) {

      // Initialize the breakpoint object on the scope.
      // 'class' will store the active CSS class, 'windowSize' the current width.
      scope .breakpoint = { class : '' , windowSize : $window .innerWidth } ;

      // Parse the breakpoint attribute value from the element.
      // This expects an object like {width: 'className'}.
      var breakpoints = ( scope .$eval ( attr .breakpoint ) ) ;

      // A flag to ensure the broadcast event fires at least once on initialization.
      var firstTime = true ;


      // Attach an event listener to the window's resize event.
      // When the window resizes, the 'setWindowSize' function will be called.
      angular .element ( $window ) .bind ( 'resize' , setWindowSize ) ;


      // Watch for changes in 'breakpoint.windowSize'.
      // Whenever the window width changes, update the CSS class.
      scope .$watch ( 'breakpoint.windowSize' , function ( windowWidth , oldValue ) {

        // Call the helper function to determine and set the appropriate CSS class.
        setClass ( windowWidth ) ;

      } ) ;


      // Watch for changes in 'breakpoint.class'.
      // If the class changes or it's the first time, broadcast an event.
      scope .$watch ( 'breakpoint.class' , function ( newClass , oldClass ) {

        // Check if the class has actually changed or if it's the initial setup.
        if ( newClass != oldClass || firstTime ) {

          // Broadcast an event across the root scope.
          // Other parts of the application can listen for 'breakpointChange'.
          broadcastEvent ( oldClass ) ;

          // Reset the flag after the first broadcast.
          firstTime = false ;
        }

      } ) ;


      /**
       * Broadcasts a 'breakpointChange' event on the $rootScope.
       * This allows other controllers/directives to react to breakpoint changes.
       *
       * @param {string} oldClass - The CSS class that was active before the change.
       */
      function broadcastEvent ( oldClass ) {

        $rootScope .$broadcast ( 'breakpointChange' , scope .breakpoint , oldClass ) ;

      }


      /**
       * Updates the windowSize property on the scope.
       * Also triggers a digest cycle if one isn't already in progress.
       */
      function setWindowSize ( ) {

        // Update the windowSize property with the current inner width.
        scope .breakpoint .windowSize = $window .innerWidth ;

        // Manually trigger a digest cycle if not already in progress.
        // This ensures the view is updated after the window resize event.
        if ( ! scope .$$phase ) scope .$apply ( ) ;

      }


      /**
       * Determines and sets the appropriate CSS class based on the window width.
       * Iterates through defined breakpoints and applies the matching class.
       *
       * @param {number} windowWidth - The current width of the browser window.
       */
      function setClass ( windowWidth ) {

        // Initialize setClass with the first breakpoint's class as a default.
        // This ensures at least one class is set if no other breakpoint matches.
        var setClass = breakpoints [ Object .keys ( breakpoints ) [ 0 ] ] ;

        // Iterate through all defined breakpoints.
        for ( var breakpoint in breakpoints ) {

          // If the breakpoint's width is less than the current window width,
          // then this breakpoint applies.
          if ( breakpoint < windowWidth ) {
            setClass = breakpoints [ breakpoint ] ;
          }

          // Remove all breakpoint classes from the element to ensure only
          // the currently active one is present.
          element .removeClass ( breakpoints [ breakpoint ] ) ;

        }

        // Add the determined active class to the element.
        element .addClass ( setClass ) ;

        // Update the 'class' property on the scope's breakpoint object.
        scope .breakpoint .class = setClass ;

        // Manually trigger a digest cycle if not already in progress.
        // This is important because class changes might not be detected
        // by Angular immediately after a native DOM manipulation.
        if ( ! scope .$$phase ) scope .$apply ( ) ;

      }

    } // End of link function.

  } ; // End of return object for directive.

} ] ) ; // End of directive definition.