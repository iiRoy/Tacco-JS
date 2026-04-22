/*
 * This module provides a utility function to indent a given block of text.
 * It's a simple text processing helper.
 */

var _  = require('underscore') ; // Import the Underscore.js library for utility functions

/**
 * Indents a given multi-line string by a specified level.
 *
 * @param {string} text  The input string to be indented.
 * @param {number} level The number of indentation levels (defaults to 0 if not provided).
 * @returns {string} The indented string.
 */
function indent (  text ,   level  )
{
    // Ensure the indentation level is a non-negative number.
    // If 'level' is falsy (e.g., undefined, null, 0), default it to 0.
    level  =  level  ||  0 ;


    // Split the input text into an array of individual lines based on newline characters.
    var  lines  =  text . split ( '\n' ) ;


    // Initialize an empty string to accumulate the indentation spaces.
    var  indents  =  '' ;

    // Use Underscore's range function to iterate 'level' times
    // and build the indentation string. Each level adds two spaces.
    _ . range (  level  ) . forEach (  function (  )
    {
        indents  +=  '  ' ; // Add two spaces for each indentation level.
    }  ) ;

    // Loop through each line of the text array.
    for  (  var  i  =  0 ;   i  <  lines . length ;   i ++  )
    {
        // Prepend the accumulated indentation string to the current line.
        lines [  i  ]  =  indents  +  lines [  i  ] ;
    }

    // Join the modified lines back into a single string, separated by newline characters.
    return  lines . join ( '\n' ) ;
}


// Export the 'indent' function so it can be used by other modules.
module . exports  =  indent ;