/*
 * jQuery UI Widget @VERSION - A foundational UI component for jQuery.
 * More details at: http://jqueryui.com
 *
 * Copyright 2013 jQuery Foundation and its many contributors.
 * This software is licensed under the MIT license agreement.
 * See: http://jquery.org/license
 *
 * Official API documentation: http://api.jqueryui.com/jQuery.widget/
 */
( function ( $ , undefined ) {

  // Internal counter for generating unique widget IDs.
  var uuid = 0 ;

  // Reference to the native Array slice method, used for argument handling.
  var slice = Array.prototype.slice ;

  // Store the original $.cleanData function to be called later.
  var _cleanData = $.cleanData ;

  // Override jQuery's cleanData function to add a 'remove' trigger for widgets.
  $.cleanData = function ( elems ) {
    for ( var i = 0 , elem ; ( elem = elems[ i ] ) != null ; i++ ) {
      try {
        // Trigger a custom 'remove' event on elements being cleaned.
        // This allows widgets to perform necessary cleanup before removal.
        $ ( elem ) . triggerHandler ( "remove" ) ;
      } catch ( e ) {
        // Suppress errors during the remove trigger.
        // Related to: http://bugs.jquery.com/ticket/8235
      }
    }
    // Call the original cleanData function to complete the process.
    _cleanData ( elems ) ;
  } ;

  // The main widget factory function.
  // This creates new widget constructors.
  $.widget = function ( name , base , prototype ) {

    var fullName , existingConstructor , constructor , basePrototype ;
    // The proxiedPrototype object ensures the original prototype remains intact,
    // allowing it to serve as a reusable mixin for various widgets (issue #8876).
    var proxiedPrototype = {} ;
    var namespace = name . split ( "." ) [ 0 ] ;

    name = name . split ( "." ) [ 1 ] ;
    fullName = namespace + "-" + name ;

    // If only two arguments are provided, assume `base` is the `prototype` and use `$.Widget` as base.
    if ( ! prototype ) {
      prototype = base ;
      base = $.Widget ;
    }

    // Create a custom selector for this widget, enabling `$( ":mywidget" )`.
    $.expr [ ":" ] [ fullName . toLowerCase () ] = function ( elem ) {
      return !! $.data ( elem , fullName ) ;
    } ;

    // Ensure the namespace object exists on jQuery.
    $ [ namespace ] = $ [ namespace ] || {} ;

    // Keep a reference to any existing constructor under this name, for redefinition purposes.
    existingConstructor = $ [ namespace ] [ name ] ;

    // Define the new widget constructor function.
    constructor = $ [ namespace ] [ name ] = function ( options , element ) {
      // Allow instantiation without the "new" keyword for convenience.
      if ( ! this._createWidget ) {
        return new constructor ( options , element ) ;
      }

      // Allow instantiation without immediate initialization for simple inheritance scenarios.
      // Note: The "new" keyword must be used in these cases, as the above code always passes arguments.
      if ( arguments . length ) {
        this . _createWidget ( options , element ) ;
      }
    } ;

    // Extend the new constructor with static properties from any existing constructor,
    // and add widget-specific static properties.
    $.extend ( constructor , existingConstructor , {
      version: prototype . version ,
      // Store a copy of the prototype object used to create the widget,
      // useful for redefining the widget later or for inheritance.
      _proto: $.extend ( {} , prototype ) ,
      // Keep track of child constructors that inherit from this widget.
      // This is crucial for handling widget redefinitions.
      _childConstructors: [ ]
    } ) ;

    // Create an instance of the base widget to inherit its prototype properties.
    basePrototype = new base () ;

    // We need to ensure that the 'options' hash is a direct property on the new instance.
    // Otherwise, modifying 'options' would inadvertently affect the prototype shared by all instances.
    basePrototype . options = $.widget . extend ( {} , basePrototype . options ) ;

    // Iterate over the provided prototype properties to set up method proxying.
    $.each ( prototype , function ( prop , value ) {
      // If the property is not a function, assign it directly to the proxied prototype.
      if ( ! $.isFunction ( value ) ) {
        proxiedPrototype [ prop ] = value ;
        return ;
      }

      // For functions, create a proxied version that provides _super and _superApply methods.
      proxiedPrototype [ prop ] = ( function () {
        var _super = function () {
            // Call the base method with the current context and arguments.
            return base . prototype [ prop ] . apply ( this , arguments ) ;
          } ,
          _superApply = function ( args ) {
            // Call the base method with the current context and an array of arguments.
            return base . prototype [ prop ] . apply ( this , args ) ;
          } ;

        return function () {
          // Temporarily store the current _super and _superApply references.
          var __super = this._super ,
            __superApply = this._superApply ,
            returnValue ;

          // Set _super and _superApply to point to the base method.
          this._super = _super ;
          this._superApply = _superApply ;

          // Execute the original method.
          returnValue = value . apply ( this , arguments ) ;

          // Restore the original _super and _superApply references.
          this._super = __super ;
          this._superApply = __superApply ;

          return returnValue ;
        } ;
      } ) () ;
    } ) ;

    // Assign the new widget's prototype by extending the base prototype with proxied methods
    // and additional widget-specific properties.
    constructor . prototype = $.widget . extend ( basePrototype , {
      // TODO: The widgetEventPrefix property should eventually remove support for existingConstructor
      // and always use the format 'name:' (e.g., 'draggable:start').
      // It should not be prefixed for widgets that are not DOM-based.
      widgetEventPrefix: existingConstructor ? basePrototype . widgetEventPrefix : name
    } , proxiedPrototype , {
      constructor: constructor ,
      namespace: namespace ,
      widgetName: name ,
      widgetFullName: fullName
    } ) ;

    // Handle widget redefinition: If this widget is being redefined,
    // we must update all widgets that inherit from it.
    // This effectively replaces one level in the prototype chain.
    if ( existingConstructor ) {
      $.each ( existingConstructor . _childConstructors , function ( i , child ) {
        var childPrototype = child . prototype ;

        // Redefine the child widget using its original prototype,
        // but now inheriting from the new version of this base widget.
        $.widget ( childPrototype . namespace + "." + childPrototype . widgetName , constructor , child . _proto ) ;
      } ) ;
      // Remove the list of existing child constructors from the old constructor.
      // This allows the old child constructors to be garbage collected.
      delete existingConstructor . _childConstructors ;
    } else {
      // If this is a new widget, add its constructor to the base's child constructors list.
      base . _childConstructors . push ( constructor ) ;
    }

    // Bridge the new widget to jQuery's fn object, allowing `$( "#elem" ).mywidget()`.
    $.widget . bridge ( name , constructor ) ;
  } ;

  // Custom extend function for widgets, designed for deep merging of options.
  $.widget . extend = function ( target ) {
    var input = slice . call ( arguments , 1 ) ,
      inputIndex = 0 ,
      inputLength = input . length ,
      key ,
      value ;

    // Iterate through all input objects provided.
    for ( ; inputIndex < inputLength ; inputIndex++ ) {
      // Iterate through the properties of the current input object.
      for ( key in input [ inputIndex ] ) {
        value = input [ inputIndex ] [ key ] ;
        // Ensure the property is directly on the object and not undefined.
        if ( input [ inputIndex ] . hasOwnProperty ( key ) && value !== undefined ) {
          // If the value is a plain object, perform a recursive deep clone.
          if ( $.isPlainObject ( value ) ) {
            target [ key ] = $.isPlainObject ( target [ key ] ) ?
              $.widget . extend ( {} , target [ key ] , value ) :
              // If the target property is not an object (e.g., string, array),
              // don't try to extend it; just create a new extended object.
              $.widget . extend ( {} , value ) ;
          } else {
            // For all other types (primitives, arrays, functions), copy by reference.
            target [ key ] = value ;
          }
        }
      }
    }
    return target ;
  } ;

  // Bridge function to expose widget functionality via jQuery's `$.fn`.
  $.widget . bridge = function ( name , object ) {
    var fullName = object . prototype . widgetFullName || name ;

    // Attach the widget method to jQuery's prototype.
    $.fn [ name ] = function ( options ) {
      var isMethodCall = typeof options === "string" ,
        args = slice . call ( arguments , 1 ) ,
        returnValue = this ;

      // If multiple option hashes are passed during initialization, merge them.
      options = ! isMethodCall && args . length ?
        $.widget . extend . apply ( null , [ options ] . concat ( args ) ) :
        options ;

      if ( isMethodCall ) {
        // Handle method calls (e.g., `$( "#elem" ).mywidget( "method", "arg" )`).
        this . each ( function () {
          var methodValue ,
            instance = $.data ( this , fullName ) ;

          // Error if a method is called on an uninitialized widget.
          if ( ! instance ) {
            return $.error ( "cannot call methods on " + name + " prior to initialization; " +
              "attempted to call method '" + options + "'" ) ;
          }
          // Error if the method does not exist or is a private method (starts with underscore).
          if ( ! $.isFunction ( instance [ options ] ) || options . charAt ( 0 ) === "_" ) {
            return $.error ( "no such method '" + options + "' for " + name + " widget instance" ) ;
          }

          // Execute the method.
          methodValue = instance [ options ] . apply ( instance , args ) ;

          // If the method returns a value that is not the instance itself and is not undefined,
          // update `returnValue`.
          if ( methodValue !== instance && methodValue !== undefined ) {
            returnValue = methodValue && methodValue . jquery ?
              returnValue . pushStack ( methodValue . get () ) :
              methodValue ;
            return false ; // Stop the each loop.
          }
        } ) ;
      } else {
        // Handle initialization (e.g., `$( "#elem" ).mywidget( { options } )`).
        this . each ( function () {
          var instance = $.data ( this , fullName ) ;
          if ( instance ) {
            // If already initialized, update options and re-initialize.
            instance . option ( options || {} ) . _init () ;
          } else {
            // Otherwise, create a new instance and store it.
            $.data ( this , fullName , new object ( options , this ) ) ;
          }
        } ) ;
      }

      return returnValue ;
    } ;
  } ;

  // The base constructor for all jQuery UI widgets.
  $.Widget = function ( /* options, element */ ) {
    // This is intentionally left empty. Initialization happens in _createWidget.
  } ;

  // Static array to keep track of all constructors inheriting from $.Widget.
  $.Widget . _childConstructors = [ ] ;

  // Prototype methods for the base $.Widget.
  $.Widget . prototype = {
    widgetName: "widget" ,
    widgetEventPrefix: "" ,
    defaultElement: "<div>" ,
    options: {
      disabled: false , // Default option for widget state.

      // Callback function for widget creation.
      create: null
    } ,

    // Core method to create and initialize a widget instance.
    _createWidget: function ( options , element ) {
      // Ensure 'element' is a DOM element and wrap it in a jQuery object.
      element = $ ( element || this . defaultElement || this ) [ 0 ] ;
      this . element = $ ( element ) ;

      // Assign a unique ID and event namespace for this widget instance.
      this . uuid = uuid++ ;
      this . eventNamespace = "." + this . widgetName + this . uuid ;

      // Merge default options, create options, and user-provided options.
      this . options = $.widget . extend ( {} ,
        this . options ,
        this . _getCreateOptions () ,
        options ) ;

      // Initialize collections for event bindings, hoverable and focusable elements.
      this . bindings = $ () ;
      this . hoverable = $ () ;
      this . focusable = $ () ;

      // If the widget's element is a distinct DOM node (not the widget instance itself).
      if ( element !== this ) {
        // Store the widget instance as jQuery data on its DOM element.
        $.data ( element , this . widgetFullName , this ) ;
        // Bind to the 'remove' event on the element for automatic destruction.
        this . _on ( true , this . element , {
          remove: function ( event ) {
            if ( event . target === element ) {
              this . destroy () ;
            }
          }
        } ) ;

        // Determine the document and window context for the widget's element.
        this . document = $ ( element . style ?
          // Element is part of a document.
          element . ownerDocument :
          // Element is window or document itself.
          element . document || element ) ;
        this . window = $ ( this . document [ 0 ] . defaultView || this . document [ 0 ] . parentWindow ) ;
      }

      // Call internal lifecycle methods.
      this . _create () ;
      this . _trigger ( "create" , null , this . _getCreateEventData () ) ;
      this . _init () ;
    } ,

    // Placeholder for getting custom creation options.
    _getCreateOptions: $.noop ,
    // Placeholder for getting custom event data for the 'create' event.
    _getCreateEventData: $.noop ,
    // Placeholder for widget-specific creation logic.
    _create: $.noop ,
    // Placeholder for widget-specific initialization logic.
    _init: $.noop ,

    // Destroys the widget instance, unbinding events and removing data.
    destroy: function () {
      this . _destroy () ;
      // Note: The unbind calls might be removed in future versions (2.0+).
      // All event bindings should ideally go through `this._on()`.
      this . element
        . unbind ( this . eventNamespace ) // Unbind all events for this widget instance.
        // For jQuery <1.9 compatibility, remove data using both widgetName and widgetFullName.
        // TODO: Remove dual storage for #7810.
        . removeData ( this . widgetName )
        . removeData ( this . widgetFullName )
        // Support for jQuery <1.6.3, which used camelCase for data keys.
        // See: http://bugs.jquery.com/ticket/9413
        . removeData ( $.camelCase ( this . widgetFullName ) ) ;
      this . widget ()
        . unbind ( this . eventNamespace ) // Unbind events from the widget wrapper element.
        . removeAttr ( "aria-disabled" ) // Remove accessibility attribute.
        . removeClass (
          this . widgetFullName + "-disabled " + // Remove disabled classes.
          "ui-state-disabled" ) ;

      // Clean up event bindings and state classes for internal collections.
      this . bindings . unbind ( this . eventNamespace ) ;
      this . hoverable . removeClass ( "ui-state-hover" ) ;
      this . focusable . removeClass ( "ui-state-focus" ) ;
    } ,

    // Placeholder for widget-specific destruction logic.
    _destroy: $.noop ,

    // Returns the widget's jQuery element.
    widget: function () {
      return this . element ;
    } ,

    // Manages widget options. Can get all, get one, or set one/many.
    option: function ( key , value ) {
      var options = key ,
        parts ,
        curOption ,
        i ;

      // If no arguments, return a copy of all current options.
      if ( arguments . length === 0 ) {
        // Return a cloned object to prevent direct modification of internal options.
        return $.widget . extend ( {} , this . options ) ;
      }

      // If 'key' is a string, it can be a single option name or a dot-separated path.
      if ( typeof key === "string" ) {
        // Handle nested keys like "foo.bar" which maps to { foo: { bar: ___ } }.
        options = {} ;
        parts = key . split ( "." ) ;
        key = parts . shift () ;
        if ( parts . length ) {
          curOption = options [ key ] = $.widget . extend ( {} , this . options [ key ] ) ;
          for ( i = 0 ; i < parts . length - 1 ; i++ ) {
            curOption [ parts [ i ] ] = curOption [ parts [ i ] ] || {} ;
            curOption = curOption [ parts [ i ] ] ;
          }
          key = parts . pop () ;
          if ( value === undefined ) {
            return curOption [ key ] === undefined ? null : curOption [ key ] ;
          }
          curOption [ key ] = value ;
        } else {
          if ( value === undefined ) {
            return this . options [ key ] === undefined ? null : this . options [ key ] ;
          }
          options [ key ] = value ;
        }
      }

      // Apply the new options.
      this . _setOptions ( options ) ;

      return this ;
    } ,

    // Internal method to set multiple options.
    _setOptions: function ( options ) {
      var key ;

      for ( key in options ) {
        this . _setOption ( key , options [ key ] ) ;
      }

      return this ;
    } ,

    // Internal method to set a single option.
    _setOption: function ( key , value ) {
      this . options [ key ] = value ;

      // Special handling for the 'disabled' option.
      if ( key === "disabled" ) {
        this . widget ()
          . toggleClass ( this . widgetFullName + "-disabled ui-state-disabled" , !! value )
          . attr ( "aria-disabled" , value ) ;
        this . hoverable . removeClass ( "ui-state-hover" ) ;
        this . focusable . removeClass ( "ui-state-focus" ) ;
      }

      return this ;
    } ,

    // Enables the widget by setting the 'disabled' option to false.
    enable: function () {
      return this . _setOption ( "disabled" , false ) ;
    } ,
    // Disables the widget by setting the 'disabled' option to true.
    disable: function () {
      return this . _setOption ( "disabled" , true ) ;
    } ,

    // Binds events, providing a mechanism for event delegation and automatic cleanup.
    _on: function ( suppressDisabledCheck , element , handlers ) {
      var delegateElement ,
        instance = this ;

      // If 'suppressDisabledCheck' is not a boolean, assume it's the 'element' argument.
      if ( typeof suppressDisabledCheck !== "boolean" ) {
        handlers = element ;
        element = suppressDisabledCheck ;
        suppressDisabledCheck = false ;
      }

      // If 'handlers' is missing, assume 'element' is actually 'handlers' and use 'this.element'.
      if ( ! handlers ) {
        handlers = element ;
        element = this . element ;
        delegateElement = this . widget () ;
      } else {
        // Normalize 'element' to a jQuery object and add it to the bindings collection.
        element = delegateElement = $ ( element ) ;
        this . bindings = this . bindings . add ( element ) ;
      }

      $.each ( handlers , function ( event , handler ) {
        function handlerProxy () {
          // Allow widgets to customize how 'disabled' state is handled.
          // This supports scenarios where 'disabled' is an array or a method
          // for disabling individual parts of the widget.
          if ( ! suppressDisabledCheck &&
            ( instance . options . disabled === true ||
              $ ( this ) . hasClass ( "ui-state-disabled" ) ) ) {
            return ;
          }
          // Call the actual handler, supporting string method names.
          return ( typeof handler === "string" ? instance [ handler ] : handler )
            . apply ( instance , arguments ) ;
        }

        // Copy the GUID to the proxy function if the handler has one, or generate a new one.
        // This ensures direct unbinding works correctly.
        if ( typeof handler !== "string" ) {
          handlerProxy . guid = handler . guid =
            handler . guid || handlerProxy . guid || $.guid++ ;
        }

        var match = event . match ( /^(\w+)\s*(.*)$/ ) ,
          eventName = match [ 1 ] + instance . eventNamespace ,
          selector = match [ 2 ] ;

        // Use delegate for events with a selector, otherwise use bind.
        if ( selector ) {
          delegateElement . delegate ( selector , eventName , handlerProxy ) ;
        } else {
          element . bind ( eventName , handlerProxy ) ;
        }
      } ) ;
    } ,

    // Unbinds events previously bound with `_on`.
    _off: function ( element , eventName ) {
      // Prepend eventNamespace to each event type and append it once more.
      eventName = ( eventName || "" ) . split ( " " ) . join ( this . eventNamespace + " " ) + this . eventNamespace ;
      element . unbind ( eventName ) . undelegate ( eventName ) ;
    } ,

    // Delays the execution of a function.
    _delay: function ( handler , delay ) {
      function handlerProxy () {
        return ( typeof handler === "string" ? instance [ handler ] : handler )
          . apply ( instance , arguments ) ;
      }
      var instance = this ;
      return setTimeout ( handlerProxy , delay || 0 ) ;
    } ,

    // Helper for managing hover state on elements.
    _hoverable: function ( element ) {
      this . hoverable = this . hoverable . add ( element ) ;
      this . _on ( element , {
        mouseenter: function ( event ) {
          $ ( event . currentTarget ) . addClass ( "ui-state-hover" ) ;
        } ,
        mouseleave: function ( event ) {
          $ ( event . currentTarget ) . removeClass ( "ui-state-hover" ) ;
        }
      } ) ;
    } ,

    // Helper for managing focus state on elements.
    _focusable: function ( element ) {
      this . focusable = this . focusable . add ( element ) ;
      this . _on ( element , {
        focusin: function ( event ) {
          $ ( event . currentTarget ) . addClass ( "ui-state-focus" ) ;
        } ,
        focusout: function ( event ) {
          $ ( event . currentTarget ) . removeClass ( "ui-state-focus" ) ;
        }
      } ) ;
    } ,

    // Triggers a custom event.
    _trigger: function ( type , event , data ) {
      var prop , orig ;
      var callback = this . options [ type ] ;

      data = data || {} ;
      event = $.Event ( event ) ;
      // Set the event type, prefixing if necessary and converting to lowercase.
      event . type = ( type === this . widgetEventPrefix ?
        type :
        this . widgetEventPrefix + type ) . toLowerCase () ;
      // The original event might come from any element,
      // so we explicitly reset the target to the widget's main element.
      event . target = this . element [ 0 ] ;

      // Copy properties from the original event to the new event object.
      orig = event . originalEvent ;
      if ( orig ) {
        for ( prop in orig ) {
          if ( ! ( prop in event ) ) {
            event [ prop ] = orig [ prop ] ;
          }
        }
      }

      this . element . trigger ( event , data ) ;
      // Return false if the callback explicitly returns false or event propagation is prevented.
      return ! ( $.isFunction ( callback ) &&
        callback . apply ( this . element [ 0 ] , [ event ] . concat ( data ) ) === false ||
        event . isDefaultPrevented () ) ;
    }
  } ;

  // Extend Widget prototype with _show and _hide methods for animation.
  $.each ( { show: "fadeIn" , hide: "fadeOut" } , function ( method , defaultEffect ) {
    $.Widget . prototype [ "_" + method ] = function ( element , options , callback ) {
      if ( typeof options === "string" ) {
        options = { effect: options } ;
      }
      var hasOptions ;
      var effectName = ! options ?
        method :
        options === true || typeof options === "number" ?
          defaultEffect :
          options . effect || defaultEffect ;
      options = options || {} ;
      if ( typeof options === "number" ) {
        options = { duration: options } ;
      }
      hasOptions = ! $.isEmptyObject ( options ) ;