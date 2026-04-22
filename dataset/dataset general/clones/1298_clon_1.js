/*
 * js-finite-state-machine: A Simple FSM Library
 *
 * This file contains the core implementation of a JavaScript Finite State Machine.
 * It provides mechanisms for defining states, events, and transitions between states.
 *
 * Project Home: https://github.com/jhund/js-finite-state-machine
 * Copyright (c) 2011 Jo Hund, ClearCove Software Inc.
 * Original Concept: FSM by Anthony Blackshaw <ant@getme.co.uk> (www.getme.co.uk) Copyright (c)2008
 *
 * License: MIT (or similar, check original project for details)
 */


// FSM Constructor: Initializes a new state machine instance.
//
// Usage Example:
//   var myFsm = new FSM("off", { deviceId: "A123", mode: "standby" });
//
// @param {String} initialState - The initial state for this state machine.
// @param {Object} [data]       - Optional data object specific to this FSM instance.
//                                  Accessible as `this.data` within transition callbacks.
function FSM ( initialState , data )
{

    this.stateTransitions           = {};
    this.stateTransitionsFromAnyState = {};
    this.defaultTransition          = null;

    this.currentState               = initialState;
    this.data                       = data;

    // Debugging flag: Set to `true` to enable console logging for events and transitions.
    this.debug                      = true;

} ; // End of FSM constructor


// FSM.prototype.addTransition: Defines a specific state transition.
//
// This method sets up a transition that occurs when a specific event
// is received while the FSM is in one of the specified current states.
//
// @param {String|Array<String>} events        - One or more event names that trigger this transition.
// @param {String|Array<String>} currentStates - One or more states in which this transition is valid.
// @param {Function|null}        callback      - An optional function to execute before the state changes.
//                                                 It's called in the FSM's context (`this` refers to the FSM).
// @param {String}               nextState     - The state the FSM will enter after the transition.
//                                                 If omitted or `null`, the FSM remains in its current state.
FSM . prototype . addTransition = function ( events , currentStates , callback , nextState )
{

    // Ensure 'events' is an array for consistent iteration.
    if ( typeof ( events ) === 'string' ) {
        events = [ events ] ;
    }

    // Ensure 'currentStates' is an array for consistent iteration.
    if ( typeof ( currentStates ) === 'string' ) {
        currentStates = [ currentStates ] ;
    }


    for ( var i = 0 ; i < events . length ; i ++ ) {

        for ( var j = 0 ; j < currentStates . length ; j ++ ) {

            // If `nextState` is not provided, the FSM stays in the `currentStates[j]`.
            if ( ! nextState ) {
                nextState = currentStates [ j ] ;
            }

            // Store the transition: key is [event, currentState], value is [callback, nextState].
            this . stateTransitions [ [ events [ i ] , currentStates [ j ] ] ] = [ callback , nextState ] ;

        } // End of inner for loop (currentStates)

    } // End of outer for loop (events)

} ; // End of addTransition method


// FSM.prototype.addTransitionFromAnyState: Defines a transition that can occur from any state.
//
// This type of transition is considered if no "specific" transition (defined by `addTransition`)
// matches the current state and event.
//
// @param {String|Array<String>} events    - One or more event names that trigger this transition.
// @param {Function|null}        callback  - An optional function to execute before the state changes.
// @param {String}               nextState - The state the FSM will enter after the transition.
//                                             If omitted or `null`, the FSM remains in its current state.
FSM . prototype . addTransitionFromAnyState = function ( events , callback , nextState )
{

    // Normalize events to an array.
    if ( typeof ( events ) === 'string' ) {
        events = [ events ] ;
    }

    for ( var i = 0 ; i < events . length ; i ++ ) {

        // Store the "from any state" transition: key is event, value is [callback, nextState].
        this . stateTransitionsFromAnyState [ events [ i ] ] = [ callback , nextState ] ;

    } // End of for loop

} ; // End of addTransitionFromAnyState method


// FSM.prototype.setDefaultTransition: Sets a global default transition.
//
// This transition is used as a fallback if no other specific or "from any state"
// transition matches the current event.
//
// @param {Function|null} callback  - An optional function to execute before the state changes.
// @param {String}        nextState - The state the FSM will enter after the transition.
//                                      If omitted or `null`, the FSM remains in its current state.
FSM . prototype . setDefaultTransition = function ( callback , nextState )
{

    this . defaultTransition = [ callback , nextState ] ;

} ; // End of setDefaultTransition method


// FSM.prototype.getTransition: Retrieves the appropriate transition for a given event and state.
//
// The lookup order for transitions is:
// 1. Specific transition (event + current state).
// 2. "From any state" transition (event only).
// 3. Default transition (global fallback).
//
// @param {String} event - The event that is being processed.
// @param {String} state - The current state of the FSM.
// @returns {Array}      - A tuple: `[callbackFunction, nextState]`.
//                           `nextState` will be the current state if no specific `nextState` was defined
//                           for the matched transition.
// @throws {Error}       - If no matching transition is found for the given event and state.
FSM . prototype . getTransition = function ( event , state )
{

    var r ; // Variable to hold the found transition tuple.

    // Attempt to find a matching transition in the specified order.
    r = this . stateTransitions [ [ event , state ] ] || // 1. Try "specific" transition first.
        this . stateTransitionsFromAnyState [ event ] || // 2. If not found, try "from any state".
        this . defaultTransition ;                       // 3. Finally, try the "default" transition.


    if ( r ) {

        // Return the callback and the determined next state.
        // If the `nextState` in `r` is null/undefined, stay in the current `state`.
        return [ r [ 0 ] , r [ 1 ] || this . currentState ] ;

    } else {

        // If no transition is found, throw an error.
        throw Error ( "Transition is undefined: (" + event + ", " + state + ")" ) ;

    }

} ; // End of getTransition method


// FSM.prototype.sendEvent: Processes an event, triggering a state transition.
//
// This is the primary method to interact with the FSM, causing it to potentially
// change state and execute associated callbacks.
//
// @param {String} event     - The name of the event to send to the state machine.
// @param {Object} [eventData] - Optional data specific to this event.
//                                 This data is passed as an argument to the transition callback.
FSM . prototype . sendEvent = function ( event , eventData )
{

    var result         = this . getTransition ( event , this . currentState ) ;
    var currentState   = this . currentState ;
    var newState ;
    var callback ;
    var debugMsg ;

    newState = result [ 1 ] ;
    callback = result [ 0 ] ;

    // --- Debugging Output ---
    if ( this . debug && window . console && window . console . log )
    {

        debugMsg = [ ] ;

        if ( this . data && this . data . name ) {
            debugMsg . push ( this . data . name + ': ' ) ;
        } else {
            debugMsg . push ( 'FSM: ' ) ;
        }

        debugMsg . push ( event + ': ' ) ;
        debugMsg . push ( currentState + ' -> ' + newState ) ;

        if ( eventData ) {
            debugMsg . push ( '; with event data' ) ;
        }
        if ( callback ) {
            debugMsg . push ( '; with callback' ) ;
        }

        window . console . log ( debugMsg . join ( '' ) ) ;

    } // End of debug output block


    // Update the FSM's current state.
    this . currentState = newState ;

    // Store the last executed action (callback).
    this . action       = callback ;

    // Execute the callback if one was defined for the transition.
    // The callback is called in the context of the FSM instance (`this` refers to the FSM).
    if ( callback ) {
        callback . call ( this , eventData ) ;
    }

} ; // End of sendEvent method