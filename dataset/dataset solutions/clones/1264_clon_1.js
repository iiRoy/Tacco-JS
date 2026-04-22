/*
 * This JavaScript file reads input from stdin, processes it
 * to generate a series of ASCII art rectangles, and then prints
 * the combined string to the console.
 *
 * The input consists of pairs of integers (height, width) on separate lines.
 * A pair of (0, 0) indicates the end of input.
 *
 * Each rectangle is drawn with '#' characters for the border
 * and '.' characters for the interior.
 */
const inputs /* all lines from stdin */ = require('fs') . readFileSync ( '/dev/stdin' , 'UTF-8' ) . split ( '\n' ) ;


// Initialize an empty string to accumulate the output.
let str = '' ;

// Loop through each line of input received.
for ( let i = 0 ; i < inputs . length ; i ++ )
{
    // Parse the current line into height and width.
    const input = inputs [ i ] . split ( ' ' ) . map ( Number ) ;

    // Extract height and width for readability.
    const h = input [ 0 ] ;
    const w = input [ 1 ] ;

    // Check for the termination condition: height and width are both zero.
    if ( w === 0 && h === 0 )
    {
        // If so, exit the loop.
        break ;
    }

    // If this is not the first rectangle, add a newline character
    // to separate it from the previous one.
    if ( i !== 0 )
    {
        str += '\n' ; /* Add a line break */
    }

    // Generate the top and bottom border line.
    // It consists of 'w' '#' characters, plus one for Array(w+1) to make it w '#'s joined.
    let W = Array ( w + 1 ) . join ( '#' ) + '\n' ;

    // Add the top border to the result string.
    str += W ;

    // Loop to generate the middle rows of the rectangle.
    // This loop runs from j=1 up to h-2, effectively h-2 rows.
    for ( let j = 1 ; j < h - 1 ; j ++ )
    {
        // Each middle row starts with '#', followed by 'w-2' '.' characters,
        // and ends with '#'.
        str += '#' + Array ( w - 1 ) . join ( '.' ) + '#' + '\n' ;
    }

    // Add the bottom border to the result string.
    str += W ; // Re-use the generated border string for consistency.
}

/*
 * Finally, print the entire accumulated string to the standard output.
 * This string contains all the generated ASCII art rectangles,
 * separated by newlines as required.
 */
console . log ( str ) ;