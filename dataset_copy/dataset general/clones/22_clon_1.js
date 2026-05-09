/*
 * jQuery Widget factory core module.
 * This code initializes the jQuery UI Widget factory, ensuring compatibility
 * with AMD (Asynchronous Module Definition) environments like RequireJS,
 * and provides foundational methods for creating stateful jQuery plugins.
 */
( function ( e ) {
    "function" == typeof define && define.amd ? define( [ "jquery" ], e ) : e( jQuery );
} )( function ( e ) {
    var t = 0; /* Unique ID counter for widgets */
    var i = Array.prototype.slice; /* Reference to Array.prototype.slice for argument handling */

    // Override jQuery's cleanData to allow widgets to perform cleanup actions.
    e.cleanData = ( function ( t_originalCleanData ) {
        return function ( i_elements ) {
            var s_eventsData, n_element, a_index;
            for ( a_index = 0; null != ( n_element = i_elements[ a_index ] ); a_index++ ) {
                try {
                    s_eventsData = e._data( n_element, "events" );
                    s_eventsData && s_eventsData.remove && e( n_element ).triggerHandler( "remove" );
                } catch ( o_error ) { /* Suppress errors during cleanup */ }
            }
            t_originalCleanData( i_elements ); // Call the original cleanData method.
        };
    } )( e.cleanData );

    // The main widget factory function.
    e.widget = function ( t_fullName, i_baseWidget, s_prototype ) {
        var n_widgetFullName, a_parentWidget, o_newWidgetConstructor, r_baseInstance, h_protoMethods = {};
        var l_namespace = t_fullName.split( "." )[ 0 ];

        t_fullName = t_fullName.split( "." )[ 1 ]; // Extract widget name.
        n_widgetFullName = l_namespace + "-" + t_fullName; // Create full widget name (e.g., "ui-button").

        // If no base widget is provided, assume it's the default jQuery.Widget.
        if ( !s_prototype ) {
            s_prototype = i_baseWidget;
            i_baseWidget = e.Widget;
        }

        // Add a custom selector for this widget.
        e.expr[ ":" ][ n_widgetFullName.toLowerCase() ] = function ( t_element ) {
            return !!e.data( t_element, n_widgetFullName );
        };

        // Ensure the namespace object exists (e.g., `e.ui`).
        e[ l_namespace ] = e[ l_namespace ] || {};

        a_parentWidget = e[ l_namespace ][ t_fullName ]; // Reference to the parent constructor if extending.

        // Define the new widget constructor.
        o_newWidgetConstructor = e[ l_namespace ][ t_fullName ] = function ( e_element, t_options ) {
            if ( this._createWidget ) {
                if ( arguments.length ) {
                    this._createWidget( e_element, t_options );
                }
                return void 0;
            } else {
                return new o_newWidgetConstructor( e_element, t_options );
            }
        };

        // Extend the new constructor with static properties from the parent and prototype.
        e.extend( o_newWidgetConstructor, a_parentWidget, {
            version: s_prototype.version,
            _proto: e.extend( {}, s_prototype ), // Store a copy of the prototype for potential future extensions.
            _childConstructors: [] // Keep track of widgets that extend this one.
        } );

        // Create an instance of the base widget to inherit options.
        r_baseInstance = new i_baseWidget();
        r_baseInstance.options = e.widget.extend( {}, r_baseInstance.options );

        // Iterate over the prototype methods and wrap them to enable `_super` and `_superApply`.
        e.each( s_prototype, function ( t_methodName, s_method ) {
            if ( e.isFunction( s_method ) ) {
                h_protoMethods[ t_methodName ] = ( function () {
                    var e_superMethod = function () {
                        return i_baseWidget.prototype[ t_methodName ].apply( this, arguments );
                    };
                    var n_superApplyMethod = function ( e_args ) {
                        return i_baseWidget.prototype[ t_methodName ].apply( this, e_args );
                    };
                    return function () {
                        var t_oldSuper = this._super;
                        var i_oldSuperApply = this._superApply;
                        var a_result;

                        this._super = e_superMethod;
                        this._superApply = n_superApplyMethod;

                        a_result = s_method.apply( this, arguments );

                        this._super = t_oldSuper;
                        this._superApply = i_oldSuperApply;

                        return a_result;
                    };
                } )();
                return void 0;
            } else {
                h_protoMethods[ t_methodName ] = s_method;
                return void 0;
            }
        } );

        // Extend the new widget's prototype with base options and new methods.
        o_newWidgetConstructor.prototype = e.widget.extend( r_baseInstance, {
            widgetEventPrefix: a_parentWidget ? r_baseInstance.widgetEventPrefix || t_fullName : t_fullName
        }, h_protoMethods, {
            constructor: o_newWidgetConstructor,
            namespace: l_namespace,
            widgetName: t_fullName,
            widgetFullName: n_widgetFullName
        } );

        // If extending an existing widget, re-bridge its children.
        if ( a_parentWidget ) {
            e.each( a_parentWidget._childConstructors, function ( t_index, i_childConstructor ) {
                var s_childPrototype = i_childConstructor.prototype;
                e.widget( s_childPrototype.namespace + "." + s_childPrototype.widgetName, o_newWidgetConstructor, i_childConstructor._proto );
            } );
            delete a_parentWidget._childConstructors;
        } else {
            i_baseWidget._childConstructors.push( o_newWidgetConstructor );
        }

        // Bridge the new widget to jQuery's prototype (`$.fn`).
        e.widget.bridge( t_fullName, o_newWidgetConstructor );

        return o_newWidgetConstructor;
    };

    // Utility function for extending widget options, handling deep merges.
    e.widget.extend = function ( t_target ) {
        var s_property, n_value, a_sources = i.call( arguments, 1 );
        var o_idx = 0;
        var r_len = a_sources.length;

        for ( ; r_len > o_idx; o_idx++ ) {
            for ( s_property in a_sources[ o_idx ] ) {
                n_value = a_sources[ o_idx ][ s_property ];
                if ( a_sources[ o_idx ].hasOwnProperty( s_property ) && void 0 !== n_value ) {
                    t_target[ s_property ] = e.isPlainObject( n_value ) ? ( e.isPlainObject( t_target[ s_property ] ) ? e.widget.extend( {}, t_target[ s_property ], n_value ) : e.widget.extend( {}, n_value ) ) : n_value;
                }
            }
        }
        return t_target;
    };

    // Bridges a widget constructor to `jQuery.fn`, making it a jQuery plugin.
    e.widget.bridge = function ( t_widgetName, s_widgetConstructor ) {
        var n_fullWidgetName = s_widgetConstructor.prototype.widgetFullName || t_widgetName;
        e.fn[ t_widgetName ] = function ( a_methodOrOptions ) {
            var o_isString = "string" == typeof a_methodOrOptions;
            var r_args = i.call( arguments, 1 );
            var h_result = this;

            a_methodOrOptions = !o_isString && r_args.length ? e.widget.extend.apply( null, [ a_methodOrOptions ].concat( r_args ) ) : a_methodOrOptions;

            if ( o_isString ) {
                this.each( function () {
                    var i_methodResult, s_instance = e.data( this, n_fullWidgetName );

                    if ( "instance" === a_methodOrOptions ) {
                        h_result = s_instance;
                        return false;
                    }

                    if ( s_instance ) {
                        if ( e.isFunction( s_instance[ a_methodOrOptions ] ) && "_" !== a_methodOrOptions.charAt( 0 ) ) {
                            i_methodResult = s_instance[ a_methodOrOptions ].apply( s_instance, r_args );
                            if ( i_methodResult !== s_instance && void 0 !== i_methodResult ) {
                                h_result = i_methodResult && i_methodResult.jquery ? h_result.pushStack( i_methodResult.get() ) : i_methodResult;
                                return false;
                            }
                        } else {
                            e.error( "no such method '" + a_methodOrOptions + "' for " + t_widgetName + " widget instance" );
                        }
                    } else {
                        e.error( "cannot call methods on " + t_widgetName + " prior to initialization; " + "attempted to call method '" + a_methodOrOptions + "'" );
                    }
                } );
            } else {
                this.each( function () {
                    var t_instance = e.data( this, n_fullWidgetName );
                    if ( t_instance ) {
                        t_instance.option( a_methodOrOptions || {} );
                        t_instance._init && t_instance._init();
                    } else {
                        e.data( this, n_fullWidgetName, new s_widgetConstructor( a_methodOrOptions, this ) );
                    }
                } );
            }
            return h_result;
        };
    };

    // The base Widget constructor.
    e.Widget = function () {};
    e.Widget._childConstructors = [];

    // Prototype for the base Widget, defining common properties and methods.
    e.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        defaultElement: "<div>",
        options: {
            disabled: false,
            create: null
        },
        _createWidget: function ( i_options, s_element ) {
            s_element = e( s_element || this.defaultElement || this )[ 0 ];
            this.element = e( s_element );
            this.uuid = t++;
            this.eventNamespace = "." + this.widgetName + this.uuid;
            this.bindings = e();
            this.hoverable = e();
            this.focusable = e();

            if ( s_element !== this ) {
                e.data( s_element, this.widgetFullName, this );
                this._on( true, this.element, {
                    remove: function ( e_event ) {
                        if ( e_event.target === s_element ) {
                            this.destroy();
                        }
                    }
                } );
                this.document = e( s_element.style ? s_element.ownerDocument : s_element.document || s_element );
                this.window = e( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
            }

            this.options = e.widget.extend( {}, this.options, this._getCreateOptions(), i_options );
            this._create();
            this._trigger( "create", null, this._getCreateEventData() );
            this._init();
        },
        _getCreateOptions: e.noop, // Placeholder for custom create options.
        _getCreateEventData: e.noop, // Placeholder for custom create event data.
        _create: e.noop, // Placeholder for custom creation logic.
        _init: e.noop, // Placeholder for custom initialization logic.
        destroy: function () {
            this._destroy();
            this.element
                .unbind( this.eventNamespace )
                .removeData( this.widgetFullName )
                .removeData( e.camelCase( this.widgetFullName ) );
            this.widget()
                .unbind( this.eventNamespace )
                .removeAttr( "aria-disabled" )
                .removeClass( this.widgetFullName + "-disabled " + "ui-state-disabled" );
            this.bindings.unbind( this.eventNamespace );
            this.hoverable.removeClass( "ui-state-hover" );
            this.focusable.removeClass( "ui-state-focus" );
        },
        _destroy: e.noop, // Placeholder for custom destruction logic.
        widget: function () {
            return this.element;
        },
        option: function ( t_name, i_value ) {
            var s_path, n_current, a_index, o_optionsObject = t_name;

            if ( 0 === arguments.length ) {
                return e.widget.extend( {}, this.options );
            }

            if ( "string" === typeof t_name ) {
                if ( o_optionsObject = {}, s_path = t_name.split( "." ), t_name = s_path.shift(), s_path.length ) {
                    for ( n_current = o_optionsObject[ t_name ] = e.widget.extend( {}, this.options[ t_name ] ), a_index = 0; s_path.length - 1 > a_index; a_index++ ) {
                        n_current[ s_path[ a_index ] ] = n_current[ s_path[ a_index ] ] || {};
                        n_current = n_current[ s_path[ a_index ] ];
                    }
                    if ( t_name = s_path.pop(), 1 === arguments.length ) {
                        return void 0 === n_current[ t_name ] ? null : n_current[ t_name ];
                    }
                    n_current[ t_name ] = i_value;
                } else {
                    if ( 1 === arguments.length ) {
                        return void 0 === this.options[ t_name ] ? null : this.options[ t_name ];
                    }
                    o_optionsObject[ t_name ] = i_value;
                }
            }
            this._setOptions( o_optionsObject );
            return this;
        },
        _setOptions: function ( e_options ) {
            var t_key;
            for ( t_key in e_options ) {
                this._setOption( t_key, e_options[ t_key ] );
            }
            return this;
        },
        _setOption: function ( e_key, t_value ) {
            this.options[ e_key ] = t_value;
            if ( "disabled" === e_key ) {
                this.widget().toggleClass( this.widgetFullName + "-disabled", !!t_value );
                if ( t_value ) {
                    this.hoverable.removeClass( "ui-state-hover" );
                    this.focusable.removeClass( "ui-state-focus" );
                }
            }
            return this;
        },
        enable: function () {
            return this._setOptions( { disabled: false } );
        },
        disable: function () {
            return this._setOptions( { disabled: true } );
        },
        _on: function ( t_delegate, i_element, s_handlers ) {
            var n_target, a_self = this;
            if ( "boolean" !== typeof t_delegate ) {
                s_handlers = i_element;
                i_element = t_delegate;
                t_delegate = false;
            }
            if ( s_handlers ) {
                i_element = n_target = e( i_element );
                this.bindings = this.bindings.add( i_element );
            } else {
                s_handlers = i_element;
                i_element = this.element;
                n_target = this.widget();
            }

            e.each( s_handlers, function ( s_eventType, o_handler ) {
                function r_wrappedHandler () {
                    return t_delegate || a_self.options.disabled !== true && !e( this ).hasClass( "ui-state-disabled" ) ? ( "string" === typeof o_handler ? a_self[ o_handler ] : o_handler ).apply( a_self, arguments ) : void 0;
                }
                if ( "string" !== typeof o_handler ) {
                    r_wrappedHandler.guid = o_handler.guid = o_handler.guid || r_wrappedHandler.guid || e.guid++;
                }

                var h_eventMatch = s_eventType.match( /^([\w:-]*)\s*(.*)$/ );
                var l_fullEventName = h_eventMatch[ 1 ] + a_self.eventNamespace;
                var u_selector = h_eventMatch[ 2 ];

                if ( u_selector ) {
                    n_target.delegate( u_selector, l_fullEventName, r_wrappedHandler );
                } else {
                    i_element.bind( l_fullEventName, r_wrappedHandler );
                }
            } );
        },
        _off: function ( t_element, i_events ) {
            i_events = ( i_events || "" ).split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
            t_element.unbind( i_events ).undelegate( i_events );
            this.bindings = e( this.bindings.not( t_element ).get() );
            this.focusable = e( this.focusable.not( t_element ).get() );
            this.hoverable = e( this.hoverable.not( t_element ).get() );
        },
        _delay: function ( e_function, t_delay ) {
            var s_self = this;
            function i_delayedCall () {
                return ( "string" === typeof e_function ? s_self[ e_function ] : e_function ).apply( s_self, arguments );
            }
            return setTimeout( i_delayedCall, t_delay || 0 );
        },
        _hoverable: function ( t_element ) {
            this.hoverable = this.hoverable.add( t_element );
            this._on( t_element, {
                mouseenter: function ( t_event ) {
                    e( t_event.currentTarget ).addClass( "ui-state-hover" );
                },
                mouseleave: function ( t_event ) {
                    e( t_event.currentTarget ).removeClass( "ui-state-hover" );
                }
            } );
        },
        _focusable: function ( t_element ) {
            this.focusable = this.focusable.add( t_element );
            this._on( t_element, {
                focusin: function ( t_event ) {
                    e( t_event.currentTarget ).addClass( "ui-state-focus" );
                },
                focusout: function ( t_event ) {
                    e( t_event.currentTarget ).removeClass( "ui-state-focus" );
                }
            } );
        },
        _trigger: function ( t_eventType, i_event, s_data ) {
            var n_prop, a_originalEvent, o_callback = this.options[ t_eventType ];
            s_data = s_data || {};
            i_event = e.Event( i_event );
            i_event.type = ( t_eventType === this.widgetEventPrefix ? t_eventType : this.widgetEventPrefix + t_eventType ).toLowerCase();
            i_event.target = this.element[ 0 ];

            a_originalEvent = i_event.originalEvent;
            if ( a_originalEvent ) {
                for ( n_prop in a_originalEvent ) {
                    if ( !( n_prop in i_event ) ) {
                        i_event[ n_prop ] = a_originalEvent[ n_prop ];
                    }
                }
            }

            this.element.trigger( i_event, s_data );
            return !( e.isFunction( o_callback ) && o_callback.apply( this.element[ 0 ], [ i_event ].concat( s_data ) ) === false || i_event.isDefaultPrevented() );
        }
    };

    // Add _show and _hide methods to the Widget prototype, leveraging jQuery effects.
    e.each( { show: "fadeIn", hide: "fadeOut" }, function ( t_method, i_defaultEffect ) {
        e.Widget.prototype[ "_" + t_method ] = function ( s_element, n_options, a_completeCallback ) {
            if ( "string" === typeof n_options ) {
                n_options = { effect: n_options };
            }
            var o_hasOptions, r_effectName = n_options ? ( n_options === true || "number" === typeof n_options ? i_defaultEffect : n_options.effect || i_defaultEffect ) : t_method;
            n_options = n_options || {};

            if ( "number" === typeof n_options ) {
                n_options = { duration: n_options };
            }

            o_hasOptions = !e.isEmptyObject( n_options );
            n_options.complete = a_completeCallback;

            if ( n_options.delay ) {
                s_element.delay( n_options.delay );
            }

            if ( o_hasOptions && e.effects && e.effects.effect[ r_effectName ] ) {
                s_element[ t_method ]( n_options );
            } else if ( r_effectName !== t_method && s_element[ r_effectName ] ) {
                s_element[ r_effectName ]( n_options.duration, n_options.easing, a_completeCallback );
            } else {
                s_element.queue( function ( i_next ) {
                    e( this )[ t_method ]();
                    if ( a_completeCallback ) {
                        a_completeCallback.call( s_element[ 0 ] );
                    }
                    i_next();
                } );
            }
        };
    } );

    e.widget; // Reference e.widget to ensure it's returned by the outer IIFE in some contexts.
} );


