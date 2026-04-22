( function ( ionic ) {

    /* This is an immediately invoked function expression (IIFE)
     * which encapsulates the module definition to prevent global scope pollution.
     * It uses the 'ionic' object passed as an argument.
     */

    // SCREENWIDTH = screen.width; /* This line was previously commented out, kept as a reference. */
    /* Original constant for card width, currently not in use: CARDWIDTH = 120; */


    angular
        .module( 'ionic.contrib.ui.hscrollcards', [ 'ionic' ] ) // Define the module 'ionic.contrib.ui.hscrollcards' with a dependency on 'ionic'.

        .directive( 'hscroller', [ '$timeout', function ( $timeout ) { /* Definition of the 'hscroller' directive. */

            return { // Directive Definition Object
                restrict  :  'E', // Restrict to element usage
                template  :  '<div class="hscroller" ng-transclude></div>', // The template for the hscroller element
                replace   :  true, // Replace the original element with the template
                transclude:  true, // Transclude content into the template

                compile   :  function ( element, attr ) { /* The compile function is called once when the directive is compiled. */

                    return function ( $scope, $element, $attr ) { // The link function, called once per instance after compilation.

                        var el = $element[ 0 ]; // Get the raw DOM element.

                        angular
                            .element( $element ) // Wrap the element with Angular's jQLite.
                            .bind( "scroll", function ( ) { // Bind a scroll event listener.

                                var left = $element[ 0 ].scrollLeft; // Get the current scroll position.
                                // console.log($element.childNodes); /* Debugging line, often commented out in production. */

                            }
                        ); // End of bind call.


                    }; // End of link function.
                }, // End of compile function.
            }; // End of directive definition object.
        } ] ) // End of hscroller directive.


        .directive( 'hcard', [ '$rootScope', function ( $rootScope ) { // Definition of the 'hcard' directive.

            return { // Directive Definition Object for hcard.
                restrict  :  'E', // This directive is also restricted to element usage.
                template  :  '<div class="hscroller-card" ng-transclude></div>', // Template for individual cards.
                replace   :  true, // Replace the hcard element.
                transclude:  true, // Allow content to be transcluded.

                // Define isolated scope properties
                scope     :  {
                    desc : '@', // One-way binding for description
                    image: '@', // One-way binding for image URL
                    index: '@'  // One-way binding for index
                },

                link      :  function ( scope, element, attrs ) { /* The link function for 'hcard' directive. */

                    // Create an image element and set its source.
                    var img = angular.element( "<img class='hscroller-img' src='" + attrs.image + "' />" );

                    element.append( img ); // Append the image to the card element.

                    // Append a label div with the description.
                    element.append( '<div class="hscroller-label">' + attrs.desc + '</div>' );

                    // Generate a unique animation class based on the index.
                    var animationClass = 'hscroller-card-animated-' + attrs.index.toString( );

                    // Add the generated class to the element.
                    element.addClass( animationClass );

                }, // End of link function.

            }; // End of hcard directive definition object.
        } ] ); // End of hcard directive.


} ) ( window.ionic ); // Pass the global 'ionic' object to the IIFE.