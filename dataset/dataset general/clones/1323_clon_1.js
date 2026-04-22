/*
 * Superfish jQuery Menu Plugin - Type I Clone Example
 * This code is a clone of the original jQuery Superfish Menu Plugin
 * Copyright (c) 2013 Joel Birch
 *
 * It retains all original logic, identifiers, and expressions.
 * Only whitespace (indentation, line breaks, spacing) and comments have been altered.
 *
 * Licenses:
 *	http://www.opensource.org/licenses/mit-license.php (MIT License)
 *	http://www.gnu.org/licenses/gpl.html (GPL License)
 */

// Anonymous self-executing function to encapsulate the plugin
( function ( $, w ) {

    // Enforce strict mode for better code quality and error handling
    "use strict" ;

    // Define the core methods for the plugin
    var methods = ( function () {

        // --- Private properties and helper methods start here ---

        // Configuration constants for CSS classes
        var c = {
                bcClass     : 'sf-breadcrumb' ,      // Class for breadcrumb items
                menuClass   : 'sf-js-enabled' ,      // Class applied to enabled Superfish menus
                anchorClass : 'sf-with-ul'    ,      // Class for anchors that have sub-menus
                menuArrowClass: 'sf-arrows'          // Class for menus with CSS arrows
            } ,

            // Detect iOS devices and apply specific touch handling
            ios = ( function () {
                // Check if user agent string indicates an iOS device
                var ios = /iPhone|iPad|iPod/i.test( navigator.userAgent ) ;
                // If it's an iOS device, attach a click handler to body children on window load
                // This prevents iOS from sometimes not bubbling clicks correctly
                if ( ios ) {
                    $( w ).load( function () {
                        $( 'body' ).children().on( 'click', $.noop ) ;
                    } ) ;
                }
                return ios ; // Return the detection result
            } ) () , // Immediately invoke this function

            // Detect Windows Phone 7 (IE Mobile) for specific touch handling
            wp7 = ( function () {
                var style = document.documentElement.style ;
                // Check for 'behavior' and 'fill' in style and 'iemobile' in user agent
                return ( 'behavior' in style && 'fill' in style && /iemobile/i.test( navigator.userAgent ) ) ;
            } ) () , // Immediately invoke this function

            // Check for unprefixed Pointer Events support
            unprefixedPointerEvents = ( function () {
                return ( !! w.PointerEvent ) ;
            } ) () , // Immediately invoke this function

            // Helper function to toggle menu-related CSS classes
            toggleMenuClasses = function ( $menu , o ) {
                var classes = c.menuClass ;
                // Add arrow class if cssArrows option is enabled
                if ( o.cssArrows ) {
                    classes += ' ' + c.menuArrowClass ;
                }
                $menu.toggleClass( classes ) ;
            } ,

            // Helper function to set the path to the current active menu item
            setPathToCurrent = function ( $menu , o ) {
                // Find path items, add hover/breadcrumb classes, hide/show popups, then remove pathClass
                return $menu.find( 'li.' + o.pathClass ).slice( 0, o.pathLevels )
                    .addClass( o.hoverClass + ' ' + c.bcClass )
                    .filter( function () {
                        return ( $( this ).children( o.popUpSelector ).hide().show().length ) ;
                    } ) . removeClass( o.pathClass ) ;
            } ,

            // Helper function to toggle the anchor class
            toggleAnchorClass = function ( $li ) {
                $li.children( 'a' ).toggleClass( c.anchorClass ) ;
            } ,

            // Helper function to toggle MS/standard touch-action CSS property
            toggleTouchAction = function ( $menu ) {
                var msTouchAction = $menu.css( 'ms-touch-action' ) ;
                var touchAction   = $menu.css( 'touch-action' ) ;
                touchAction       = touchAction || msTouchAction ; // Fallback for browsers with only MS prefix
                // Toggle between 'pan-y' and 'auto'
                touchAction       = ( touchAction === 'pan-y' ) ? 'auto' : 'pan-y' ;
                $menu.css( {
                    'ms-touch-action' : touchAction ,
                    'touch-action'    : touchAction
                } ) ;
            } ,

            // Apply event handlers for mouse, touch, and focus events
            applyHandlers = function ( $menu , o ) {
                var targets = 'li:has(' + o.popUpSelector + ')' ; // Selector for list items with pop-ups

                // Use hoverIntent if available and not disabled
                if ( $.fn.hoverIntent && ! o.disableHI ) {
                    $menu.hoverIntent( over , out , targets ) ;
                }
                else {
                    // Fallback to standard mouseenter/mouseleave events
                    $menu
                        .on( 'mouseenter.superfish' , targets , over )
                        .on( 'mouseleave.superfish' , targets , out ) ;
                }

                // Determine the appropriate touch event
                var touchevent = 'MSPointerDown.superfish' ;
                if ( unprefixedPointerEvents ) {
                    touchevent = 'pointerdown.superfish' ;
                }
                if ( ! ios ) {
                    touchevent += ' touchend.superfish' ; // Add touchend for non-iOS
                }
                if ( wp7 ) {
                    touchevent += ' mousedown.superfish' ; // Add mousedown for WP7
                }

                // Attach focus, touch, and mousedown handlers
                $menu
                    .on( 'focusin.superfish' , 'li' , over )
                    .on( 'focusout.superfish' , 'li' , out )
                    .on( touchevent , 'a' , o , touchHandler ) ;
            } ,

            // Handler for touch/pointerdown events
            touchHandler = function ( e ) {
                var $this = $( this ) ,
                    $ul   = $this.siblings( e.data.popUpSelector ) ;

                // If a sub-menu exists and is hidden
                if ( $ul.length > 0 && $ul.is( ':hidden' ) ) {
                    $this.one( 'click.superfish' , false ) ; // Prevent default click
                    if ( e.type === 'MSPointerDown' || e.type === 'pointerdown' ) {
                        $this.trigger( 'focus' ) ; // Trigger focus for pointer events
                    } else {
                        $.proxy( over , $this.parent( 'li' ) )() ; // Proxy 'over' for touch events
                    }
                }
            } ,

            // 'Over' event handler (mouse enter, focus, touch)
            over = function () {
                var $this = $( this ) ,
                    o     = getOptions( $this ) ;
                clearTimeout( o.sfTimer ) ; // Clear any pending hide timers
                $this.siblings().superfish( 'hide' ).end().superfish( 'show' ) ; // Hide siblings, show current
            } ,

            // 'Out' event handler (mouse leave, blur)
            out = function () {
                var $this = $( this ) ,
                    o     = getOptions( $this ) ;
                if ( ios ) {
                    $.proxy( close , $this , o )() ; // Close immediately on iOS
                }
                else {
                    clearTimeout( o.sfTimer ) ; // Clear any existing timer
                    o.sfTimer = setTimeout( $.proxy( close , $this , o ) , o.delay ) ; // Set new hide timer
                }
            } ,

            // Close the menu item
            close = function ( o ) {
                // Check if the current item is part of the retained path
                o.retainPath = ( $.inArray( this[ 0 ] , o.$path ) > -1 ) ;
                this.superfish( 'hide' ) ; // Hide the current menu

                // If no parents are hovered, call onIdle callback
                if ( ! this.parents( '.' + o.hoverClass ).length ) {
                    o.onIdle.call( getMenu( this ) ) ;
                    // If a path is retained, re-trigger 'over' on it
                    if ( o.$path.length ) {
                        $.proxy( over , o.$path )() ;
                    }
                }
            } ,

            // Get the main Superfish menu element from any child element
            getMenu = function ( $el ) {
                return $el.closest( '.' + c.menuClass ) ;
            } ,

            // Get the options associated with a Superfish menu
            getOptions = function ( $el ) {
                return getMenu( $el ).data( 'sf-options' ) ;
            } ;

        // --- Private properties and helper methods end here ---


        // --- Public methods exposed through `methods` object ---
        return {
            // Public method to hide a menu item
            hide: function ( instant ) {
                if ( this.length ) {
                    var $this = this ,
                        o     = getOptions( $this ) ;
                    if ( ! o ) {
                        return this ; // If no options, return early
                    }
                    var not   = ( o.retainPath === true ) ? o.$path : '' , // Elements to not hide
                        $ul   = $this.find( 'li.' + o.hoverClass ).add( this ).not( not ).removeClass( o.hoverClass ).children( o.popUpSelector ) ,
                        speed = o.speedOut ;

                    if ( instant ) {
                        $ul.show() ; // Show instantly if 'instant' is true
                        speed = 0 ;  // Set speed to 0 for instant animation
                    }
                    o.retainPath = false ; // Reset retainPath
                    o.onBeforeHide.call( $ul ) ; // Call before hide callback
                    $ul.stop( true , true ).animate( o.animationOut , speed , function () {
                        var $this = $( this ) ;
                        o.onHide.call( $this ) ; // Call on hide callback
                    } ) ;
                }
                return this ; // Allow chaining
            } ,

            // Public method to show a menu item
            show: function () {
                var o     = getOptions( this ) ;
                if ( ! o ) {
                    return this ; // If no options, return early
                }
                var $this = this.addClass( o.hoverClass ) , // Add hover class
                    $ul   = $this.children( o.popUpSelector ) ; // Get the sub-menu

                o.onBeforeShow.call( $ul ) ; // Call before show callback
                $ul.stop( true , true ).animate( o.animation , o.speed , function () {
                    o.onShow.call( $ul ) ; // Call on show callback
                } ) ;
                return this ; // Allow chaining
            } ,

            // Public method to destroy a Superfish menu instance
            destroy: function () {
                return this.each( function () {
                    var $this    = $( this ) ,
                        o        = $this.data( 'sf-options' ) ,
                        $hasPopUp ;
                    if ( ! o ) {
                        return false ; // If no options, it's not initialized
                    }
                    $hasPopUp = $this.find( o.popUpSelector ).parent( 'li' ) ;
                    clearTimeout( o.sfTimer ) ; // Clear any active timers
                    toggleMenuClasses( $this , o ) ; // Remove menu classes
                    toggleAnchorClass( $hasPopUp ) ; // Remove anchor classes
                    toggleTouchAction( $this ) ; // Reset touch action

                    // Remove all Superfish and hoverIntent event handlers
                    $this.off( '.superfish' ).off( '.hoverIntent' ) ;

                    // Clear inline display styles from sub-menus
                    $hasPopUp.children( o.popUpSelector ).attr( 'style' , function ( i , style ) {
                        return style.replace( /display[^;]+;?/g , '' ) ; // Remove display property
                    } ) ;

                    // Reset 'current' path classes
                    o.$path.removeClass( o.hoverClass + ' ' + c.bcClass ).addClass( o.pathClass ) ;
                    $this.find( '.' + o.hoverClass ).removeClass( o.hoverClass ) ; // Remove any remaining hover classes
                    o.onDestroy.call( $this ) ; // Call destroy callback
                    $this.removeData( 'sf-options' ) ; // Remove stored options data
                } ) ;
            } ,

            // Public method to initialize a Superfish menu
            init: function ( op ) {
                return this.each( function () {
                    var $this = $( this ) ;
                    if ( $this.data( 'sf-options' ) ) {
                        return false ; // Already initialized, prevent re-initialization
                    }
                    var o         = $.extend( {} , $.fn.superfish.defaults , op ) , // Merge default and custom options
                        $hasPopUp = $this.find( o.popUpSelector ).parent( 'li' ) ;
                    o.$path       = setPathToCurrent( $this , o ) ; // Set the current path

                    $this.data( 'sf-options' , o ) ; // Store options on the menu element

                    toggleMenuClasses( $this , o ) ; // Apply menu classes
                    toggleAnchorClass( $hasPopUp ) ; // Apply anchor classes
                    toggleTouchAction( $this ) ; // Apply touch action
                    applyHandlers( $this , o ) ; // Apply event handlers

                    $hasPopUp.not( '.' + c.bcClass ).superfish( 'hide' , true ) ; // Hide all pop-ups initially, except breadcrumbs

                    o.onInit.call( this ) ; // Call initialization callback
                } ) ;
            }
        } ; // End of public methods return
    } ) () ; // End of methods IIFE


    // Extend jQuery's prototype with the superfish plugin
    $.fn.superfish = function ( method , args ) {
        // If a public method exists, call it with provided arguments
        if ( methods[ method ] ) {
            return methods[ method ].apply( this , Array.prototype.slice.call( arguments , 1 ) ) ;
        }
        // If no method specified or an options object is passed, initialize the plugin
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this , arguments ) ;
        }
        // If an invalid method is called, throw an error
        else {
            return $.error( 'Method ' + method + ' does not exist on jQuery.fn.superfish' ) ;
        }
    } ;

    // Define default options for the Superfish plugin
    $.fn.superfish.defaults = {
        popUpSelector  : 'ul,.sf-mega' ,  // Selector for sub-menus
        hoverClass     : 'sfHover'     ,  // Class applied to hovered items
        pathClass      : 'overrideThisToUse' , // Class for path items (override to use)
        pathLevels     : 1             ,  // Number of path levels to retain
        delay          : 800           ,  // Delay before menu hides (milliseconds)
        animation      : { opacity: 'show' } , // Animation properties for showing menu
        animationOut   : { opacity: 'hide' } , // Animation properties for hiding menu
        speed          : 'normal'      ,  // Speed of show animation
        speedOut       : 'fast'        ,  // Speed of hide animation
        cssArrows      : true          ,  // Enable CSS arrows
        disableHI      : false         ,  // Disable hoverIntent integration
        onInit         : $.noop        ,  // Callback on menu initialization
        onBeforeShow   : $.noop        ,  // Callback before menu shows
        onShow         : $.noop        ,  // Callback after menu shows
        onBeforeHide   : $.noop        ,  // Callback before menu hides
        onHide         : $.noop        ,  // Callback after menu hides
        onIdle         : $.noop        ,  // Callback when menu is idle
        onDestroy      : $.noop           // Callback on menu destruction
    } ;

} ) ( jQuery , window ) ; // Pass jQuery and window objects to the IIFE