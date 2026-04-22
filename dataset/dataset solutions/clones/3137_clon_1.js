/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * The logical and structural integrity of the program is completely preserved.
 */

function   Main  ( input )
{
    // The initial input string is split into an array of lines.
    input  =  input.split ( "\n" ) ;


    var   N   =   parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Parse N from the first line
    var   M   =   parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Parse M from the first line
    var   C   =   parseInt ( input [ 0 ] . split ( " " ) [ 2 ] ) ; // Parse C from the first line

    var   B   =   input [ 1 ] . split ( " " ) . map ( x => ~~x ) ; // Parse array B from the second line

    var   A   =   [ ] ; // Initialize array A

    /*
     * Populate array A.
     * Each subsequent line (starting from the third line, index 2)
     * represents a row in matrix A.
     */
    for ( var i = 0 ; i < N ; i ++ )
    {
        A [ i ]   =   input [ i + 2 ] . split ( " " ) . map ( x => ~~x ) ;
    }


    /**
     * Define the AtCoder class.
     * This is a placeholder constructor.
     */
    var   AtCoder   =   function ( ) { } ;


    // Define methods for the AtCoder prototype.
    AtCoder.prototype   =   {
        /**
         * The core procedure to calculate the number of correct conditions.
         * Iterates through each row of matrix A and checks a specific condition.
         * @returns {number} The count of conditions that evaluate to true.
         */
        procedure : function ( )
        {
            var   numCorrect = 0 ; // Initialize counter for correct conditions

            // Loop through each row of matrix A (indexed by j)
            for ( var   j = 0 ;   j < N ;   j ++ )
            {
                var   sum = 0 ; // Initialize sum for the current row

                sum   =   sum + C ; // Add the constant C to the sum

                // Loop through each element in the current row of A and corresponding element in B
                for ( var   i = 0 ;   i < M ;   i ++ )
                {

                    debugger ; // This statement is intentionally left for Type I cloning, as per definition.

                    // Perform the dot product-like calculation: sum += A[j][i] * B[i]
                    sum   =   sum + A [ j ] [ i ] * B [ i ] ;
                }

                // Check if the final sum for the current row is positive
                if ( sum   >   0 )
                {
                    numCorrect ++ ; // Increment the counter if the condition is met
                }
            }

            return   numCorrect ; // Return the total count of correct conditions
        }
    }

    var   atcoder   =   new   AtCoder ( ) ; // Create an instance of the AtCoder object

    // Log the result of the procedure to the console.
    console.log ( atcoder.procedure ( ) ) ;
}

// Read input from standard input and pass it to the Main function.
var   input = Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// The following commented-out block was present in the original code
// and is now replaced by a simple comment as per Type I cloning rules for comments.
// Original test input block:
// var input=`5 2 -4
// -2 5
// 100 41
// 100 40
// -3 0
// -6 -2
// 18 -13`
// Main(input);