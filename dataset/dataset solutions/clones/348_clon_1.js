/*
 * This is a JavaScript file.
 * It strictly adheres to modern coding standards.
 */
"use strict";

// Core utility module import.
var util = require("util")
  , puts = console.log   /* Alias for console.log for quick output */
  , p    = util.print   // Another alias, for direct printing
  , cin  = parseInput(); // Initialize input parser immediately

/**
 * Parses and evaluates an arithmetic expression.
 * This function handles addition and subtraction operations.
 * @returns {number} The result of the expression.
 */
function expression( )
{
    // Start by evaluating the first term.
    var n = term();


    /* Loop indefinitely to process subsequent terms with + or - */
    while ( true )
    {
        // Check for an addition operator.
        if ( line[idx] == "+" )
        {
            idx++; // Advance the index past the operator.
            n += term(); // Add the next term.
        }
        // Else, check for a subtraction operator.
        else if ( line[idx] == "-" )
        {
            idx++; // Advance the index.
            n -= term(); // Subtract the next term.
        }
        // If neither, then the expression segment is complete.
        else
        {
            break; // Exit the loop.
        }
    }

    // Return the accumulated result.
    return n;
}


/*
 * This function parses and evaluates a term within an expression.
 * It handles multiplication and division operations.
 * A term is composed of factors.
 */
function term( )
{
    // Start with the first factor.
    var n = factor();

    // Continue processing factors as long as multiplication or division operators are found.
    while ( true )
    {
        // If the current character is a multiplication sign.
        if ( line[idx] == "*" )
        {
            idx++;     // Move to the next character.
            n *= factor(); // Multiply by the next factor.
        }
        // If the current character is a division sign.
        else if ( line[idx] == "/" )
        {
            idx++;     // Move past the operator.
            // Integer division using bitwise NOT operator trick (~~).
            n = ~~( n / factor() );
        }
        // No more multiplication or division operators for this term.
        else
        {
            break; // Exit the loop.
        }
    }
    // Return the calculated term value.
    return n;
}


// This function parses a factor.
// A factor can be a number, or an expression enclosed in parentheses.
function factor( )
{
    // Loop to handle parentheses or directly parse a number.
    while ( true )
    {
        // Check for an opening parenthesis.
        if ( line[idx] == "(" )
        {
            idx++;          // Move past the '('.
            return expression(); // Recursively evaluate the expression inside.
        }
        // Check for a closing parenthesis (should ideally not be here unless an empty expression or error).
        else if ( line[idx] == ")" )
        {
            idx++;          // Move past the ')'.
        }
        // If neither parenthesis, it must be a number or an error.
        else
        {
            break; // Exit the loop and parse a number.
        }
    }

    // If no parentheses, it's a direct number.
    var n = number();
    return n;
}


/*
 * Parses a sequence of digits to form a number.
 * Supports multi-digit integers.
 */
function number( )
{
    var ret; // Variable to store the parsed number.

    // Loop through characters to build the number.
    while ( true )
    {
        // Check if the current character is a digit using a regular expression.
        if ( /^\d/.test( line[idx] ) )
        {
            // If `ret` already has a value, append the new digit.
            // Otherwise, initialize `ret` with the first digit.
            // The unary '+' operator converts the character digit to a number.
            ret = ret ? ret * 10 + +line[idx] : +line[idx];
            idx++; // Move to the next character.
        }
        // If the character is not a digit, stop parsing the number.
        else
        {
            break;
        }
    }
    // Return the final parsed number.
    return ret;
}


// --- Global variables for input processing and parsing state ---
var n = cin.nextInt(), // Number of test cases to process.
    line,              // Stores the current input line being parsed.
    idx;               // Current index in the 'line' string.


// Main loop for processing each test case.
while ( n-- )
{
    idx = 0; // Reset index for each new line.

    line = cin.next(); // Get the next line from input.
    // Remove the last character (likely a newline or carriage return)
    // to ensure clean parsing of the arithmetic expression.
    line = line.slice( 0, line.length - 1 );

    // Evaluate the expression and print the result.
    puts( expression() );
}


/**
 * Custom input parser function.
 * Reads from stdin, splits input, and provides utility methods.
 * @param {boolean} [useSplitSpace=true] - Whether to split lines by spaces in addition to newlines.
 * @returns {object} An object with methods to access parsed input.
 */
function parseInput( useSplitSpace )
{
    var index = 0, // Current position in the flattened input array.
        ret   = [], // Array to hold all parsed input elements.
        input = require("fs").readFileSync( "/dev/stdin", "utf8" ), // Read all input from stdin.
        inputs = input.replace( /\r/g, '' ).split( "\n" ); // Normalize newlines and split into an array of lines.

    // Default to true if useSplitSpace is not provided.
    useSplitSpace = useSplitSpace || true;

    /*
     * Iterate over each line of input to flatten it into a single array.
     * This processes each line, potentially splitting it further by spaces.
     */
    inputs.forEach( function ( val )
    {
        // If splitting by spaces is enabled and the line is not empty.
        if ( useSplitSpace && val !== "" )
        {
            val.split( " " ).forEach( function ( el )
            {
                // Push non-empty elements into the result array.
                if ( el !== "" ) ret.push( el );
            } );
        }
        // If not splitting by spaces, or if the line is empty, just push the line itself.
        else
        {
            ret.push( val );
        }
    } );

    // Return an object containing helper functions for navigating the parsed input.
    return {
        // Checks if there is a next element, or if the next element matches a specific value.
        hasNext: function ( val )
        {
            if ( typeof val === "undefined" )
            {
                return typeof ret[index] !== "undefined";
            }
            else
            {
                return ret[index] === val;
            }
        },
        // Retrieves the next element from the input array and advances the index.
        next: function ( )
        {
            // Throw an error if trying to access beyond the array bounds.
            if ( typeof ret[index+1] === "undefined" ) throw new RangeError( "Index out of bounds at '" + index+1 + "'" );
            return ret[index++]; // Return current element and increment index.
        },
        // Retrieves the next element and attempts to convert it to a number.
        nextNumber: function ( )
        {
            // Validate if the next element is a valid number string.
            if ( !/^\d+$/.test( this.top() ) ) throw new TypeError( "'" + this.top() + "' cannot convet to Number" );
            return +this.next(); // Convert to number using unary plus and return.
        },
        // Retrieves the next element and converts it to an integer.
        nextInt: function ( )
        {
            return parseInt( this.nextNumber() );
        },
        // Peeks at the current element without advancing the index.
        top: function ( )
        {
            return ret[index];
        },
        // Resets the input index to the beginning.
        rewind: function ( )
        {
            index = 0;
        }
    };
}