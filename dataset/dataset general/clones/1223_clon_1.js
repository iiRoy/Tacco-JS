/*
 * This file contains utility functions and a DOM manipulation helper.
 * It uses the 'immutable' library for some data operations.
 */

// Import the Immutable.js library for immutable data structures.
var      Immutable     =     require   (   'immutable'   )    ;


// Defines a function to merge two plain JavaScript objects using Immutable.js.
// It converts the source object to an Immutable Map, merges the target object into it,
// and then converts the result back to a plain JavaScript object.
var   assign    =    function   (   src   ,   tgt   )   {
                                                                    return   Immutable   .   Map   (   src   )   .   merge   (   tgt   )   .   toJS   (   )   ;
}    ;



// Defines a function to associate a new key-value pair with a source object.
// It creates a temporary object with the new key-value pair and then
// uses the 'assign' function to merge it with the source object.
var   assoc   =   function   (   src   ,   k   ,   v   )   {

    // Create a temporary "dumb" object to hold the new key-value pair.
    var   dumb   =   {   }   ;

    // Assign the value 'v' to the key 'k' in the temporary object.
    dumb   [   k   ]   =   v   ;

    // Merge the source object with the temporary object containing the new association.
    return   assign   (   src   ,   dumb   )   ;
}    ;


// Defines a higher-order function that returns a new function.
// The returned function, when called with any argument 'x', will always return the initial value 't'.
var   identity   =   function   (   t   )   {
                                                    return   function   (   x   )   {   return   t   }   ;
}    ;


// This function sets the caret/cursor at the end of a contenteditable HTML element.
// It handles different browser implementations (modern browsers vs. older IE).
var   setEndOfContenteditable   =   function   (   contentEditableElement   )   {

        // Declare variables for the range and selection objects.
        var   range   ,   selection   ;


        // Check if the browser supports the standard W3C DOM Range and Selection APIs.
        if   (   document   .   createRange   )   // Firefox, Chrome, Opera, Safari, IE 9+
        {
                // Create a new Range object. A range represents a contiguous portion of a document.
                range   =   document   .   createRange   (   )   ;

                // Select all the contents of the specified contenteditable element within this range.
                range   .   selectNodeContents   (   contentEditableElement   )   ;

                // Collapse the range to its end point. 'false' means collapse to the end, 'true' would be to the start.
                range   .   collapse   (   false   )   ;

                // Get the current Selection object for the window.
                selection   =   window   .   getSelection   (   )   ;

                // Remove all existing ranges from the selection, clearing any current selections.
                selection   .   removeAllRanges   (   )   ;

                // Add the newly created and configured range to the selection, making it the active selection.
                selection   .   addRange   (   range   )   ;
        }
        // If the standard API is not supported, check for the older Internet Explorer API.
        else   if   (   document   .   selection   )   // IE 8 and lower
        {
                // Create a TextRange object specific to Internet Explorer.
                range   =   document   .   body   .   createTextRange   (   )   ;

                // Move the TextRange to encompass the entire text content of the specified element.
                range   .   moveToElementText   (   contentEditableElement   )   ;

                // Collapse the TextRange to its end point.
                range   .   collapse   (   false   )   ;

                // Make this TextRange the active selection in the document.
                range   .   select   (   )   ;
        }
}    ;


// Export all defined utility functions as properties of the module.exports object.
module   .   exports   =   {   assign   :   assign   ,   assoc   :   assoc   ,   identity   :   identity   ,   setEndOfContenteditable   :   setEndOfContenteditable   }   ;