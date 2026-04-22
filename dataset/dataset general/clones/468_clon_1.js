( function ( angular , document ) { // This is an immediately invoked function expression (IIFE) encapsulating our module logic.

  // Declare our Angular module named 'viewhead'.
  var mod = angular.module( 'viewhead' , [ ] );

  // Define the 'viewTitle' directive.
  // This directive is responsible for updating the document's title dynamically.
  mod.directive(
    'viewTitle', // The name of our directive.
    [ '$rootScope' , function ( $rootScope ) { // Injecting $rootScope to modify the global title.
      return { // Directive Definition Object (DDO).
        restrict : 'EA' , // Can be used as an element ('<view-title>') or an attribute ('<div view-title>').
        link : function ( scope , iElement , iAttrs , controller , transcludeFn ) { // The link function for directive logic.

          // Check if the directive was used as an element itself.
          // If so, we detach it from the DOM to prevent it from having any visual presence.
          // If it's an attribute on an existing element, we leave the element as is.
          var tagName = iElement[0].tagName.toLowerCase( ) ;

          if ( tagName === 'view-title' || tagName === 'viewtitle' )
          { // If it's an element, remove it from the DOM.
            iElement.remove( ) ; // Detach the element.
          }

          // Watch for changes in the text content of the element this directive is on.
          // When the text changes, update the $rootScope.viewTitle property.
          scope.$watch(
            function ( ) { // This function returns the value to watch.
              return iElement.text( ) ; // Get the current text content.
            } ,
            function ( newTitle ) { // This function is called when the watched value changes.
              $rootScope.viewTitle = newTitle ; // Update the root scope's title.
            }
          ) ;

          // Clean up when the scope is destroyed.
          // This prevents memory leaks and ensures our title isn't left behind.
          scope.$on(
            '$destroy', // Event name for scope destruction.
            function ( ) { // Callback for the $destroy event.
              delete $rootScope.viewTitle ; // Remove the viewTitle property from rootScope.
            }
          ) ;
        } // End of link function.
      } ; // End of DDO.
    } ] // End of dependency injection array and function.
  ) ; // End of mod.directive('viewTitle').


  // Define the 'viewHead' directive.
  // This directive allows content to be dynamically moved into the document's <head>.
  mod.directive(
    'viewHead', // The name of this directive.
    function ( ) { // No explicit dependencies needed for this directive.
      // Cache a reference to the document's head element.
      var head = angular.element( document.head ) ;

      return { // Directive Definition Object (DDO) for viewHead.
        restrict : 'A', // This directive can only be used as an attribute.
        link : function ( scope , iElement , iAttrs , controller , transcludeFn ) { // The linking function.

          // Move the element that this directive is attached to into the document's <head>.
          // Even though its physical location changes, its scope binding remains intact,
          // allowing it to access variables from its original view scope.
          head.append( iElement ) ; // Append the element to the head.

          // Set up a listener for the scope's destruction event.
          // When the scope associated with this directive is destroyed (e.g., view change),
          // remove the element from the <head> to clean up.
          // This directive is intended for use within view scopes and not in contexts like ng-repeat.
          scope.$on(
            '$destroy', // Listen for the scope destruction event.
            function ( ) { // Callback function for when the scope is destroyed.
              iElement.remove( ) ; // Remove the element from the DOM.
            }
          ) ;
        } // End of link function.
      } ; // End of DDO.
    } // End of directive function.
  ) ; // End of mod.directive('viewHead').

} ) ( angular , document ) ; // Pass angular and document as arguments to the IIFE.