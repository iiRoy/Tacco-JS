/*
 * This file contains the sticky-kit plugin implementation.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered for visual difference.
 */

// Initial IIFE for scope encapsulation
( function ( ) {

    /*
     * Declare local variables for jQuery and window object.
     * These will be initialized shortly.
     */
    var $ ,
        win ;

    // Assign jQuery object, checking for global jQuery or window.jQuery
    $ = this . jQuery || window . jQuery ;

    // Cache the window object wrapped in jQuery
    win = $ ( window ) ;

    /**
     * The main plugin function for sticking elements in their parent.
     * @param {Object} opts - Configuration options for the sticky behavior.
     * @returns {jQuery} The jQuery object to allow chaining.
     */
    $. fn . stick_in_parent = function ( opts ) {

        /*
         * Declare all variables that will be used within this scope.
         * These include options and internal helper variables.
         */
        var elm ,
            enable_bottoming ,
            inner_scrolling ,
            manual_spacer ,
            offset_top ,
            parent_selector ,
            recalc_every ,
            sticky_class ,
            _fn ,
            _i ,
            _len ;

        /*
         * If options are not provided, initialize an empty object.
         * This prevents errors when destructuring or accessing properties.
         */
        if ( opts == null ) {

            opts = { } ;

        }

        // Destructure options for easier access
        sticky_class      = opts . sticky_class ,
        inner_scrolling   = opts . inner_scrolling ,
        recalc_every      = opts . recalc_every ,
        parent_selector   = opts . parent ,
        offset_top        = opts . offset_top ,
        manual_spacer     = opts . spacer ,
        enable_bottoming  = opts . bottoming ;

        // Provide default values for options if they are not explicitly set
        if ( offset_top == null ) {

            offset_top = 0 ;

        }

        if ( parent_selector == null ) {

            parent_selector = void 0 ;

        }

        if ( inner_scrolling == null ) {

            inner_scrolling = true ;

        }

        if ( sticky_class == null ) {

            sticky_class = "is_stuck" ;

        }

        if ( enable_bottoming == null ) {

            enable_bottoming = true ;

        }

        /*
         * This internal function encapsulates the core sticky logic for a single element.
         * It takes several parameters that define the element's state and context.
         */
        _fn = function ( elm , padding_bottom , parent_top , parent_height , top , height , el_float , detached ) {

            // Internal variables for the sticky state and behavior
            var bottomed ,
                detach ,
                fixed ,
                last_pos ,
                offset ,
                parent ,
                recalc ,
                recalc_and_tick ,
                recalc_counter ,
                spacer ,
                tick ;

            // If the element already has sticky_kit data, it's already initialized, so return.
            if ( elm . data ( "sticky_kit" ) ) {

                return ;

            }

            // Mark the element as initialized
            elm . data ( "sticky_kit" , true ) ;

            // Get the immediate parent of the element
            parent = elm . parent ( ) ;

            // If a parent selector is provided, find the closest matching ancestor
            if ( parent_selector != null ) {

                parent = parent . closest ( parent_selector ) ;

            }

            // Throw an error if no parent could be found (either immediate or via selector)
            if ( ! parent . length ) {

                throw "failed to find stick parent" ;

            }

            // Initialize state variables
            fixed    = false ;
            bottomed = false ;

            /*
             * Determine if a manual spacer is provided.
             * If not, create a new div element to act as a spacer.
             */
            spacer = manual_spacer != null ? manual_spacer && elm . closest ( manual_spacer ) : $ ( "<div />" ) ;

            // If a spacer exists, copy the element's position CSS property to it.
            if ( spacer ) {

                spacer . css ( 'position' , elm . css ( 'position' ) ) ;

            }

            /*
             * The `recalc` function recalculates the element's position and dimensions.
             * This is crucial for adapting to changes in layout or content.
             */
            recalc = function ( ) {

                var border_top ,
                    padding_top ,
                    restore ;

                // If the element is detached, do nothing.
                if ( detached ) {

                    return ;

                }

                // Get parent's border and padding values for accurate height calculation
                border_top     = parseInt ( parent . css ( "border-top-width" ) , 10 ) ;
                padding_top    = parseInt ( parent . css ( "padding-top" ) , 10 ) ;
                padding_bottom = parseInt ( parent . css ( "padding-bottom" ) , 10 ) ;

                // Calculate the parent's effective top position
                parent_top    = parent . offset ( ) . top + border_top + padding_top ;
                parent_height = parent . height ( ) ;

                // If the element is currently fixed, unfix it to get its natural position
                if ( fixed ) {

                    fixed    = false ;
                    bottomed = false ;

                    // If no manual spacer, re-insert the element after the spacer and detach the spacer
                    if ( manual_spacer == null ) {

                        elm . insertAfter ( spacer ) ;
                        spacer . detach ( ) ;

                    }

                    // Reset CSS properties and remove sticky class
                    elm . css ( {
                        position : "" ,
                        top      : "" ,
                        width    : "" ,
                        bottom   : ""
                    } ) . removeClass ( sticky_class ) ;

                    // Flag that a restore operation occurred, requiring a tick
                    restore = true ;

                }

                // Calculate the element's top position, accounting for margin and offset_top
                top      = elm . offset ( ) . top - parseInt ( elm . css ( "margin-top" ) , 10 ) - offset_top ;
                height   = elm . outerHeight ( true ) ;
                el_float = elm . css ( "float" ) ;

                // If a spacer exists, update its dimensions to match the element
                if ( spacer ) {

                    spacer . css ( {
                        width          : elm . outerWidth ( true ) ,
                        height         : height ,
                        display        : elm . css ( "display" ) ,
                        "vertical-align" : elm . css ( "vertical-align" ) ,
                        "float"        : el_float
                    } ) ;

                }

                // If element was restored, force a tick to re-evaluate its state
                if ( restore ) {

                    return tick ( ) ;

                }

            } ;

            // Perform initial recalculation
            recalc ( ) ;

            // If element height is equal to parent height, no sticking is needed
            if ( height === parent_height ) {

                return ;

            }

            // Initialize last scroll position and current offset
            last_pos      = void 0 ;
            offset        = offset_top ;
            recalc_counter = recalc_every ;

            /*
             * The `tick` function is the main scroll handler.
             * It checks the scroll position and applies/removes sticky states.
             */
            tick = function ( ) {

                var css ,
                    delta ,
                    scroll ,
                    will_bottom ,
                    win_height ;

                // If detached, do nothing
                if ( detached ) {

                    return ;

                }

                // Handle periodic recalculations if `recalc_every` is set
                if ( recalc_counter != null ) {

                    recalc_counter -= 1 ;

                    if ( recalc_counter <= 0 ) {

                        recalc_counter = recalc_every ;
                        recalc ( ) ;

                    }

                }

                // Get current scroll position
                scroll = win . scrollTop ( ) ;

                // Calculate scroll delta if a previous position exists
                if ( last_pos != null ) {

                    delta = scroll - last_pos ;

                }

                // Update last scroll position
                last_pos = scroll ;

                // Logic for when the element is currently fixed
                if ( fixed ) {

                    if ( enable_bottoming ) {

                        // Check if the element would hit the bottom of the parent
                        will_bottom = scroll + height + offset > parent_height + parent_top ;

                        // If it was bottomed and now isn't, unbottom it
                        if ( bottomed && ! will_bottom ) {

                            bottomed = false ;
                            elm . css ( {
                                position : "fixed" ,
                                bottom   : "" ,
                                top      : offset
                            } ) . trigger ( "sticky_kit:unbottom" ) ;

                        }

                    }

                    // If scroll position goes above the original top, unfix the element
                    if ( scroll < top ) {

                        fixed  = false ;
                        offset = offset_top ;

                        // If no manual spacer, handle its removal and element re-insertion
                        if ( manual_spacer == null ) {

                            if ( el_float === "left" || el_float === "right" ) {

                                elm . insertAfter ( spacer ) ;

                            }

                            spacer . detach ( ) ;

                        }

                        // Reset CSS and remove sticky class, then trigger unstick event
                        css = {
                            position : "" ,
                            width    : "" ,
                            top      : ""
                        } ;
                        elm . css ( css ) . removeClass ( sticky_class ) . trigger ( "sticky_kit:unstick" ) ;

                    }

                    // Handle inner scrolling behavior for elements taller than the viewport
                    if ( inner_scrolling ) {

                        win_height = win . height ( ) ;

                        if ( height + offset_top > win_height ) {

                            if ( ! bottomed ) {

                                offset = offset - delta ; // Adjust offset based on scroll delta
                                offset = Math . max ( win_height - height , offset ) ; // Don't go above viewport bottom
                                offset = Math . min ( offset_top , offset ) ; // Don't go below original offset_top

                                if ( fixed ) {

                                    elm . css ( {
                                        top : offset + "px"
                                    } ) ;

                                }

                            }

                        }

                    }

                } else { // Logic for when the element is not fixed

                    // If scroll position goes below the original top, fix the element
                    if ( scroll > top ) {

                        fixed = true ;

                        // Set fixed CSS properties
                        css = {
                            position : "fixed" ,
                            top      : offset
                        } ;

                        // Calculate width considering box-sizing
                        css . width = elm . css ( "box-sizing" ) === "border-box" ? elm . outerWidth ( ) + "px" : elm . width ( ) + "px" ;

                        // Apply CSS, add sticky class, and trigger stick event
                        elm . css ( css ) . addClass ( sticky_class ) ;

                        // If no manual spacer, insert it and handle floating elements
                        if ( manual_spacer == null ) {

                            elm . after ( spacer ) ;

                            if ( el_float === "left" || el_float === "right" ) {

                                spacer . append ( elm ) ;

                            }

                        }

                        elm . trigger ( "sticky_kit:stick" ) ;

                    }

                }

                // If element is fixed and bottoming is enabled, check for bottom collision
                if ( fixed && enable_bottoming ) {

                    // Recalculate will_bottom if it hasn't been determined yet
                    if ( will_bottom == null ) {

                        will_bottom = scroll + height + offset > parent_height + parent_top ;

                    }

                    // If not bottomed and now will be, apply bottomed state
                    if ( ! bottomed && will_bottom ) {

                        bottomed = true ;

                        // Ensure parent has position relative for absolute positioning of child
                        if ( parent . css ( "position" ) === "static" ) {

                            parent . css ( {
                                position : "relative"
                            } ) ;

                        }

                        // Apply absolute positioning to the bottom of the parent and trigger event
                        return elm . css ( {
                            position : "absolute" ,
                            bottom   : padding_bottom ,
                            top      : "auto"
                        } ) . trigger ( "sticky_kit:bottom" ) ;

                    }

                }

            } ;

            /*
             * Helper function to trigger both recalc and tick.
             * Useful for resize events.
             */
            recalc_and_tick = function ( ) {

                recalc ( ) ;
                return tick ( ) ;

            } ;

            /*
             * The `detach` function cleans up all event listeners and resets the element's state.
             * This effectively removes the sticky behavior.
             */
            detach = function ( ) {

                detached = true ; // Set detached flag to prevent further ticking

                // Remove all event listeners
                win . off ( "touchmove" , tick ) ;
                win . off ( "scroll" , tick ) ;
                win . off ( "resize" , recalc_and_tick ) ;
                $ ( document . body ) . off ( "sticky_kit:recalc" , recalc_and_tick ) ;
                elm . off ( "sticky_kit:detach" , detach ) ;

                // Remove sticky_kit data from the element
                elm . removeData ( "sticky_kit" ) ;

                // Reset element's CSS properties
                elm . css ( {
                    position : "" ,
                    bottom   : "" ,
                    top      : "" ,
                    width    : ""
                } ) ;

                // Reset parent's position property
                parent . position ( "position" , "" ) ;

                // If element was fixed, clean up spacer and remove sticky class
                if ( fixed ) {

                    if ( manual_spacer == null ) {

                        if ( el_float === "left" || el_float === "right" ) {

                            elm . insertAfter ( spacer ) ;

                        }

                        spacer . remove ( ) ;

                    }

                    return elm . removeClass ( sticky_class ) ;

                }

            } ;

            // Attach event listeners for scroll, resize, and custom events
            win . on ( "touchmove" , tick ) ;
            win . on ( "scroll" , tick ) ;
            win . on ( "resize" , recalc_and_tick ) ;
            $ ( document . body ) . on ( "sticky_kit:recalc" , recalc_and_tick ) ;
            elm . on ( "sticky_kit:detach" , detach ) ;

            // Trigger an initial tick after a short delay to ensure correct positioning
            return setTimeout ( tick , 0 ) ;

        } ;

        // Iterate over all elements in the jQuery collection
        for ( _i = 0 , _len = this . length ; _i < _len ; _i ++ ) {

            elm = this [ _i ] ;
            _fn ( $ ( elm ) ) ; // Call the internal function for each element

        }

        // Return the jQuery object for chaining
        return this ;

    } ;

} ) . call ( this ) ; // Execute the IIFE immediately, binding 'this' to the global context (window)