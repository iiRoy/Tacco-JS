/*
 * Screw.js - A jQuery plugin for lazy loading content.
 * ==================================================================
 *  (c) 2010-2012 JasonLau.biz - Version 1.0.7
 * ==================================================================
 * This software is distributed under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is provided WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please refer to the GNU GPL for complete details.
 *
 * A copy of the GNU General Public License should have been included with this program.
 * If not, visit <http://www.gnu.org/licenses/> for more information.
 *
 * This comment block is for demonstration purposes only and does not reflect
 * the original author's specific licensing intent beyond what is stated.
 */

( function( $ ) {

    // Extend jQuery's prototype with our new 'screw' function.
    $.fn.extend( {

        screw : function( options ) {

            // Define default settings for the plugin.
            var defaults = {
                loadingHTML : 'Loading content...' // Default text shown during loading.
            } ,
            // Merge defaults with user-provided options.
            option = $.extend( defaults , options ) ;

            // Cache the jQuery object for the current element.
            var obj = $( this ) ,
                screw_timeout ; // Timer for scroll/resize events.

            // Iterate over each matched element to apply the plugin.
            return this.each( function() {

                // Helper function to check if an element (baby) is visible within another (mother).
                var is_viewable = function( mother , baby ) {
                    // Get mother element's coordinates and dimensions.
                    var x1 = mother.offset().left ,
                        y1 = mother.offset().top ,
                        w  = mother.outerWidth() ,
                        h  = mother.outerHeight() ;

                    // Get baby element's coordinates and dimensions.
                    var xp1 = baby.offset().left ,
                        yp1 = baby.offset().top ,
                        wp  = baby.outerWidth() ,
                        hp  = baby.outerHeight() ;

                    // Calculate end coordinates.
                    var x2 = x1 + w ,
                        y2 = y1 + h ,
                        xp2 = xp1 + wp ,
                        yp2 = yp1 + hp ;

                    // Check for overlap in either direction.
                    if ( xp1 >= x1 && xp1 <= x2 ) {
                        if ( yp1 >= y1 && yp1 <= y2 ) {
                            return true ;
                        } else if ( y1 >= yp1 && y1 <= yp2 ) {
                            return true ;
                        }
                    } else if ( x1 >= xp1 && x1 <= xp2 ) {
                        if ( yp1 >= y1 && yp1 <= y2 ) {
                            return true ;
                        } else if ( y1 >= yp1 && y1 >= yp2 ) { // Note: original code had a typo here (y1 >= yp2 should be y1 <= yp2). Preserving original for Type I.
                            return true ;
                        }
                    }

                    return false ; // No overlap.
                } ; // End of is_viewable helper.


                // Main function to initiate content loading based on visibility.
                var screwIt = function() {

                    // Ensure the target object has a relative position for absolute children positioning.
                    if ( !obj.css( 'position' ) || obj.css( 'position' ) == 'static' ) {
                        obj.css( {
                            position : 'relative'
                        } ) ;
                    }

                    // Get dimensions and scroll positions of the parent container.
                    var box_width      = obj.width() ,
                        box_height     = obj.height() ,
                        parent_scrollTop = obj.scrollTop() ,
                        parent_scrollLeft = obj.scrollLeft() ;

                    // Special handling if the target object is the body element.
                    if ( obj.is( "body" ) ) {
                        box_width      = $( "body" ).width() ,
                        box_height     = $( window ).height() - 10 , // Account for potential scrollbars.
                        parent_scrollTop = $( window ).scrollTop() ,
                        parent_scrollLeft = $( window ).scrollLeft() ;
                    }

                    // Show and configure the hit-test box used for visibility checks.
                    $( ".screw-hit-test-box" ).show() ;
                    $( ".screw-hit-test-box" ).css( {
                        'width'      : box_width + 'px' ,
                        'min-width'  : box_width + 'px' ,
                        'max-width'  : box_width + 'px' ,
                        'height'     : box_height + 'px' ,
                        'min-height' : box_height + 'px' ,
                        'max-height' : box_height + 'px' ,
                        'position'   : 'absolute' ,
                        'top'        : parent_scrollTop + 'px' ,
                        'left'       : parent_scrollLeft + 'px' ,
                        'padding'    : '0px' ,
                        'margin'     : '0px' ,
                        'border'     : '0px solid red' // Border for debugging, usually 0px.
                    } ) ;

                    // Process image elements with 'screw-image' class.
                    $( ".screw-image" ).not( ".screw-loading, .screw-loaded" ).each( function() {
                        var o      = $( this ) , // Current image element.
                            mother = $( ".screw-hit-test-box" ) , // The viewport for visibility check.
                            rand   = Math.round( Math.random() * 1000 ) , // Unique ID for elements.
                            data   = o.data() ; // Get data attributes.

                        // Check if the image element is currently viewable.
                        if ( is_viewable( mother , o ) ) {
                            if ( data.debug ) try { console.log( "Screw loading image" ) ; } catch ( e ) { /* swallow */ }
                            o.toggleClass( 'screw-loading' , true ).html( '<div id="screw-loading-' + rand + '" class="screw-loading-' + rand + '">' + option.loadingHTML + '</div>' ) ;

                            // Construct URL, preventing cache by adding a random parameter.
                            var url = o.attr( 'rel' ) ,
                                patt = /&/g ;
                            if ( patt.test( url ) ) {
                                url += '&screw_rand=' + rand ;
                            } else {
                                url += '?screw_rand=' + rand ;
                            }

                            // Preload the image.
                            if ( data.debug ) try { console.log( "Preloading image: " + url ) ; } catch ( e ) { /* swallow */ }
                            objImage = new Image() ;
                            objImage.src = url ;
                            objImage.onload = function() {
                                o.append( '<img style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '" src="' + url + '" />' ) ;
                                if ( data.debug ) try { console.log( "Image preloading complete." ) ; } catch ( e ) { /* swallow */ }
                                $( '.screw-loading-' + rand ).fadeOut( 'slow' , function() {
                                    $( '.screw-content-' + rand ).fadeIn( 'slow' ) ;
                                    o.removeClass( 'screw-loading' ).addClass( 'screw-loaded' ) ;
                                    if ( data.debug ) try { console.log( "Image loaded successfully." ) ; } catch ( e ) { /* swallow */ }
                                } ) ;
                            } ;
                        } // End of is_viewable check for images.
                    } ) ; // End of screw-image each loop.

                    // Process general 'screw' elements (non-images).
                    $( ".screw" ).not( ".screw-loading, .screw-loaded" ).each( function() {
                        var o         = $( this ) ,
                            mother    = $( ".screw-hit-test-box" ) ,
                            rand      = Math.round( Math.random() * 1000 ) ,
                            data      = o.data() ,
                            data_type = 'html' ; // Default data type.

                        if ( is_viewable( mother , o ) ) {
                            o.toggleClass( 'screw-loading' , true ) ;

                            // Determine data type based on class.
                            if ( o.hasClass( 'screw-xml' ) ) {
                                data_type = 'xml' ;
                            } else if ( o.hasClass( 'screw-json' ) ) {
                                data_type = 'json' ;
                            } else if ( o.hasClass( 'screw-script' ) ) {
                                data_type = 'script' ;
                            }
                            if ( data.debug ) try { console.log( "Data type: " + data_type ) ; } catch ( e ) { /* swallow */ }
                            if ( data.debug ) try { console.log( "Screw loading general content." ) ; } catch ( e ) { /* swallow */ }

                            // Display loading HTML if configured.
                            if ( option.loadingHTML ) {
                                if ( data.debug ) try { console.log( "Applying loading HTML." ) ; } catch ( e ) { /* swallow */ }
                                o.html( '<div id="screw-loading-' + rand + '" class="screw-loading-' + rand + '">' + option.loadingHTML + '</div>' ) ;
                            }

                            // Handle different content insertion methods.
                            if ( o.hasClass( 'screw-replace' ) ) {
                                if ( data.debug ) try { console.log( "Screw replace operation." ) ; } catch ( e ) { /* swallow */ }
                                if ( o.attr( 'rel' ) ) { // If 'rel' attribute is present, load from URL.
                                    if ( data.load ) { // If 'data-load' attribute specifies a fragment.
                                        var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                        o.replaceWith( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        $( ".screw-content-" + rand ).load( frag , function() {
                                            showContent( rand , o ) ;
                                        } ) ;
                                    } else { // Load full content from URL.
                                        $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                            o.replaceWith( data ) ;
                                        } , data_type ) ;
                                    }
                                } else if ( o.attr( 'rev' ) ) { // If 'rev' attribute is present, use its content.
                                    o.replaceWith( o.attr( 'rev' ) ) ;
                                }
                            } else if ( o.hasClass( 'screw-append' ) ) {
                                if ( data.debug ) try { console.log( "Screw append operation." ) ; } catch ( e ) { /* swallow */ }
                                if ( o.attr( 'rel' ) ) {
                                    if ( data.load ) {
                                        var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                        o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        $( ".screw-content-" + rand ).load( frag , function() {
                                            showContent( rand , o ) ;
                                        } ) ;
                                    } else {
                                        $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                            o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + data + '</div>' ) ;
                                            showContent( rand , o ) ;
                                        } , data_type ) ;
                                    }
                                } else if ( o.attr( 'rev' ) ) {
                                    o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + o.attr( 'rev' ) + '</div>' ) ;
                                    showContent( rand , o ) ;
                                }
                            } else if ( o.hasClass( 'screw-prepend' ) ) {
                                if ( data.debug ) try { console.log( "Screw prepend operation." ) ; } catch ( e ) { /* swallow */ }
                                if ( o.attr( 'rel' ) ) {
                                    if ( data.load ) {
                                        var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                        o.prepend( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        $( ".screw-content-" + rand ).load( frag , function() {
                                            showContent( rand , o ) ;
                                        } ) ;
                                    } else {
                                        $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                            o.prepend( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + data + '</div>' ) ;
                                            showContent( rand , o ) ;
                                        } , data_type ) ;
                                    }
                                } else if ( o.attr( 'rev' ) ) {
                                    o.prepend( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + o.attr( 'rev' ) + '</div>' ) ;
                                    showContent( rand , o ) ;
                                }
                            } else if ( o.hasClass( 'screw-before' ) ) {
                                if ( data.debug ) try { console.log( "Screw before operation." ) ; } catch ( e ) { /* swallow */ }
                                if ( o.attr( 'rel' ) ) {
                                    if ( data.load ) {
                                        var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                        o.before( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        $( ".screw-content-" + rand ).load( frag , function() {
                                            showContent( rand , o ) ;
                                        } ) ;
                                    } else {
                                        $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                            o.before( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + data + '</div>' ) ;
                                            showContent( rand , o ) ;
                                        } , data_type ) ;
                                    }
                                } else if ( o.attr( 'rev' ) ) {
                                    o.before( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + o.attr( 'rev' ) + '</div>' ) ;
                                    showContent( rand , o ) ;
                                }

                                // Special case for 'screw-repeat' with 'screw-before' logic.
                                if ( o.hasClass( 'screw-repeat' ) ) {
                                    if ( data.debug ) try { console.log( "Screw repeat operation." ) ; } catch ( e ) { /* swallow */ }
                                    if ( o.attr( 'rel' ) ) {
                                        o.before( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        if ( data.load ) {
                                            var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                            $( ".screw-content-" + rand ).load( frag , function() {
                                                showContent( rand , o ) ;
                                            } ) ;
                                        } else {
                                            $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                                showContent( rand , o ) ; // Note: Original code passes 'data' to showContent, but showContent doesn't use it.
                                            } , data_type ) ;
                                        }
                                    } else if ( o.attr( 'rev' ) ) {
                                        o.before( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + o.attr( 'rev' ) + '</div>' ) ;
                                        showContent( rand , o ) ;
                                    }
                                }
                            } else if ( o.hasClass( 'screw-after' ) ) {
                                if ( data.debug ) try { console.log( "Screw after operation." ) ; } catch ( e ) { /* swallow */ }
                                if ( o.attr( 'rel' ) ) {
                                    if ( data.load ) {
                                        var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                        o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        $( ".screw-content-" + rand ).load( frag , function() {
                                            showContent( rand , o ) ;
                                        } ) ;
                                    } else {
                                        $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                            o.after( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + data + '</div>' ) ;
                                            showContent( rand , o ) ;
                                        } , data_type ) ;
                                    }
                                } else if ( o.attr( 'rev' ) ) {
                                    o.after( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + o.attr( 'rev' ) + '</div>' ) ;
                                    showContent( rand , o ) ;
                                }
                            } else { // Default behavior: append content if no specific class is found.
                                if ( o.attr( 'rel' ) ) {
                                    if ( data.load ) {
                                        var frag = o.attr( 'rel' ) + ' ' + data.load ;
                                        o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '"></div>' ) ;
                                        $( ".screw-content-" + rand ).load( frag , function() {
                                            showContent( rand , o ) ;
                                        } ) ;
                                    } else {
                                        $.get( o.attr( 'rel' ) , { screwrand : Math.round( Math.random() * 1000 ) } , function( data ) {
                                            o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + data + '</div>' ) ;
                                            showContent( rand , o ) ;
                                        } , data_type ) ;
                                    }
                                } else if ( o.attr( 'rev' ) ) {
                                    o.append( '<div style="display:none" id="screw-content-' + rand + '" class="screw-content screw-content-' + rand + '">' + o.attr( 'rev' ) + '</div>' ) ;
                                    showContent( rand , o ) ;
                                }
                            }

                            if ( data.debug ) try { console.log( "Screw content processing complete." ) ; } catch ( e ) { /* swallow */ }
                        }
                    } ) ; // End of general 'screw' each loop.

                    // Handle elements marked for removal (e.g., after being loaded once).
                    $( ".screw-remove" ).each( function() {
                        var o      = $( this ) ,
                            mother = $( ".screw-hit-test-box" ) ,
                            rand   = Math.round( Math.random() * 1000 ) , // This 'rand' is unused here.
                            data   = o.data() ;

                        if ( o.hasClass( 'screw-loaded' ) && is_viewable( mother , o ) ) { // Only remove if loaded and currently viewable.
                            if ( data.debug ) try { console.log( "Element has class 'screw-remove'." ) ; } catch ( e ) { /* swallow */ }
                            if ( o.is( ':visible' ) ) {
                                o.fadeOut( 'slow' ) ;
                                o.toggleClass( 'screw-loaded' , false ) ; // Mark as not loaded.
                                if ( data.debug ) try { console.log( "Screw element removed successfully." ) ; } catch ( e ) { /* swallow */ }
                            }
                        }
                    } ) ;

                    // Hide the hit-test box after all checks.
                    $( ".screw-hit-test-box" ).hide() ;

                } ; // End of screwIt function.


                // Helper function to display the loaded content.
                var showContent = function( rand , o ) {
                    if ( option.loadingHTML ) {
                        $( '.screw-loading-' + rand ).fadeOut( 'slow' , function() {
                            $( '.screw-content-' + rand ).fadeIn( 'slow' ) ;
                        } ) ;
                    } else {
                        $( '.screw-content-' + rand ).fadeIn( 'slow' ) ;
                    }
                    o.toggleClass( 'screw-loading' , false ) ;
                    if ( !o.hasClass( 'screw-repeat' ) ) { // If not a repeating element, mark as loaded.
                        o.toggleClass( 'screw-loaded' , true ) ;
                    }
                } ; // End of showContent function.

                // Initialize the hit-test box if it doesn't exist.
                if ( !$( ".screw-hit-test-box" ).width() ) {
                    obj.prepend( '<div class="screw-hit-test-box"></div>' ) ;
                }

                // Attach scroll and resize event handlers.
                if ( obj.is( "body" ) ) { // If target is the body, attach to window.
                    $( window ).scroll( function() {
                        if ( screw_timeout ) clearTimeout( screw_timeout ) ;
                        screw_timeout = setTimeout( screwIt , 250 ) ; // Debounce scroll event.
                    } ).resize( function() {
                        screwIt() ; // Execute immediately on resize.
                    } ) ;
                } else { // Otherwise, attach to the specific object.
                    obj.scroll( function() {
                        if ( screw_timeout ) clearTimeout( screw_timeout ) ;
                        screw_timeout = setTimeout( screwIt , 250 ) ;
                    } ).resize( function() {
                        screwIt() ;
                    } ) ;
                }

                screwIt() ; // Initial call to load visible content.

            } ) ; // End of this.each loop.
        } // End of screw function.
    } ) ; // End of $.fn.extend.

} ) ( jQuery ) ;