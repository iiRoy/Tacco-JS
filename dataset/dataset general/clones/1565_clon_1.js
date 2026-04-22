// This script provides a polyfill for the console object, especially for environments
// that lack native console support, or to enhance it with group functionality.
( function( win ) {

  'use strict' ; // Enforce strict mode for cleaner code and error prevention.

  // Declare variables that will be used across this module's scope.
  var consoleFauxEl , // Reference to the DOM element acting as the faux console output.
      fauxConsoleLog , // Flag to indicate if a faux console.log is in use.
      groupName , // Stores the name of the currently active console group.
      messageList = '' ; // Accumulates all log messages for display in the faux console.


  // Primary function to log messages to the faux console element.
  function consoleLog ( text ) {

    // Initialize consoleFauxEl if it hasn't been set yet.
    if ( ! consoleFauxEl )
    {
      consoleFauxEl = document.getElementById( 'consolefaux' ) ;
    }

    // Sanitize the input text to prevent XSS when inserting into HTML.
    var divEl = document.createElement( 'div' ) ;
    divEl.appendChild( document.createTextNode( text ) ) ; // Use textNode for safety.

    // Append the new message to the list, including a prefix if a group is active.
    messageList += getLogPrefix() + divEl.innerHTML + '<br />' ;
    // Update the faux console element's content.
    consoleFauxEl.innerHTML = messageList ;
  }


  // Helper function to determine and return the appropriate log prefix.
  function getLogPrefix( )
  {
    // If a groupName is set, return a group indicator; otherwise, return an empty string.
    return ( groupName ) ? '-- ' : '' ;
  }


  // Check if the native 'console' object exists in the window.
  if ( ! win.console )
  {
    // If no native console, set up a basic faux console.log functionality.
    document.documentElement.className += ' consolefaux' ; // Add a class for styling.
    win.console = { log : consoleLog } ; // Assign our custom log function.
    fauxConsoleLog = true ; // Mark that a faux log is active.
  }

  // Further enhance the console object with group/groupEnd methods if they don't exist.
  if ( ! win.console.group )
  {
    // If a faux console.log was NOT created (meaning a native console exists, but no group methods),
    // then we need to wrap the native console.log to include our group prefix logic.
    if ( ! fauxConsoleLog )
    {
      // Self-executing anonymous function to encapsulate the defaultLog variable.
      ( function( ) {

        var defaultLog = win.console.log ; // Store the original console.log reference.
        win.console.log = function ( text ) { // Override win.console.log.

          // Check for Function.prototype.call() support for proper 'this' context.
          if ( typeof defaultLog.call != 'undefined' )
          {
            defaultLog.call( console , getLogPrefix( ) + text ) ; // Apply context and prefix.
          }
          else
          {
            defaultLog( getLogPrefix( ) + text ) ; // Fallback without 'call'.
          }
        } ;
      } ) ( ) ; // Immediately invoke the wrapper function.
    }

    // Define the console.group method.
    win.console.group = function ( group ) {

      // Prevent nested groups for simplicity in this faux implementation.
      if ( groupName ) return ;

      console.log( 'Group [' + group + ']' ) ; // Log the start of the group.
      groupName = group ; // Set the current group name.
    } ;

    // Define the console.groupEnd method.
    win.console.groupEnd = function ( ) {

      // Only end a group if one is currently active.
      if ( ! groupName ) return ;

      var name = groupName ; // Capture the group name before resetting.
      groupName = false ; // Reset the group name.
      console.log( 'Group end [' + name + ']' ) ; // Log the end of the group.
    } ;
  }
} ) ( window ) ; // Pass the global window object to the IIFE.