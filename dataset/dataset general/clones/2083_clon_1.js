/*
 * This file is part of the LivePipe UI library.
 *
 * Original Author: Ryan Johnson <http://syntacticx.com/>
 * Copyright (c) 2008 PersonalGrid Corporation <http://personalgrid.com/>
 *
 * Package: LivePipe UI Core Components
 * License: MIT License (see http://www.opensource.org/licenses/mit-license.php)
 * Project URL: http://livepipe.net/core
 *
 * Dependencies:
 *   - prototype.js (required)
 *
 * This code has been extensively reformatted and commented for demonstration
 * purposes as a Type I code clone. No logical changes have been made.
 */


// Ensure the global 'Control' object exists.
// If 'Control' is not defined, initialize it as an empty object.
if ( typeof ( Control ) == 'undefined' ) {
    Control = {}; // Initialize Control namespace
}


/*
 * Helper function: $proc
 *
 * This utility ensures that a given argument is always a function.
 * If 'proc' is already a function, it's returned as is.
 * Otherwise, a new function is created that simply returns the 'proc' value.
 */
var $proc = function ( proc ) {
    // Check if the input 'proc' is a function.
    return typeof ( proc ) == 'function'
        ? proc // If it is, return it directly.
        : function ( ) {
            // If not, return a new function that returns the original 'proc' value.
            return proc;
        };
}; // End of $proc function definition


/*
 * Helper function: $value
 *
 * This utility function retrieves the actual value from an argument.
 * If 'value' is a function, it's executed and its return value is used.
 * Otherwise, the 'value' itself is returned.
 */
var $value = function ( value ) {
    // Determine if 'value' is a function.
    return typeof ( value ) == 'function'
        ? value( ) // If it's a function, call it to get the value.
        : value;   // Otherwise, use the value directly.
}; // End of $value function


// Object: Event
// Provides a generic event observation/notification mechanism that can be
// extended onto any JavaScript object or Prototype.js Class.
Object.Event = {

    // The 'extend' method adds event observation capabilities to any given object.
    // It injects several methods (_objectEventSetup, observe, stopObserving, observeOnce, notify)
    // directly into the provided 'object'.
    extend: function ( object ) {

        // Internal helper method: _objectEventSetup
        // Ensures that the observer registry for a specific event name exists.
        object._objectEventSetup = function ( event_name ) {
            // Initialize the top-level _observers object if it doesn't exist.
            this._observers                     = this._observers || {};
            // Initialize the array for a specific event_name if it doesn't exist.
            this._observers[ event_name ]       = this._observers[ event_name ] || [];
        };

        // Method: observe
        // Allows an observer function to be registered for a specific event.
        // Can handle a single event/observer pair or an object of event/observer pairs.
        object.observe = function ( event_name, observer ) {

            // Check if a single event name (string) and an observer are provided.
            if ( typeof ( event_name ) == 'string' && typeof ( observer ) != 'undefined' ) {
                // Ensure the observer array for this event is set up.
                this._objectEventSetup( event_name );
                // Add the observer if it's not already present in the list.
                if ( !this._observers[ event_name ].include( observer ) ) {
                    this._observers[ event_name ].push( observer );
                }
            } else {
                // If event_name is an object, iterate over its properties
                // and observe each event with its corresponding observer.
                for ( var e in event_name ) {
                    this.observe( e, event_name[ e ] );
                }
            }
        };

        // Method: stopObserving
        // Removes an observer for a specific event, or all observers for an event,
        // or all observers for all events.
        object.stopObserving = function ( event_name, observer ) {

            // Ensure the observer array for this event is set up (though it might be empty).
            this._objectEventSetup( event_name );

            // Case 1: Both event_name and observer are provided.
            // Remove the specific observer from the event's list.
            if ( event_name && observer ) {
                this._observers[ event_name ] = this._observers[ event_name ].without( observer );
            }
            // Case 2: Only event_name is provided.
            // Clear all observers for that specific event.
            else if ( event_name ) {
                this._observers[ event_name ] = [];
            }
            // Case 3: Neither event_name nor observer are provided.
            // Clear all observers for all events.
            else {
                this._observers = {};
            }
        };

        // Method: observeOnce
        // Registers an observer that will automatically unregister itself after being called once.
        object.observeOnce = function ( event_name, outer_observer ) {

            // Create an inner observer that calls the outer_observer and then stops observing itself.
            var inner_observer = function ( ) {
                outer_observer.apply( this, arguments ); // Call the original observer.
                this.stopObserving( event_name, inner_observer ); // Unregister this one-time observer.
            }.bind( this ); // Ensure 'this' context is preserved for the inner observer.

            // Set up the event's observer array.
            this._objectEventSetup( event_name );
            // Add the inner, self-unregistering observer to the list.
            this._observers[ event_name ].push( inner_observer );
        };

        // Method: notify
        // Triggers an event, executing all registered observers for that event.
        // Any additional arguments passed to notify will be forwarded to the observers.
        object.notify = function ( event_name ) {

            // Prepare the observer list for the event.
            this._objectEventSetup( event_name );

            var collected_return_values = []; // Array to store return values from observers.
            // Extract arguments passed after event_name.
            var args                    = $A( arguments ).slice( 1 );

            try {
                // Iterate through all registered observers for the event.
                for ( var i = 0; i < this._observers[ event_name ].length; ++i ) {
                    // Call each observer with the collected arguments.
                    // Store the return value, defaulting to null if observer returns undefined.
                    collected_return_values.push(
                        this._observers[ event_name ][ i ].apply(
                            this._observers[ event_name ][ i ],
                            args
                        ) || null
                    );
                }
            } catch ( e ) {
                // If a $break exception is thrown, stop execution and return false.
                if ( e == $break ) {
                    return false;
                }
                // For any other exception, re-throw it.
                else {
                    throw e;
                }
            }
            // Return an array of all collected return values from the observers.
            return collected_return_values;
        };

        // If the object has a prototype (i.e., it's a constructor function),
        // also extend its prototype with event observation capabilities.
        // This allows instances created from the constructor to observe and notify events.
        if ( object.prototype ) {

            // Assign the setup method to the prototype.
            object.prototype._objectEventSetup  = object._objectEventSetup;
            // Assign the observe method to the prototype.
            object.prototype.observe            = object.observe;
            // Assign the stopObserving method to the prototype.
            object.prototype.stopObserving      = object.stopObserving;
            // Assign the observeOnce method to the prototype.
            object.prototype.observeOnce        = object.observeOnce;

            // The 'notify' method on the prototype is slightly different,
            // as it also allows for notifying the object itself (static notify)
            // and checking for 'options' callbacks.
            object.prototype.notify = function ( event_name ) {

                // If the object itself has a static 'notify' method, call it first.
                // This allows for global notifications or pre-processing.
                if ( object.notify ) {
                    var args_for_static_notify = $A( arguments ).slice( 1 ); // Get original arguments.
                    args_for_static_notify.unshift( this );                 // Prepend 'this' (the instance).
                    args_for_static_notify.unshift( event_name );           // Prepend event_name.
                    object.notify.apply( object, args_for_static_notify );  // Call static notify.
                }

                // Prepare the observer list for the instance's event.
                this._objectEventSetup( event_name );

                var args                        = $A( arguments ).slice( 1 ); // Arguments for instance observers.
                var collected_return_values     = [];                         // Store return values.

                try {
                    // Check if there's a callback defined in the instance's 'options' property
                    // for this specific event. If so, execute it.
                    if (
                        this.options
                        && this.options[ event_name ]
                        && typeof ( this.options[ event_name ] ) == 'function'
                    ) {
                        collected_return_values.push(
                            this.options[ event_name ].apply( this, args ) || null
                        );
                    }

                    // Now, iterate through the standard registered observers for the event.
                    for ( var i = 0; i < this._observers[ event_name ].length; ++i ) {
                        collected_return_values.push(
                            this._observers[ event_name ][ i ].apply(
                                this._observers[ event_name ][ i ],
                                args
                            ) || null
                        );
                    }
                } catch ( e ) {
                    // Handle $break exception to stop observer chain.
                    if ( e == $break ) {
                        return false;
                    }
                    // Re-throw any other exceptions.
                    else {
                        throw e;
                    }
                }
                // Return all collected return values from instance-level observers and options callback.
                return collected_return_values;
            };
        } // End of if (object.prototype)
    } // End of extend method
}; // End of Object.Event definition


/*
 * ===========================================================================
 *                         Begin Core Extensions
 * ===========================================================================
 *
 * This section includes extensions to Prototype.js's core functionalities.
 */


// Extension: Element.observeOnce
// Adds a one-time observation capability directly to Element objects.
Element.addMethods( {
    // The 'observeOnce' method for elements.
    // Registers a callback that fires once and then automatically unregisters itself.
    observeOnce: function ( element, event_name, outer_callback ) {

        // Create an internal callback wrapper.
        var inner_callback = function ( ) {
            // Execute the original callback, passing along all arguments.
            outer_callback.apply( this, arguments );
            // After execution, stop observing this event with the inner callback.
            Element.stopObserving( element, event_name, inner_callback );
        };

        // Register the inner callback for the specified event on the element.
        Element.observe( element, event_name, inner_callback );
    }
} );


