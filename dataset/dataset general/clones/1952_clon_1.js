/*
 * jQuery UI 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * This file is part of the jQuery UI library.
 * For more information, visit: http://docs.jquery.com/UI
 */
; jQuery .ui  ||  ( function( $ ) {

    // Preserve the original remove method for later use.
    var     _remove = $.fn.remove,

            isFF2   = $.browser.mozilla  &&  ( parseFloat( $.browser.version )  <  1.9 ) ;

    /*
     *  Helper functions and the main ui object.
     *  This object contains various utility methods and properties
     *  used throughout the jQuery UI library.
     */
    $.ui  =  {
        version : "1.7.1", /* Current version of jQuery UI */

        /**
         *  Plugin management.
         *  Note: $.ui.plugin is deprecated. Developers should use the proxy pattern instead.
         */
        plugin :  {

            add : function( module, option, set ) {
                var     proto = $.ui[ module ].prototype;
                for ( var i  in  set ) {
                    proto.plugins[i] = proto.plugins[i]  ||  [ ] ;
                    proto.plugins[i].push( [ option, set[i] ] ) ;
                }
            },

            call : function( instance, name, args ) {
                var set = instance.plugins[ name ] ;
                // If no plugin set or element is detached, do nothing.
                if ( ! set  ||  ! instance.element[0].parentNode ) {
                    return;
                }

                for ( var i = 0 ;  i < set.length ;  i++ ) {
                    // Execute the plugin callback if the option is enabled.
                    if ( instance.options[ set[i][0] ] ) {
                        set[i][1].apply( instance.element, args );
                    }
                }
            }
        },

        /*
         *  Checks if element 'a' contains element 'b'.
         *  Uses compareDocumentPosition for modern browsers, falls back to contains for others.
         */
        contains : function( a, b ) {
            return document.compareDocumentPosition
                ? a.compareDocumentPosition( b )  &  16
                : a  !==  b  &&  a.contains( b ) ;
        },

        /*
         *  Determines if an element has scrollable content.
         *  @param el The element to check.
         *  @param a Optional, specifies 'left' for horizontal scroll, otherwise checks vertical.
         */
        hasScroll : function( el, a ) {

            // If overflow is hidden, visually there's no scroll, even if content is larger.
            if ( $( el ).css( 'overflow' )  ==  'hidden' ) {
                return false;
            }

            var     scroll  =  ( a  &&  a  ==  'left' )  ?  'scrollLeft'  :  'scrollTop',
                    has     =  false;

            // If scroll position is already greater than 0, it's scrollable.
            if ( el[ scroll ]  >  0 ) {
                return true;
            }

            // TODO: Investigate edge cases where this is needed.
            // Temporarily set scroll to 1 to check if it moves, then reset.
            el[ scroll ]  =  1 ;
            has           =  ( el[ scroll ]  >  0 ) ;
            el[ scroll ]  =  0 ;
            return has;
        },

        /*
         *  Checks if a coordinate 'x' is within a given axis range.
         *  @param x The coordinate.
         *  @param reference The starting point of the axis.
         *  @param size The length of the axis.
         */
        isOverAxis : function( x, reference, size ) {
            return ( x  >  reference )  &&  ( x  <  ( reference  +  size ) ) ;
        },

        /*
         *  Checks if a point (y, x) is over a given rectangular area.
         *  @param y The Y coordinate.
         *  @param x The X coordinate.
         *  @param top The top position of the area.
         *  @param left The left position of the area.
         *  @param height The height of the area.
         *  @param width The width of the area.
         */
        isOver : function( y, x, top, left, height, width ) {
            return $.ui.isOverAxis( y, top, height )  &&  $.ui.isOverAxis( x, left, width ) ;
        },

        /*
         *  Key code constants for various keyboard keys.
         */
        keyCode : {
            BACKSPACE      : 8,
            CAPS_LOCK      : 20,
            COMMA          : 188,
            CONTROL        : 17,
            DELETE         : 46,
            DOWN           : 40,
            END            : 35,
            ENTER          : 13,
            ESCAPE         : 27,
            HOME           : 36,
            INSERT         : 45,
            LEFT           : 37,
            NUMPAD_ADD     : 107,
            NUMPAD_DECIMAL : 110,
            NUMPAD_DIVIDE  : 111,
            NUMPAD_ENTER   : 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN      : 34,
            PAGE_UP        : 33,
            PERIOD         : 190,
            RIGHT          : 39,
            SHIFT          : 16,
            SPACE          : 32,
            TAB            : 9,
            UP             : 38
        }
    };

/* WAI-ARIA normalization logic */
if  ( isFF2 ) {
    // Cache original jQuery methods before overriding for ARIA compatibility.
    var     attr       = $.attr,
            removeAttr = $.fn.removeAttr,
            ariaNS     = "http://www.w3.org/2005/07/aaa", // ARIA namespace URI
            ariaState  = /^aria-/,                        // Regex for ARIA state attributes
            ariaRole   = /^wairole:/;                     // Regex for ARIA role attributes

    /*
     *  Overrides $.attr to handle WAI-ARIA attributes correctly,
     *  especially for Firefox 2 which has specific ARIA handling.
     */
    $.attr = function( elem, name, value ) {
        // Determine if a value is being set or if it's a getter call.
        var set = value  !==  undefined;

        // Handle 'role' attribute specifically.
        return ( name  ==  'role'
            ? ( set
                ? attr.call( this, elem, name, "wairole:"  +  value ) // Set role with 'wairole:' prefix.
                : ( attr.apply( this, arguments )  ||  "" ).replace( ariaRole, "" ) ) // Get role, remove prefix.
            : ( ariaState.test( name ) // Handle other ARIA state attributes.
                ? ( set
                    ? elem.setAttributeNS( ariaNS,
                        name.replace( ariaState, "aaa:" ), value ) // Set ARIA state with namespace.
                    : attr.call( this, elem, name.replace( ariaState, "aaa:" ) ) ) // Get ARIA state.
                : attr.apply( this, arguments ) ) ) ; // Fallback to original $.attr for non-ARIA attributes.
    };

    /*
     *  Overrides $.fn.removeAttr to correctly remove WAI-ARIA attributes with namespace.
     */
    $.fn.removeAttr = function( name ) {
        // If it's an ARIA state attribute, use removeAttributeNS.
        return ( ariaState.test( name )
            ? this.each( function( ) {
                this.removeAttributeNS( ariaNS, name.replace( ariaState, "" ) ) ;
            } ) : removeAttr.call( this, name ) ) ; // Otherwise, call original removeAttr.
    };
}

// Extending jQuery's prototype with custom utility methods.
$.fn.extend( {

    /*
     *  Custom `remove` method for jQuery elements.
     *  Ensures that 'remove' events are triggered on elements and their descendants
     *  before actual DOM removal to allow widgets to clean up.
     *  This addresses issues like Safari's native 'remove' event.
     */
    remove : function( ) {
        // Trigger a custom 'remove' handler on all descendants and the element itself.
        $( "*", this ).add( this ).each( function( ) {
            $( this ).triggerHandler( "remove" ) ;
        } ) ;
        // Call the original jQuery remove method to perform the actual DOM removal.
        return _remove.apply( this, arguments ) ;
    },

    /**
     *  Enables text selection on the matched elements.
     *  Resets 'unselectable' attribute and 'MozUserSelect' style,
     *  and unbinds the 'selectstart.ui' event handler.
     */
    enableSelection : function( ) {
        return this
            .attr( 'unselectable', 'off' ) // Set unselectable to 'off' for IE.
            .css( 'MozUserSelect', '' )    // Reset 'MozUserSelect' for Firefox.
            .unbind( 'selectstart.ui' )    // Remove custom selectstart handler.
            ;
    },

    /*
     *  Disables text selection on the matched elements.
     *  Sets 'unselectable' attribute and 'MozUserSelect' style,
     *  and binds an event handler to prevent 'selectstart'.
     */
    disableSelection : function( ) {
        return this
            .attr( 'unselectable', 'on' )          // Set unselectable to 'on' for IE.
            .css( 'MozUserSelect', 'none' )        // Set 'MozUserSelect' to 'none' for Firefox.
            .bind( 'selectstart.ui', function( ) { // Prevent selection for other browsers.
                return false;
            } ) ;
    },

    /*
     *  Finds the first scrollable parent of the element.
     *  Considers both position and overflow properties.
     */
    scrollParent : function( ) {
        var scrollParent;

        // Special handling for IE and absolutely positioned elements.
        if ( ( $.browser.msie  &&  ( /(static|relative)/ ).test( this.css( 'position' ) ) )  ||  ( /absolute/ ).test( this.css( 'position' ) ) ) {
            scrollParent = this.parents( ) .filter( function( ) {
                return ( /(relative|absolute|fixed)/ ).test( $.curCSS( this, 'position', 1 ) )  &&
                       ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) ) ;
            } ) .eq( 0 ) ;
        } else {
            // General case for finding scrollable parents.
            scrollParent = this.parents( ) .filter( function( ) {
                return ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) ) ;
            } ) .eq( 0 ) ;
        }

        // If element is fixed or no scrollable parent found, return $(document).
        return ( /fixed/ ).test( this.css( 'position' ) )  ||  ! scrollParent.length  ?  $( document )  :  scrollParent ;
    }
} ) ;

