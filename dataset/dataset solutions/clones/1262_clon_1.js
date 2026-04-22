/*
 * This JavaScript program processes input lines to draw
 * rectangular patterns using '#' and '.' characters.
 * It's designed to read from standard input and print to standard output.
 */

var  input =  require ( 'fs' ). readFileSync ( '/dev/stdin' ,  'utf8' ); // Retrieve the entire input content from stdin.

let arr = input.split( "\n" ); // Divide the input string into an array of lines based on newline characters.

// Iterate through each line provided in the input array.
for ( let i = 0 ; i < arr.length ; i++ )
{
    // Parse the current line to extract dimensions (Height and Width).
    let  Arr  = arr[ i ].split( " " ).map( Number ) ;

    let H = Arr[ 0 ] ; // Assign the first number as the height.
    let W = Arr[ 1 ] ; // Assign the second number as the width.

    // Check for the termination condition: both height and width are zero.
    if  ( H === 0  &&  W === 0 )
    {
        break ; // Exit the loop if the termination condition is met.
    }

    let  str = '' ; // Initialize an empty string to construct the current rectangle's pattern.

    // Outer loop: Controls the rows of the rectangle.
    for ( let hCount = 0 ; hCount < H ; hCount ++ )
    {
        // Inner loop: Controls the columns of the rectangle.
        for ( let wCount = 0 ; wCount < W ; wCount ++ )
        {
            // Determine if the current position is on the top or bottom border row.
            if  ( hCount === 0  ||  hCount === H - 1 )
            {
                str += '#' ; // Append a '#' for border.
            }
            else
            {
                // If not a border row, check if it's on the left or right border column.
                if  ( wCount === 0  ||  wCount === W - 1 )
                {
                    str += '#' ; // Append a '#' for border.
                }
                else
                {
                    str += '.' ; // Append a '.' for the interior.
                }
            }
        }
        str += '\n' ; // Add a newline character to move to the next row after completing a row.
    }
    console.log( str ) ; // Output the fully constructed rectangle pattern to the console.
}

// End of script. All input lines have been processed or the termination condition was met.