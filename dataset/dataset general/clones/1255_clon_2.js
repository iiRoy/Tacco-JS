/*
 *  FastLoader.js - A jQuery extension for dynamic content loading
 *  ----------------------------------------------------------------
 *  (C) 2023 Acme Corp. - Version 2.0.0
 *  ----------------------------------------------------------------
 *  This software is provided "as is", without warranty of any kind.
 *  Use at your own risk.
 *
 *  It's designed to asynchronously fetch and inject content into
 *  elements as they become visible within a defined viewport.
 */

( function( jq ) {
    jq.fn.extend( {

        fastLoad: function( config ) {
            // Default configuration for the plugin operations
            var standardSettings = {
                preloadContent : 'Fetching data... ', // Message shown while content is loading
            };

            // Merge user-provided settings with the standard defaults
            var currentConfig = jq.extend( standardSettings, config );

            // Reference to the main element(s) on which the plugin is called
            var targetElement = jq( this ),
                loadDelayHandle; // Timer handle for throttling scroll/resize events

            // Iterate over each selected DOM element to apply the fastLoad logic
            return this.each( function() {

                /**
                 * Determines if a child element is currently visible within its container.
                 * @param {jQuery} containerEl - The parent container element.
                 * @param {jQuery} childEl - The element to check for visibility.
                 * @returns {boolean} True if childEl is visible within containerEl, false otherwise.
                 */
                var isWithinViewport = function( containerEl, childEl ) {
                    // Get coordinates and dimensions of the container
                    var contX1 = containerEl.offset().left,
                        contY1 = containerEl.offset().top,
                        contWidth = containerEl.outerWidth(),
                        contHeight = containerEl.outerHeight();

                    // Get coordinates and dimensions of the child element
                    var childX1 = childEl.offset().left,
                        childY1 = childEl.offset().top,
                        childWidth = childEl.outerWidth(),
                        childHeight = childEl.outerHeight();

                    // Calculate secondary coordinates for both elements
                    var contX2 = contX1 + contWidth,
                        contY2 = contY1 + contHeight,
                        childX2 = childX1 + childWidth,
                        childY2 = childY1 + childHeight;

                    // Check for horizontal and vertical overlap
                    if ( childX1 >= contX1 && childX1 <= contX2 ) {
                        if ( childY1 >= contY1 && childY1 <= contY2 ) {
                            return true; // Top-left corner of child is inside container
                        } else if ( contY1 >= childY1 && contY1 <= childY2 ) {
                            return true; // Top-left corner of container is inside child
                        }
                    } else if ( contX1 >= childX1 && contX1 <= childX2 ) {
                        if ( childY1 >= contY1 && childY1 <= contY2 ) {
                            return true; // Top-left corner of child is inside container
                        } else if ( contY1 >= childY1 && contY1 <= childY2 ) {
                            return true; // Top-left corner of container is inside child
                        }
                    }
                    return false; // No overlap found
                }; // End of isWithinViewport function

                /**
                 * Main function to process and load elements that are now visible.
                 */
                var processLoadItems = function() {

                    // Ensure the target element has a relative position for absolute children
                    if ( !targetElement.css( 'position' ) || targetElement.css( 'position' ) === 'static' ) {
                        targetElement.css( {
                            position: 'relative' // Set position to relative if not already
                        } );
                    }

                    // Determine the dimensions and scroll position of the loading viewport
                    var viewportWidth = targetElement.width(),
                        viewportHeight = targetElement.height(),
                        scrollPosTop = targetElement.scrollTop(),
                        scrollPosLeft = targetElement.scrollLeft();

                    // Special handling if the target element is the document body
                    if ( targetElement.is( "body" ) ) {
                        viewportWidth = jq( "body" ).width();
                        viewportHeight = jq( window ).height() - 10; // Adjust for scrollbar if needed
                        scrollPosTop = jq( window ).scrollTop();
                        scrollPosLeft = jq( window ).scrollLeft();
                    }

                    // Display the hidden viewport box for hit testing
                    jq( ".fastload-viewport-box" ).show();
                    // Position and size the viewport box to match the current view
                    jq( ".fastload-viewport-box" ).css( {
                        'width': viewportWidth + 'px',
                        'min-width': viewportWidth + 'px',
                        'max-width': viewportWidth + 'px',
                        'height': viewportHeight + 'px',
                        'min-height': viewportHeight + 'px',
                        'max-height': viewportHeight + 'px',
                        'position': 'absolute',
                        'top': scrollPosTop + 'px',
                        'left': scrollPosLeft + 'px',
                        'padding': '0px',
                        'margin': '0px',
                        'border': '1px solid transparent' // Invisible border for visual debugging if needed
                    } );

                    // Process image elements that need loading
                    jq( ".fastload-image" ).not( ".fastload-pending, .fastload-complete" ).each( function() {
                        var currentItem = jq( this ),
                            containerEl = jq( ".fastload-viewport-box" ),
                            uniqueId = Math.floor( Math.random() * 9999 ), // Generate a unique ID
                            elementData = currentItem.data(); // Get data attributes

                        // Check if the image element is currently visible
                        if ( isWithinViewport( containerEl, currentItem ) ) {
                            if ( elementData.debugMode ) try { console.log( "FastLoad: Loading image..." ); } catch ( e ) {}
                            // Mark as pending and insert loading content
                            currentItem.toggleClass( 'fastload-pending', true ).html( '<div id="fastload-pending-' + uniqueId + '" class="fastload-pending-' + uniqueId + '">' + currentConfig.preloadContent + '</div>' );

                            // Get image URL and add a cache-busting parameter
                            var resourcePath = currentItem.attr( 'rel' ),
                                ampPattern = /&/g; // Regex to check for existing query parameters
                            if ( ampPattern.test( resourcePath ) ) {
                                resourcePath += '&cacheBuster=' + uniqueId;
                            } else {
                                resourcePath += '?cacheBuster=' + uniqueId;
                            }

                            // Preload the image
                            if ( elementData.debugMode ) try { console.log( "FastLoad: Preloading image: " + resourcePath ); } catch ( e ) {}
                            var tempImage = new Image();
                            tempImage.src = resourcePath;
                            tempImage.onload = function() {
                                // Append the actual image, initially hidden
                                currentItem.append( '<img style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '" src="' + resourcePath + '" />' );
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Image preloading complete." ); } catch ( e ) {}
                                // Fade out loading message, then fade in the image
                                jq( '.fastload-pending-' + uniqueId ).fadeOut( 'fast', function() {
                                    jq( '.fastload-content-' + uniqueId ).fadeIn( 'fast' );
                                    currentItem.removeClass( 'fastload-pending' ).addClass( 'fastload-complete' ); // Update classes
                                    if ( elementData.debugMode ) try { console.log( "FastLoad: Image loaded successfully." ); } catch ( e ) {}
                                } );
                            };
                        } // End of isWithinViewport check for images
                    } );

                    // Process general content items that need loading
                    jq( ".fastload-item" ).not( ".fastload-pending, .fastload-complete" ).each( function() {
                        var currentItem = jq( this ),
                            containerEl = jq( ".fastload-viewport-box" ),
                            uniqueId = Math.floor( Math.random() * 9999 ),
                            elementData = currentItem.data(),
                            dataTypeHint = 'html'; // Default data type

                        // Check if the content item is visible
                        if ( isWithinViewport( containerEl, currentItem ) ) {
                            currentItem.toggleClass( 'fastload-pending', true ); // Mark as pending

                            // Determine data type based on classes
                            if ( currentItem.hasClass( 'fastload-xml' ) ) {
                                dataTypeHint = 'xml';
                            } else if ( currentItem.hasClass( 'fastload-json' ) ) {
                                dataTypeHint = 'json';
                            } else if ( currentItem.hasClass( 'fastload-script' ) ) {
                                dataTypeHint = 'script';
                            }
                            if ( elementData.debugMode ) try { console.log( "FastLoad: Data type detected: " + dataTypeHint ); } catch ( e ) {}
                            if ( elementData.debugMode ) try { console.log( "FastLoad: Loading general item..." ); } catch ( e ) {}

                            // Apply loading HTML if configured
                            if ( currentConfig.preloadContent ) {
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Applying loading HTML." ); } catch ( e ) {}
                                currentItem.html( '<div id="fastload-pending-' + uniqueId + '" class="fastload-pending-' + uniqueId + '">' + currentConfig.preloadContent + '</div>' );
                            }

                            // Handle 'replace' action
                            if ( currentItem.hasClass( 'fastload-replace' ) ) {
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Action - Replace." ); } catch ( e ) {}
                                if ( currentItem.attr( 'rel' ) ) {
                                    if ( elementData.load ) {
                                        var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                        currentItem.replaceWith( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                            revealContent( uniqueId, currentItem );
                                        } );
                                    } else {
                                        jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                            currentItem.replaceWith( responseData );
                                        }, dataTypeHint );
                                    }
                                } else if ( currentItem.attr( 'rev' ) ) {
                                    currentItem.replaceWith( currentItem.attr( 'rev' ) );
                                }
                            }
                            // Handle 'append' action
                            else if ( currentItem.hasClass( 'fastload-append' ) ) {
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Action - Append." ); } catch ( e ) {}
                                if ( currentItem.attr( 'rel' ) ) {
                                    if ( elementData.load ) {
                                        var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                        currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                            revealContent( uniqueId, currentItem );
                                        } );
                                    } else {
                                        jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                            currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + responseData + '</div>' );
                                            revealContent( uniqueId, currentItem );
                                        }, dataTypeHint );
                                    }
                                } else if ( currentItem.attr( 'rev' ) ) {
                                    currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + currentItem.attr( 'rev' ) + '</div>' );
                                    revealContent( uniqueId, currentItem );
                                }
                            }
                            // Handle 'prepend' action
                            else if ( currentItem.hasClass( 'fastload-prepend' ) ) {
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Action - Prepend." ); } catch ( e ) {}
                                if ( currentItem.attr( 'rel' ) ) {
                                    if ( elementData.load ) {
                                        var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                        currentItem.prepend( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                            revealContent( uniqueId, currentItem );
                                        } );
                                    } else {
                                        jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                            currentItem.prepend( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + responseData + '</div>' );
                                            revealContent( uniqueId, currentItem );
                                        }, dataTypeHint );
                                    }
                                } else if ( currentItem.attr( 'rev' ) ) {
                                    currentItem.prepend( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + currentItem.attr( 'rev' ) + '</div>' );
                                    revealContent( uniqueId, currentItem );
                                }
                            }
                            // Handle 'before' action
                            else if ( currentItem.hasClass( 'fastload-before' ) ) {
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Action - Insert Before." ); } catch ( e ) {}
                                if ( currentItem.attr( 'rel' ) ) {
                                    if ( elementData.load ) {
                                        var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                        currentItem.before( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                            revealContent( uniqueId, currentItem );
                                        } );
                                    } else {
                                        jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                            currentItem.before( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + responseData + '</div>' );
                                            revealContent( uniqueId, currentItem );
                                        }, dataTypeHint );
                                    }
                                } else if ( currentItem.attr( 'rev' ) ) {
                                    currentItem.before( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + currentItem.attr( 'rev' ) + '</div>' );
                                    revealContent( uniqueId, currentItem );
                                }

                                // Handle 'repeat' within 'before' (original code structure was a bit nested here)
                                if ( currentItem.hasClass( 'fastload-repeat' ) ) {
                                    if ( elementData.debugMode ) try { console.log( "FastLoad: Action - Repeat (within Before)." ); } catch ( e ) {}
                                    if ( currentItem.attr( 'rel' ) ) {
                                        currentItem.before( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        if ( elementData.load ) {
                                            var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                            jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                                revealContent( uniqueId, currentItem );
                                            } );
                                        } else {
                                            jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                                revealContent( uniqueId, currentItem );
                                            }, dataTypeHint );
                                        }
                                    } else if ( currentItem.attr( 'rev' ) ) {
                                        currentItem.before( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + currentItem.attr( 'rev' ) + '</div>' );
                                        revealContent( uniqueId, currentItem );
                                    }
                                }
                            }
                            // Handle 'after' action
                            else if ( currentItem.hasClass( 'fastload-after' ) ) {
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Action - Insert After." ); } catch ( e ) {}
                                if ( currentItem.attr( 'rel' ) ) {
                                    if ( elementData.load ) {
                                        var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                        currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                            revealContent( uniqueId, currentItem );
                                        } );
                                    } else {
                                        jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                            currentItem.after( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + responseData + '</div>' );
                                            revealContent( uniqueId, currentItem );
                                        }, dataTypeHint );
                                    }
                                } else if ( currentItem.attr( 'rev' ) ) {
                                    currentItem.after( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + currentItem.attr( 'rev' ) + '</div>' );
                                    revealContent( uniqueId, currentItem );
                                }
                            }
                            // Default action (append if no specific action class)
                            else {
                                if ( currentItem.attr( 'rel' ) ) {
                                    if ( elementData.load ) {
                                        var fragmentSelector = currentItem.attr( 'rel' ) + ' ' + elementData.load;
                                        currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '"></div>' );
                                        jq( ".fastload-content-" + uniqueId ).load( fragmentSelector, function() {
                                            revealContent( uniqueId, currentItem );
                                        } );
                                    } else {
                                        jq.get( currentItem.attr( 'rel' ), { requestBuster: Math.floor( Math.random() * 9999 ) }, function( responseData ) {
                                            currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + responseData + '</div>' );
                                            revealContent( uniqueId, currentItem );
                                        }, dataTypeHint );
                                    }
                                } else if ( currentItem.attr( 'rev' ) ) {
                                    currentItem.append( '<div style="display:none" id="fastload-content-' + uniqueId + '" class="fastload-content fastload-content-' + uniqueId + '">' + currentItem.attr( 'rev' ) + '</div>' );
                                    revealContent( uniqueId, currentItem );
                                }
                            }

                            if ( elementData.debugMode ) try { console.log( "FastLoad: General item loaded successfully." ); } catch ( e ) {}
                        }
                    } );

                    // Process elements marked for removal
                    jq( ".fastload-hide" ).each( function() {
                        var currentItem = jq( this ),
                            containerEl = jq( ".fastload-viewport-box" ),
                            uniqueId = Math.floor( Math.random() * 9999 ), // Not used here, but keeping structure
                            elementData = currentItem.data();

                        // If element is already loaded and now visible (again), fade it out
                        if ( currentItem.hasClass( 'fastload-complete' ) && isWithinViewport( containerEl, currentItem ) ) {
                            if ( elementData.debugMode ) try { console.log( "FastLoad: Item with 'fastload-hide' class detected." ); } catch ( e ) {}
                            if ( currentItem.is( ':visible' ) ) {
                                currentItem.fadeOut( 'fast' ); // Fade out the element
                                currentItem.toggleClass( 'fastload-complete', false ); // Mark as not complete
                                if ( elementData.debugMode ) try { console.log( "FastLoad: Item removed successfully." ); } catch ( e ) {}
                            }
                        }
                    } );

                    // Hide the temporary viewport box
                    jq( ".fastload-viewport-box" ).hide();

                }; // End of processLoadItems function


                /**
                 * Reveals the loaded content after the loading indicator fades out.
                 * @param {number} uniqueId - The unique ID associated with the content.
                 * @param {jQuery} currentItem - The jQuery object of the item being processed.
                 */
                var revealContent = function( uniqueId, currentItem ) {
                    if ( currentConfig.preloadContent ) {
                        jq( '.fastload-pending-' + uniqueId ).fadeOut( 'fast', function() {
                            jq( '.fastload-content-' + uniqueId ).fadeIn( 'fast' );
                        } );
                    } else {
                        jq( '.fastload-content-' + uniqueId ).fadeIn( 'fast' );
                    }
                    currentItem.toggleClass( 'fastload-pending', false ); // Remove pending class
                    // Do not mark as complete if it's a repeating item
                    if ( !currentItem.hasClass( 'fastload-repeat' ) ) {
                        currentItem.toggleClass( 'fastload-complete', true ); // Mark as complete
                    }
                }; // End of revealContent function

                // Create the hidden hit-test box if it doesn't exist
                if ( !jq( ".fastload-viewport-box" ).length ) { // Changed from .width() to .length for robustness
                    targetElement.prepend( '<div class="fastload-viewport-box"></div>' );
                }

                // Attach scroll and resize event handlers
                if ( targetElement.is( "body" ) ) {
                    jq( window ).scroll( function() {
                        if ( loadDelayHandle ) clearTimeout( loadDelayHandle );
                        loadDelayHandle = setTimeout( processLoadItems, 200 ); // Shorter delay
                    } ).resize( function() {
                        processLoadItems(); // Resize should trigger immediately
                    } );
                } else {
                    targetElement.scroll( function() {
                        if ( loadDelayHandle ) clearTimeout( loadDelayHandle );
                        loadDelayHandle = setTimeout( processLoadItems, 200 ); // Shorter delay
                    } ).resize( function() {
                        processLoadItems(); // Resize should trigger immediately
                    } );
                }

                processLoadItems(); // Initial call to load visible items on page load

            } ); // End of each loop
        } // End of fastLoad function
    } ); // End of extend
} )( jQuery ); // Pass jQuery into the IIFE