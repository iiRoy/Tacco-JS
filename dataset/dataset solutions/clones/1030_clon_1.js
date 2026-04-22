( function   main ( )   {
    // This is the main execution block of the program.
    // It reads input, processes it, and then calculates and displays results.


    let   line   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( '' ) ; // Read input from stdin, convert to string, trim, and split into an array of characters.

    let   height_list   =   [ 0 ] ; // Initialize a list to store height profiles, starting with a base height of 0.

    let   current_height   =   0 ; // Tracks the current height as we traverse the input line.



    // First pass: Remove any leading flat sections or inclines before the first descent.
    // This ensures we start processing from a relevant point.
    while (   line . length   >   0   &&   line [ 0 ]   !==   '\\'   )
    {
        line . shift ( ) ;
    }


    // Second pass: Remove any trailing flat sections or inclines after the last ascent.
    // This cleans up the end of the input line.
    while (   line . length   >   0   &&   line [ line . length   -   1 ]   !==   '/'   )
    {
        line . pop ( ) ;
    }



    // Iterate through the processed input line to build the height profile.
    line . forEach (
        function (   e ,   i   )
        {
            // A '\' character signifies a decrease in height.
            if   (   e   ===   '\\'   )
            {
                current_height   -=   1 ;
            }
            // A '_' character signifies no change in height.
            else   if   (   e   ===   '_'   )
            {
                current_height   +=   0 ; // Explicitly adding zero for clarity, no actual change.
            }
            // Any other character (implicitly '/') signifies an increase in height.
            else
            {
                current_height   +=   1 ;
            }

            // Record the current height in our height profile list.
            height_list . push (   current_height   ) ;
        }
    ) ;


    let   sum   =   0 ; // Accumulator for the total area of all found holes.

    let   holes   =   [ ] ; // An array to store the areas of individual holes found.


    // Loop to repeatedly find and process holes in the height profile.
    // Continues as long as there are at least two points left to form a potential hole.
    for   (   ;   height_list . length   >   1   ;   )
    {
        // Attempt to find and calculate the area of the next hole.
        let   h   =   makeHole (   height_list   ) ;

        // If a valid hole with a positive area was found...
        if   (   h   >   0   )
        {
            sum   +=   h ; // Add its area to the total sum.
            holes . push (   h   ) ; // Record the area of this specific hole.
        }
    }


    // Output the total accumulated area of all holes.
    console . log (   sum   ) ;

    // Output the count of holes and their individual areas, if any holes were found.
    // If no holes, it will just output a blank line (or falsey value).
    console . log (   holes . length   &&   holes . length   +   ' '   +   holes . join ( ' ' )   ) ;

} ) ( ) ; // Immediately Invoked Function Expression (IIFE) to encapsulate the code.




/**
 * Function to identify and calculate the area of a "hole" in a given height list.
 * A hole is defined by a starting point that is higher than the subsequent points,
 * and is bounded by either the end of the list or a point equal to or higher than the start.
 *
 * @param {number[]} list - The array of height values. This array is modified (shifted).
 * @returns {number} The calculated area of the hole, or 0 if no valid hole is found.
 */
function   makeHole (   list   )
{
    // The 'begin' variable is intentionally not declared with 'let', 'const', or 'var'
    // to match the original code's behavior, making it a global variable.
    begin   =   list . shift ( ) ; // Take the first height as the potential starting point of a hole.


    // Check conditions for a potential hole:
    // 1. The first point after 'begin' must be lower than 'begin'.
    // 2. 'begin' must be less than or equal to the maximum height remaining in the list.
    //    This ensures there's a potential "wall" on the right side to contain the water.
    if   (   list [ 0 ]   <   begin   &&   begin   <=   list . reduce (   (   a ,   b   )   =>   Math . max (   a ,   b   ) ,   -100000   )   )
    {
        let   area   =   0 ; // Initialize area for the current hole.

        // Loop to fill the hole until a boundary is reached.
        while   (   true   )
        {
            // Break conditions:
            // 1. The list is exhausted (no more points).
            // 2. The current point is equal to or higher than the 'begin' height,
            //    indicating the end of the hole.
            if   (   list . length   ==   0   ||   begin   <=   list [ 0 ]   )
            {
                break ;
            }

            // Calculate the water trapped at the current point and add to the area.
            area   +=   begin   -   list . shift ( ) ; // Remove the point and calculate trapped water.
        }

        return   area ; // Return the calculated area of the hole.
    }
    else
    {
        return   0 ; // No valid hole found under these conditions.
    }
}