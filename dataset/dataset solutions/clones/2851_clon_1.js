/*
 This JavaScript code processes input data
 to perform a complex calculation involving rates
 and then outputs a maximum value based on these calculations.
 */
function Main(  input  )
{
    // The input string is first split into an array of lines.
    input  =  input.split( "\n" );

    // Parse the first line as an integer N.
    const N = parseInt( input[0] );

    // Parse the second line, splitting by space, and mapping to integers for array A.
    const A = input[1].split( " " ).map( x => parseInt(x) );

    // Parse the third line, splitting by space, and mapping to integers for array B.
    const B = input[2].split( " " ).map( x => parseInt(x) );

    // Calculate initial rates for gold, silver, and bronze.
    // These rates are derived from corresponding values in arrays A and B.
    const goldRate   =   A[0]   /   B[0];
    const silverRate =   A[1]   /   B[1];
    const brondsRate =   A[2]   /   B[2];


    // Initialize variables to store indices representing high, middle, and low rates.
    var   high   =   0;
    var   midle  =   0;
    var   low    =   0;


    // Determine the order of rates (gold, silver, bronze)
    // and assign their original indices to high, midle, and low variables.
    if  (  goldRate  >=  silverRate  )
    {
        // Case 1: Gold rate is greater than or equal to silver rate.
        if  (  silverRate  >=  brondsRate  )
        {
            // Subcase 1.1: g >= s >= b
            high  =  0; // Gold
            midle =  1; // Silver
            low   =  2; // Bronze
        }
        else
        {
            // Subcase 1.2: Silver rate is less than bronze rate.
            if  (  goldRate  >=  brondsRate  )
            {
                // Subcase 1.2.1: g >= b > s
                high  =  0; // Gold
                midle =  2; // Bronze
                low   =  1; // Silver
            }
            else
            {
                // Subcase 1.2.2: b > g >= s
                high  =  2; // Bronze
                midle =  0; // Gold
                low   =  1; // Silver
            }
        }
    }
    else
    {
        // Case 2: Gold rate is less than silver rate.
        if  (  goldRate  >=  brondsRate  )
        {
            // Subcase 2.1: s > g >= b
            high  =  1; // Silver
            midle =  0; // Gold
            low   =  2; // Bronze
        }
        else
        {
            // Subcase 2.2: Gold rate is less than bronze rate.
            if  (  silverRate  >=  brondsRate  )
            {
                // Subcase 2.2.1: s >= b > g
                high  =  1; // Silver
                midle =  2; // Bronze
                low   =  0; // Gold
            }
            else
            {
                // Subcase 2.2.2: b > s > g
                high  =  2; // Bronze
                midle =  1; // Silver
                low   =  0; // Gold
            }
        }
    }


    // Initialize 'max' with the value of N.
    var max = N;

    // Perform calculations based on whether rates are greater than or equal to 1.0.
    if  (  A[high]  /  B[high]  >=  1.0  )
    {
        // If the highest rate is >= 1.0
        if  (  A[midle]  /  B[midle]  >=  1.0  )
        {
            // If the middle rate is also >= 1.0
            if  (  A[low]  /  B[low]  >=  1.0  )
            {
                // All three rates are >= 1.0
                max  =  Math.floor( N / B[high] ) * A[high]
                     +  Math.floor( (N % B[high]) / B[midle] ) * A[midle]
                     +  Math.floor( (N % B[high] % B[midle]) / B[low] ) * A[low]
                     +  N % B[high] % B[midle] % B[low];
            }
            else
            {
                // Highest and middle rates are >= 1.0, but lowest is < 1.0
                var n = Math.floor( N / A[low] ) * B[low]  +  N % A[low];
                max   = Math.floor( n / B[high] ) * A[high]
                      + Math.floor( (n % B[high]) / B[midle] ) * A[midle]
                      + n % B[high] % B[midle];
            }
        }
        else
        {
            // Highest rate is >= 1.0, but middle rate is < 1.0
            var n = Math.floor( N / A[low] ) * B[low]
                  + Math.floor( (N % A[low]) / A[midle] ) * B[midle]
                  + N % A[low] % A[midle];
            max   = Math.floor( n / B[high] ) * A[high]
                  + n % B[high];
        }
    }
    else
    {
        // If the highest rate is < 1.0
        max = Math.floor( N / A[low] ) * B[low]
            + Math.floor( (N % A[low]) / A[midle] ) * B[midle]
            + Math.floor( (N % A[low] % A[midle]) / A[high] ) * B[high]
            + N % A[low] % A[midle] % A[high];
    }

    // Output the calculated maximum value to the console.
    console.log(max);
}


// This line handles standard input/output.
// It reads the entire input from stdin and passes it to the Main function.
// Do not modify anything below this comment.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );