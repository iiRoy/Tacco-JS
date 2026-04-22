/**
 *  -------------------------------------------------------------------------
 *  Copyright (c) 2013 Brad Vernon <bradbury.vernon@gmail.com>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *  -------------------------------------------------------------------------
 */


angular.module ( 'ng-iscroll', [] )

  .directive ( 'ngIscroll', function ( ) {

    // The directive definition object is returned here.
    return {
      replace : false, // Do not replace the original element.
      restrict : 'A',  // Restrict the directive to attribute usage.

      link : function ( scope, element, attr ) {
        // This is the link function, executed after the template has been cloned.

        // Define a default timeout value for iScroll initialization.
        var ngiScroll_timeout = 5;


        // Define the default options for iScroll.
        // These can be overridden by parent scope or specific attributes.
        var ngiScroll_opts = {
          snap : true,       // Enable snapping feature.
          momentum : true,   // Enable momentum scrolling.
          hScrollbar : false // Disable horizontal scrollbar by default.
        };

        // Determine the scroll key/ID for this iScroll instance.
        // It first tries to use the value of the ngIscroll attribute.
        var scroll_key = attr.ngIscroll;

        // If ngIscroll attribute is empty, fall back to the element's ID.
        if ( scroll_key === '' ) {
          scroll_key = attr.id;
        }


        // Check if the ngIscrollForm attribute is present and set to 'true'.
        // This enables special handling for form elements within the scrollable area.
        if ( attr.ngIscrollForm !== undefined && attr.ngIscrollForm == 'true' ) {
          // Disable CSS transforms for iScroll in form mode.
          ngiScroll_opts.useTransform = false;

          // Define a custom onBeforeScrollStart event handler.
          ngiScroll_opts.onBeforeScrollStart = function ( e ) {
            var target = e.target; // Get the event target.

            // Traverse up the DOM tree until a valid HTML element (nodeType 1) is found.
            while ( target.nodeType != 1 ) {
              target = target.parentNode;
            }

            // If the target is not a SELECT, INPUT, or TEXTAREA element, prevent default scroll behavior.
            // This allows native scrolling for form controls while iScroll handles the rest.
            if ( target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA' ) {
              e.preventDefault ( );
            }
          };
        }


        // Check if there are custom iScroll options defined in the parent scope.
        if ( scope.$parent.myScrollOptions ) {
          // Iterate through the custom options.
          for ( var i in scope.$parent.myScrollOptions ) {
            // If the current option key matches the scroll_key for this instance,
            // apply specific options for this iScroll.
            if ( i === scroll_key ) {
              for ( var k in scope.$parent.myScrollOptions[i] ) {
                ngiScroll_opts[k] = scope.$parent.myScrollOptions[i][k];
              }
            } else {
              // Otherwise, apply general options from the root scope.
              // Note: This 'else' block might be problematic as it would overwrite options for *all* instances
              // if myScrollOptions contained a non-matching key at the root.
              // A more robust implementation might only apply root options once or for specific keys.
              ngiScroll_opts[i] = scope.$root.myScrollOptions[i];
            }
          }
        }


        // Function to initialize or re-initialize the iScroll instance.
        function setScroll ( ) {
          // Ensure that the myScroll object exists in the parent scope.
          if ( scope.$parent.myScroll === undefined ) {
            scope.$parent.myScroll = []; // Initialize as an array if not present.
          }

          // Create a new iScroll instance and store it in the parent scope's myScroll array,
          // using the determined scroll_key as the index.
          scope.$parent.myScroll[scroll_key] = new iScroll ( element[0], ngiScroll_opts );
        }


        // Check for a custom delay for iScroll initialization.
        // This allows users to specify a timeout using ng-iscroll-delay attribute.
        if ( attr.ngIscrollDelay !== undefined ) {
          ngiScroll_timeout = attr.ngIscrollDelay;
        }


        // Watch the ngIscroll attribute for changes.
        // This triggers the iScroll initialization after a specified timeout.
        scope.$watch ( attr.ngIscroll, function ( ) {
          // Use setTimeout to ensure the DOM is fully rendered before iScroll is initialized.
          setTimeout ( setScroll, ngiScroll_timeout );
        } );


        // Add a watcher for dynamic content refreshing.
        // If ngIscrollRefresher attribute is present, it will watch its value.
        if ( attr.ngIscrollRefresher !== undefined ) {
          scope.$watch ( attr.ngIscrollRefresher, function ( ) {
            // If the iScroll instance exists for this key, refresh it.
            // This is crucial when content inside the scrollable area changes dynamically.
            if ( scope.$parent.myScroll[scroll_key] !== undefined ) {
              scope.$parent.myScroll[scroll_key].refresh ( );
            }
          } );
        }
      } // End of link function.
    }; // End of return object.
  } ); // End of directive definition.