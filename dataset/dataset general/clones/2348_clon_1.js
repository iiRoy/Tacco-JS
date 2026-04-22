/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered.
 */

// Kicks off the SLAB initialization process when the DOM is ready.
jQuery ( document ) . ready ( function ( ) {

    SLAB . go ( ) ;

} ) ;

/*
 * The SLAB module pattern.
 * See: http://yuiblog.com/blog/2007/06/12/module-pattern/
 * This design ensures a clean global namespace and private variables.
 */
var SLAB = ( function ( $ , window , undefined ) {

    // Determines if the current device supports touch interactions.
    var TOUCH_DEVICE = ( typeof Touch === 'object' ) ;

    // Public API for the SLAB module.
    return {

        /**
         * Iterates through all registered initialization functions
         * within SLAB.init and executes them sequentially.
         */
        go : function ( ) {
            for ( var i in SLAB . init ) {
                SLAB . init [ i ] ( ) ; // Call each initialization function.
            }
        } , // End of 'go' method.

        /**
         * Contains various initialization routines for the application.
         * Each property is a function that performs a specific setup task.
         */
        init : {

            // Adjusts the width of textareas and elements with 'input_full' class.
            full_input_size : function ( ) {

                // If no relevant elements are found, exit early.
                if ( ! $ ( 'textarea, .input_full' ) . length ) {
                    return ;
                }

                // This critical fix ensures that width: 100% on <textarea>
                // and elements with class="input_full" does not cause
                // them to exceed the width of their parent container.
                // It wraps them in a span with appropriate styling.
                $ ( 'textarea, .input_full' ) . wrap ( '<span class="input_full_wrap"></span>' ) ;
            } , // End of 'full_input_size' function.

            // Implements a fallback for HTML5 placeholder attribute in older browsers.
            placeholder : function ( ) {

                // Check if the browser natively supports the 'placeholder' attribute.
                var placeholder_supported = 'placeholder' in document . createElement ( 'input' ) ;

                // If no elements with 'placeholder' are found, or if native support exists,
                // there's no need for the polyfill.
                if ( ! $ ( '*[placeholder]' ) . length || placeholder_supported ) {
                    return ;
                }

                // Iterate over each element that has a 'placeholder' attribute.
                $ ( '*[placeholder]' ) . each ( function ( ) {
                    var el = $ ( this ) ;
                    var text = el . attr ( 'placeholder' ) ;

                    // Set the placeholder text as the value if the field is empty.
                    if ( ! el . val ( ) ) {
                        el . val ( text ) ;
                    }

                    // Handle focus event: clear placeholder text if it matches.
                    el . focus ( function ( ) {
                        if ( el . val ( ) === text ) {
                            el . val ( '' ) ;
                        }
                    } ) . blur ( function ( ) { // Handle blur event: restore placeholder if field is empty.
                        if ( ! el . val ( ) ) {
                            el . val ( text ) ;
                        }
                    } ) ; // End of focus/blur binding.
                } ) ; // End of each loop.
            } , // End of 'placeholder' function.

            // Manages UI adjustments based on device rotation (orientation changes).
            rotation : function ( ) {

                // Helper function to apply orientation-dependent styles.
                function adjust_angle ( ) {
                    var angle = window . orientation ; // Current device orientation.
                    var body = $ ( 'body' ) ;
                    var body_width = body . outerWidth ( ) ; // Get the current body width.
                    var sidebar = $ ( '#sidebar' ) ;

                    // Determine if the device is in portrait mode or if the screen is narrow.
                    if ( angle === 0 || angle === 180 || body_width < 1024 ) {
                        body . addClass ( 'is_portrait' ) ; // Add portrait class.
                        $ ( '#button_navigation' ) . removeClass ( 'button_active' ) ; // Deactivate nav button.
                        sidebar . hide ( ) ; // Hide the sidebar.
                    }
                    else { // Landscape mode or wider screen.
                        body . removeClass ( 'is_portrait' ) ; // Remove portrait class.
                        sidebar . show ( ) ; // Show the sidebar.
                    }
                }

                // Initial adjustment on page load.
                adjust_angle ( ) ;

                // Bind the adjustment function to resize and orientationchange events.
                $ ( window ) . bind ( 'resize orientationchange' , function ( ) {
                    adjust_angle ( ) ; // Re-adjust on window resize or orientation change.
                } ) ;
            } , // End of 'rotation' function.

            // Toggles the visibility of the sidebar navigation.
            navigation : function ( ) {

                // Skip if the navigation button doesn't exist.
                if ( ! $ ( '#button_navigation' ) . length ) {
                    return ;
                }

                // Attach a click handler to the navigation button.
                $ ( '#button_navigation' ) . click ( function ( ) {
                    var sidebar = $ ( '#sidebar' ) ;

                    // Toggle sidebar visibility and button active state.
                    if ( sidebar . is ( ':hidden' ) ) {
                        $ ( this ) . addClass ( 'button_active' ) ; // Activate button.
                        sidebar . show ( ) ; // Show sidebar.
                    }
                    else {
                        $ ( this ) . removeClass ( 'button_active' ) ; // Deactivate button.
                        sidebar . hide ( ) ; // Hide sidebar.
                    }

                    this . blur ( ) ; // Remove focus from the button.
                    return false ; // Prevent default link behavior.
                } ) ;
            } , // End of 'navigation' function.

            // Handles expansion and collapse of menu items in the sidebar.
            expand_menu : function ( ) {

                // Exit if the sidebar menu is not present.
                if ( ! $ ( '#sidebar_menu' ) . length ) {
                    return ;
                }

                // Determine the appropriate event for touch devices.
                var touch_click = TOUCH_DEVICE ? 'click' : 'mousedown' ;

                // Add a toggle arrow to menu items that have sub-menus.
                $ ( '#sidebar_menu li' ) . each ( function ( ) {
                    if ( $ ( this ) . find ( 'ul:first' ) . length ) {
                        $ ( this ) . find ( 'a:first' ) . prepend ( '<span class="abs toggle_arrow"></span>' ) ;
                    }
                } ) ;

                // Bind the expansion/collapse logic to menu links.
                $ ( '#sidebar_menu a' ) . live ( touch_click , function ( ) {
                    var el = $ ( this ) ;
                    var li = $ ( this ) . parent ( 'li' ) ;
                    var ul = li . find ( 'ul:first' ) ;

                    /*
                     * This section addresses a potential conflict where
                     * iScroll.js might interfere with a {return true}
                     * from a link with an actual href.
                     * For menu toggles, we remove the href to prevent navigation.
                     */
                    if ( el . attr ( 'href' ) === '#' ) {
                        el . removeAttr ( 'href' ) ;
                    }

                    // If a sub-menu exists for this item.
                    if ( ul . length ) {
                        if ( ul . is ( ':hidden' ) ) {
                            li . addClass ( 'expanded' ) ; // Mark as expanded.

                            // Hide siblings to create a focused view.
                            li . siblings ( 'li' ) . each ( function ( ) {
                                if ( $ ( this ) . attr ( 'id' ) !== 'sidebar_menu_home' ) {
                                    $ ( this ) . hide ( ) ;
                                }
                            } ) ;

                            ul . show ( ) ; // Show the sub-menu.
                        }
                        else {
                            ul . hide ( ) ; // Hide the sub-menu.
                            li . removeClass ( 'expanded' ) . siblings ( 'li' ) . show ( ) ; // Restore siblings.
                            li . find ( '.expanded' ) . removeClass ( 'expanded' ) . find ( 'ul' ) . hide ( ) . end ( ) . siblings ( 'li' ) . show ( ) ; // Collapse nested expanded items.
                        }

                        this . blur ( ) ; // Remove focus.
                        return false ; // Prevent default link action.
                    }
                } ) ;
            } , // End of 'expand_menu' function.

            // Dynamically sizes main content and sidebar content areas.
            size_content_areas : function ( ) {

                // Only proceed if main and sidebar content elements exist.
                if ( ! $ ( '#main_content, #sidebar_content' ) . length ) {
                    return ;
                }

                // Iterate over both main and sidebar content elements.
                $ ( '#main_content, #sidebar_content' ) . each ( function ( ) {
                    var el = $ ( this ) ;

                    // Calculate and pin the top position based on header presence.
                    if ( el . siblings ( '.header_upper' ) . length ) {
                        if ( el . siblings ( '.header_lower' ) . length ) {
                            el . css ( {
                                top : '92px'
                            } ) ;
                        }
                        else {
                            el . css ( {
                                top : '46px'
                            } ) ;
                        }
                    }
                    else {
                        el . css ( {
                            top : '0'
                        } ) ;
                    }

                    // Calculate and pin the bottom position based on footer presence.
                    if ( el . siblings ( '.footer_lower' ) . length ) {
                        if ( el . siblings ( '.footer_upper' ) . length ) {
                            el . css ( {
                                bottom : '92px'
                            } ) ;
                        }
                        else {
                            el . css ( {
                                bottom : '46px'
                            } ) ;
                        }
                    }
                    else {
                        el . css ( {
                            bottom : '0'
                        } ) ;
                    }
                } ) ;
            } , // End of 'size_content_areas' function.

            // Initializes iScroll for touch-enabled scrolling on specific content areas.
            touch_scroll : function ( ) {

                // If content areas for scrolling are not present, return.
                if ( ! $ ( '#main_content_inner, #sidebar_content_inner' ) . length ) {
                    return ;
                }

                // Prevent default document scrolling behavior on touch devices.
                $ ( document ) . bind ( 'touchmove' , function ( ) {
                    return false ;
                } ) ;

                // Initialize iScroll instances if the library is available.
                if ( typeof iScroll !== 'undefined' ) {
                    var main_content_inner = new iScroll ( 'main_content_inner' ) ;
                    var sidebar_content_inner = new iScroll ( 'sidebar_content_inner' ) ;
                }
            } // End of 'touch_scroll' function.
        } // End of 'init' object.
    } ; // End of public return object.

// Pass in jQuery reference, window, and undefined for safety and performance.
} ) ( jQuery , this ) ; // Immediately-invoked function expression (IIFE) closure.