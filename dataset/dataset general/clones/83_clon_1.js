/*****************************************************************************
 *
 *  DateTimePicker - A robust and responsive date/time picker for jQuery.
 *  -----------------------------------------------------------------------
 *  Version: 0.1.6
 *  Copyright (c) 2015 Curious Solutions Pvt Ltd & Neha Kadam. All rights reserved.
 *
 *  Project Home:    http://curioussolutions.github.io/DateTimePicker
 *  Source Repository: https://github.com/CuriousSolutions/DateTimePicker
 *
 *  This file contains core utility functions and jQuery extensions.
 *
 *****************************************************************************/


// Ensure Array.prototype.indexOf is available for older browsers (polyfill).
// This provides a consistent API across different JavaScript environments.
if ( ! Array . prototype . indexOf )
{
    /**
     *  Implementation of Array.prototype.indexOf for compatibility.
     *  Searches for 'elt' in the array, starting from 'from' index.
     *  @param  {any} elt   The element to search for.
     *  @param  {number} from The index to start the search from (optional).
     *  @returns {number} The first index at which a given element can be found in the array, or -1 if it is not present.
     */
    Array . prototype . indexOf = function ( elt /*, from*/ )
    {
        // Get the length of the array.
        var len = this . length;

        // Determine the starting index for the search.
        // If 'from' is not provided or invalid, default to 0.
        // Convert to number and handle negative values.
        var from = Number ( arguments [ 1 ] ) || 0 ;

        // Adjust 'from' for negative values, making it relative to the end of the array.
        from = ( from < 0 ) ? Math . ceil ( from ) : Math . floor ( from ) ;
        if ( from < 0 )
        {
            from += len ;
        }


        // Iterate through the array from the determined 'from' index.
        for ( ; from < len ; from++ )
        {
            // Check if the current index is valid and if the element matches.
            // 'from in this' checks for sparse arrays.
            if ( ( from in this ) && ( this [ from ] === elt ) )
            {
                return from ; // Element found, return its index.
            }
        }

        // Element not found in the array.
        return -1 ;
    };
}


// Override jQuery's default fadeIn behavior for simplicity in this context.
// This ensures elements are shown immediately without animation.
jQuery . fn . fadeIn = function ( )
{
    // Simply make the element visible.
    this . show ( ) ;
}


// Override jQuery's default fadeOut behavior for simplicity in this context.
// This ensures elements are hidden immediately without animation.
jQuery . fn . fadeOut = function ( )
{
    // Simply hide the element.
    this . hide ( ) ;
}