/*
 * Midnight.js - A jQuery UI Widget for dynamic header color changes.
 * This widget observes scroll position and section visibility to
 * smoothly transition header appearance based on defined sections.
 */
( ( function ( $ ) {

  "use strict";

  // Define the 'aerolab.midnight' widget, extending the base jQuery UI Widget.
  $.widget( 'aerolab.midnight', {

    /*
     * Widget options: Configurable settings for the header behavior.
     */
    options: {
      headerClass:  'midnightHeader', // CSS class for the main header wrapper.
      innerClass:   'midnightInner',  // CSS class for the content inside the header.
      defaultClass: 'default',        // Class applied to the default header state.
      classPrefix:  ''                // Currently unused prefix for header classes.
    },

    /*
     * Internal properties to cache elements and state data.
     */
    _headers:         {},       // Stores details about each header variant (e.g., clipping progress).
    _headerInfo:      { top: 0, height: 0 }, // Current calculated dimensions and position of the header.

    _$sections:       [],       // jQuery collection of all DOM elements with `data-midnight` attribute.
    _sections:        [],       // Processed array of section data (element, class, start/end positions).

    _scrollTop:       0,        // Current vertical scroll position of the window.
    _documentHeight:  0,        // Total height of the document.

    _transformMode:   false,    // Stores the detected CSS transform property name for performance.


    /**
     * Public method: Refreshes the widget's internal state.
     * This should be called if the DOM structure or dimensions of sections change.
     */
    refresh: function () {

      // Update the header's cached height. 'top' is currently fixed at 0.
      this._headerInfo = {
        top:    0,
        height: this.element.outerHeight()
      };

      // Re-query and re-cache all sections that define header color changes.
      this._$sections = $( '[data-midnight]' );
      this._sections  = [];

      // Set up the actual header DOM elements.
      this._setupHeaders();

      // Perform a complete recalculation of all positions and update visuals.
      this.recalculate();

    }, // End refresh method


    /**
     * Widget creation callback: Executed once when the widget is initialized.
     * Sets up initial state, event listeners, and starts the animation loop.
     */
    _create: function () {

      var context = this; // Store reference to `this` for use in callbacks.

      // Initialize scroll position and document height.
      this._scrollTop       = window.pageYOffset || document.documentElement.scrollTop;
      this._documentHeight  = $( document ).height();
      this._headers         = {}; // Ensure headers cache is empty on creation.

      // Detect the best CSS transform property for animations.
      this._transformMode = this._getSupportedTransform();

      // Perform an initial refresh to set up everything.
      this.refresh();

      /*
       * Set up a periodic interval to re-evaluate section positions.
       * This helps in cases where content shifts without a resize event.
       * The overhead is minimal for a 1-second interval.
       */
      setInterval( function () {
        context._recalculateSections();
      }, 1000 );


      /*
       * Attach a resize event listener to the window.
       * When the window resizes, a full recalculation is triggered.
       * Immediately trigger once to ensure correct initial layout.
       */
      $( window ).resize( function () {
        context.recalculate();
      } ).trigger( 'resize' );


      // Start the requestAnimationFrame-based update loop for smooth animations.
      this._updateHeadersLoop();

    }, // End _create method


    /**
     * Orchestrates a full recalculation and update of the header states.
     * Called on initialization, resize, and periodically.
     */
    recalculate: function () {

      this._recalculateSections();   // Update stored positions of all sections.
      this._updateHeaderHeight();    // Recalculate and apply the header's container height.

      this._recalculateHeaders();    // Determine which header variants should be active.
      this._updateHeaders();         // Apply the visual changes to the header elements.

    }, // End recalculate method


    /**
     * Determines which CSS transform property (if any) is supported by the browser.
     * This is used to apply GPU-accelerated transforms for smoother animations.
     *
     * @returns {string|boolean} The supported transform property name, or `false` if none.
     */
    _getSupportedTransform: function () {

      var prefixes = [ 'transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ];
      var div      = document.createElement( 'div' ); // Create a dummy element for style checking.

      for ( var ix = 0; ix < prefixes.length; ix++ ) {
        if ( div.style[ prefixes[ ix ] ] !== undefined ) {
          return prefixes[ ix ]; // Return the first supported prefix.
        }
      }

      return false; // No CSS transform property is supported.

    }, // End _getSupportedTransform method


    /**
     * Calculates the maximum height among all custom header elements.
     * This height is then used to set the fixed height of the main widget container.
     *
     * @returns {number} The maximum height of any header element.
     */
    _getContainerHeight: function () {

      var $customHeaders = this.element.find( '> .' + this.options[ 'headerClass' ] );
      var maxHeight      = 0;
      var currentHeight  = 0;
      var context        = this; // Preserve 'this' context for the `.each` callback.

      if ( $customHeaders.length ) {
        $customHeaders.each( function () {

          var $header = $( this );
          var $inner  = $header.find( '> .' + context.options[ 'innerClass' ] );

          // Temporarily adjust CSS to get the natural height without fixed positioning interference.
          if ( $inner.length ) {
            $inner.css( 'bottom', 'auto' ).css( 'overflow', 'auto' ); // Fix for Chrome 41+ outerHeight issues.
            currentHeight = $inner.outerHeight();
            $inner.css( 'bottom', '0' );
          } else {
            $header.css( 'bottom', 'auto' );
            currentHeight = $header.outerHeight();
            $header.css( 'bottom', '0' );
          }

          // Keep track of the largest height found.
          maxHeight = ( currentHeight > maxHeight ) ? currentHeight : maxHeight;
        } );
      } else {
        // If no custom headers, use the widget's own outer height.
        maxHeight = currentHeight = this.element.outerHeight();
      }

      return maxHeight;

    }, // End _getContainerHeight method


    /**
     * Sets up the DOM elements for the various header styles.
     * It clones a default header and applies styles for each `data-midnight` class.
     */
    _setupHeaders: function () {

      var context = this; // Capture the widget instance.
      // Initialize the default header entry in the internal headers map.
      this._headers[ this.options[ 'defaultClass' ] ] = {};

      // Iterate through all sections to collect unique header classes.
      this._$sections.each( function () {
        var $section    = $( this );
        var headerClass = $section.data( 'midnight' );

        if ( typeof headerClass !== 'string' ) { return; } // Skip if data-midnight is not a string.
        headerClass = headerClass.trim(); // Clean up whitespace.
        if ( headerClass === '' ) { return; } // Skip if class name is empty.

        context._headers[ headerClass ] = {}; // Add to the map.
      } );


      /*
       * Placeholder: This section was intended to store padding values from the original header.
       * It is currently not used in the implementation.
       */
      var defaultPaddings = {
        top:    this.element.css( "padding-top" ),
        right:  this.element.css( "padding-right" ),
        bottom: this.element.css( "padding-bottom" ),
        left:   this.element.css( "padding-left" )
      };


      // Apply fixed positioning and overflow styles to the main widget element.
      this.element.css( {
        position: 'fixed',
        top:      0,
        left:     0,
        right:    0,
        overflow: 'hidden'
      } );

      // Update the header's height property based on content.
      this._updateHeaderHeight();

      var $customHeaders = this.element.find( '> .' + this.options[ 'headerClass' ] );

      // Ensure there's a default header element.
      if ( $customHeaders.length ) {
        if ( !$customHeaders.filter( '.' + this.options[ 'defaultClass' ] ).length ) {
          // If no explicit default header exists, clone the first custom header found.
          $customHeaders.filter( '.' + this.options[ 'headerClass' ] + ':first' )
            .clone( true, true )
            .attr( 'class', this.options[ 'headerClass' ] + ' ' + this.options[ 'defaultClass' ] );
        }
      } else {
        // If no custom headers are defined at all, wrap the existing content as the default header.
        this.element.wrapInner( '<div class="' + this.options[ 'headerClass' ] + ' ' + this.options[ 'defaultClass' ] + '"></div>' );
      }

      // Re-select all custom headers after potential DOM manipulation.
      $customHeaders = this.element.find( '> .' + this.options[ 'headerClass' ] );
      // Create a template by cloning the default header.
      var $defaultHeader = $customHeaders.filter( '.' + this.options[ 'defaultClass' ] ).clone( true, true );


      // For each identified header class, create or configure its DOM element.
      for ( var headerClass in this._headers ) {
        if ( !this._headers.hasOwnProperty( headerClass ) ) { continue; } // Skip inherited properties.

        if ( typeof this._headers[ headerClass ].element === 'undefined' ) {

          // Check if an existing custom header matches this class.
          var $existingHeader = $customHeaders.filter( '.' + headerClass );
          if ( $existingHeader.length ) {
            this._headers[ headerClass ].element = $existingHeader;
          } else {
            // Otherwise, clone the default header and apply the specific class.
            this._headers[ headerClass ].element = $defaultHeader.clone( true, true )
              .removeClass( this.options[ 'defaultClass' ] )
              .addClass( headerClass )
              .appendTo( this.element );
          }

          // Define common reset styles for header layers.
          var resetStyles = {
            position: 'absolute',
            overflow: 'hidden',
            top:      0,
            left:     0,
            right:    0,
            bottom:   0
          };
          this._headers[ headerClass ].element.css( resetStyles );

          // Apply `translateZ(0)` for GPU acceleration if transforms are supported.
          if ( this._transformMode !== false ) {
            this._headers[ headerClass ].element.css( this._transformMode, 'translateZ(0)' );
          }

          // Ensure an inner wrapper for content exists within each header variant.
          if ( !this._headers[ headerClass ].element.find( '> .' + this.options[ 'innerClass' ] ).length ) {
            this._headers[ headerClass ].element.wrapInner( '<div class="' + this.options[ 'innerClass' ] + '"></div>' );
          }
          this._headers[ headerClass ].inner = this._headers[ headerClass ].element.find( '> .' + this.options[ 'innerClass' ] );
          this._headers[ headerClass ].inner.css( resetStyles ); // Apply same reset styles to inner.

          // Also apply `translateZ(0)` to the inner element.
          if ( this._transformMode !== false ) {
            this._headers[ headerClass ].inner.css( this._transformMode, 'translateZ(0)' );
          }

          // Initialize state variables for clipping.
          this._headers[ headerClass ].from     = '';
          this._headers[ headerClass ].progress = 0.0;
        }
      }


      // Iterate through all custom headers to hide those not explicitly associated with a `data-midnight` class.
      $customHeaders.each( function () {
        var $header     = $( this );
        var hasAnyClass = false;

        for ( var headerClass in context._headers ) {
          if ( !context._headers.hasOwnProperty( headerClass ) ) { continue; }
          if ( $header.hasClass( headerClass ) ) { hasAnyClass = true; } // Check if this header has a registered class.
        }

        // As a safeguard, ensure inner clipping mask exists.
        if ( !$header.find( '> .' + context.options[ 'innerClass' ] ).length ) {
          $header.wrapInner( '<div class="' + context.options[ 'innerClass' ] + '"></div>' );
        }

        // Show headers that are defined, hide others.
        if ( hasAnyClass ) {
          $header.show();
        } else {
          $header.hide();
        }
      } );

    }, // End _setupHeaders method


    /**
     * Recalculates the active headers and their clipping progress based on scroll position.
     * This method determines the logical state without applying visual changes.
     */
    _recalculateHeaders: function () {

      // Get current scroll position, ensuring it's within valid bounds.
      this._scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
      this._scrollTop = Math.max( this._scrollTop, 0 );
      this._scrollTop = Math.min( this._scrollTop, this._documentHeight );

      // Calculate the header's current visible area in document coordinates.
      var headerHeight = this._headerInfo.height;
      var headerStart  = this._scrollTop + this._headerInfo.top;
      var headerEnd    = headerStart + headerHeight;

      // Account for potential CSS transforms (e.g., from external libraries like Headroom.js)
      if ( typeof window.getComputedStyle === 'function' ) {
        var style      = window.getComputedStyle( this.element[ 0 ], null );
        var topOffset  = 0.0;
        var transformY = 0.0;

        if ( this._transformMode !== false && typeof style.transform === 'string' ) {
          // Extract `translateY` value from the transform matrix.
          var transformArray = ( style.transform ).match( /(-?[0-9\.]+)/g );
          if ( transformArray !== null && transformArray.length >= 6 && !isNaN( parseFloat( transformArray[ 5 ] ) ) ) {
            transformY = parseFloat( transformArray[ 5 ] );
          }
        }
        if ( ( style.top ).indexOf( 'px' ) >= 0 && !isNaN( parseFloat( style.top ) ) ) {
          topOffset = parseFloat( style.top );
        }

        headerStart += topOffset + transformY;
        headerEnd   += topOffset + transformY;
      }

      // Reset the state of all headers before determining current active states.
      for ( var headerClass in this._headers ) {
        if ( !this._headers.hasOwnProperty( headerClass ) ) { continue; }
        this._headers[ headerClass ].from     = ''; // Mark as inactive for this frame.
        this._headers[ headerClass ].progress = 0.0;
      }

      // Iterate through each section to determine which headers are currently active.
      for ( var ix = 0; ix < this._sections.length; ix++ ) {

        // Check if the header's visible area overlaps with the current section.
        if ( headerEnd >= this._sections[ ix ].start && headerStart <= this._sections[ ix ].end ) {

          this._headers[ this._sections[ ix ].className ].visible = true; // Mark this header class as visible.

          // Case 1: Header is fully contained within the section.
          if ( headerStart >= this._sections[ ix ].start && headerEnd <= this._sections[ ix ].end ) {
            this._headers[ this._sections[ ix ].className ].from     = 'top';
            this._headers[ this._sections[ ix ].className ].progress += 1.0;
          }
          // Case 2: Header extends past the bottom of the section.
          else if ( headerEnd > this._sections[ ix ].end && headerStart < this._sections[ ix ].end ) {
            this._headers[ this._sections[ ix ].className ].from     = 'top';
            this._headers[ this._sections[ ix ].className ].progress = 1.0 - ( headerEnd - this._sections[ ix ].end ) / headerHeight;
          }
          // Case 3: Header starts before the section, extending into it.
          else if ( headerEnd > this._sections[ ix ].start && headerStart < this._sections[ ix ].start ) {
            // If the same header class is already active from the 'top' (e.g., spanning multiple sections of same color),
            // just add to its progress.
            if ( this._headers[ this._sections[ ix ].className ].from === 'top' ) {
              this._headers[ this._sections[ ix ].className ].progress += ( headerEnd - this._sections[ ix ].start ) / headerHeight;
            } else {
              this._headers[ this._sections[ ix ].className ].from     = 'bottom';
              this._headers[ this._sections[ ix ].className ].progress = ( headerEnd - this._sections[ ix ].start ) / headerHeight;
            }
          }

        }

      }

    }, // End _recalculateHeaders method


    /**
     * Applies the calculated clipping offsets to the header elements' styles.
     * This method is responsible for the visual scrolling/clipping effect.
     */
    _updateHeaders: function () {

      // If the default header is not defined, there's nothing to update.
      if ( typeof this._headers[ this.options[ 'defaultClass' ] ] === 'undefined' ) { return; }

      // Pre-processing step to ensure a header is always fully visible (using default if necessary).
      var totalProgress   = 0.0;
      var lastActiveClass = '';

      for ( var headerClass in this._headers ) {
        if ( !this._headers.hasOwnProperty( headerClass ) ) { continue; }
        if ( this._headers[ headerClass ].from === '' ) { continue; } // Skip headers that are not currently active.
        totalProgress   += this._headers[ headerClass ].progress;
        lastActiveClass = headerClass;
      }

      // If the sum of progress for all active headers is less than 1.0,
      // the remaining portion is filled by the default header.
      if ( totalProgress < 1.0 ) {
        if ( this._headers[ this.options[ 'defaultClass' ] ].from === '' ) {
          // Assign 'from top' or 'from bottom' based on the last active header's direction.
          this._headers[ this.options[ 'defaultClass' ] ].from     = ( this._headers[ lastActiveClass ].from === 'top' ) ? 'bottom' : 'top';
          this._headers[ this.options[ 'defaultClass' ] ].progress = 1.0 - totalProgress;
        } else {
          // If default header is already active, just add to its progress.
          this._headers[ this.options[ 'defaultClass' ] ].progress += 1.0 - totalProgress;
        }
      }


      // Apply the calculated `translateY` or `top` styles to each header variant.
      for ( var ix in this._headers ) {
        if ( !this._headers.hasOwnProperty( ix ) ) { continue; }
        if ( this._headers[ ix ].from === '' ) { continue; } // Only update headers that are active.

        var offset = ( 1.0 - this._headers[ ix ].progress ) * 100.0;

        // Adjust offset slightly for hidden areas to prevent visual artifacts due to rounding.
        if ( offset >= 100.0 ) { offset = 110.0; }
        if ( offset <= -100.0 ) { offset = -110.0; }

        if ( this._headers[ ix ].from === 'top' ) {
          if ( this._transformMode !== false ) {
            // Use CSS transforms for GPU acceleration.
            this._headers[ ix ].element[ 0 ].style[ this._transformMode ] = 'translateY(-' + offset + '%) translateZ(0)';
            this._headers[ ix ].inner[ 0 ].style[ this._transformMode ]   = 'translateY(+' + offset + '%) translateZ(0)';
          } else {
            // Fallback to `top` property if transforms are not supported.
            this._headers[ ix ].element[ 0 ].style[ 'top' ] = '-' + offset + '%';
            this._headers[ ix ].inner[ 0 ].style[ 'top' ]   = '+' + offset + '%';
          }
        } else { // Direction is 'bottom'.
          if ( this._transformMode !== false ) {
            this._headers[ ix ].element[ 0 ].style[ this._transformMode ] = 'translateY(+' + offset + '%) translateZ(0)';
            this._headers[ ix ].inner[ 0 ].style[ this._transformMode ]   = 'translateY(-' + offset + '%) translateZ(0)';
          } else {
            this._headers[ ix ].element[ 0 ].style[ 'top' ] = '+' + offset + '%';
            this._headers[ ix ].inner[ 0 ].style[ 'top' ]   = '-' + offset + '%';
          }
        }
      }

    }, // End _updateHeaders method


    /**
     * Recalculates and caches the document height and the start/end positions
     * of all sections that trigger header changes.
     */
    _recalculateSections: function () {

      this._documentHeight = $( document ).height(); // Update the cached document height.

      this._sections = []; // Clear the previous section data.

      // Iterate through the jQuery collection of sections and store their properties.
      for ( var ix = 0; ix < this._$sections.length; ix++ ) {
        var $section = $( this._$sections[ ix ] );

        this._sections.push( {
          element:    $section,                      // The jQuery element for the section.
          className:  $section.data( 'midnight' ),   // The header class associated with this section.
          start:      $section.offset().top,         // The document-relative top position of the section.
          end:        $section.offset().top + $section.outerHeight() // The document-relative bottom position.
        } );
      }

    }, // End _recalculateSections method


    /**
     * Updates the internal header height information and applies it as a fixed height
     * to the widget's main element.
     */
    _updateHeaderHeight: function () {
      this._headerInfo.height = this._getContainerHeight(); // Get the maximum header height.
      this.element.css( 'height', this._headerInfo.height + 'px' ); // Apply as CSS height.
    }, // End _updateHeaderHeight method


    /**
     * Implements the animation loop using `requestAnimationFrame` for optimal performance.
     * This method continuously updates header states based on scroll position.
     */
    _updateHeadersLoop: function () {

      var context = this; // Preserve the widget's context.
      this._requestAnimationFrame( function () {
        context._updateHeadersLoop(); // Schedule the next frame for continuous animation.
      } );

      this._recalculateHeaders(); // Determine the current logical state of headers.
      this._updateHeaders();      // Apply the visual updates based on the calculated state.

    }, // End _updateHeadersLoop method


    /**
     * Provides a cross-browser compatible `requestAnimationFrame` function.
     * It falls back to `setTimeout` if `requestAnimationFrame` is not natively supported.
     *
     * @param {function} callback - The function to be executed in the next animation frame.
     */
    _requestAnimationFrame: function ( callback ) {

      var requestAnimationFrame = ( requestAnimationFrame || ( function () {
        return  window.requestAnimationFrame        || // Standard.
                window.webkitRequestAnimationFrame  || // Chrome, Safari.
                window.mozRequestAnimationFrame     || // Firefox.
                function ( callback ) {
                  window.setTimeout( callback, 1000 / 60 ); // Fallback to 60 frames per second.
                };
      } )() );

      requestAnimationFrame( callback ); // Execute the provided callback.

    } // End _requestAnimationFrame method


  } ); // End $.widget definition

} )( jQuery ) ); // End IIFE to encapsulate the widget definition and pass jQuery.