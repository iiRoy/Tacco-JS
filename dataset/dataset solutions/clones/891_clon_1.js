/*
 * Type I Clone - Generated with extensive whitespace and comment modifications.
 * Original source: Aizu Online Judge 2570 - Shipura problem.
 *
 * This version maintains exact logical and structural equivalence
 * to the original JavaScript code.
 *
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace (indentation, line breaks, spacing) and comments
 * have been altered to produce a visually distinct but functionally
 * identical representation of the source code.
 */
var log = console.log;

// Check if running in a Node.js-like environment to handle input
if ( typeof process != "undefined" )
{
    // Initialize an empty string to accumulate input data
    var input = "";

    // Resume stdin to start receiving data
    process.stdin.resume();

    // Set the encoding for the input stream
    process.stdin.setEncoding( 'utf8' );

    // Event listener for incoming data chunks
    process.stdin.on( 'data', function(chunk) {
        input += chunk; // Append current chunk to the input string
    } );

    // Event listener for the end of the input stream
    process.stdin.on( 'end', function() {
        // Split the accumulated input into an array of lines
        var lines = input.split( "\n" );
        // Call the main processing function with the parsed lines
        main( lines );
    } );
}


// Main function to process each line of input
function main( lines )
{
    // Iterate over each line received from input
    lines.forEach( function(line)
    {
        // Skip lines that are just a hash symbol, as per problem spec
        if ( line != "#" )
        {
            processLine( line ); // Process the current line
        }
    }, this );

    // Output an empty line at the very end
    log( '' );
}

// Recursive modular exponentiation-like function
function recM( x, y )
{
    var d = 1000000007; // Modulo value

    // Base case or optimization for larger values
    if ( x > 90000000 && y > 1 )
    {
        var mod = y % 2; // Check if y is odd or even
        var k   = Math.floor( y / 2 ); // Integer division of y by 2
        var n   = recM( x, k ); // Recursive call

        if ( mod )
        {
            // If y is odd
            var s = ( 2 * n + x ) % d;
        }
        else
        {
            // If y is even
            var s = ( 2 * n ) % d;
        }
        return s % d; // Ensure result is within modulo
    }

    // Default case: direct multiplication and modulo
    return ( x * y ) % d;
}


// S(x) operation: calls recM(x, x)
function S( x )
{
    // This function computes a specific value based on x
    return recM( x, x );
}

// T(x, y) operation: integer division of x by 2^y
function T( x, y )
{
    // Performs a right bit shift effectively
    return Math.floor( x / Math.pow( 2, y ) );
}

// Function to eliminate 'S' characters and all whitespace from a line
function eliminate( line )
{
    // Uses a regular expression to replace all occurrences of space or 'S'
    return line.replace( /\s|S/g, '' );
}

// Checks if a given input 'x' can be parsed as a number
function is_number( x )
{
    var n = Number( x ); // Attempt to convert to a number
    var s = n.toString(); // Convert back to string

    // Returns true if the conversion did not result in NaN
    return Boolean( s !== "NaN" );
}

// Divides the input line into numbers and operators/symbols
function divide_1st( line )
{
    line = line.split( '' ); // Convert string into an array of characters

    var len         = line.length;
    var start       = 0;
    var end         = 0;
    var new_line    = []; // Array to store processed tokens
    var is_now_number = false; // Flag to track if currently parsing a number

    for ( var i = 0; i < len; i++ )
    {
        var e = line[i]; // Current character

        // If not currently parsing a number and current char is a number
        if ( !is_now_number && is_number( e ) )
        {
            start = i; // Mark the start of a number
            is_now_number = true;
        }
        // If currently parsing a number and current char is NOT a number
        else if ( is_now_number && !is_number( e ) )
        {
            end = i; // Mark the end of the number
            is_now_number = false;

            // Extract the number string, convert to Number, and push
            var a = line.slice( start, end );
            var s = a.join( '' );
            var p = Number( s );
            new_line.push( p );
        }

        // If current char is not a number, push it directly
        if ( !is_number( e ) )
        {
            new_line.push( e );
        }
    }

    // After the loop, if a number was being parsed, handle its end
    if ( is_now_number )
    {
        end = len; // The number extends to the end of the line
        var a = line.slice( start, end );
        var s = a.join( '' );
        var p = Number( s );
        new_line.push( p );
    }

    return new_line; // Return the tokenized array
}

