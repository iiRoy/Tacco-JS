/*
 *    This is a Type I clone of the original jquery.qtip plugin source.
 *
 *    Original Author: Craig Thompson
 *    Website: http://craigsworks.com
 *
 *    License: MIT - http://www.opensource.org/licenses/mit-license.php
 *
 *    Version Information:
 *    - Initial Release: February 2009
 *    - Current Version: 1.0.0-rc3
 *    - Release Date: May 12th, 2009 - 00:00
 *
 *    Note: The original 'Debug' comment pointed to 'jquery.qtip.debug.js'.
 *          This file maintains the exact code structure and identifiers,
 *          with only whitespace and comments altered for visual differentiation.
 */
( function( $ )
{
    // Main plugin implementation for jQuery
    $.fn.qtip = function ( options, blanket )
    {
        // Declare local variables used throughout the function.
        var i, id, interfaces, opts, obj, command, config, api;

        // Check if the call is an API request (options is a string)
        if ( typeof options == 'string' )
        {
            // First, ensure that qTip data exists on the element.
            // If no tooltip is present, log an error.
            if ( typeof $ ( this ) . data ( 'qtip' ) !== 'object' )
                $.fn.qtip.log.error . call ( self, 1, $.fn.qtip.constants.NO_TOOLTIP_PRESENT, false );

            // Return the requested API object or interfaces collection.
            if ( options == 'api' )
                return $ ( this ) . data ( 'qtip' ) . interfaces [ $ ( this ) . data ( 'qtip' ) . current ];
            else if ( options == 'interfaces' )
                return $ ( this ) . data ( 'qtip' ) . interfaces;
        }

        // If not an API request, proceed with tooltip creation or option processing.
        else
        {
            // If no options are provided, initialize an empty object to prevent errors.
            if ( ! options )
                options = {};

            // Sanitize and normalize the structure of the options object.
            // This ensures consistent object structures for content, position, show, hide, and style.
            if ( typeof options.content !== 'object' || ( options.content.jquery && options.content.length > 0 ) )
                options.content = { text: options.content };

            if ( typeof options.content.title !== 'object' )
                options.content.title = { text: options.content.title };

            if ( typeof options.position !== 'object' )
                options.position = { corner: options.position };

            if ( typeof options.position.corner !== 'object' )
                options.position.corner = { target: options.position.corner, tooltip: options.position.corner };

            if ( typeof options.show !== 'object' )
                options.show = { when: options.show };

            if ( typeof options.show.when !== 'object' )
                options.show.when = { event: options.show.when };

            if ( typeof options.show.effect !== 'object' )
                options.show.effect = { type: options.show.effect };

            if ( typeof options.hide !== 'object' )
                options.hide = { when: options.hide };

            if ( typeof options.hide.when !== 'object' )
                options.hide.when = { event: options.hide.when };

            if ( typeof options.hide.effect !== 'object' )
                options.hide.effect = { type: options.hide.effect };

            if ( typeof options.style !== 'object' )
                options.style = { name: options.style };

            // Apply style sanitization, potentially merging with defaults.
            options.style = sanitizeStyle ( options.style );

            // Merge user-provided options with default settings. Deep merge is used.
            opts = $ . extend ( true, {}, $ .fn.qtip.defaults, options );

            // Further process style options and store original user options.
            opts.style = buildStyle . call ( { options: opts }, opts.style );
            opts.user = $ . extend ( true, {}, options );
        }
        ; // End of options processing block

        // Iterate over each selected element to apply or manage qTip instances.
        return $ ( this ) . each ( function () // Adhering to jQuery's chainability: return original elements.
        {
            // Handle API commands if 'options' was a string.
            if ( typeof options == 'string' )
            {
                command = options . toLowerCase (); // Convert command to lowercase for consistency.
                interfaces = $ ( this ) . qtip ( 'interfaces' ); // Retrieve all qTip interfaces for the current element.

                // Proceed only if interfaces exist for this element.
                if ( typeof interfaces == 'object' )
                {
                    // Special handling for a 'blanket destroy' command, which destroys all tooltips on the element.
                    if ( blanket === true && command == 'destroy' )
                        while ( interfaces.length > 0 )
                            interfaces [ interfaces.length - 1 ] . destroy ();

                    // If it's not a blanket destroy, process other API commands.
                    else
                    {
                        // If 'blanket' is not true, the command applies only to the *current* active tooltip.
                        if ( blanket !== true )
                            interfaces = [ $ ( this ) . qtip ( 'api' ) ];

                        // Execute the command on each relevant qTip interface.
                        for ( i = 0; i < interfaces.length; i ++ )
                        {
                            // 'destroy' can be called regardless of rendering status.
                            if ( command == 'destroy' )
                                interfaces [ i ] . destroy ();

                            // For other commands, ensure the tooltip is rendered before attempting API calls.
                            else if ( interfaces [ i ] . status . rendered === true )
                            {
                                if ( command == 'show' )
                                    interfaces [ i ] . show ();
                                else if ( command == 'hide' )
                                    interfaces [ i ] . hide ();
                                else if ( command == 'focus' )
                                    interfaces [ i ] . focus ();
                                else if ( command == 'disable' )
                                    interfaces [ i ] . disable ( true );
                                else if ( command == 'enable' )
                                    interfaces [ i ] . disable ( false );
                            }
                            ; // End of conditional API calls
                        }
                        ; // End of interfaces loop
                    }
                    ; // End of blanket check
                }
                ; // End of interfaces existence check
            }

            // If 'options' is not a string, this is a tooltip creation/initialization call.
            else
            {
                // Create a unique configuration object for this specific qTip instance.
                config = $ . extend ( true, {}, opts );
                config.hide.effect.length = opts.hide.effect.length;
                config.show.effect.length = opts.show.effect.length;

                // Sanitize target options, ensuring they are valid jQuery objects.
                if ( config.position.container === false )
                    config.position.container = $ ( document.body );
                if ( config.position.target === false )
                    config.position.target = $ ( this );
                if ( config.show.when.target === false )
                    config.show.when.target = $ ( this );
                if ( config.hide.when.target === false )
                    config.hide.when.target = $ ( this );

                // Determine a unique ID for this tooltip instance, reusing slots if available.
                id = $ .fn.qtip.interfaces.length;
                for ( i = 0; i < id; i ++ )
                {
                    if ( typeof $ .fn.qtip.interfaces [ i ] == 'undefined' )
                    {
                        id = i;
                        break;
                    }
                    ;
                }
                ;

                // Instantiate a new qTip object.
                obj = new qTip ( $ ( this ), config, id );

                // Store a reference to the new API object in the global interfaces array.
                $ .fn.qtip.interfaces [ id ] = obj;

                // Check if the current element already has qTip data.
                if ( typeof $ ( this ) . data ( 'qtip' ) == 'object' )
                {
                    // If it does, and it's a new qTip (not just an update), update the current interface ID.
                    if ( typeof $ ( this ) . attr ( 'qtip' ) === 'undefined' )
                        $ ( this ) . data ( 'qtip' ) . current = $ ( this ) . data ( 'qtip' ) . interfaces.length;

                    // Add the new qTip instance to the element's interfaces array.
                    $ ( this ) . data ( 'qtip' ) . interfaces . push ( obj );
                }

                // If no qTip data is present, create it with the new instance.
                else
                    $ ( this ) . data ( 'qtip', { current: 0, interfaces: [ obj ] } );

                // Handle prerendering: if disabled, create tooltip on the show event.
                if ( config.content.prerender === false && config.show.when.event !== false && config.show.ready !== true )
                {
                    config.show.when.target . bind ( config.show.when.event + '.qtip-' + id + '-create', { qtip: id }, function ( event )
                    {
                        // Retrieve the API interface using the stored qTip ID.
                        api = $ .fn.qtip.interfaces [ event.data.qtip ];

                        // Unbind the creation event and cache mouse coordinates for positioning.
                        api.options.show.when.target . unbind ( api.options.show.when.event + '.qtip-' + event.data.qtip + '-create' );
                        api.cache.mouse = { x: event.pageX, y: event.pageY };

                        // Construct the tooltip and trigger the initial show event.
                        construct . call ( api );
                        api.options.show.when.target . trigger ( api.options.show.when.event );
                    } );
                }

                // If prerendering is enabled, construct the tooltip immediately.
                else
                {
                    // Initialize mouse position cache to the top-left of the target element.
                    obj.cache.mouse = {
                        x: config.show.when.target . offset () . left,
                        y: config.show.when.target . offset () . top
                    };

                    // Construct the tooltip for immediate rendering.
                    construct . call ( obj );
                }
            }
            ; // End of qTip creation block
        } );
    }
    ; // End of $.fn.qtip

    // The qTip constructor function.
    function qTip ( target, options, id )
    {
        // Store a reference to 'this' for use in nested scopes.
        var self = this;

        // Initialize core properties for the qTip instance.
        self.id = id;
        self.options = options;
        self.status = {
            animated: false,
            rendered: false,
            disabled: false,
            focused: false
        };
        self.elements = {
            target: target . addClass ( self.options.style.classes.target ), // The element the tooltip is attached to.
            tooltip: null, // The main tooltip element.
            wrapper: null, // Wrapper element.
            content: null, // Content area.
            contentWrapper: null, // Content wrapper.
            title: null, // Title bar.
            button: null, // Close button.
            tip: null, // The pointer/tip element.
            bgiframe: null // Iframe for IE6 z-index fix.
        };
        self.cache = {
            mouse: {}, // Last known mouse position.
            position: {}, // Last known tooltip position.
            toggle: 0 // Toggle state.
        };
        self.timers = {}; // Stores various timers (e.g., show/hide delays).

        // Extend 'self' with API methods defined in options.
        $ . extend ( self, self.options.api,
        {
            // The 'show' API method.
            show: function ( event )
            {
                var returned, solo;

                // If the tooltip isn't rendered yet, log an error and return.
                if ( ! self.status.rendered )
                    return $ .fn.qtip.log.error . call ( self, 2, $ .fn.qtip.constants.TOOLTIP_NOT_RENDERED, 'show' );

                // If the tooltip is already visible, simply return 'self'.
                if ( self.elements.tooltip . css ( 'display' ) !== 'none' )
                    return self;

                // Stop any ongoing animations on the tooltip.
                self.elements.tooltip . stop ( true, false );

                // Call the 'beforeShow' callback. If it returns false, halt the show operation.
                returned = self . beforeShow . call ( self, event );
                if ( returned === false )
                    return self;

                // Inner function to be called after the show animation completes.
                function afterShow ()
                {
                    // If the tooltip is not static, bring it to the front.
                    if ( self.options.position.type !== 'static' )
                        self . focus ();
                    // Call the 'onShow' callback.
                    self . onShow . call ( self, event );

                    // IE7 fix: remove filter attribute to prevent anti-aliasing issues.
                    if ( $ . browser.msie )
                        self.elements.tooltip . get ( 0 ) . style . removeAttribute ( 'filter' );
                }
                ;

                // Update the toggle state.
                self.cache.toggle = 1;

                // Update tooltip position if it's not static and animation is needed.
                if ( self.options.position.type !== 'static' )
                    self . updatePosition ( event, ( self.options.show.effect.length > 0 ) );

                // Handle 'solo' option: hide other tooltips.
                if ( typeof self.options.show.solo == 'object' )
                    solo = $ ( self.options.show.solo );
                else if ( self.options.show.solo === true )
                    solo = $ ( 'div.qtip' ) . not ( self.elements.tooltip );

                if ( solo )
                    solo . each ( function () { if ( $ ( this ) . qtip ( 'api' ) . status . rendered === true ) $ ( this ) . qtip ( 'api' ) . hide (); } );

                // Animate the tooltip's appearance based on effect type.
                if ( typeof self.options.show.effect.type == 'function' )
                {
                    self.options.show.effect.type . call ( self.elements.tooltip, self.options.show.effect.length );
                    self.elements.tooltip . queue ( function () { afterShow (); $ ( this ) . dequeue (); } );
                }
                else
                {
                    switch ( self.options.show.effect.type . toLowerCase () )
                    {
                        case 'fade':
                            self.elements.tooltip . fadeIn ( self.options.show.effect.length, afterShow );
                            break;
                        case 'slide':
                            self.elements.tooltip . slideDown ( self.options.show.effect.length, function ()
                            {
                                afterShow ();
                                if ( self.options.position.type !== 'static' )
                                    self . updatePosition ( event, true );
                            } );
                            break;
                        case 'grow':
                            self.elements.tooltip . show ( self.options.show.effect.length, afterShow );
                            break;
                        default:
                            self.elements.tooltip . show ( null, afterShow );
                            break;
                    }
                    ;

                    // Add the active class to the tooltip.
                    self.elements.tooltip . addClass ( self.options.style.classes.active );
                }
                ;

                // Log the event and return the instance for chaining.
                return $ .fn.qtip.log.error . call ( self, 1, $ .fn.qtip.constants.EVENT_SHOWN, 'show' );
            },

            // The 'hide' API method.
            hide: function ( event )
            {
                var returned;

                // If the tooltip isn't rendered, log an error and return.
                if ( ! self.status.rendered )
                    return $ .fn.qtip.log.error . call ( self, 2, $ .fn.qtip.constants.TOOLTIP_NOT_RENDERED, 'hide' );

                // If the tooltip is already hidden, simply return 'self'.
                else if ( self.elements.tooltip . css ( 'display' ) === 'none' )
                    return self;

                // Clear any pending show timers and stop current animations.
                clearTimeout ( self.timers.show );
                self.elements.tooltip . stop ( true, false );

                // Call the 'beforeHide' callback. If it returns false, halt the hide operation.
                returned = self . beforeHide . call ( self, event );
                if ( returned === false )
                    return self;

                // Inner function to be called after the hide animation completes.
                function afterHide () { self . onHide . call ( self, event ); }
                ;

                // Reset the toggle state.
                self.cache.toggle = 0;

                // Animate the tooltip's disappearance based on effect type.
                if ( typeof self.options.hide.effect.type == 'function' )
                {
                    self.options.hide.effect.type . call ( self.elements.tooltip, self.options.hide.effect.length );
                    self.elements.tooltip . queue ( function () { afterHide (); $ ( this ) . dequeue (); } );
                }
                else
                {
                    switch ( self.options.hide.effect.type . toLowerCase () )
                    {
                        case 'fade':
                            self.elements.tooltip . fadeOut ( self.options.hide.effect.length, afterHide );
                            break;
                        case 'slide':
                            self.elements.tooltip . slideUp ( self.options.hide.effect.length, afterHide );
                            break;
                        case 'grow':
                            self.elements.tooltip . hide ( self.options.hide.effect.length, afterHide );
                            break;
                        default:
                            self.elements.tooltip . hide ( null, afterHide );
                            break;
                    }
                    ;

                    // Remove the active class from the tooltip.
                    self.elements.tooltip . removeClass ( self.options.style.classes.active );
                }
                ;

                // Log the event and return the instance for chaining.
                return $ .fn.qtip.log.error . call ( self, 1, $ .fn.qtip.constants.EVENT_HIDDEN, 'hide' );
            },

            // The 'updatePosition' API method, used to recalculate and set tooltip position.
            updatePosition: function ( event, animate )
            {
                var i, target, tooltip, coords, mapName, imagePos, newPosition, ieAdjust, ie6Adjust, borderAdjust, mouseAdjust, offset, curPosition, returned;

                // If tooltip not rendered, log error and exit.
                if ( ! self.status.rendered )
                    return $ .fn.qtip.log.error . call ( self, 2, $ .fn.qtip.constants.TOOLTIP_NOT_RENDERED, 'updatePosition' );

                // If tooltip is static, it cannot be positioned. Log and exit.
                else if ( self.options.position.type == 'static' )
                    return $ .fn.qtip.log.error . call ( self, 1, $ .fn.qtip.constants.CANNOT_POSITION_STATIC, 'updatePosition' );

                // Initialize objects to store target and tooltip properties.
                target = {
                    position: { left: 0, top: 0 },
                    dimensions: { height: 0, width: 0 },
                    corner: self.options.position.corner.target // Target corner.
                };
                tooltip = {
                    position: self . getPosition (), // Current tooltip position.
                    dimensions: self . getDimensions (), // Current tooltip dimensions.
                    corner: self.options.position.corner.tooltip // Tooltip corner.
                };

                // Determine target position and dimensions based on its type.
                if ( self.options.position.target !== 'mouse' ) // Target is an HTML element.
                {
                    // Special handling for AREA elements within an image map.
                    if ( self.options.position.target . get ( 0 ) . nodeName . toLowerCase () == 'area' )
                    {
                        coords = self.options.position.target . attr ( 'coords' ) . split ( ',' );
                        for ( i = 0; i < coords.length; i ++ )
                            coords [ i ] = parseInt ( coords [ i ] );

                        mapName = self.options.position.target . parent ( 'map' ) . attr ( 'name' );
                        imagePos = $ ( 'img[usemap="#' + mapName + '"]:first' ) . offset ();
                        target.position = {
                            left: Math . floor ( imagePos.left + coords [ 0 ] ),
                            top: Math . floor ( imagePos.top + coords [ 1 ] )
                        };

                        // Calculate dimensions based on area shape.
                        switch ( self.options.position.target . attr ( 'shape' ) . toLowerCase () )
                        {
                            case 'rect':
                                target.dimensions = {
                                    width: Math . ceil ( Math . abs ( coords [ 2 ] - coords [ 0 ] ) ),
                                    height: Math . ceil ( Math . abs ( coords [ 3 ] - coords [ 1 ] ) )
                                };
                                break;

                            case 'circle':
                                target.dimensions = {
                                    width: coords [ 2 ] + 1,
                                    height: coords [ 2 ] + 1
                                };
                                break;

                            case 'poly':
                                target.dimensions = {
                                    width: coords [ 0 ],
                                    height: coords [ 1 ]
                                };

                                for ( i = 0; i < coords.length; i ++ )
                                {
                                    if ( i % 2 == 0 )
                                    {
                                        if ( coords [ i ] > target.dimensions.width )
                                            target.dimensions.width = coords [ i ];
                                        if ( coords [ i ] < coords [ 0 ] )
                                            target.position.left = Math . floor ( imagePos.left + coords [ i ] );
                                    }
                                    else
                                    {
                                        if ( coords [ i ] > target.dimensions.height )
                                            target.dimensions.height = coords [ i ];
                                        if ( coords [ i ] < coords [ 1 ] )
                                            target.position.top = Math . floor ( imagePos.top + coords [ i ] );
                                    }
                                    ;
                                }
                                ;

                                target.dimensions.width = target.dimensions.width - ( target.position.left - imagePos.left );
                                target.dimensions.height = target.dimensions.height - ( target.position.top - imagePos.top );
                                break;

                            default:
                                return $ .fn.qtip.log.error . call ( self, 4, $ .fn.qtip.constants.INVALID_AREA_SHAPE, 'updatePosition' );
                                break;
                        }
                        ;

                        // Adjust position by 2 pixels (potential browser bug workaround).
                        target.dimensions.width -= 2;
                        target.dimensions.height -= 2;
                    }

                    // If the target is the document itself.
                    else if ( self.options.position.target . add ( document.body ) . length === 1 )
                    {
                        target.position = { left: $ ( document ) . scrollLeft (), top: $ ( document ) . scrollTop () };
                        target.dimensions = { height: $ ( window ) . height (), width: $ ( window ) . width () };
                    }

                    // For regular HTML elements.
                    else
                    {
                        // If target is another qTip, use its cached position (if animated).
                        if ( typeof self.options.position.target . attr ( 'qtip' ) !== 'undefined' )
                            target.position = self.options.position.target . qtip ( 'api' ) . cache.position;
                        else
                            target.position = self.options.position.target . offset ();

                        // Get dimensions of the target element.
                        target.dimensions = {
                            height: self.options.position.target . outerHeight (),
                            width: self.options.position.target . outerWidth ()
                        };
                    }
                    ;

                    // Calculate the final target corner position.
                    newPosition = $ . extend ( {}, target.position );
                    if ( target.corner . search ( /right/i ) !== -1 )
                        newPosition.left += target.dimensions.width;

                    if ( target.corner . search ( /bottom/i ) !== -1 )
                        newPosition.top += target.dimensions.height;

                    if ( target.corner . search ( /((top|bottom)Middle)|center/ ) !== -1 )
                        newPosition.left += ( target.dimensions.width / 2 );

                    if ( target.corner . search ( /((left|right)Middle)|center/ ) !== -1 )
                        newPosition.top += ( target.dimensions.height / 2 );
                }

                // If 'mouse' is the target, use current mouse coordinates.
                else
                {
                    target.position = newPosition = { left: self.cache.mouse.x, top: self.cache.mouse.y };
                    target.dimensions = { height: 1, width: 1 };
                }
                ;

                // Adjust newPosition based on the tooltip's corner.
                if ( tooltip.corner . search ( /right/i ) !== -1 )
                    newPosition.left -= tooltip.dimensions.width;

                if ( tooltip.corner . search ( /bottom/i ) !== -1 )
                    newPosition.top -= tooltip.dimensions.height;

                if ( tooltip.corner . search ( /((top|bottom)Middle)|center/ ) !== -1 )