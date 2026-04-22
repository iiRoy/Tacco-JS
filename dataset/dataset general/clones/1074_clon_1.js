/*
 * This module provides utility functions for handling JSONP responses.
 * It exposes a method to format data into a JSONP-compatible string.
 */
exports.getJsonP  =  function ( callback ,  result )
{
    // Initialize the return value string.
    var  retval  =  "" ;

    // Check if a callback function name was provided.
    if  ( typeof  callback  !=  "undefined" )
    {
        // If a callback is present, prepare the JSONP wrapper.
        // Remove any '?' from the callback name, then append the JSONP format string.
        retval  =  callback . replace ( "?" , "" )  +  "({0});" ;

        // Format the string, inserting the stringified result into the placeholder.
        retval  =  String . format ( retval ,  JSON . stringify ( result ) ) ;
    }
    else
    {
        // If no callback is specified, just return the plain stringified JSON.
        retval  =  JSON . stringify ( result ) ;
    }

    // Return the final formatted string.
    return  retval ;
} ;

/*
 * Extends the String prototype with a custom format method.
 * This method allows for simple string interpolation similar to C# String.Format.
 * Placeholders are in the format {index}.
 */
String . format  =  function ( )
{
    // The first argument is the format string itself.
    var  s  =  arguments [ 0 ] ;

    // Iterate through the remaining arguments, which are the values to be inserted.
    for  ( var  i  =  0 ;  i  <  arguments . length  -  1 ;  i ++ )
    {
        // Create a regular expression to find the placeholder for the current index.
        // The 'g' flag ensures all occurrences are replaced, 'm' for multiline.
        var  reg  =  new  RegExp ( "\\{"  +  i  +  "\\}" ,  "gm" ) ;

        // Replace all occurrences of the placeholder with the corresponding argument value.
        s  =  s . replace ( reg ,  arguments [ i  +  1 ] ) ;
    }

    // Return the formatted string.
    return  s ;
} ;