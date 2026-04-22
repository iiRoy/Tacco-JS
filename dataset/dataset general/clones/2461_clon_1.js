/*!
 *
 * This is a Type I clone of the original fancyBox jQuery Plugin code.
 *
 * Version : 2.1.5 (as of Friday, 14th June 2013)
 * Requires: jQuery v1.6 or later.
 *
 * Information and examples can be found at: http://fancyapps.com/fancybox/
 * License details: www.fancyapps.com/fancybox/#license
 *
 * Original Copyright (c) 2012 Janis Skarnelis - janis@fancyapps.com
 *
 * This cloned version maintains exact functional equivalence.
 * Only whitespace and comments have been altered.
 *
 */

;
(
    function (
        window,
        document,
        $,
        undefined
    )
    {
        "use strict"
        ; // Enforce strict mode for better code quality.


        // Cache frequently used jQuery objects for performance.
        var H = $ ( "html" )
            , W = $ ( window )
            , D = $ ( document )
            , F = $.fancybox = function ( ) {
                F . open . apply ( this , arguments )
                ;
            }
            ,
            // Detect Internet Explorer based on user agent.
            IE = navigator . userAgent . match ( /msie/i )
            ,
            // Variable to track update status, initially null.
            didUpdate = null
            ,
            // Determine if the device supports touch events.
            isTouch = document . createTouch !== undefined
            ,

            // Helper function to check if an object is a jQuery object.
            isQuery = function ( obj )
            {
                return obj && obj . hasOwnProperty && obj instanceof $
                ;
            }
            ,
            // Helper function to check if a variable is a string.
            isString = function ( str )
            {
                return str && $ . type ( str ) === "string"
                ;
            }
            ,
            // Helper function to check if a string represents a percentage.
            isPercentage = function ( str )
            {
                return isString ( str ) && str . indexOf ( '%' ) > 0
                ;
            }
            ,
            // Helper function to determine if an element is scrollable.
            isScrollable = function ( el )
            {
                return (
                    el
                    && ! (
                        el . style . overflow
                        && el . style . overflow === 'hidden'
                    )
                    && (
                        (
                            el . clientWidth
                            && el . scrollWidth > el . clientWidth
                        )
                        ||
                        (
                            el . clientHeight
                            && el . scrollHeight > el . clientHeight
                        )
                    )
                )
                ;
            }
            ,
            // Calculates a scalar value from an original string, potentially based on a dimension.
            getScalar = function ( orig , dim )
            {
                var value = parseInt ( orig , 10 ) || 0
                ;

                if ( dim && isPercentage ( orig ) )
                {
                    value = F . getViewport ( ) [ dim ] / 100 * value
                    ;
                }

                return Math . ceil ( value )
                ;
            }
            ,
            // Returns a pixel value from a given input.
            getValue = function ( value , dim )
            {
                return getScalar ( value , dim ) + 'px'
                ;
            }
        ;

        // Extend the main fancyBox object with properties and methods.
        $ . extend ( F , {

            // The current version string of fancyBox.
            version : '2.1.5' ,

            // Default configuration options for fancyBox.
            defaults : {
                padding : 15 ,
                margin : 20 ,

                width : 800 ,
                height : 600 ,
                minWidth : 100 ,
                minHeight : 100 ,
                maxWidth : 9999 ,
                maxHeight : 9999 ,
                pixelRatio : 1 , // Set to 2 for retina display support.

                autoSize : true ,
                autoHeight : false ,
                autoWidth : false ,

                autoResize : true ,
                autoCenter : ! isTouch , // Auto-center is disabled for touch devices.
                fitToView : true ,
                aspectRatio : false ,
                topRatio : 0.5 ,
                leftRatio : 0.5 ,

                scrolling : 'auto' , // Options: 'auto', 'yes' or 'no'.
                wrapCSS : '' , // Custom CSS class for the wrapper.

                arrows : true ,
                closeBtn : true ,
                closeClick : false , // Whether clicking on content closes the box.
                nextClick : false , // Whether clicking on content goes to next item.
                mouseWheel : true ,
                autoPlay : false ,
                playSpeed : 3000 ,
                preload : 3 , // Number of items to preload.
                modal : false , // If true, disables closing on overlay click, esc key, etc.
                loop : true , // Loop through gallery items.

                ajax : {
                    dataType : 'html' ,
                    headers : {
                        'X-fancyBox' : true
                    }
                } ,
                iframe : {
                    scrolling : 'auto' ,
                    preload : true
                } ,
                swf : {
                    wmode : 'transparent' ,
                    allowfullscreen : 'true' ,
                    allowscriptaccess : 'always'
                } ,

                // Keyboard shortcuts configuration.
                keys : {
                    next : {
                        13 : 'left' , // Enter key.
                        34 : 'up' , // Page Down key.
                        39 : 'left' , // Right arrow key.
                        40 : 'up' // Down arrow key.
                    } ,
                    prev : {
                        8 : 'right' , // Backspace key.
                        33 : 'down' , // Page Up key.
                        37 : 'right' , // Left arrow key.
                        38 : 'down' // Up arrow key.
                    } ,
                    close : [ 27 ] , // Escape key.
                    play : [ 32 ] , // Spacebar - start/stop slideshow.
                    toggle : [ 70 ] // Letter "f" - toggle fullscreen.
                } ,

                direction : {
                    next : 'left' ,
                    prev : 'right'
                } ,

                scrollOutside : true ,

                // Override some core properties.
                index : 0 ,
                type : null ,
                href : null ,
                content : null ,
                title : null ,

                // HTML templates for various fancyBox elements.
                tpl : {
                    wrap : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>' ,
                    image : '<img class="fancybox-image" src="{href}" alt="" />' ,
                    iframe : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + ( IE ? ' allowtransparency="true"' : '' ) + '></iframe>' ,
                    error : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>' ,
                    closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>' ,
                    next : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>' ,
                    prev : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
                } ,

                // Properties for each animation type.
                // Opening fancyBox animation settings.
                openEffect : 'fade' , // Options: 'elastic', 'fade' or 'none'.
                openSpeed : 250 ,
                openEasing : 'swing' ,
                openOpacity : true ,
                openMethod : 'zoomIn' ,

                // Closing fancyBox animation settings.
                closeEffect : 'fade' , // Options: 'elastic', 'fade' or 'none'.
                closeSpeed : 250 ,
                closeEasing : 'swing' ,
                closeOpacity : true ,
                closeMethod : 'zoomOut' ,

                // Changing to next gallery item animation settings.
                nextEffect : 'elastic' , // Options: 'elastic', 'fade' or 'none'.
                nextSpeed : 250 ,
                nextEasing : 'swing' ,
                nextMethod : 'changeIn' ,

                // Changing to previous gallery item animation settings.
                prevEffect : 'elastic' , // Options: 'elastic', 'fade' or 'none'.
                prevSpeed : 250 ,
                prevEasing : 'swing' ,
                prevMethod : 'changeOut' ,

                // Enable default helper modules.
                helpers : {
                    overlay : true ,
                    title : true
                } ,

                // Callback functions for various events in the fancyBox lifecycle.
                onCancel : $ . noop , // Called if canceling.
                beforeLoad : $ . noop , // Called before content loading.
                afterLoad : $ . noop , // Called after content loading.
                beforeShow : $ . noop , // Called before changing in current item.
                afterShow : $ . noop , // Called after opening.
                beforeChange : $ . noop , // Called before changing gallery item.
                beforeClose : $ . noop , // Called before closing.
                afterClose : $ . noop // Called after closing.
            } ,

            // Current state variables of the fancyBox instance.
            group : {
            } , // The currently selected group of items.
            opts : {
            } , // Merged options for the current group.
            previous : null , // Reference to the previous element.
            coming : null , // Reference to the element currently being loaded.
            current : null , // Reference to the currently loaded and active element.
            isActive : false , // Flag indicating if fancyBox is active.
            isOpen : false , // Flag indicating if fancyBox is currently open.
            isOpened : false , // Flag indicating if fancyBox has been fully opened at least once.

            wrap : null , // jQuery object for the main wrapper.
            skin : null , // jQuery object for the skin element.
            outer : null , // jQuery object for the outer element.
            inner : null , // jQuery object for the inner content element.

            player : {
                timer : null , // Timer for the slideshow.
                isActive : false // Flag for slideshow activity.
            } ,

            // Loader functions.
            ajaxLoad : null , // Stores the AJAX deferred object.
            imgPreload : null , // Stores the image preload object.

            // Collections for transitions and helpers.
            transitions : {
            } ,
            helpers : {
            } ,

            /*
             *
             * Static methods for fancyBox functionality.
             *
             */

            /**
             * Opens fancyBox with a given group of items and options.
             *
             * @param {Array|jQuery|HTMLElement|string} group - The items to display.
             * @param {Object} opts - Options to override defaults.
             */
            open : function ( group , opts )
            {
                if ( ! group )
                {
                    return
                    ;
                }

                if ( ! $ . isPlainObject ( opts ) )
                {
                    opts = {
                    }
                    ;
                }

                // Close any existing active fancyBox instance before opening a new one.
                if ( false === F . close ( true ) )
                {
                    return
                    ;
                }

                // Normalize the group input into an array of objects.
                if ( ! $ . isArray ( group ) )
                {
                    group = isQuery ( group ) ? $ ( group ) . get ( ) : [ group ]
                    ;
                }

                // Recheck the type of each element and set content type (image, ajax, etc.).
                $ . each ( group , function ( i , element )
                {
                    var obj = {
                        }
                        ,
                        href
                        ,
                        title
                        ,
                        content
                        ,
                        type
                        ,
                        rez
                        ,
                        hrefParts
                        ,
                        selector
                    ;

                    if ( $ . type ( element ) === "object" )
                    {
                        // Check if it's a DOM element.
                        if ( element . nodeType )
                        {
                            element = $ ( element )
                            ;
                        }

                        if ( isQuery ( element ) )
                        {
                            obj = {
                                href : element . data ( 'fancybox-href' ) || element . attr ( 'href' ) ,
                                title : $ ( '<div/>' ) . text ( element . data ( 'fancybox-title' ) || element . attr ( 'title' ) ) . html ( ) ,
                                isDom : true ,
                                element : element
                            }
                            ;

                            if ( $ . metadata )
                            {
                                $ . extend ( true , obj , element . metadata ( ) )
                                ;
                            }

                        }
                        else
                        {
                            obj = element
                            ;
                        }
                    }

                    // Determine href and title.
                    href = opts . href || obj . href || ( isString ( element ) ? element : null )
                    ;
                    title = opts . title !== undefined ? opts . title : obj . title || ''
                    ;

                    // Determine content and type.
                    content = opts . content || obj . content
                    ;
                    type = content ? 'html' : ( opts . type || obj . type )
                    ;

                    if ( ! type && obj . isDom )
                    {
                        type = element . data ( 'fancybox-type' )
                        ;

                        if ( ! type )
                        {
                            rez = element . prop ( 'class' ) . match ( /fancybox\.(\w+)/ )
                            ;
                            type = rez ? rez [ 1 ] : null
                            ;
                        }
                    }

                    if ( isString ( href ) )
                    {
                        // Try to guess the content type if not explicitly set.
                        if ( ! type )
                        {
                            if ( F . isImage ( href ) )
                            {
                                type = 'image'
                                ;

                            }
                            else if ( F . isSWF ( href ) )
                            {
                                type = 'swf'
                                ;

                            }
                            else if ( href . charAt ( 0 ) === '#' )
                            {
                                type = 'inline'
                                ;

                            }
                            else if ( isString ( element ) )
                            {
                                type = 'html'
                                ;
                                content = element
                                ;
                            }
                        }

                        // Split URL into source URL and content selector for AJAX type.
                        // Example: "/mypage.html #my_id"
                        if ( type === 'ajax' )
                        {
                            hrefParts = href . split ( /\s+/ , 2 )
                            ;
                            href = hrefParts . shift ( )
                            ;
                            selector = hrefParts . shift ( )
                            ;
                        }
                    }

                    if ( ! content )
                    {
                        if ( type === 'inline' )
                        {
                            if ( href )
                            {
                                content = $ ( isString ( href ) ? href . replace ( /.*(?=#[^\s]+$)/ , '' ) : href )
                                ; // Strip for IE7 compatibility.

                            }
                            else if ( obj . isDom )
                            {
                                content = element
                                ;
                            }

                        }
                        else if ( type === 'html' )
                        {
                            content = href
                            ;

                        }
                        else if ( ! type && ! href && obj . isDom )
                        {
                            type = 'inline'
                            ;
                            content = element
                            ;
                        }
                    }

                    // Extend the current object with resolved properties.
                    $ . extend ( obj , {
                        href : href ,
                        type : type ,
                        content : content ,
                        title : title ,
                        selector : selector
                    } )
                    ;

                    group [ i ] = obj
                    ;
                } )
                ;

                // Extend the defaults with user-provided options.
                F . opts = $ . extend ( true , {
                } , F . defaults , opts )
                ;

                // All options are merged recursively except for 'keys'.
                if ( opts . keys !== undefined )
                {
                    F . opts . keys = opts . keys ? $ . extend ( {
                    } , F . defaults . keys , opts . keys ) : false
                    ;
                }

                // Set the current group.
                F . group = group
                ;

                // Start the fancyBox process with the specified index.
                return F . _start ( F . opts . index )
                ;
            } ,

            /**
             * Cancels current image loading or aborts AJAX requests.
             */
            cancel : function ( )
            {
                var coming = F . coming
                ;

                // Trigger 'onCancel' callback and stop if it returns false.
                if ( coming && false === F . trigger ( 'onCancel' ) )
                {
                    return
                    ;
                }

                // Hide the loading indicator.
                F . hideLoading ( )
                ;

                if ( ! coming )
                {
                    return
                    ;
                }

                // Abort any active AJAX request.
                if ( F . ajaxLoad )
                {
                    F . ajaxLoad . abort ( )
                    ;
                }

                F . ajaxLoad = null
                ;

                // Clear image preload handlers.
                if ( F . imgPreload )
                {
                    F . imgPreload . onload = F . imgPreload . onerror = null
                    ;
                }

                // Stop animations and remove the wrapper if it exists.
                if ( coming . wrap )
                {
                    coming . wrap . stop ( true , true ) . trigger ( 'onReset' ) . remove ( )
                    ;
                }

                F . coming = null
                ;

                // If the first item was canceled, perform a full cleanup.
                if ( ! F . current )
                {
                    F . _afterZoomOut ( coming )
                    ;
                }
            } ,

            /**
             * Closes fancyBox.
             * @param {boolean} [event] - If true, forces immediate removal without animation.
             */
            close : function ( event )
            {
                F . cancel ( )
                ;

                // Trigger 'beforeClose' callback and stop if it returns false.
                if ( false === F . trigger ( 'beforeClose' ) )
                {
                    return
                    ;
                }

                // Unbind all fancyBox-related events.
                F . unbindEvents ( )
                ;

                if ( ! F . isActive )
                {
                    return
                    ;
                }

                // If not fully open or forced to close immediately.
                if ( ! F . isOpen || event === true )
                {
                    // Stop animations, trigger reset, and remove all wrappers.
                    $ ( '.fancybox-wrap' ) . stop ( true ) . trigger ( 'onReset' ) . remove ( )
                    ;

                    F . _afterZoomOut ( )
                    ;

                }
                else
                {
                    // Set state flags for closing animation.
                    F . isOpen = F . isOpened = false
                    ;
                    F . isClosing = true
                    ;

                    // Remove fancyBox items and navigation elements.
                    $ ( '.fancybox-item, .fancybox-nav' ) . remove ( )
                    ;

                    // Stop wrapper animations, remove 'fancybox-opened' class.
                    F . wrap . stop ( true , true ) . removeClass ( 'fancybox-opened' )
                    ;

                    // Execute the closing transition method.
                    F . transitions [ F . current . closeMethod ] ( )
                    ;
                }
            } ,

            /**
             * Manages the slideshow functionality.
             * @param {boolean} [action] - true to start, false to stop, undefined to toggle.
             */
            play : function ( action )
            {
                var clear = function ( )
                {
                    clearTimeout ( F . player . timer )
                    ;
                }
                    ,
                    set = function ( )
                    {
                        clear ( )
                        ;

                        if ( F . current && F . player . isActive )
                        {
                            F . player . timer = setTimeout ( F . next , F . current . playSpeed )
                            ;
                        }
                    }
                    ,
                    stop = function ( )
                    {
                        clear ( )
                        ;

                        D . unbind ( '.player' )
                        ;

                        F . player . isActive = false
                        ;

                        F . trigger ( 'onPlayEnd' )
                        ;
                    }
                    ,
                    start = function ( )
                    {
                        // Start only if there's a current item and looping is enabled or it's not the last item.
                        if ( F . current && ( F . current . loop || F . current . index < F . group . length - 1 ) )
                        {
                            F . player . isActive = true
                            ;

                            // Bind player-specific events.
                            D . bind ( {
                                'onCancel.player beforeClose.player' : stop ,
                                'onUpdate.player' : set ,
                                'beforeLoad.player' : clear
                            } )
                            ;

                            set ( )
                            ; // Initialize the timer.

                            F . trigger ( 'onPlayStart' )
                            ;
                        }
                    }
                ;

                // Determine action based on input.
                if ( action === true || ( ! F . player . isActive && action !== false ) )
                {
                    start ( )
                    ;
                }
                else
                {
                    stop ( )
                    ;
                }
            } ,

            /**
             * Navigates to the next gallery item.
             * @param {string} [direction] - Optional direction ('left', 'right', 'up', 'down').
             */
            next : function ( direction )
            {
                var current = F . current
                ;

                if ( current )
                {
                    // Use default direction if not provided.
                    if ( ! isString ( direction ) )
                    {
                        direction = current . direction . next
                        ;
                    }

                    // Jump to the next item.
                    F . jumpto ( current . index + 1 , direction , 'next' )
                    ;
                }
            } ,

            /**
             * Navigates to the previous gallery item.
             * @param {string} [direction] - Optional direction ('left', 'right', 'up', 'down').
             */
            prev : function ( direction )
            {
                var current = F . current
                ;

                if ( current )
                {
                    // Use default direction if not provided.
                    if ( ! isString ( direction ) )
                    {
                        direction = current . direction . prev
                        ;
                    }

                    // Jump to the previous item.
                    F . jumpto ( current . index - 1 , direction , 'prev' )
                    ;
                }
            }
        } )
        ; // End of $.extend(F, { ... });

    }
)
(
    window,
    document,
    jQuery
)
;