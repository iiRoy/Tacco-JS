/*
 * This JavaScript file is designed to solve a number puzzle.
 * It processes lines of four numbers, attempting to find an arithmetic
 * expression using these numbers and basic operations (+, -, *)
 * that evaluates to the value 10.
 *
 * The solution employs permutation generation and brute-force evaluation
 * of various expression templates.
 */

/*
 * The primary execution function.
 * It iterates through each line of input, processes it,
 * and outputs the result of the puzzle for valid inputs.
 */
function   main ( )
{
    // Begin processing the collected input data.
    // Each line from the input is treated as a string 'str'.
    input . forEach ( function ( str )
    {

            /*
             * Declare 'num' variable.
             * It parses the space-separated numbers from the input string.
             * Example: "1 2 3 4" becomes [1, 2, 3, 4]
             */
        var
        num = str . split ( ' ' ) . map ( parseFloat ) ;


            // Conditional check for invalid input lines.
            // If the line does not contain exactly four numbers OR
            // if it's the specific sentinel "0 0 0 0" (often used to mark end of input).
        if ( num . length !== 4 || str . indexOf ( '0 0 0 0' ) === 0 )
        {
            return ; // Skip further processing for this line and move to the next.
        }

            // If the input is valid, call the 'expr' function
            // to find an expression that evaluates to 10,
            // and then print the result to the console.
        console . log ( expr ( num ) ) ;

    } ) ; // End of input.forEach loop
} // End of main function definition


// Global array containing the basic arithmetic operators to be used.
var
op = [ '+' , '-' , '*' ] ;

// Global array containing different expression templates.
// '@' acts as a placeholder for numbers, '%' for operators.
// These templates cover various parenthesizations.
var
ex = [
    '(@%@)%(@%@)' ,     // e.g., (A op B) op (C op D)
    '@%(@%@)%@' ,       // e.g., A op (B op C) op D
    '@%@%@%@' ,         // e.g., A op B op C op D (evaluated left-to-right)
    '(@%(@%@))%@'       // e.g., (A op (B op C)) op D
] ;


/*
 * Helper function to format an expression string.
 * It replaces placeholders in a template with actual numbers and operators.
 *
 * @param {string} txt - The expression template string (e.g., '(@%@)%(@%@)').
 * @param {Array<number>} a - An array of numbers to insert into the template.
 * @param {Array<string>} b - An array of operators to insert into the template.
 * @returns {string} The fully formed mathematical expression string.
 */
function   format ( txt , a , b )
{
    // Initialize index counters for numbers (i) and operators (j).
    var
    i , j = i = 0 ;


    // First, replace all '@' placeholders with numbers from array 'a'.
    // Then, replace all '%' placeholders with operators from array 'b'.
    return txt . replace ( / @ / g , function ( )
    {
            return a [ i ++ ] ; // Use and then increment the number index.
    } ) . replace ( / % / g , function ( )
    {
            return b [ j ++ ] ; // Use and then increment the operator index.
    } ) ;
} // End of format function


/*
 * Generates all possible permutations of the elements in an array.
 * This is a recursive function.
 *
 * @param {Array<any>} xs - The input array for which to generate permutations.
 * @returns {Array<Array<any>>} An array of arrays, where each inner array is a permutation.
 */
function   perm ( xs )
{
    // Declare variables: 'x' for current element, 'i' for loop index,
    // 'len' for array length, and 'ret' to store results.
    var
    x , i , len = xs . length ,
    ret = [ ] ;


    // Base case for recursion: If the input array is empty,
    // there's only one permutation (an empty array itself).
    if ( len === 0 )
    {
        return [ [ ] ] ;
    }


    // Loop through each element of the input array.
    for ( i = 0 ; i < len ; i ++ )
    {
        x = xs . shift ( ) ; // Remove the first element (or current element picked).

        // Recursively find permutations of the remaining elements.
        // Then, for each sub-permutation, prepend the removed element 'x'.
        ret = ret . concat ( perm ( xs ) . map ( function ( ys )
        {
                return ( ys . unshift ( x ) , ys ) ; // Prepend 'x' to 'ys' and return 'ys'.
        } ) ) ;

        xs . push ( x ) ; // Add the element back to its original position
                         // to ensure the array is restored for the next iteration.
    }


    return ret ; // Return the complete list of permutations.
} // End of perm function


/*
 * This function attempts to find an expression that evaluates to 10
 * using a given set of four numbers. It explores all permutations,
 * operator combinations, and expression templates.
 *
 * @param {Array<number>} src - An array of four numbers (e.g., [1, 2, 3, 4]).
 * @returns {string|number} The expression string that evaluates to 10,
 *                          or 0 if no such expression is found.
 */
function   expr ( src )
{
        // Declare loop counter variables and a variable 'r' for the formatted expression string.
    var
    i , j , k , m , n , r ;


        // Generate all 24 permutations of the input four numbers.
    src = perm ( src ) ;


        // Extensive nested loops to try all combinations:
        // 'i' iterates through each permutation of the numbers (24 permutations for 4 numbers).
        // 'j', 'k', 'm' iterate through the three possible operators ('+', '-', '*') for each of the three operator slots.
        // 'n' iterates through the four different expression templates.
    for ( i = 0 ; i < 24 ; i ++ )
    {
        for ( j = 0 ; j < 3 ; j ++ )
        {
            for ( k = 0 ; k < 3 ; k ++ )
            {
                for ( m = 0 ; m < 3 ; m ++ )
                {
                    for ( n = 0 ; n < 4 ; n ++ )
                    {
                        // Construct the expression string using the current permutation,
                        // operator combination, and expression template.
                        r = format ( ex [ n ] , src [ i ] , [ op [ j ] , op [ k ] , op [ m ] ] ) ;

                            // Use `eval()` to dynamically execute the generated expression string.
                            // If the result of the evaluation is exactly 10,
                            // then we have found a solution.
                        if ( eval ( r ) === 10 )
                        {
                            return r ; // Return the successful expression string.
                        }
                    } // End of loop for expression templates (n)
                } // End of loop for third operator (m)
            } // End of loop for second operator (k)
        } // End of loop for first operator (j)
    } // End of loop for number permutations (i)


    return 0 ; // If no expression evaluates to 10 after checking all possibilities, return 0.
} // End of expr function


// Global variable to store all incoming data from standard input.
var
input = '' ;


// Start listening for input from the standard input stream.
process . stdin . resume ( ) ;

// Set the character encoding for the incoming data to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Event listener: When data chunks are received from stdin,
// append them to the 'input' string.
process . stdin . on ( 'data' , function ( chunk )
{
        input += chunk ; // Concatenate the new chunk of data.
} ) ;


// Event listener: When the standard input stream ends (no more data),
// process the accumulated input.
process . stdin . on ( 'end' , function ( )
{
        // Split the entire input string into an array of lines.
    input = input . split ( '\n' ) ;

        main ( ) ; // Call the main function to begin solving the puzzle.
} ) ;