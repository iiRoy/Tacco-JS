/*
 * Module: Application Event Handling System
 * Version: 1.0.0
 * Author: Code Weaver
 * License: Open Source (MIT-like)
 * Dependencies: prototype.js (for core utilities like $A, Element, Class, Event)
 */

// Ensure the main application namespace exists
if ( typeof ( Apparatus ) == 'undefined' ) {
  Apparatus = {};
}

/**
 * Wraps a value or function into a callable function.
 * If the input is already a function, it's returned as is.
 * Otherwise, a new function is created that returns the input value.
 * @param {any} inputCallable - The value or function to wrap.
 * @returns {Function} A function that, when called, returns the original value or the result of the original function.
 */
var $callable = function ( inputCallable ) {
  return typeof ( inputCallable ) == 'function' ? inputCallable : function ( ) {
    return inputCallable
  };
};

/**
 * Resolves a value from a source.
 * If the source is a function, it's executed to get the value.
 * Otherwise, the source itself is returned.
 * @param {any} valSource - The value or function source.
 * @returns {any} The resolved value.
 */
var $resolveVal = function ( valSource ) {
  return typeof ( valSource ) == 'function' ? valSource ( ) : valSource;
};


// Core event dispatching and observation mechanism
Subject.Notifier = {

  // Augments an object with event capabilities
  augment: function ( entityInstance ) {

    // Internal utility to prepare event listeners for a given signal
    entityInstance._subjectEventInit = function ( signal_name ) {
      this._listeners = this._listeners || {};
      this._listeners[ signal_name ] = this._listeners[ signal_name ] || [];
    };

    // Attaches a listener to a specific signal
    entityInstance.addListener = function ( signal_name, listener_func ) {
      if ( typeof ( signal_name ) == 'string' && typeof ( listener_func ) != 'undefined' ) {
        this._subjectEventInit ( signal_name );
        // Prevent duplicate listeners - using Prototype.js 'include'
        if ( !this._listeners[ signal_name ].include ( listener_func ) ) {
          this._listeners[ signal_name ].push ( listener_func );
        }
      } else {
        // If signal_name is an object, iterate through its properties
        for ( var evt_key in signal_name ) {
          this.addListener ( evt_key, signal_name[ evt_key ] );
        }
      }
    };

    // Removes a listener or all listeners for a signal
    entityInstance.removeListener = function ( signal_name, listener_func ) {
      this._subjectEventInit ( signal_name ); // Ensure the structure is initialized
      if ( signal_name && listener_func ) {
        // Remove a specific listener using Prototype.js 'without'
        this._listeners[ signal_name ] = this._listeners[ signal_name ].without ( listener_func );
      } else if ( signal_name ) {
        // Clear all listeners for this signal
        this._listeners[ signal_name ] = [];
      } else {
        // Clear all listeners for all signals
        this._listeners = {};
      }
    };

    // Attaches a listener that will be removed after its first invocation
    entityInstance.addListenerOnce = function ( signal_name, primary_listener ) {
      var temp_listener = function ( ) {
        primary_listener.apply ( this, arguments );
        this.removeListener ( signal_name, temp_listener );
      }.bind ( this );
      this._subjectEventInit ( signal_name );
      this._listeners[ signal_name ].push ( temp_listener );
    };

    // Dispatches a signal, invoking all registered listeners
    entityInstance.dispatch = function ( signal_name ) {
      this._subjectEventInit ( signal_name );
      var callback_outcomes = [];
      var argument_list = $A ( arguments ).slice ( 1 ); // Get arguments excluding signal_name
      try {
        for ( var idx = 0; idx < this._listeners[ signal_name ].length; ++idx ) {
          callback_outcomes.push ( this._listeners[ signal_name ][ idx ].apply ( this._listeners[ signal_name ][ idx ], argument_list ) || null );
        }
      } catch ( err_obj ) {
        if ( err_obj == $break ) { // Prototype.js specific break
          return false;
        } else {
          throw err_obj;
        }
      }
      return callback_outcomes;
    };

    // If the object has a prototype, also augment its prototype
    if ( entityInstance.prototype ) {
      entityInstance.prototype._subjectEventInit = entityInstance._subjectEventInit;
      entityInstance.prototype.addListener = entityInstance.addListener;
      entityInstance.prototype.removeListener = entityInstance.removeListener;
      entityInstance.prototype.addListenerOnce = entityInstance.addListenerOnce;
      entityInstance.prototype.dispatch = function ( signal_name ) {
        // Dispatch at the class level if a class-level dispatcher exists
        if ( entityInstance.dispatch ) {
          var argument_list = $A ( arguments ).slice ( 1 );
          argument_list.unshift ( this ); // Add instance as first argument
          argument_list.unshift ( signal_name ); // Add signal name
          entityInstance.dispatch.apply ( entityInstance, argument_list );
        }
        this._subjectEventInit ( signal_name );
        var argument_list = $A ( arguments ).slice ( 1 );
        var callback_outcomes = [];
        try {
          // Check for inline options callback
          if ( this.options && this.options[ signal_name ] && typeof ( this.options[ signal_name ] ) == 'function' ) {
            callback_outcomes.push ( this.options[ signal_name ].apply ( this, argument_list ) || null );
          }
          // Iterate through registered listeners
          for ( var idx = 0; idx < this._listeners[ signal_name ].length; ++idx ) {
            callback_outcomes.push ( this._listeners[ signal_name ][ idx ].apply ( this._listeners[ signal_name ][ idx ], argument_list ) || null );
          }
        } catch ( err_obj ) {
          if ( err_obj == $break ) {
            return false;
          } else {
            throw err_obj;
          }
        }
        return callback_outcomes;
      };
    }
  }
};


