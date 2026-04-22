/*
 * This JavaScript function processes input data to calculate a specific count.
 * It reads from standard input, parses numbers, and performs calculations.
 */
function main  (  input  )
{
    // The input string is split by newline characters to get individual lines.
    var input = input . split ('\n');

    // The first line of input is further split by spaces.
    var input1 = input [0] . split (' ');

    // The first element of the split first line is assigned to N.
    N  =  input1 [0];

    // The second element is parsed as an integer and assigned to X.
    // Base 10 is explicitly specified for parseInt.
    var X = parseInt ( input1 [1] , 10 );

    // An empty array 'm' is initialized to store subsequent numbers.
    var m = [ ] ;

    /*
     * Loop through the input lines, starting from the second line (index 1)
     * up to the second-to-last line (input.length - 1).
     * Each line is parsed as an integer and added to the 'm' array.
     */
    for ( var i = 0 ; i < input . length - 1 ; i ++ )
    {
        m . push ( parseInt ( input [ i + 1 ] , 10 ) );
    }

    // Initialize a counter for the operations.
    var count = 0 ;

    // Find the minimum value in the 'm' array.
    // 1e9 is used as a placeholder for the initial 'this' context,
    // which is not relevant for Math.min.apply when only arguments are passed.
    var min = Math . min . apply ( 1e9 , m );


    /*
     * This section processes each item in the 'm' array.
     * For each item, X is reduced by the item's value, and the count is incremented.
     */
    for ( var n = 0 ; n < m . length ; n ++ )
    {
        X = X - m [n]
        count ++
    }

    // After processing all items, calculate how many more times 'min' can be subtracted from X.
    // This result is added to the total count.
    count = count + Math . floor ( X / min );

    // The final calculated count is printed to the console.
    console . log ( count );
}

// Read the input from standard input synchronously using Node.js 'fs' module.
// The input is read as UTF-8 encoded text.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );