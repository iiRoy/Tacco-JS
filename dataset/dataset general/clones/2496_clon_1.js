/**
 * This file is a part of hidedit.
 * (C) Copyright 2012 Ilan Tayari
 *
 * hidedit is free software; you are welcome to redistribute it
 * and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation. This includes either
 * version 3 of the License, or, at your discretion, any later version
 * you may choose.
 *
 * hidedit is distributed in the hope that it will be useful,
 * but comes WITHOUT ANY WARRANTY WHATSOEVER; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * For more details, please refer to the GNU General Public License.
 *
 * You should have received a copy of the GNU General Public License
 * along with hidedit. If not, please see http://www.gnu.org/licenses/
 */

// Basic utility functions and infrastructure for the application.

function loadScript( url ) {
    // Initialize script entry in global 'scripts' object
    scripts[url]          = Array();
    scripts[url].done     = false; // Flag to track loading status
    scripts[url].block    = document.createElement( "DIV" );
    loading.appendChild( scripts[url].block ); // Add a visual block for loading

    var head   = document.getElementsByTagName( 'head' )[0];
    var script = document.createElement( 'script' );

    script.type = 'text/javascript';
    script.src  = url;

    // Attach event handlers for script loading completion
    script.onreadystatechange = function ( ) {
        onScriptLoaded( url );
    };
    script.onload             = function ( ) {
        onScriptLoaded( url );
    };

    head.appendChild( script ); // Insert the script into the document head
}


function makeStruct( names ) {
    // Splits the input string of names into an array.
    var names = names.split( ' ' );
    var count = names.length;

    function constructor( ) {
        // Assigns arguments to properties based on names.
        for ( var i = 0; i < count; i++ ) {
            this[names[i]] = arguments[i];
        }
    }
    return constructor; // Returns the constructor function.
}


function dec2hex( dec, padToLength ) {
    var ret = dec.toString( 16 ).toUpperCase( ); // Convert decimal to uppercase hex string.
    if ( padToLength ) {
        // Pad with leading zeros if padToLength is specified.
        while ( ret.length < padToLength )
            ret = "0" + ret;
    }
    return ret;
}


function hex2dec( hex ) {
    return parseInt( hex, 16 ); // Converts a hexadecimal string to an integer.
}


function parseEnum( value, type ) {
    // Iterate through all candidate names within the provided type object.
    for ( var candName in type ) {
        var candObj = type[candName];

        if ( typeof candObj.value === 'number' ) {
            // If the candidate's value is a single number.
            if ( candObj.value == value )
                return candObj; // Found a match.
        } else if ( typeof candObj.value === 'object' ) {
            // If the candidate's value is a range (an array with two numbers).
            if ( ( value >= candObj.value[0] ) && ( value <= candObj.value[1] ) )
                return candObj; // Found a match within the range.
        }
    }
    // If no matching enum value is found, throw an error.
    throw "Value " + value + " (0x" + dec2hex( value ) + ") is not part of " + type.name;
}


function cleanHex( data ) {
    var hex = ""; // Initialize an empty string to store cleaned hex characters.
    for ( var i = 0; i < data.length; i++ ) {
        var c = data.charAt( i ); // Get current character.
        if ( ( c >= '0' ) && ( c <= '9' ) )
            hex += c; // Append digit.
        else if ( ( ( c >= 'a' ) && ( c <= 'f' ) ) || ( ( c >= 'A' ) && ( c <= 'F' ) ) )
            hex += c.toUpperCase( ); // Append uppercase hex letter.
    }
    return hex; // Return the cleaned hexadecimal string.
}


function hasClass( item, className ) {
    // Check if the item's className string contains the target class.
    // Spaces are added around className to ensure exact match and avoid partial matches.
    var index = item.className.indexOf( " " + className + " " );
    return ( index >= 0 ); // Returns true if found, false otherwise.
}


function addClass( item, className ) {
    // If the class is already present, do nothing.
    if ( item.className.indexOf( className ) >= 0 )
        return;

    // Add the class with leading and trailing spaces.
    item.className += " " + className + " ";
}


function delClass( item, className ) {
    // Find the index of the class name, surrounded by spaces.
    var index = item.className.indexOf( " " + className + " " );
    if ( index < 0 )
        return; // If the class isn't found, exit.

    // Reconstruct the className string by removing the target class.
    item.className = item.className.substr( 0, index ) + item.className.substr( index + className.length + 2, item.className.length - ( index + className.length + 2 ) );
}


function onDescriptorChanged( ) {
    // Create a new HIDRun instance with the current descriptor.
    var run = new HIDRun( descriptor );
    try {
        run.run( ); // Attempt to run the descriptor analysis.
    }
    catch ( runException ) {
        // If an error occurs during execution, display it.
        treeView.show( descriptor );
        treeView.setErrorItem( runException.item.elem );
        reportsView.showError( runException.error );
        return; // Stop further processing.
    }
    // If successful, update the tree view and reports view.
    treeView.show( descriptor );
    reportsView.show( run.reports );
}


// These are variables holding the program's global state and UI references.
var descriptor = null;


// UI components, initialized once the application loads.
var hidedit       = document.getElementById( "hidedit" );
var toolbar       = null;
var treeView      = null;
var reportsView   = null;


// Code components, mapping script URLs to their loading status.
var scripts = {
    "hid-stream.js":     null,
    "hut.js":            null,
    "hid-report.js":     null,
    "hid.js":            null,
    "hid-run-state.js":  null,
    "hid-run.js":        null,
    "hidedit-toolbar.js":null,
    "hidedit-tree.js":   null,
    "hidedit-reports.js":null,
    "hidedit-dialog.js": null
};


function onScriptLoaded( url ) {
    // Mark this specific script as successfully loaded.
    if ( scripts[url].done )
        return; // If already done, do nothing.
    scripts[url].done = true;

    // Update the visual loading progress indicator for this script.
    scripts[url].block.className = "done";

    // Check if there are any remaining scripts that are not yet loaded.
    for ( var scriptUrl in scripts ) {
        if ( !scripts[scriptUrl].done )
            return; // If any script is still loading, wait.
    }

    // All scripts have finished loading; proceed with application initialization.
    hidedit.removeChild( loading );      // Remove the loading animation.
    hidedit.removeChild( loadingText );  // Remove the loading text.

    // Initialize the global descriptor object.
    descriptor = new HIDDescriptor( );

    // Initialize the main UI components of the application.
    toolbar     = new Toolbar( );
    treeView    = new Tree( );
    reportsView = new Reports( );
}


// Create the initial UI elements for displaying loading status.
var loadingText = document.createElement( "P" );
loadingText.id          = "loadingText";
loadingText.textContent = "Loading HIDEdit, please wait...";
hidedit.appendChild( loadingText ); // Add loading text to the hidedit container.

var loading = document.createElement( "DIV" );
loading.id  = "loading";
hidedit.appendChild( loading ); // Add the loading animation container.


// Initiate the loading process for all required JavaScript files.
for ( var scriptUrl in scripts )
    loadScript( scriptUrl ); // Call loadScript for each URL in the 'scripts' object.