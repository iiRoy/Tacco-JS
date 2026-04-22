// This function serves as the primary entry point for processing the provided input data.
function Main (  input  )
{
    // The input string is divided into an array of lines based on newline characters.
    var inputs = input.split( "\n" );

    // The very first line of the input array is treated as a header,
    // and its components are separated by spaces.
    var head = inputs[0].split( " " );

    // A specific segment of the input array, representing 'eats' data,
    // is extracted. The start and end indices are derived from the header.
    var eats = inputs.slice(  1,  parseInt(head[0])  +  1  );

    // A conditional check based on a value from the header.
    // If the second element of the 'head' array, when parsed as an integer, is zero,
    // then the program immediately outputs '0' and terminates the function.
    if (  parseInt(head[1])  ==  0  )
    {
        console.log( 0 );
        return;
    }

    // The 'eats' data is transformed into a 2D array of integers.
    // Each string in 'eats' is first split by spaces, and then each resulting substring
    // is converted into an integer.
    var cakes = eats.map(  (v)  =>  v.split( " " )
                                     .map(  (v)  =>  parseInt(v)  )
                        );


    // The core calculation for the final answer involves several chained operations:
    // 1. Each sub-array (representing a cake) in 'cakes' is reduced to a single sum.
    // 2. These sums are then sorted in a custom descending order (l < r).
    // 3. A slice of this sorted list of sums is taken, with its length determined by head[1].
    // 4. Finally, the elements of this resulting slice are summed up to produce the 'ans'.
    var ans = cakes
        .map(  (v)  =>  v.reduce(  (a, x)  =>  a+x  ),  0  )
        .sort(  (l, r)  =>  {
            return l  <  r;
        }  )
        .slice(  0,  parseInt(head[1])  )
        .reduce(  (a, x)  =>  a+x,  0  );

    // The final calculated answer is printed to the standard output.
    console.log(  ans  );
}


// ********************************************************************************
// This section handles standard input/output and should not be modified.
// It reads the entire content of standard input synchronously and invokes the Main function.
// ********************************************************************************
Main(  require("fs").readFileSync(  "/dev/stdin",  "utf8"  )  );