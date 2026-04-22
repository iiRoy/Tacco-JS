/*
 *	?§£????????????:Shipura
 *	(http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570)
 *
 *	-status: Done
 *
 *	-comment: This is a Type I clone of the original code.
 *            Whitespace and comments have been extensively altered
 *            to visually differentiate it, while maintaining
 *            exact structural and logical equivalence.
 *
 */

// Global logger variable, set to console.log for convenience.
var log = console.log;

// Check if running in a Node.js-like environment (where 'process' is defined).
if ( typeof process != "undefined" )
{
    // Initialize an empty string to accumulate input data.
    var input = "";

    // Resume stdin to start receiving data.
    process.stdin.resume();

    // Set the encoding for incoming data to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Register a 'data' event listener to append chunks to 'input'.
    process.stdin.on( 'data', function( chunk )
    {
        input += chunk;
    } );

    // Register an 'end' event listener to process all received input.
    process.stdin.on( 'end', function()
    {
        // Split the accumulated input into an array of lines.
        var lines = input.split( "\n" );

        // Call the main processing function with the lines.
        main( lines );
    } );
}


/**
 * The primary entry point for processing multiple lines of input.
 * Iterates through each line and processes it individually.
 * @param {Array<string>} lines - An array of input strings.
 */
function main( lines )
{
    // Iterate over each line provided in the input array.
    lines.forEach( function( line )
    {
        // Only process lines that are not exactly "#".
        if ( line != "#" )
        {
            processLine( line ); // Delegate processing to a separate function.
        }
    },
    this
    );
}

/**
 * Calculates (x * y) modulo 1000000007,
 * with a special recursive handling for large x and y.
 * This function seems to implement a form of modular exponentiation or multiplication.
 * @param {number} x - The first operand.
 * @param {number} y - The second operand.
 * @returns {number} The result of (x * y) % d, possibly with recursion.
 */
function recM( x, y )
{
    var d = 1000000007; // Modulo constant.

    // Special handling for large x and y, likely to prevent overflow or optimize.
    if ( x > 90000000 && y > 1 )
    {
        var mod = y % 2;           // Check if y is odd or even.
        var k = Math.floor( y / 2 ); // Integer division of y by 2.
        var n = recM( x, k );      // Recursive call.

        if ( mod )
        {
            var s = ( 2 * n + x ) % d; // If y is odd.
        }
        else
        {
            var s = ( 2 * n ) % d;     // If y is even.
        }

        return s % d; // Ensure the final result is also modulo d.
    }

    // Base case or for smaller values: direct modular multiplication.
    return ( x * y ) % d;
}


//S<x>?????????
/**
 * Computes S(x) which is defined as recM(x, x).
 * @param {number} x - The input value.
 * @returns {number} The result of recM(x, x).
 */
function S( x )
{
    return recM( x, x );
}

//x>>y?????????
/**
 * Computes T(x, y) which is Math.floor(x / (2^y)).
 * This represents a right bit shift operation.
 * @param {number} x - The number to shift.
 * @param {number} y - The number of positions to shift.
 * @returns {number} The result of Math.floor(x / Math.pow(2, y)).
 */
function T( x, y )
{
    return Math.floor( x / Math.pow( 2, y ) );
}

//remove s and spaces
/**
 * Removes all whitespace characters and the letter 'S' from a given string.
 * @param {string} line - The input string.
 * @returns {string} The modified string with 'S' and whitespace removed.
 */
function eliminate( line )
{
    return line.replace( /\s|S/g, '' );
}

//x ??? string
/**
 * Checks if a given value can be parsed as a number.
 * @param {*} x - The value to check.
 * @returns {boolean} True if x can be converted to a number, false otherwise.
 */
function is_number( x )
{
    var n = Number( x ); // Attempt to convert to a number.
    var s = n.toString(); // Convert back to string.

    //????£??????true
    // If the string representation of the number is not "NaN", it's a valid number.
    return Boolean( s !== "NaN" );
}

//<,>,??°????????????
/**
 * Divides an input line into a sequence of numbers and special characters ('<', '>').
 * It identifies contiguous sequences of digits as numbers.
 * @param {string} line - The input string to divide.
 * @returns {Array<string|number>} An array containing numbers and individual characters.
 */
function divide_1st( line )
{
    line = line.split( '' ); // Convert the string into an array of characters.
    var len = line.length;   // Get the length of the character array.
    var start = 0;           // Start index for number parsing.
    var end = 0;             // End index for number parsing.
    var new_line = [];       // Array to store the divided tokens.
    var is_now_number = false; // Flag to track if currently inside a number sequence.

    for ( var i = 0; i < len; i++ )
    {
        var e = line[i]; // Current character.

        // If not currently parsing a number and the current char is a number.
        if ( !is_now_number && is_number( e ) )
        {
            //??°??????????????§??????????????°????????£??????????????????
            start = i;
            is_now_number = true;
        }
        // If currently parsing a number and the current char is NOT a number.
        else if ( is_now_number && !is_number( e ) )
        {
            //????????????????????§elseif??§?????????
            //??°???????????????????????????
            end = i;
            is_now_number = false;

            //??°???????????¨??????push
            var a = line.slice( start, end ); // Extract the number string.
            var s = a.join( '' );             // Join characters back to a string.
            var p = Number( s );              // Convert to a number.
            new_line.push( p );               // Add the number to the new_line array.
        }

        // If the current character is not a number, push it directly.
        if ( !is_number( e ) )
        {
            //??°?????§????????????push
            new_line.push( e );
        }
    }

    //for???????????????????????????is_now_number???????¶????????????????
    // After the loop, if still parsing a number, it means the number extends to the end of the line.
    if ( is_now_number )
    {
        end = len;
        var a = line.slice( start, end );
        var s = a.join( '' );
        var p = Number( s );
        new_line.push( p );
    }

    return new_line; // Return the tokenized array.
}

//>??????S<>????????¨?????????>>????????¨?????????????????????
/*
??????????????????????¨???????
p...S<x>???<
q...S<x>???>
L...19,331???????????°???(literal)
t...>>????????¨
??????t????¬???????????????????p???L????????\????????¨????????§???????????¨?????????????????????
??????????????????>????¬??????????>???L??????????????????????????????????????????§????????°??????>????????????..??????
 */
/**
 * Helper function to determine if a '>' character should be tokenized as 'q' or 't'.
 * 'q' represents the closing angle bracket for S<x> (e.g., S<10> -> p, 10, q).
 * 't' represents the right shift operator (>>).
 * @param {number} i - The current index of the '>' character in the line array.
 * @param {Array<string|number>} line - The tokenized line array.
 * @returns {boolean} True if it's 'q', false if it's 't'.
 */
function is_q( i, line )
{
    var ret = true; // Assume it's 'q' by default.

    // Check if the next character is also '>'.
    if ( line[ i + 1 ] == '>' )
    {
        // If the character after '>>' is a number or '<', then it's 't' (right shift).
        if ( is_number( line[ i + 2 ] ) || line[ i + 2 ] == '<' )
        {
            //t??§??????
            ret = false; // It's 't', not 'q'.
        }
    }
    return ret;
}

//token????????????<???p??????>???q??????>>???t?????????
//[p,p,p,10,q,t,10,q,t,10,q]?????????????????????
/**
 * Tokenizes the divided line array into a simplified sequence of 'p', 'q', 't', and numbers.
 * 'p' for '<', 'q' for '>', 't' for '>>'.
 * @param {Array<string|number>} line - The array from divide_1st.
 * @returns {Array<string|number>} The tokenized array.
 */
function tokenizer( line )
{
    //q_* ??£????????? > ???????????¨???????????¨???
    var q_start = 0; // Not used in this implementation.
    var q_end = 0;   // Not used in this implementation.

    //??´???
    //?????????
    var new_line = []; // Array to store the final tokens.

    var len = line.length; // Length of the input line array.
    for ( var i = 0; i < len; i++ )
    {
        var e = line[i]; // Current element.

        if ( is_number( e ) )
        {
            new_line.push( e ); // Numbers are pushed directly.
        }
        else if ( e === '<' )
        {
            new_line.push( 'p' ); // '<' becomes 'p'.
        }
        else if ( e === '>' )
        {
            //???????????????????????????
            // Determine if it's 'q' or 't'.
            if ( is_q( i, line ) )
            {
                //q?????£??????
                new_line.push( 'q' ); // It's 'q'.
            }
            else
            {
                new_line.push( 't' ); // It's 't' (for '>>').
                i += 1;               //t??§???????????????????£???¶ - Skip the next '>' as it's part of '>>'.
            }
        }
    }

    return new_line; // Return the fully tokenized array.
}

//?¨?????????¨?????¢?????????
/**
 * Processes the tokenized line array to evaluate expressions based on 'p', 'q', 't' operators.
 * This effectively reduces the expression into its final numerical result.
 * The processing is done in-place by modifying the 'line' array.
 * @param {Array<string|number>} line - The tokenized array from tokenizer.
 * @returns {Array<number>} An array containing the single final result.
 */
function treenize( line )
{
    var len = line.length; // Initial length (will change).
    var i = 0;             // Current index.

    // Continue processing until only one element (the final result) remains in the array.
    while ( line.length > 1 )
    {
        var e = line[i]; // Current element.

        if ( is_number( e ) )
        {
            // If the previous token was 't' (>>), perform the T operation.
            if ( i > 0 && line[ i - 1 ] == 't' )
            {
                // T(operand1, operand2) where operand1 is line[i-2] and operand2 is line[i].
                line[ i - 2 ] = T( line[ i - 2 ], line[ i ] ); // Replace operand1 with the result.
                line.splice( i - 1, 2 );                       // Remove 't' and operand2.
                i = i - 3;                                     // Adjust index to re-evaluate from the new position.
            }
        }
        else if ( e == 'p' )
        {
            // 'p' tokens are markers for S<x> and are handled when 'q' is encountered.
            // No action needed directly on 'p'.
        }
        else if ( e == 'q' )
        {
            // When 'q' is encountered, it signifies the end of an S<x> expression.
            // S(operand) where operand is line[i-1].
            line[ i - 2 ] = S( line[ i - 1 ] ); // Replace 'p' with the result of S(operand).
            line.splice( i - 1, 2 );           // Remove operand and 'q'.
            i = i - 3;                         // Adjust index.
        }
        else if ( e == 't' )
        {
            // 't' tokens are markers for '>>' and are handled when the second operand is encountered.
            // No action needed directly on 't'.
        }
        i++; // Move to the next element.
        //log(line); // Uncomment for debugging to see intermediate states.
    }
    return line; // The array now contains a single element, the final result.
}

/**
 * Processes a single input line through a series of transformations:
 * elimination, division, tokenization, and tree-like evaluation.
 * Finally, logs the result to the console.
 * @param {string} line - The raw input string.
 */
function processLine( line )
{
    line = eliminate( line ); // Step 1: Remove 'S' and whitespace.
    if ( !line ) { log( '' ); return; } // If line becomes empty, log empty and return.

    line = divide_1st( line ); // Step 2: Divide into numbers and operators.
    if ( !line ) { log( '' ); return; } // If line becomes empty, log empty and return.

    line = tokenizer( line );  // Step 3: Tokenize operators ('<', '>', '>>').
    if ( !line ) { log( '' ); return; } // If line becomes empty, log empty and return.

    line = treenize( line );   // Step 4: Evaluate the tokens.
    if ( !line ) { log( '' ); return; } // If line becomes empty, log empty and return.

    line = line[0];            // Extract the final numerical result from the array.
    if ( !line ) { log( '' ); return; } // If line becomes empty, log empty and return.

    log( line );               // Log the final computed value.
}