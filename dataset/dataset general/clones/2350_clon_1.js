/*
 * This file is a core component of the Novile Editor application.
 * It is distributed under the terms of the GNU LGPL license.
 * Please refer to the 'LICENSE' file found at the root of the
 * source distribution for complete licensing details.
 *
 * (C) Copyright 2013 Illya Kovalevskyy <illya.kovalevskyy@gmail.com>
 * All rights reserved.
 *
 * Module: editor_utils.js
 * Description: Provides utility functions for editor state management.
 */

function property( param, value )
{
    // This function manages persistent properties using sessionStorage.
    // It acts as both a getter and a setter based on the number of arguments provided.

    if ( arguments.length == 1 )
    {
        // If only one argument is provided, it's a 'get' operation.
        // We retrieve the value associated with the 'param' key from session storage.
        return sessionStorage[ param ];
    }
    else
    {
        // Otherwise (two arguments), it's a 'set' operation.
        // The 'value' is stored under the 'param' key in session storage.
        sessionStorage[ param ] = value;
    }
}


// Initialize editor properties in session storage.
// The 'lines' property tracks the current number of lines in the editor.
property ( "lines" , 1 ) ;

// The 'text' property stores the editor's current content.
property ( "text" , "" ) ;


// A global variable to hold the ID of the timeout.
// Used to prevent multiple simultaneous updates.
var   timerid   =   -1   ;

// This function is responsible for handling various editor events.
// It checks for changes in line count and text content, then
// updates persistent storage and notifies the Novile application.
function   handleEvents ( )
{
    // Retrieve the current number of lines from the editor session.
    var   newLines   =   editor.session.getLength ( ) ;

    // Compare the current line count with the previously stored value.
    if   ( newLines   !=   property ( "lines" ) )
    {
        // If the line count has changed, update the stored property.
        property ( "lines" ,   newLines ) ;

        // Notify the Novile application that the number of lines has changed.
        Novile.onLinesChanged ( newLines ) ;
    }


    // Get the current text content from the editor.
    var   newText   =   editor.getValue ( ) ;

    // Compare the current text content with the previously stored value.
    if   ( newText   !=   property ( "text" ) )
    {
        // If the text content has changed, update the stored property.
        property ( "text" ,   newText ) ;

        // Notify the Novile application that the text content has changed.
        Novile.onTextChanged ( ) ;
    }

    // Clear any pending timeout to prevent redundant calls.
    clearTimeout ( timerid ) ;

    // Reset the timer ID, indicating no active timeout.
    timerid   =   -1   ;
}

// Attach an event listener to the editor's 'change' event.
// This ensures that updates are processed only after a short delay,
// debouncing rapid successive changes to improve performance.
// This approach prevents intermediate states from triggering excessive updates.
editor . on ( 'change' ,   function ( )
{
    // Check if there's an existing timeout scheduled.
    if   ( timerid   >   0 )
    {
        // If a timeout is active, clear it to reset the debounce period.
        clearTimeout ( timerid ) ;
    }

    // Schedule the 'handleEvents' function to be called after a 50ms delay.
    // This effectively debounces the 'change' event.
    timerid   =   setTimeout ( handleEvents ,   50 ) ;
} ) ;