// Feature: mouse:wheel custom event
// This Immediately Invoked Function Expression (IIFE) sets up cross-browser
// mouse wheel event handling and normalizes the delta value.
( function ( ) {

    // The main handler function for mouse wheel events.
    function wheel ( event ) {
        var delta,          // Stores the normalized wheel delta.
            element,        // The target element of the event.
            custom_event;   // The custom event fired by Prototype.js.

        // Normalize the mouse wheel delta across different browsers.
        if ( event.wheelDelta ) { // For Internet Explorer and Opera browsers.
            delta = event.wheelDelta / 120;
        } else if ( event.detail ) { // For W3C compliant browsers (e.g., Firefox).
            delta = -event.detail / 3; // Firefox reports detail in opposite direction.
        }

        // If no delta could be determined, exit early.
        if ( !delta ) {
            return;
        }

        // Extend the native event object to get the target element.
        element = Event.extend( event ).target;

        // Ensure the target element is a proper Element object, handling text nodes.
        element = Element.extend(
            element.nodeType === Node.TEXT_NODE
                ? element.parentNode
                : element
        );

        // Fire a custom 'mouse:wheel' event on the target element,
        // passing the normalized delta value.
        custom_event = element.fire( 'mouse:wheel', { delta: delta } );

        // If the custom event was stopped (e.g., by an observer returning false),
        // stop the propagation of the native event and return false.
        if ( custom_event.stopped ) {
            Event.stop( event ); // Prevent default browser action.
            return false;
        }
    } // End of wheel function

    // Attach the 'wheel' handler to the document for standard 'mousewheel' event.
    document.observe( 'mousewheel', wheel );
    // Attach the 'wheel' handler to the document for Firefox's 'DOMMouseScroll' event.
    document.observe( 'DOMMouseScroll', wheel );

} ) ( ); // Execute the IIFE immediately.


/*
 * ===========================================================================
 *                         End Core Extensions
 * ===========================================================================
 */


// Component: IframeShim
// Derived from PrototypeUI, this class creates and manages an invisible
// iframe that can be used to "shim" select boxes or other elements
// that appear above absolutely positioned divs in IE6.
var IframeShim = Class.create( {

    // The 'initialize' method is the constructor for the IframeShim.
    initialize: function ( ) {
        // Create a new iframe element with specific styles and attributes.
        // The style makes it invisible and absolutely positioned, and initially hidden.
        // 'src: javascript:void(0);' prevents unnecessary loading.
        this.element = new Element( 'iframe', {
            style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
            src: 'javascript:void(0);',
            frameborder: 0 // Ensure no border on the iframe.
        } );
        // Insert the newly created iframe into the document body.
        $( document.body ).insert( this.element );
    },

    // Method: hide
    // Hides the iframe shim.
    hide: function ( ) {
        this.element.hide( );
        return this; // Enable method chaining.
    },

    // Method: show
    // Shows the iframe shim.
    show: function ( ) {
        this.element.show( );
        return this; // Enable method chaining.
    },

    // Method: positionUnder
    // Positions the iframe shim directly underneath a specified element,
    // matching its size and placing it one z-index level below.
    positionUnder: function ( element ) {
        var target_element = $( element ); // Ensure 'element' is a Prototype extended element.
        var offset         = target_element.cumulativeOffset( ); // Get absolute position.
        var dimensions     = target_element.getDimensions( );    // Get width and height.

        // Apply styles to the iframe to match the target element's position and size.
        // Set its z-index one less than the target to ensure it's underneath.
        this.element.setStyle( {
            left:     offset[ 0 ] + 'px',
            top:      offset[ 1 ] + 'px',
            width:    dimensions.width + 'px',
            height:   dimensions.height + 'px',
            zIndex:   target_element.getStyle( 'zIndex' ) - 1
        } ).show( ); // Show the iframe after positioning.

        return this; // Enable method chaining.
    },

    // Method: setBounds
    // Sets the position and dimensions of the iframe shim using a bounds object.
    setBounds: function ( bounds ) {
        // Iterate over properties in the bounds object and append 'px' suffix.
        for ( prop in bounds ) {
            bounds[ prop ] += 'px';
        }
        // Apply the modified bounds as styles to the iframe.
        this.element.setStyle( bounds );
        return this; // Enable method chaining.
    },

    // Method: destroy
    // Removes the iframe shim element from the DOM.
    destroy: function ( ) {
        // Check if the element exists before attempting to remove it.
        if ( this.element ) {
            this.element.remove( );
        }
        return this; // Enable method chaining.
    }
} ); // End of IframeShim class definition