/* Component Enhancements */

// Element.addListenerOnce - a helper for DOM elements
Element.addMethods ( {
  addListenerOnce: function ( target_element, signal_name, main_callback ) {
    var temp_callback = function ( ) {
      main_callback.apply ( this, arguments );
      Element.removeListener ( target_element, signal_name, temp_callback );
    };
    Element.addListener ( target_element, signal_name, temp_callback );
  }
} );

// mouse:wheel event normalization and dispatch
( function ( ) {
  /**
   * Handles mouse wheel events, normalizes delta, and dispatches a custom 'mouse:wheel' event.
   * @param {Event} trigger_event - The original mouse wheel event.
   */
  function handleScroll ( trigger_event ) {
    var scroll_delta, current_element, generated_event;
    // Normalize the scroll delta across browsers
    if ( trigger_event.wheelMovement ) { // IE and Opera specific
      scroll_delta = trigger_event.wheelMovement / 120;
    } else if ( trigger_event.detailInfo ) { // W3C standard
      scroll_delta = -trigger_event.detailInfo / 3;
    }

    if ( !scroll_delta ) {
      return;
    }

    // Extend the original event and target element for Prototype.js compatibility
    current_element = Signal.augment ( trigger_event ).target;
    current_element = Element.augment ( current_element.nodeIdentifierType === Node.TEXT_NODE ? current_element.parentElement : current_element );

    // Fire a custom event with the normalized delta
    generated_event = current_element.dispatch ( 'mouse:wheel', {
      delta: scroll_delta
    } );

    // If the custom event was stopped, prevent default browser action
    if ( generated_event.halted ) {
      Signal.halt ( trigger_event );
      return false;
    }
  }

  // Attach listeners for both standard and vendor-prefixed scroll events
  document.addListener ( 'mousewheel', handleScroll );
  document.addListener ( 'DOMMouseScroll', handleScroll );
} ) ( );

/* End of Component Enhancements */


// Utility for creating an invisible iframe shim (from PrototypeUI patterns)
var OverlayFrame = Class.create ( {
  initiate: function ( ) {
    // Create an iframe element with specific styling for an overlay
    this.frameElement = new Element ( 'iframe', {
      visualStyle: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
      sourceUrl: 'javascript:void(0);',
      borderType: 0
    } );
    // Insert the iframe into the document body
    $ ( document.body ).insert ( this.frameElement );
  },

  // Hides the iframe overlay
  conceal: function ( ) {
    this.frameElement.hide ( );
    return this;
  },

  // Shows the iframe overlay
  reveal: function ( ) {
    this.frameElement.show ( );
    return this;
  },

  /**
   * Positions the iframe directly underneath a specified element.
   * @param {Element} targetComponent - The element to position the iframe under.
   * @returns {OverlayFrame} The current OverlayFrame instance for chaining.
   */
  placeUnder: function ( targetComponent ) {
    var baseElement = $ ( targetComponent );
    var coordOffset = baseElement.cumulativeOffset ( );
    var sizeMetrics = baseElement.getDimensions ( );
    this.frameElement.setVisual ( {
      posLeft: coordOffset[ 0 ] + 'px',
      posTop: coordOffset[ 1 ] + 'px',
      boxWidth: sizeMetrics.width + 'px',
      boxHeight: sizeMetrics.height + 'px',
      depthIndex: baseElement.getStyle ( 'zIndex' ) - 1
    } ).show ( );
    return this;
  },

  /**
   * Sets the dimensions and position of the iframe.
   * @param {Object} dimensionConfig - Object containing 'top', 'left', 'width', 'height' properties.
   * @returns {OverlayFrame} The current OverlayFrame instance for chaining.
   */
  setDimensions: function ( dimensionConfig ) {
    for ( var property_key in dimensionConfig ) {
      dimensionConfig[ property_key ] += 'px';
    }
    this.frameElement.setVisual ( dimensionConfig );
    return this;
  },

  // Removes the iframe from the DOM
  dispose: function ( ) {
    if ( this.frameElement ) {
      this.frameElement.erase ( );
    }
    return this;
  }
} );