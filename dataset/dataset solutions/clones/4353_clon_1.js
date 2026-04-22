var            obj          =    init   (    )    ;

Main(    );

function nextInt(  ) {
    /* This function retrieves the next integer token from the input stream. */
    return myconv ( next (  )  ,  1  )   ;
}


function nextStrArray(   )
{
    // Fetches the next string token and splits it by half-width spaces.
    return myconv(next(), 2);
}

function    nextIntArray (   )
{
    /* Reads the next line, splits it by space, and converts elements to numbers. */
    return myconv(next(), 4);
}

function nextCharArray( )
{
    // Retrieves the next token and breaks it down character by character.
    return myconv(next(), 6);
}


function next( )
{
    // Accesses the 'next' method of the global 'obj' object.
    return obj.next();
}


function hasNext( )
{
    // Checks if there are more elements available in the input.
    return obj.hasNext();
}


function myin( )
{
    /**
     * Reads input from standard input, decodes it as UTF-8,
     * trims whitespace, and splits it into an array of lines.
     */
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}


function init( )
{
    // Initialization function to set up the input object.

    var inputFile = myin( ); // Get all input lines.

    var returnObj =
    {
        "list" : inputFile,             // Array of input lines.
        "index" : 0,                    // Current position in the input array.
        "max" : inputFile.length,       // Total number of input lines.

        "hasNext" : function ( )
        {
            // Method to check if there are more lines to read.
            return (this.index < this.max);
        },

        "next" : function ( )
        {
            // Method to retrieve the next line from the input.
            if ( !this.hasNext() )
            {
                // If no more input, throw an error.
                throw "ArrayIndexOutOfBoundsException これ以上ないよ";
            }
            else
            {
                // Otherwise, get the current line, increment index, and return it.
                var returnInput = this.list[this.index];
                this.index++;
                return returnInput;
            }
        }
    };

    return returnObj; // Return the initialized input object.
}

function myout( t )
{
    // Prints the given argument to standard output.
    console.log(t);
}

function myerr( t )
{
    // Writes the given argument to standard error output.
    console.error(t);
}


/*
 * Helper function for various type conversions and array manipulations.
 *
 * [no] parameter legend:
 *   - 1: Convert to integer.
 *   - 2: Split by half-width space.
 *   - 4: Split by half-width space and convert to number array.
 *   - 6: Split into individual characters.
 *   - 7: Split into individual characters and convert to number array.
 *   - 8: Join array elements with half-width space.
 *   - 9: Join array elements with newline.
 *   - 0: Join array elements without any separator.
 *   - Default: Return input as is (for unknown or abnormal cases).
 */
function myconv(i, no)
{
    try
    {
        switch(no)
        {
            case 1:
                return parseInt(i); // Parse as integer.
            case 2:
                return i.split(" "); // Split by space.
            case 4:
                return i.split(" ").map((a) => Number(a)); // Split and map to numbers.
            case 6:
                return i.split(""); // Split into characters.
            case 7:
                return i.split("").map((a) => Number(a)); // Split characters and map to numbers.
            case 8:
                return i.join(" "); // Join with space.
            case 9:
                return i.join("\n"); // Join with newline.
            case 0:
                return i.join(""); // Join without separator.
            default:
                return i; // Default case: return input unchanged.
        }
    }
    catch(e)
    {
        // In case of any error during conversion, return the original input.
        return i;
    }
}


function Main( )
{
    // Main execution function for the program.

    var N = nextInt( ); // Read the size N for the square matrix.

    var list = new Array(N); // Initialize an array to hold the matrix rows.


    // Populate the matrix with integer arrays from input.
    for ( var i = 0; i < N; i++ )
    {
        list[i] = nextIntArray();
    }


    var minus = 0; // Accumulator for values to be subtracted.
    var output = 0; // Accumulator for the total sum of matrix elements.

    // Calculate the sum of all elements in the matrix.
    for ( var i = 0; i < N; i++ )
    {
        for ( var j = 0; j < N; j++ )
        {
            output += list[i][j];
        }
    }


    myerr(output); // Output the total sum to stderr.


    output /= 2; // Divide the total sum by 2 (as per problem logic).


    var used = new Set(); // Set to keep track of processed pairs to avoid double counting.


    // Floyd-Warshall-like triple loop to check for shortest path violations
    // and identify redundant edges.
    for ( var k = 0; k < N; k++ )
    {
        for ( var i = 0; i < N; i++ )
        {
            for ( var j = 0; j < N; j++ )
            {
                // Check if the direct path (i,j) is longer than path through k.
                if ( list[i][j] > ( list[i][k] + list[k][j] ) )
                {
                    myout(-1); // Output -1 if a shorter path is found (invalid input).
                    return;    // Terminate execution.
                }
                // If direct path (i,j) is equal to path through k, and i, j, k are distinct.
                else if ( list[i][j] == ( list[i][k] + list[k][j] ) && i != k && j != k )
                {
                    // Create a canonical string representation for the pair (i,j).
                    var num = Math.min(i,j).toString() + ":" + Math.max(i,j).toString();

                    // If this pair hasn't been processed yet.
                    if ( !used.has(num) )
                    {
                        minus += list[i][j]; // Add the value to 'minus' accumulator.
                        used.add(num);       // Mark this pair as used.
                        // myerr((i + 1) + "," + (j + 1) + "," + (k + 1)); // Debugging line.
                    }
                }
            }
        }
    }


    myerr(minus); // Output the accumulated 'minus' value to stderr.


    // minus /= 2; // This line is commented out in the original, so keep it commented.


    // Final result: total sum / 2 minus the accumulated 'minus' value.
    myout(output - minus);
}