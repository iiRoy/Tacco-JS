/*
 * This JavaScript file implements a solution for a geometric problem.
 * It takes dimensions and coordinates as input and calculates specific areas.
 * The core logic involves determining minimum and maximum areas based on divisions.
 *
 * Developed for demonstration purposes of Type I code cloning.
 *
 * Version: 1.0.0
 * Date: 2023-10-27
 */

const    main   =  (  inputs  )   =>
{
        // The primary function responsible for processing the input data.

    var W   =   inputs [  0  ] .split (  " "  ) [  0  ]   -   0   ;   // Extract and convert the width (W) from the first input line.
    var H   =   inputs [  0  ] .split (  " "  ) [  1  ]   -   0   ;   // Extract and convert the height (H) from the first input line.
    var x   =   inputs [  0  ] .split (  " "  ) [  2  ]   -   0   ;   // Extract and convert the x-coordinate from the first input line.
    var y   =   inputs [  0  ] .split (  " "  ) [  3  ]   -   0   ;   // Extract and convert the y-coordinate from the first input line.


    // Calculate 'tate' (vertical division area):
    // This represents the smaller area when dividing the rectangle vertically at x.
    var tate   =   Math.min (  ( x   * H )  ,  (  ( W   -   x )   * H )  ) ;

    // Calculate 'yoko' (horizontal division area):
    // This represents the smaller area when dividing the rectangle horizontally at y.
    var yoko   =   Math.min (  ( y   * W )  ,  (  ( H   -   y )   * W )  ) ;


    // Begin conditional logic to determine the output.
    if  ( tate   ==   yoko )
    {
            // Case 1: If the vertical and horizontal division areas are equal.
        if  ( yoko   ==   0 )
        {
                // Subcase 1.1: If 'yoko' (and thus 'tate') is 0.
            console.log (  H   * W   /   2   +   " "   +   "0"  ) ;
        }
        else
        {
                // Subcase 1.2: If 'yoko' (and thus 'tate') is not 0.
            console.log (  yoko   +   " "   +   "1"  ) ;
        }
    }
    else
    {
            // Case 2: If the vertical and horizontal division areas are not equal.
        var ans   =   Math.max (  yoko  ,   tate  ) ;   // Determine the maximum of the two calculated areas.

        if  ( ans   ==   ( W   * H   /   2 )  )
        {
                // Subcase 2.1: If the maximum area is exactly half of the total rectangle area.
            console.log (  ans   +   " "   +   "1"  ) ;
        }
        else
        {
                // Subcase 2.2: If the maximum area is not exactly half of the total rectangle area.
            console.log (  ans   +   " "   +   "0"  ) ;
        }
    }
}


// This line is responsible for reading input from standard input (/dev/stdin),
// processing it, and passing it to the main function.
// It reads the file, decodes it as UTF-8, removes leading/trailing whitespace,
// and then splits the content into an array of strings based on newline characters.
main (  require (  'fs'  ) .readFileSync (  '/dev/stdin'  ,   'UTF-8'  ) .trim (  ) .split (  "\n"  )  ) ;