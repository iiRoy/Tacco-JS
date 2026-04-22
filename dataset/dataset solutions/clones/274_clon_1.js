// This section handles reading input from standard input.
// It uses the Node.js 'fs' module to perform file system operations.

var input =   require ('fs') . readFileSync ('/dev/stdin',    'utf8')    . trim ( ) ;

// The input string is then split into an array of lines.
// Each element in the 'lines' array represents a single line of input.
var lines  =  input . split ( '\n' ) ;


// Declare a variable 'line' which will hold each line as we process it.
var   line ;

// Loop through each line of input until there are no more lines.
// The 'lines.shift()' method removes the first element from the 'lines' array
// and returns it, effectively processing one line at a time.
while (  line   =   lines . shift ( )  )
{
    // Inside the loop, process the current 'line'.

    // Split the line by spaces to get individual number strings.
    // Then, map each string to a number using the unary plus operator (+n).
    var   arr   =   line . split ( ' ' ) . map ( function ( n ) {
        // Convert string to number.
        return   + n ;
    } ) ;


    // Extract year, month, and day from the parsed array.
    var   year   =   arr [ 0 ] ;
    var   month   =   arr [ 1 ] ;
    var   day   =   arr [ 2 ] ;

    // Initialize the Japanese era variable.
    var   era   =   '' ;


    // Create a Date object for the input date.
    // Note: Month in JavaScript Date constructor is 0-indexed, so we subtract 1.
    var   today   =   new   Date ( year ,   month   -   1 ,   day ) ;

    // Determine the Japanese era based on the date.

    // Check for pre-Meiji era.
    if (   today   <   new   Date ( 1868 ,   8 ,   8 )   )
    {
        era   =   'pre-meiji' ;
    }
    // Check for Meiji era.
    else   if (   today   <   new   Date ( 1912 ,   6 ,   29 )   )
    {
        era   =   'meiji' ;
        year   -=   1867 ; // Adjust year for Meiji era calculation.
    }
    // Check for Taisho era.
    else   if (   today   <   new   Date ( 1926 ,   11 ,   24 )   )
    {
        era   =   'taisho' ;
        year   -=   1911 ; // Adjust year for Taisho era calculation.
    }
    // Check for Showa era.
    else   if (   today   <   new   Date ( 1989 ,   0 ,   7 )   )
    {
        era   =   'showa' ;
        year   -=   1925 ; // Adjust year for Showa era calculation.
    }
    // Otherwise, it must be Heisei era.
    else
    {
        era   =   'heisei' ;
        year   -=   1988 ; // Adjust year for Heisei era calculation.
    }


    // Special handling for 'pre-meiji' era.
    if (   era   ==   'pre-meiji'   )
    {
        // Output 'pre-meiji' directly.
        console . log ( 'pre-meiji' ) ;
        // Move to the next iteration of the loop.
        continue ;
    }

    // For all other eras, print the era, adjusted year, original month, and original day.
    console . log ( era ,   year ,   month ,   day ) ;
}
// End of while loop.