/* Additional custom selectors for jQuery */
$.extend( $.expr[ ':' ], {

    /*
     *  Selector: `:data(key)`
     *  Checks if an element has data associated with a given key.
     *  @param elem The DOM element.
     *  @param i The index of the element in the matched set.
     *  @param match The match array from the selector regex.
     *  @returns Boolean indicating if data exists.
     */
    data : function( elem, i, match ) {
        return !! $.data( elem, match[ 3 ] ) ;
    },

    /*
     *  Selector: `:focusable`
     *  Determines if an element can receive keyboard focus.
     *  Considers element type, disabled state, tabindex, and visibility.
     */
    focusable : function( element ) {
        var     nodeName = element.nodeName.toLowerCase( ),
                tabIndex = $.attr( element, 'tabindex' ) ; // Get tabindex value.

        // Logic to determine focusability based on element type and attributes.
        return ( /input|select|textarea|button|object/ .test( nodeName )
            ? ! element.disabled // Input-like elements are focusable if not disabled.
            : 'a'  ==  nodeName  ||  'area'  ==  nodeName // Anchor or area elements.
                ? element.href  ||  ! isNaN( tabIndex ) // Focusable if has href or valid tabindex.
                : ! isNaN( tabIndex ) ) // Other elements focusable if has valid tabindex.
            // Additionally, the element and all its ancestors must be visible.
            // Note: Browser might report area as hidden, special handling.
            &&  ! $( element ) [ 'area'  ==  nodeName  ?  'parents'  :  'closest' ]( ':hidden' ) .length ;
    },

    /*
     *  Selector: `:tabbable`
     *  Determines if an element is focusable via the tab key.
     *  An element is tabbable if it has a tabindex of 0 or greater, and is focusable.
     */
    tabbable : function( element ) {
        var tabIndex = $.attr( element, 'tabindex' ) ;
        return ( isNaN( tabIndex )  ||  tabIndex  >=  0 )  &&  $( element ) .is( ':focusable' ) ;
    }
} ) ;

