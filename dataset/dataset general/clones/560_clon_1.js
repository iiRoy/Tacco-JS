/*
 *   @author bh-lay
 *
 *   @github https://github.com/bh-lay/UI
 *   @modified requires('Date')
 *
 */

( function( global, doc, UI_factory, utils_factory ) {

    // Initialize utility module
    var utils = utils_factory( global, doc );

    // Initialize UI module instance
    var UI = UI_factory( global, doc, utils );

    // Expose UI to the global window object, if not already present
    global.UI = global.UI || UI;

    // Also expose the internal utilities for potential external use
    global.UI._utils = utils;

    // Support CommonJS/AMD style module definitions if available
    global.define && define( function() {
        return UI;
    } );

} )(
    window,
    document,
    function( window, document, utils ) {

        /**
         * Cache frequently used utility functions
         * This helps in minification and potentially slight performance gains
         */
        var isNum         = utils.isNum,
            setCSS        = utils.css,
            getCSS        = utils.getStyle,
            animation     = utils.animation,
            outerWidth    = utils.outerWidth,
            outerHeight   = utils.outerHeight,
            findByClassName = utils.findByClassName,
            bindEvent     = utils.bind;

        /**
         * Base templates required for UI components.
         * These are loaded using a 'requires' mechanism, likely a custom template loader.
         */
        var allCnt_tpl     = requires( 'template/base.html' ),
            pop_tpl        = requires( 'template/pop.html' ),
            confirm_tpl    = requires( 'template/confirm.html' ),
            ask_tpl        = requires( 'template/ask.html' ),
            confirmBar_tpl = requires( 'template/confirmBar.html' ),
            prompt_tpl     = requires( 'template/prompt.html' ),
            cover_tpl      = requires( 'template/cover.html' ),
            select_tpl     = requires( 'template/select.html' ),
            popCSS         = requires( 'style.css' ); // Core CSS for UI components

        // Browser version detection for IE6, IE7, IE8
        var isIE67 = false;
        var isIE678 = false;

        if ( navigator.appName == "Microsoft Internet Explorer" ) {

            var version = navigator.appVersion.split( ";" )[ 1 ].replace( /[ ]/g, "" );

            if ( version == "MSIE6.0" || version == "MSIE7.0" ) {
                isIE67 = true;
                isIE678 = true;
            } else if ( version == "MSIE8.0" ) {
                isIE678 = true;
            }
        }

        /*
         * Define private variables for internal use within the UI module.
         * These variables hold references to core DOM elements and state.
         */
        var private_allCnt    = utils.createDom( allCnt_tpl )[ 0 ],
            private_maskDom   = findByClassName( private_allCnt, 'UI_mask' )[ 0 ],
            private_body      = document.body,
            private_docW,
            private_winH,
            private_docH,
            private_scrollTop;

        var private_CONFIG = {
            gap : {
                top    : 0,
                left   : 0,
                bottom : 0,
                right  : 0
            },
            zIndex : 499 // Base z-index for UI elements
        };

        var docDom;

        // Determine the correct document element for scroll/client dimensions
        if ( document.compatMode == "BackCompat" ) {
            docDom = private_body; // Quirks mode
        } else {
            docDom = document.documentElement; // Standard mode
        }

        // Function to refresh window and document size/scroll position
        function refreshSize() {
            private_scrollTop = docDom.scrollTop == 0 ? private_body.scrollTop : docDom.scrollTop;
            private_winH      = window.innerHeight || document.documentElement.clientHeight;
            private_winW      = window.innerWidth || document.documentElement.clientWidth;
            private_docH      = docDom.scrollHeight;
            private_docW      = docDom.clientWidth;
        }

        // Array to keep track of currently active (displayed) UI objects
        var active_objs = [];

        // Removes a UI object from the active_objs tracking array
        function remove_active_obj( obj ) {

            utils.each( active_objs, function( index, item ) {

                if ( item == obj ) {
                    active_objs.splice( index, 1 );
                    return false; // Break loop
                }

            } );
        }

        // Closes the last active UI object that is marked as 'easyClose'
        function close_last_easyClose_obj() {

            for ( var i = active_objs.length - 1; i >= 0; i-- ) {

                if ( active_objs[ i ][ '_easyClose' ] ) {
                    active_objs[ i ].close();
                    break;
                }

            }
        }

        // Returns the z-index of the last active object that has a mask, or 0 if none
        function last_has_mask_zIndex() {

            for ( var i = active_objs.length - 1; i >= 0; i-- ) {

                if ( active_objs[ i ]._easyClose ) {
                    return getCSS( active_objs[ i ].dom, 'zIndex' );
                }

            }

            return 0;
        }

        // Adapts all active UI objects to the current window size after a delay
        var adapt_delay;
        function adapt_active_obj() {
            clearTimeout( adapt_delay );
            adapt_delay = setTimeout( function() {
                utils.each( active_objs, function( index, item ) {
                    item.adapt();
                } );
            }, 150 );
        }

        /*
         * Extends UI objects with 'easy close' functionality.
         * This includes closing on outside click or 'Escape' key press.
         */
        // Event listener for mouseup on the body to detect clicks outside UI elements
        bindEvent( private_body, 'mouseup', function checkClick( event ) {
            var target = event.srcElement || event.target;
            setTimeout( function() {
                while ( !utils.hasClass( target, 'UI_easyClose' ) ) {
                    target = target.parentNode;
                    if ( !target ) {
                        close_last_easyClose_obj();
                        break;
                    }
                }
            } );
        } );

        // Event listener for keyup on the body to detect 'Escape' key press
        bindEvent( private_body, 'keyup', function checkClick( event ) {
            if ( event.keyCode == 27 ) { // Escape key
                close_last_easyClose_obj();
            }
        } );

        /*
         * Helper function to apply easyClose logic to a UI object.
         * @param {boolean} mark - Explicitly set easyClose state.
         * @param {boolean} default_value - Default easyClose state if 'mark' is not boolean.
         */
        function easyCloseHandle( mark, default_value ) {
            var me = this;

            if ( typeof( mark ) == 'boolean' ? mark : default_value ) {
                utils.addClass( me.dom, 'UI_easyClose' );
                setTimeout( function() {
                    me._easyClose = true;
                } );
            }
        }

        // Initialize core component functionality once DOM is ready (or immediately if already ready)
        // utils.ready( function() {

            // Insert core CSS stylesheet into the document
            var styleSheet = utils.createStyleSheet( popCSS, { 'data-module' : "UI" } );

            // Append the main container DOM element to the body
            private_body.appendChild( private_allCnt );

            // Release memory from template strings as they are no longer needed
            popCSS       = null;
            allCnt_tpl   = null;

            // Perform initial window size update
            refreshSize();
            setTimeout( refreshSize, 500 ); // Refresh again after a short delay

            // Add IE6/7/8 specific class if detected
            if ( isIE678 ) {
                utils.addClass( private_allCnt, 'UI_ie678' );
            }

            var rebuild_fn = null;

            if ( isIE67 ) {
                // Special handling for IE6/7 for mask positioning
                rebuild_fn = function() {
                    refreshSize();
                    adapt_active_obj();
                    setCSS( private_maskDom, {
                        marginTop : private_scrollTop
                    } );
                };
            } else {
                // Modern browsers can use fixed positioning for the mask
                setCSS( private_maskDom, {
                    position : 'fixed',
                    top      : 0
                } );
                rebuild_fn = function() {
                    refreshSize();
                    adapt_active_obj();
                };
            }

            // Bind resize and scroll events to the rebuild function for adaptability
            bindEvent( window, 'resize', rebuild_fn );
            bindEvent( window, 'scroll', rebuild_fn );

        // } );

        // Function to fix an element's position within the viewport boundaries
        function fix_position( top, left, width, height ) {
            var gap = private_CONFIG.gap;

            if ( top < private_scrollTop + gap.top ) {
                // If element is above visible screen
                top = private_scrollTop + gap.top;
            } else if ( top + height - private_scrollTop > private_winH - gap.bottom ) {
                // If element extends below visible screen
                if ( height > private_winH - gap.top - gap.bottom ) {
                    // If element is taller than the available viewport height
                    top = private_scrollTop + gap.top;
                } else {
                    // If element fits, but is pushed too far down
                    top = private_scrollTop + private_winH - height - gap.bottom;
                }
            }

            if ( left < gap.left ) {
                left = gap.left;
            } else if ( left + width > private_docW - gap.right ) {
                left = private_docW - width - gap.right;
            }

            return {
                top  : Math.ceil( top ),
                left : Math.ceil( left )
            };
        }

        // Function to adapt a DOM element's position to be centered on the page
        function adaption( dom, param, time ) {

            var param   = param || {},
                width   = outerWidth( dom ),
                height  = outerHeight( dom ),
                top     = ( private_winH - height ) / 2 + private_scrollTop,
                left    = ( private_docW - width ) / 2,
                newPosition = fix_position( top, left, width, height );

            var method = isNum( time ) ? animation : setCSS;

            method( dom, {
                top  : isNum( param.top ) ? param.top : Math.ceil( newPosition.top ),
                left : isNum( param.left ) ? param.left : Math.ceil( newPosition.left )
            }, time );
        }

        // Prototype method for UI objects to adapt themselves
        function ADAPT() {
            adaption( this.dom, null, 80 );
        }

        // Function to add confirmation buttons to a UI element
        function add_confirm( dom, param, close ) {
            var callback = null;
            var cancel   = null;
            var btns     = [ '\u786E\u8BA4', '\u53D6\u6D88' ]; // "Confirm", "Cancel" in Unicode

            if ( typeof( param ) == "function" ) {
                callback = param;
            } else if ( typeof( param ) == "object" ) {
                var paramBtns = param.btns || [];
                btns[ 0 ] = paramBtns[ 0 ] || btns[ 0 ];
                btns[ 1 ] = paramBtns[ 1 ] || btns[ 1 ];

                if ( typeof( param.callback ) == "function" ) {
                    callback = param.callback;
                }

                if ( typeof( param.cancel ) == "function" ) {
                    cancel = param.cancel;
                }
            }

            var this_html = utils.render( confirmBar_tpl, {
                confirm : btns[ 0 ],
                cancel  : btns[ 1 ]
            } );

            dom.appendChild( utils.createDom( this_html )[ 0 ] );

            // Bind click events to the confirmation and cancel buttons
            bindEvent( dom, 'click', '.UI_pop_confirm_ok', function() {
                // If callback exists and returns anything other than false, close the pop-up
                callback ? ( ( callback() != false ) && close() ) : close();
            } );

            bindEvent( dom, 'click', '.UI_pop_confirm_cancel', function() {
                // If cancel callback exists and returns anything other than false, close the pop-up
                cancel ? ( ( cancel() != false ) && close() ) : close();
            } );
        }

        /**
         * Blur effect implementation for background elements.
         * This uses CSS filters if supported by the browser.
         */
        // Iterates through root-level body child elements (excluding UI container and scripts)
        function travelRootElements( callback ) {
            var doms = private_body.childNodes;
            utils.each( doms, function( i, dom ) {
                if ( dom != private_allCnt && dom.nodeType == 1 && dom.tagName != 'SCRIPT' && dom.tagName != 'LINK' && dom.tagName != 'STYLE' ) {
                    callback( dom );
                }
            } );
        }

        var blur     = null;
        var removeBlur = null;

        if ( utils.supports( '-webkit-filter' ) ) {
            blur = function() {
                travelRootElements( function( dom ) {
                    utils.addClass( dom, 'UI-blur' );
                } );
            };
            removeBlur = function() {
                travelRootElements( function( dom ) {
                    utils.removeClass( dom, 'UI-blur' );
                } );
            };
        }

        /**
         * Logic to show the overlay mask.
         */
        function showMask() {
            var lastHasMaskZindex = last_has_mask_zIndex();

            setCSS( this.dom, {
                zIndex : lastHasMaskZindex + 2
            } );

            if ( !this._mask ) {
                return;
            }

            setCSS( private_maskDom, {
                zIndex : lastHasMaskZindex + 1
            } );

            if ( lastHasMaskZindex == 0 ) {
                // If no other masked object is active, display the mask and blur
                blur && blur();
                utils.fadeIn( private_maskDom, 400 );
            }
        }

        /**
         * Logic to close the overlay mask.
         */
        function closeMask() {
            var me = this;

            if ( !me._mask ) {
                return;
            }

            var lastHasMaskZindex = last_has_mask_zIndex();

            setCSS( private_maskDom, {
                zIndex : lastHasMaskZindex - 1
            } );

            if ( lastHasMaskZindex == 0 ) {
                // If this is the last masked object, remove blur and fade out mask
                removeBlur && removeBlur();
                utils.fadeOut( private_maskDom, 200 );
            }
        }

        /**
         * Calculates animation properties for slide-in/out effects.
         * @param {string} direction - 'left', 'right', 'top', 'bottom'
         * @param {number} range - Distance for translation
         * @returns {Array} [property ('X' or 'Y'), start value]
         */
        function countTranslate( direction, range ) {
            var prop,
                start;

            switch ( direction ) {
                case 'left':
                    prop  = 'X';
                    start = -range;
                    break;
                case 'right':
                    prop  = 'X';
                    start = range;
                    break;
                case 'bottom':
                    prop  = 'Y';
                    start = range;
                    break;
                default: // 'top'
                    prop  = 'Y';
                    start = -range;
            }

            return [ prop, start ];
        }

        /**
         * Handles the opening animation for a UI component.
         * @param {function} fn - Callback to execute after animation completes.
         */
        function openAnimation( fn ) {
            var me   = this;
            var DOM  = me.dom;
            var from = me._from; // Animation origin (e.g., 'top', 'left', or a DOM element)
            var time = 100;

            // Add the current object to the global active objects list
            active_objs.push( me );

            // Show the mask (internal logic determines if it's actually displayed)
            showMask.call( me );

            // Skip animation for IE or if 'from' is not specified or 'none'
            if ( isIE678 || !from || from == 'none' ) {
                fn && fn();
                return;
            }

            var offset      = utils.offset( DOM ),
                cssStart    = {}, // Initial CSS state for animation
                cssAnim     = {}; // Target CSS state for animation

            // If 'from' is a DOM object, animate from its position and dimensions
            if ( from.tagName && from.parentNode ) {
                var offset_from = utils.offset( from );

                cssStart = {
                    top      : offset_from.top,
                    left     : offset_from.left,
                    clip     : 'rect(0,' + outerWidth( from ) + 'px,' + outerHeight( from ) + 'px,0)',
                    overflow : 'hidden'
                };
                cssAnim = {
                    clip : 'rect(0,' + outerWidth( DOM ) + 'px,' + outerHeight( DOM ) + 'px,0)',
                    top  : getCSS( DOM, 'top' ),
                    left : getCSS( DOM, 'left' )
                };
            // If 'from' is a string (e.g., 'top', 'left'), use a slide animation
            } else if ( typeof( from ) == 'string' ) {
                var countResult = countTranslate( from, 40 ); // Calculate translation properties

                cssStart.transform = 'translate' + countResult[ 0 ] + '(' + countResult[ 1 ] + 'px)';
                cssAnim.transform  = 'translateX(0) translateY(0)';
            } else {
                // If 'from' parameter is invalid, just execute the callback
                fn && fn();
                return;
            }

            // Ensure element starts hidden and fades in
            cssStart.opacity = 0;
            cssAnim.opacity  = 1;

            // Apply starting styles and begin animation
            setCSS( DOM, cssStart );
            utils.addClass( private_allCnt, 'isAnimation' ); // Add class to body for global animation state

            animation( DOM, cssAnim, time, 'ease-out', function() {
                utils.removeClass( private_allCnt, 'isAnimation' );
                // Restore clip property to 'auto' after animation
                setCSS( DOM, {
                    clip : 'auto'
                } );
                fn && fn(); // Execute callback
            } );
        }

        /**
         * Handles the closing animation and cleanup for a UI component.
         * @param {number} time_define - Default animation duration.
         * @param {function} fn - Callback to execute after animation completes and object is removed.
         * @returns {function} A function that takes a 'time' parameter to override default duration.
         */
        function closeAnimation( time_define, fn ) {
            return function( time ) {
                var me = this;

                // Check if the object has already been marked for removal/dead
                if ( me.dead ) {
                    return;
                }
                // Mark the object as dead to prevent re-closing
                me.dead = true;

                // Remove the object from the global active objects list
                remove_active_obj( me );

                // Trigger the object's close callback if defined
                me.closeFn && me.closeFn();

                // Close the mask (internal logic determines if it's actually closed)
                closeMask.call( me );

                // Execute the callback provided to closeAnimation function
                fn && fn.call( me );

                var DOM = me.dom;

                utils.addClass( private_allCnt, 'isAnimation' ); // Indicate global animation state

                // Function to remove the DOM element
                function removeDom() {
                    utils.removeClass( private_allCnt, 'isAnimation' );
                    utils.removeNode( DOM );
                }

                // Skip animation for IE or if 'from' is 'none'
                if ( isIE678 || from == 'none' ) {
                    removeDom();
                    return;
                }