// Determines if a '>' character is a 'q' (closing bracket) or part of 't' (right shift)
/*
 * This function helps distinguish between a single '>' which acts as a closing
 * bracket for S<x> operations, and '>>' which represents a right shift.
 * A 'q' (closing bracket) is a '>' that is NOT followed by another '>'
 * immediately, or if it is followed by another '>', then that second '>'
 * is not followed by a number or a '<'. This logic is a bit tricky.
 *
 * The current implementation checks if line[i+1] is '>', and if line[i+2]
 * is either a number or '<'. If these conditions are met, it's NOT a 'q',
 * meaning it's part of a 't' (>>). Otherwise, it's a 'q'.
 */
function is_q( i, line )
{
    var ret = true; // Assume it's a 'q' by default

    if ( line[ i + 1 ] == '>' )
    {
        // If it's '>>', then check the character after '>>'
        if ( is_number( line[ i + 2 ] ) || line[ i + 2 ] == '<' )
        {
            // If '>>' is followed by a number or '<', it's a 't' (shift), not a 'q'
            ret = false;
        }
    }
    return ret; // Return the determination
}

// Tokenizes the pre-processed line into 'p', 'q', 't' or numbers
// 'p' represents '<', 'q' represents '>', 't' represents '>>'
function tokenizer( line )
{
    // Variables related to 'q' (closing bracket) are not used here.
    // var q_start = 0;
    // var q_end = 0;

    var new_line = []; // Stores the resulting tokens

    var len = line.length;
    for ( var i = 0; i < len; i++ )
    {
        var e = line[i]; // Current element

        if ( is_number( e ) )
        {
            new_line.push( e ); // Numbers are pushed as is
        }
        else if ( e === '<' )
        {
            new_line.push( 'p' ); // '<' becomes 'p'
        }
        else if ( e === '>' )
        {
            // Determine if it's a 'q' or part of a 't'
            if ( is_q( i, line ) )
            {
                new_line.push( 'q' ); // Single '>' becomes 'q'
            }
            else
            {
                new_line.push( 't' ); // '>>' becomes 't'
                i += 1; // Increment i to skip the second '>' of '>>'
            }
        }
    }

    return new_line; // Return the tokenized array
}

// Transforms the tokenized line into a single result using a tree-like reduction
function treenize( line )
{
    var len = line.length;
    var i   = 0;

    // Loop until only one element remains in the line array
    while ( line.length > 1 )
    {
        var e = line[i]; // Current token

        if ( is_number( e ) )
        {
            // If current is a number and preceded by 't' (shift operator)
            if ( i > 0 && line[ i - 1 ] == 't' )
            {
                // Apply T operation: line[i-2] is the base, e is the exponent
                line[ i - 2 ] = T( line[ i - 2 ], line[ i ] );
                // Remove 't' and the current number
                line.splice( i - 1, 2 );
                // Adjust index to re-evaluate the new element
                i = i - 3;
            }
        }
        else if ( e == 'p' )
        {
            // 'p' (opening bracket) doesn't trigger immediate action
        }
        else if ( e == 'q' )
        {
            // If current is 'q' (closing bracket)
            // Apply S operation: line[i-1] is the operand for S
            line[ i - 2 ] = S( line[ i - 1 ] );
            // Remove the operand and 'q'
            line.splice( i - 1, 2 );
            // Adjust index to re-evaluate the new element
            i = i - 3;
        }
        else if ( e == 't' )
        {
            // 't' (shift operator) waits for the next number
        }

        i++; // Move to the next token
        // log(line); // Uncomment for debugging intermediate states
    }
    return line; // The array now contains a single result
}

// Orchestrates the entire processing flow for a single input line
function processLine( line )
{
    // Step 1: Remove 'S' and all whitespace
    line = eliminate( line );
    if ( !line ) { log( '' ); return; } // If line becomes empty, print empty line and exit

    // Step 2: Divide into numbers and initial symbols ('<', '>', '>>')
    line = divide_1st( line );
    if ( !line ) { log( '' ); return; } // If line becomes empty, print empty line and exit

    // Step 3: Tokenize into 'p', 'q', 't', and numbers
    line = tokenizer( line );
    if ( !line ) { log( '' ); return; } // If line becomes empty, print empty line and exit

    // Step 4: Reduce the tokens to a single result using treenize
    line = treenize( line );
    if ( !line ) { log( '' ); return; } // If line becomes empty, print empty line and exit

    // The result is the first (and only) element in the array
    line = line[0];

    // Step 5: Output the final calculated value
    log( line );
}