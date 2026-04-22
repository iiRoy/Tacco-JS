// This is the primary function that processes the entire input data.
// The 'input' argument will contain all lines provided.
function Main(  input  )
{
 // The raw input string is first split into an array, where each element is a line.
 input   =   input.split( "\n" ) ;

    // The first line of the input array is parsed to get the value for 'n'.
    tmp0    = input[0].split( " " ) ;
    n       = Number(tmp0[0]) ; // 'n' represents the total number of items to process.

    // The second line is then processed to extract 't' and 'a'.
    tmp1    = input[1].split( " " ) ;
    t       = Number(tmp1[0]) ; // 't' likely represents a base temperature.
    a       = Number(tmp1[1]) ; // 'a' probably represents a target value.

    // The third line is prepared for processing, containing 'h' values.
    tmp2    = input[2].split( " " ) ;


    // The initial 'h' value is taken from the first element of 'tmp2'.
    h       = Number(tmp2[0]) ;
    // This 'h' value is adjusted using a specific formula involving 't'.
    h       = t - h * 0.006 ;
//  console.log(h); // This line is for debugging and was commented out in the original.

    // The initial minimum absolute difference is calculated.
    // The original code included full-width spaces around Math.abs, which are treated as whitespace.
    min     = Math.abs(h - a) ;
    // The answer is initialized to 1, corresponding to the first location.
    ans     = 1 ;

    // A loop iterates through the remaining 'h' values, starting from the second one.
    for (i = 1; i < n; i++)
    {
        // The current 'h' value is extracted from 'tmp2' and converted to a number.
        h = Number(tmp2[i]) ;
        // The same adjustment formula is applied to this new 'h' value.
        h = t - h * 0.006 ;
  //    console.log(h); // Another commented-out debug line from the original.

        // If the current absolute difference from 'a' is less than the *initial* 'min',
        // the 'ans' (answer) is updated to the current location index + 1.
        // Note: The 'min' variable itself is not updated within this loop.
        if ( min > Math.abs(h - a) )
        {
            ans = i + 1 ;
        }
    }
   // The final calculated answer is printed to the console.
   console.log(ans) ;
}


// * This section should not be edited (it reads input from standard input and calls Main).
Main(require("fs").readFileSync("/dev/stdin", "utf8")) ;
// End of file processing.