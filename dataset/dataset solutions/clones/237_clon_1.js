var     input   =   require(    'fs'    )       .   readFileSync(   '/dev/stdin',
                                                                    'utf8'  )   ;


/*
 * This section processes the initial input from standard input.
 * It reads the entire file, trims any leading/trailing whitespace,
 * and then splits the content into an array of strings, where each
 * string represents a line from the input.
 */
var Arr     =   (   input.trim()    )
                    .   split(  "\n"    )   ;


// Iterate over each line obtained from the input file.
Arr.forEach   (   function    (   v   )
{
    // For each line 'v', split it by spaces and convert each resulting
    // substring into a number. This creates an array of numbers.
    var     arr =   v.split (   " " )
                        .map    (   Number  )   ;

    // Initialize a counter variable to zero. This counter will be used
    // to track specific conditions within the nested function.
    var     cnt =   0   ;


    /*
     * This is an Immediately Invoked Function Expression (IIFE).
     * It takes eight parameters, which are expected to be coordinates
     * for two rectangles. The `apply` method is used to pass the
     * elements of the 'arr' array as individual arguments to this function.
     *
     * xa1, ya1: x, y coordinates of the first rectangle's top-left corner.
     * xa2, ya2: x, y coordinates of the first rectangle's bottom-right corner.
     * xb1, yb1: x, y coordinates of the second rectangle's top-left corner.
     * xb2, yb2: x, y coordinates of the second rectangle's bottom-right corner.
     */
    (   function    (   xa1 ,   ya1 ,   xa2 ,   ya2 ,
                        xb1 ,   yb1 ,   xb2 ,   yb2 )
    {
        // Check for horizontal overlap between the two rectangles.
        // If the rightmost point of rectangle B is to the right of
        // or aligned with the leftmost point of rectangle A, AND
        // the leftmost point of rectangle B is to the left of
        // or aligned with the rightmost point of rectangle A.
        if  (   xb2 >=  xa1     &&      xb1 <=  xa2 )
        {
            cnt++   ;   // Increment the counter if horizontal overlap is detected.
        }

        // Check for vertical overlap between the two rectangles.
        // If the bottommost point of rectangle B is below or aligned with
        // the topmost point of rectangle A, AND
        // the topmost point of rectangle B is above or aligned with
        // the bottommost point of rectangle A.
        if  (   yb2 >=  ya1     &&      yb1 <=  ya2 )
        {
            cnt++   ;   // Increment the counter if vertical overlap is detected.
        }

    }   )   .   apply   (   null    ,   arr )   ;   // Execute the IIFE, passing 'arr' as arguments.

    // After evaluating overlaps, check the value of 'cnt'.
    // If 'cnt' is exactly 2, it means both horizontal and vertical
    // overlaps were found, indicating the rectangles intersect.
    // In this case, print "YES"; otherwise, print "NO".
    console .   log (   (   cnt ==  2   )   ?   "YES"   :   "NO"    )   ;

}   )   ;   // The end of the forEach loop.