/*
 *  $.widget is a factory function designed to simplify the creation of jQuery UI plugins.
 *  It handles much of the boilerplate code involved in plugin development.
 */

/**
 *  Internal helper function to check if a method is a getter.
 *  @param namespace The widget's namespace (e.g., 'ui').
 *  @param plugin The widget's name (e.g., 'dialog').
 *  @param method The method name being called.
 *  @param args The arguments passed to the method.
 *  @returns True if the method is a getter, false otherwise.
 */
function getter ( namespace, plugin, method, args ) {

    // Helper to retrieve method names defined as getters or getterSetters.
    function getMethods( type ) {
        var methods = $[ namespace ][ plugin ][ type ]  ||  [ ] ;
        return ( typeof methods  ==  'string'  ?  methods.split( /,?\s+/ )  :  methods ) ;
    }

    var methods = getMethods( 'getter' ) ;
    // If only one argument and it's a string, consider getterSetters too.
    if ( args.length  ==  1  &&  typeof args[ 0 ]  ==  'string' ) {
        methods = methods.concat( getMethods( 'getterSetter' ) ) ;
    }
    // Check if the method exists in the list of recognized getters.
    return ( $.inArray( method, methods )  !=  -1 ) ;
}

/*
 *  The main $.widget factory function.
 *  Creates a new jQuery UI widget constructor and registers it as a jQuery plugin.
 *  @param name The full name of the widget (e.g., "ui.dialog").
 *  @param prototype An object containing the widget's methods and properties.
 */
