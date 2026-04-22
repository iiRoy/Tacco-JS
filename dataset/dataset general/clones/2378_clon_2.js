/*
 * Module: Responsive Content Scaler
 * Purpose: Dynamically adjusts the dimensions of specified HTML elements to maintain
 *          their aspect ratio and fill available width within their parent containers.
 * Usage: scaleContent('<CSS_SELECTOR>');
 * Example: scaleContent('[data-responsive-media]');
 * This utility ensures that selected media elements, including those loaded
 * asynchronously into the DOM, are responsive across various device sizes.
 */

( function ( ) {
    'use strict';
    // Array to store CSS selectors for elements that require dynamic sizing
    var targetSelectors = [ ],

        // A single DOM observation mechanism is established
        // to detect newly added nodes and apply appropriate scaling logic.
        domMonitor = new MutationObserver( function ( changes ) {
            changes.forEach( function ( changeEntry ) {
                if ( changeEntry.appendedNodes.length > 0 ) {
                    Array.prototype.slice.call( changeEntry.appendedNodes )
                        .forEach( function ( currentElement ) {
                            targetSelectors.forEach( function ( currentPattern ) {
                                if ( checkMatch( currentElement, currentPattern ) ) {
                                    initializeMedia( currentElement );
                                }
                            } );
                        } );
                }
            } );
        } ),

        // Helper function to verify if an element matches a given CSS selector string
        checkMatch = function ( targetElement, matchPattern ) {
            var matchingFunction = [ 'matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector' ]
                                     .filter( function ( funcName ) {
                                         return !!targetElement[ funcName ];
                                     } ) [ 0 ];

            if ( matchingFunction ) {
                return targetElement[ matchingFunction ]( matchPattern );
            }
        },

        // Function responsible for recalculating and applying the correct height
        // based on a stored aspect ratio and current width.
        adjustSize = function ( mediaItem ) {
            var aspectRatio = parseFloat( mediaItem.dataset.aspectRatio, 10 ),
                currentWidth = parseInt( window.getComputedStyle( mediaItem ).width, 10 );

            mediaItem.style.height = ( currentWidth / aspectRatio ) + 'px';
        },

        // Function to prepare an element for responsive scaling,
        // storing its original aspect ratio and setting initial styles.
        initializeMedia = function ( mediaNode ) {
            var computedStyles = window.getComputedStyle( mediaNode ),
                currentWidth = parseInt( computedStyles.width, 10 ),
                currentHeight = parseInt( computedStyles.height, 10 ),
                aspectRatio = currentWidth / currentHeight;

            mediaNode.dataset.aspectRatio = aspectRatio;
            mediaNode.style.width = '100%';
            mediaNode.removeAttribute( 'width' );
            mediaNode.removeAttribute( 'height' );
            adjustSize( mediaNode );
        },

        // The primary public function used to register elements for responsive behavior.
        scaleContent = function ( queryPattern ) {
            // Internal helper to determine if the document has completed loading.
            var isDocReady = function ( ) {
                    return ( document.readyState === 'interactive' || document.readyState === 'complete' || document.readyState === 'loaded' );
                };

            targetSelectors.push( queryPattern );
            
            if ( isDocReady( ) ) {
                Array.prototype.slice.call( document.querySelectorAll( queryPattern ) ).forEach( initializeMedia );
            } else {
                document.addEventListener( 'readystatechange', function ( ) {
                    if ( isDocReady( ) ) {
                        Array.prototype.slice.call( document.querySelectorAll( queryPattern ) ).forEach( initializeMedia );
                    }
                } );
            }

            window.addEventListener( 'resize', function ( ) {
                // For optimal performance, consider implementing a debounce mechanism for this event listener.
                Array.prototype.slice.call( document.querySelectorAll( queryPattern ) ).forEach( adjustSize );
            } );
        };
        
    // Initiate observation of the entire document for any additions to the DOM tree.
    domMonitor.observe( document.documentElement, { subtree: true, childList: true } );
  
    // Make the main scaling function accessible globally.
    window.scaleContent = scaleContent;
} ) ( );