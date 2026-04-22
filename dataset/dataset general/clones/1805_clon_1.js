/*
 *  This is the comprehensive header block for the Escapify jQuery Plugin Library.
 *
 *  Project Title:    Escapify JQuery Plugin Library
 *  Version Number:   v0.1.0
 *  Official Website: http://www.therubinway.com/escapify
 *
 *  Copyright (C) 2010, Alan Rubin. All rights reserved.
 *  This software is distributed under the terms of the MIT license.
 *  (Please refer to the accompanying LICENSE file or the project website for full details.)
 *
 *  Purpose: This plugin provides simple, yet effective, utilities for HTML character
 *           escaping and unescaping within a web application context, leveraging jQuery.
 */


// The plugin is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This pattern helps to prevent global scope pollution and ensures that '$' refers to jQuery.
(  function  (   $   )   {


    // -------------------------------------------------------------------------
    // Function: $.escapifyHTML
    // Description: Escapes HTML special characters in a given string.
    //              This is crucial for preventing Cross-Site Scripting (XSS)
    //              when displaying user-generated content on a web page.
    // -------------------------------------------------------------------------
    $.escapifyHTML  =  function  (  text  )  {


        // We first perform a check to ensure that the 'text' parameter is provided
        // and is not a falsy value (e.g., null, undefined, empty string).
        if  (  text  )
        {
            // If 'text' is valid, we utilize a clever jQuery trick to perform the escaping.
            // 1. A temporary `div` element is created in memory (not appended to the DOM).
            // 2. The `text()` method is called on this `div`, setting its plain text content.
            //    jQuery automatically handles the escaping of HTML characters (like '<', '>', '&', etc.)
            //    when text is inserted this way.
            // 3. Finally, the `html()` method is called *without* arguments, which retrieves
            //    the innerHTML of the `div`. This innerHTML will contain the escaped version
            //    of the original 'text'.
            return   $  (  '<div/>'  )  .  text  (  text  )  .  html  (  )  ;

        } // End of the 'if' block for truthy 'text'.
        else
        {
            // In cases where 'text' is falsy (e.g., null, undefined, or an empty string),
            // a specific placeholder string is returned. This can be useful for debugging
            // or for indicating that no valid text was provided for escaping.
            return   '$$_undefined_escapifyHTML()_$$'   ;

        } // End of the 'else' block for falsy 'text'.


    }  ; // End of the $.escapifyHTML function definition.


    // -------------------------------------------------------------------------
    // Function: $.unescapifyHTML
    // Description: Unescapes HTML entities back into their original characters.
    //              This is useful when you need to display or process HTML content
    //              that was previously escaped.
    // -------------------------------------------------------------------------
    $.unescapifyHTML  =  function  (  text  )  {


        // As with `escapifyHTML`, we first validate the input 'text' parameter.
        if  (  text  )
        {
            // To unescape HTML, we use a similar jQuery-based DOM manipulation technique.
            // 1. A transient `div` element is instantiated in memory.
            // 2. The `html()` method is invoked on this `div`, setting its HTML content
            //    to the provided 'text'. If 'text' contains HTML entities (e.g., '&lt;', '&amp;'),
            //    the browser's HTML parser will automatically convert these entities
            //    into their corresponding characters when assigning to innerHTML.
            // 3. Subsequently, the `text()` method is called *without* arguments. This retrieves
            //    the plain text content of the `div`, which now holds the unescaped version
            //    of the original 'text'.
            return   $  (  '<div/>'  )  .  html  (  text  )  .  text  (  )  ;

        } // End of the 'if' block.
        else
        {
            // If 'text' is not a valid input, a distinct placeholder string is returned.
            // This helps differentiate between undefined inputs for escaping versus unescaping.
            return   '$$_undefined_unescapifyHTML()_$$'   ;

        } // End of the 'else' block.


    }  ; // End of the $.unescapifyHTML function definition.


// The global `jQuery` object is passed into the IIFE,
// aliasing it as '$' for local use within the plugin scope.
}  )  (  jQuery  )  ;


/*
 *  --- End of Escapify JQuery Plugin Library ---
 *  Thank you for using this utility!
 */