$.widget = function ( name, prototype ) {
    var     namespace = name.split( "." ) [ 0 ] ;
    name              = name.split( "." ) [ 1 ] ;

    // Create the jQuery plugin method (e.g., $.fn.dialog).
    $.fn[ name ] = function( options ) {
        var     isMethodCall = ( typeof options  ==  'string' ),
                args         = Array.prototype.slice.call( arguments, 1 ) ;

        // Prevent direct calls to internal methods (methods starting with '_').
        if ( isMethodCall  &&  options.substring( 0, 1 )  ==  '_' ) {
            return this;
        }

        // Handle getter methods: call the method on the first instance and return its value.
        if ( isMethodCall  &&  getter( namespace, name, options, args ) ) {
            var instance = $.data( this[ 0 ], name ) ;
            return ( instance  ?  instance[ options ].apply( instance, args )
                : undefined ) ;
        }

        // Handle widget initialization or non-getter method calls.
        return this.each( function( ) {
            var instance = $.data( this, name ) ;

            // If no instance exists and it's not a method call, initialize the widget.
            ( ! instance  &&  ! isMethodCall  &&
                $.data( this, name, new $[ namespace ][ name ]( this, options ) ) ._init( ) ) ;

            // If an instance exists, it's a method call, and the method exists, call it.
            ( instance  &&  isMethodCall  &&  $.isFunction( instance[ options ] )  &&
                instance[ options ].apply( instance, args ) ) ;
        } ) ;
    };

    // Create the widget constructor function in the specified namespace.
    $[ namespace ] = $[ namespace ]  ||  { } ;
    $[ namespace ][ name ] = function( element, options ) {
        var self = this;

        this.namespace       = namespace;
        this.widgetName      = name;
        this.widgetEventPrefix = $[ namespace ][ name ].eventPrefix  ||  name;
        this.widgetBaseClass = namespace  +  '-'  +  name;

        // Merge default options, widget-specific defaults, metadata, and user-provided options.
        this.options = $.extend( { },
            $.widget.defaults,
            $[ namespace ][ name ].defaults,
            $.metadata  &&  $.metadata.get( element ) [ name ],
            options ) ;

        this.element = $( element )
            // Bind a custom 'setData' event for setting options.
            .bind( 'setData.'  +  name, function( event, key, value ) {
                if ( event.target  ==  element ) {
                    return self._setData( key, value ) ;
                }
            } )
            // Bind a custom 'getData' event for retrieving options.
            .bind( 'getData.'  +  name, function( event, key ) {
                if ( event.target  ==  element ) {
                    return self._getData( key ) ;
                }
            } )
            // Bind to the 'remove' event for widget cleanup.
            .bind( 'remove', function( ) {
                return self.destroy( ) ;
            } ) ;
    };

    // Extend the widget's prototype with the base widget prototype and the provided prototype.
    $[ namespace ][ name ].prototype = $.extend( { }, $.widget.prototype, prototype ) ;

    // TODO: Consider merging getter and getterSetter properties from both widget and plugin prototypes.
    // This property defines the default method to be treated as a getter/setter.
    $[ namespace ][ name ].getterSetter = 'option' ;
} ;

