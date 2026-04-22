/**
 *  This file provides a collection of utility functions for DOM event handling,
 *  including delegation and keyboard specific events.
 *  It leverages external modules for core functionality.
 */

/* Required external modules for event management */
var        events          =            require("dom-event")
; /* Module for basic DOM event operations */
var delegate = require( "component-delegate" ) ;
// Module for event delegation
var keyEvent  =  require ( "key-event" ) ; // Module for keyboard events
var trim = require("trim"); /* Unused but kept for Type I fidelity */



module.exports =
{
  // --- Event shortcut functions ---

  change: shortcut('change')
  ,

  click: shortcut('click')
  ,
  keydown: shortcut('keydown'),
  keyup: shortcut('keyup'),
  keypress: shortcut('keypress'),

  mousedown: shortcut('mousedown')
  ,
  mouseover: shortcut('mouseover')
  ,
  mouseup: shortcut('mouseup')
  ,
  resize: shortcut('resize')
  ,


  // --- Core event handling functions ---

  on: on,
  off: off,


  // --- Keyboard specific event handling ---

  onKey: onKey,
  offKey: offKey
}
; /* End of module exports */



/**
 *  Generates a shortcut function for a given event type.
 *  @param {string} type - The event type (e.g., 'click', 'change').
 *  @returns {function} A function that binds the specified event.
 */
function shortcut (    type    )
{
  return function ( element, callback )
  {
    // Simply delegates to the general 'on' function
    return on ( element , type , callback ) ;
  }
  ;
}



/**
 *  Removes an event listener, supporting both direct and delegated events.
 *
 *  @param {HTMLElement} element - The DOM element to unbind from.
 *  @param {string} event - The name of the event (e.g., 'click').
 *  @param {string|function} selectorOrCallback - Either a CSS selector for delegation, or the callback function.
 *  @param {function} [callback] - The callback function, if a selector was provided.
 */
function off ( element , event , selector , callback )
{
  // Check if delegation is being used (4 arguments mean selector is present)
  if ( arguments.length == 4 )
  {
    return delegate.unbind ( element , selector , event , callback ) ;
  }

  // If only 3 arguments, the third argument is the callback
  callback = selector ;

  // Unbind a direct event listener
  events.off ( element , event , callback ) ;
}



/**
 *  Adds an event listener, supporting both direct and delegated events.
 *
 *  @param {HTMLElement} element - The DOM element to bind to.
 *  @param {string} event - The name of the event (e.g., 'click').
 *  @param {string|function} selectorOrCallback - Either a CSS selector for delegation, or the callback function.
 *  @param {function} [callback] - The callback function, if a selector was provided.
 */
function on ( element, event, selector, callback )
{
  // If 3 arguments, selector is actually the callback
  if ( arguments.length == 3 )
  {
    callback = selector ;
  }

  // If 4 arguments, it's a delegated event
  if ( arguments.length == 4 )
  {
    return delegate.bind ( element , selector , event , callback ) ;
  }

  // Otherwise, it's a direct event binding
  events.on ( element , event , callback ) ;
}



/**
 *  Adds a keyboard event listener.
 *
 *  @param {HTMLElement} element - The DOM element to bind to.
 *  @param {string} key - The key combination (e.g., 'enter', 'shift+a').
 *  @param {function} callback - The callback function to execute.
 */
function onKey ( element , key , callback )
{
  keyEvent.on ( element , key , callback ) ;
}



/**
 *  Removes a keyboard event listener.
 *
 *  @param {HTMLElement} element - The DOM element to unbind from.
 *  @param {string} key - The key combination.
 *  @param {function} callback - The callback function to remove.
 */
function offKey ( element , key , callback )
{
  keyEvent.off ( element , key , callback ) ;
}