/*
 *  The base prototype for all jQuery UI widgets.
 *  Contains common methods and properties shared by all widgets.
 */
$.widget.prototype = {
    // _init is called after the widget is created. Meant for initialization logic.
    _init : function( ) {
        // Default implementation is empty. Widgets should override this.
    },

    /*
     *  Destroys the widget instance.
     *  Removes associated data, CSS classes, and ARIA attributes.
     *  Widgets should override this to perform specific cleanup.
     */
    destroy : function( ) {
        this.element.removeData( this.widgetName )
            .removeClass( this.widgetBaseClass  +  '-disabled'  +  ' '  +  this.namespace  +  '-state-disabled' )
            .removeAttr( 'aria-disabled' ) ;
    },

    /*
     *  Gets or sets options for the widget.
     *  Can be called with a key to get a single option, or a key-value pair/object to set options.
     */
    option : function( key, value ) {
        var     options = key,
                self    = this; // Cache 'this' for use in callbacks.

        if ( typeof key  ==  "string" ) {
            // If only 'key' is provided, it's a getter.
            if ( value  ===  undefined ) {
                return this._getData( key ) ;
            }
            // If 'key' and 'value' are provided, prepare for setting.
            options       = { } ;
            options[ key ] = value ;
        }

        // Iterate over the options (either single or multiple) and set each.
        $.each( options, function( key, value ) {
            self._setData( key, value ) ;
        } ) ;
    },

    /*
     *  Internal method to retrieve an option's value.
     *  @param key The name of the option.
     *  @returns The value of the option.
     */
    _getData : function( key ) {
        return this.options[ key ] ;
    },

    /*
     *  Internal method to set an option's value.
     *  Handles special cases like the 'disabled' option, which affects element classes and ARIA attributes.
     *  @param key The name of the option.
     *  @param value The new value for the option.
     */
    _setData : function( key, value ) {
        this.options[ key ] = value ;

        // Special handling for the 'disabled' option.
        if ( key  ==  'disabled' ) {
            this.element
                [ value  ?  'addClass'  :  'removeClass' ]( // Add or remove disabled classes.
                    this.widgetBaseClass  +  '-disabled'  +  ' '  +
                    this.namespace  +  '-state-disabled' )
                .attr( "aria-disabled", value ) ; // Update ARIA disabled attribute.
        }
    },

    /*
     *  Enables the widget.
     *  Sets the 'disabled' option to false.
     */
    enable : function( ) {
        this._setData( 'disabled', false ) ;
    },

    /*
     *  Disables the widget.
     *  Sets the 'disabled' option to true.
     */
    disable : function( ) {
        this._setData( 'disabled', true ) ;
    },

    /*
     *  Triggers a custom event on the widget's element.
     *  Handles event bubbling, default prevention, and callback execution.
     *  @param type The type of event (e.g., 'change').
     *  @param event The original browser event (optional).
     *  @param data Additional data to pass to the event handler.
     *  @returns False if the event was prevented or a callback returned false, true otherwise.
     */
    _trigger : function( type, event, data ) {
        var     callback  =  this.options[ type ], // Get the callback function from options.
                eventName = ( type  ==  this.widgetEventPrefix
                    ? type  :  this.widgetEventPrefix  +  type ) ; // Construct full event name.

        event      = $.Event( event ) ; // Create a jQuery event object.
        event.type = eventName ;        // Set the event type.

        // Copy original event properties to the new event object.
        // This is a workaround as $.event.fix cannot be called multiple times.
        if ( event.originalEvent ) {
            for ( var i = $.event.props.length, prop ;  i ; ) {
                prop          = $.event.props[ --i ] ;
                event[ prop ] = event.originalEvent[ prop ] ;
            }
        }

        this.element.trigger( event, data ) ; // Trigger the event on the element.

        // Return value indicates if default action should proceed.
        return ! ( $.isFunction( callback )  &&  callback.call( this.element[ 0 ], event, data )  ===  false
            ||  event.isDefaultPrevented( ) ) ;
    }
} ;

/* Default options for all widgets. */
$.widget.defaults = {
    disabled : false // Default state is enabled.
} ;

/*
 *  Mouse Interaction Plugin:
 *  Provides a standardized way for widgets to handle mouse interactions,
 *  including drag, click prevention, and delay/distance thresholds.
 */
$.ui.mouse = {

    /*
     *  Initializes mouse event handlers for the widget.
     *  Binds mousedown and click events to the widget's element.
     */
    _mouseInit : function( ) {
        var self = this ; // Store reference to 'this' for use in event handlers.

        this.element
            .bind( 'mousedown.' + this.widgetName, function( event ) {
                return self._mouseDown( event ) ; // Delegate mousedown to _mouseDown.
            } )
            .bind( 'click.' + this.widgetName, function( event ) {
                // Prevent immediate click events if a drag operation was initiated.
                if ( self._preventClickEvent ) {
                    self._preventClickEvent = false ;
                    event.stopImmediatePropagation( ) ; // Stop event from bubbling further.
                    return false ;
                }
            } ) ;

        // For Internet Explorer, prevent text selection during mouse interactions.
        if ( $.browser.msie ) {
            this._mouseUnselectable = this.element.attr( 'unselectable' ) ; // Store original state.
            this.element.attr( 'unselectable', 'on' ) ;                    // Set to 'on'.
        }

        this.started = false ; // Flag to track if a mouse interaction has started.
    },

    // TODO: Ensure that destroying one mouse instance does not interfere with other instances.
    /*
     *  Cleans up mouse event handlers.
     *  Unbinds events and restores original text selection behavior in IE.
     */
    _mouseDestroy : function( ) {
        this.element.unbind( '.' + this.widgetName ) ; // Unbind all events prefixed with widgetName.

        // Restore text selection setting in IE if it was modified.
        ( $.browser.msie
            &&  this.element.attr( 'unselectable', this._mouseUnselectable ) ) ;
    },

    /*
     *  Handles the initial mousedown event.
     *  Determines if a mouse interaction should begin, considering cancel selectors,
     *  delay, and distance thresholds.
     */
    _mouseDown : function( event ) {
        // Prevent multiple widgets from handling the same mouseStart event.
        // TODO: Investigate why originalEvent is sometimes required here.
        event.originalEvent = event.originalEvent  ||  { } ;
        if ( event.originalEvent.mouseHandled ) { return ; }

        // If a previous mouse interaction was started but mouseup was missed (e.g., out of window).
        ( this._mouseStarted  &&  this._mouseUp( event ) ) ;

        this._mouseDownEvent = event ; // Store the initial mousedown event.

        var     self        = this,
                btnIsLeft   = ( event.which  ==  1 ), // Check if left mouse button is pressed.
                elIsCancel  = ( typeof this.options.cancel  ==  "string"
                    ? $( event.target ).parents( ).add( event.target ).filter( this.options.cancel ).length
                    : false ) ; // Check if target matches a cancel selector.

        // If not left button, or element is a cancel element, or _mouseCapture returns false, abort.
        if ( ! btnIsLeft  ||  elIsCancel  ||  ! this._mouseCapture( event ) ) {
            return true ; // Allow default browser behavior.
        }

        this.mouseDelayMet = ! this.options.delay ; // Check if delay threshold is met immediately.
        if ( ! this.mouseDelayMet ) {
            this._mouseDelayTimer = setTimeout( function( ) {
                self.mouseDelayMet = true ; // Set flag after delay.
            }, this.options.delay ) ;
        }

        // If distance and delay thresholds are met, attempt to start the interaction.
        if ( this._mouseDistanceMet( event )  &&  this._mouseDelayMet( event ) ) {
            this._mouseStarted = ( this._mouseStart( event )  !==  false ) ;
            if ( ! this._mouseStarted ) {
                event.preventDefault( ) ;
                return true ;
            }
        }

        // Create delegated functions to maintain 'this' context for mousemove and mouseup.
        this._mouseMoveDelegate = function( event ) {
            return self._mouseMove( event ) ;
        } ;
        this._mouseUpDelegate = function( event ) {
            return self._mouseUp( event ) ;
        } ;

        // Bind global mousemove and mouseup handlers.
        $( document )
            .bind( 'mousemove.' + this.widgetName, this._mouseMoveDelegate )
            .bind( 'mouseup.' + this.widgetName, this._mouseUpDelegate ) ;

        // Prevent default text selection behavior.
        // Safari requires special handling to allow select boxes to remain selectable.
        ( $.browser.safari  ||  event.preventDefault( ) ) ;

        event.originalEvent.mouseHandled = true ; // Mark event as handled.
        return true ;
    },

    /*
     *  Handles mousemove events during an active mouse interaction.
     *  Triggers _mouseDrag or _mouseStart based on thresholds.
     */
    _mouseMove : function( event ) {
        // IE specific: check if mouseup happened outside the window (button property is 0).
        if ( $.browser.msie  &&  ! event.button ) {
            return this._mouseUp( event ) ;
        }

        if ( this._mouseStarted ) {
            this._mouseDrag( event ) ; // If already started, perform drag.
            return event.preventDefault( ) ;
        }

        // If not started but thresholds are met, attempt to start.
        if ( this._mouseDistanceMet( event )  &&  this._mouseDelayMet( event ) ) {
            this._mouseStarted =
                ( this._mouseStart( this._mouseDownEvent, event )  !==  false ) ;
            // If started successfully, drag; otherwise, clean up.
            ( this._mouseStarted  ?  this._mouseDrag( event )  :  this._mouseUp( event ) ) ;
        }

        return ! this._mouseStarted ; // Return true if not started, false if started.
    },

    /*
     *  Handles mouseup events, ending the mouse interaction.
     *  Unbinds global handlers and triggers _mouseStop.
     */
    _mouseUp : function( event ) {
        $( document )
            .unbind( 'mousemove.' + this.widgetName, this._mouseMoveDelegate )
            .unbind( 'mouseup.' + this.widgetName, this._mouseUpDelegate ) ;

        if ( this._mouseStarted ) {
            this._mouseStarted      = false ;
            // Prevent click event if the mouseup happened on the same element as mousedown.
            this._preventClickEvent = ( event.target  ==  this._mouseDownEvent.target ) ;
            this._mouseStop( event ) ; // Trigger the stop handler.
        }

        return false ; // Prevent default browser behavior.
    },

    /*
     *  Checks if the mouse has moved beyond the specified distance threshold.
     *  @param event The current mousemove event.
     *  @returns True if distance is met, false otherwise.
     */
    _mouseDistanceMet : function( event ) {
        return ( Math.max(
                Math.abs( this._mouseDownEvent.pageX  -  event.pageX ),
                Math.abs( this._mouseDownEvent.pageY  -  event.pageY )
            )  >=  this.options.distance
        ) ;
    },

    // The following methods (_mouseCapture, _mouseStart, _mouseDrag, _mouseStop, _mouseDelayMet)
    // are placeholder methods. They are intended to be overridden by individual widgets
    // that utilize this mouse interaction plugin to define their specific behavior.
    _mouseCapture    : function( event ) { return true; }, // Should return true to start interaction, false to prevent.
    _mouseStart      : function( event ) { return true; }, // Called when interaction begins.
    _mouseDrag       : function( event ) { },              // Called during drag.
    _mouseStop       : function( event ) { },              // Called when interaction ends.
    _mouseDelayMet   : function( event ) { return true; }  // Additional delay check.
};

} ) ( jQuery ) ; // End of the self-executing anonymous function.