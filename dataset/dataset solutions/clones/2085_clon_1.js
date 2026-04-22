// This is the primary function that takes all the input data as a single string.
function   Main (  input   )   {

    // First, we split the entire input string into an array of lines.
    input   =   input . split ( "\n" ) ;

    // The very first line contains parameters A, B, and M. We extract it.
    let   tmp   =   input . shift ( ) ;

    // Parse the values of A, B, and M from the extracted line.
    // A represents the number of items in the first category.
    A   =   parseInt (   tmp . split ( " " ) [ 0 ]   ) ;
    // B represents the number of items in the second category.
    B   =   parseInt (   tmp . split ( " " ) [ 1 ]   ) ;
    // M represents the total number of discount offers available.
    M   =   parseInt (   tmp . split ( " " ) [ 2 ]   ) ;

    // The next line contains the prices for items in the first category (refArg).
    refArg   =   input
        .   shift ( ) // Get the line.
        .   split ( " " ) // Split by space.
        .   map (   v   =>   parseInt (   v   )   ) ; // Convert each part to an integer.

    // Similarly, the line after that contains prices for items in the second category (eleArg).
    eleArg   =   input
        .   shift ( ) // Get the next line.
        .   split ( " " ) // Split by space.
        .   map (   v   =>   parseInt (   v   )   ) ; // Convert each to an integer.

    // The remaining lines in 'input' now represent the discount offers.
    // We can assign this remaining array to 'ken' for clarity, though it's not strictly necessary.
    ken   =   input ;

    // Calculate the minimum price from the first category.
    refMin   =   Math . min . apply (   null ,   refArg   ) ;
    // Calculate the minimum price from the second category.
    eleMin   =   Math . min . apply (   null ,   eleArg   ) ;

    // Determine the minimum cost if no special discount is applied.
    // This is simply the sum of the cheapest item from each category.
    defaultMin   =   refMin   +   eleMin ;

    // Initialize our overall minimum cost with this default value.
    min   =   defaultMin ;

    // Now, we iterate through each of the discount offers.
    // Each offer specifies an item from refArg, an item from eleArg, and a discount amount.
    input . forEach (   t   =>   {
        // Parse the current discount offer line.
        let   tm   =   t . split ( " " ) . map (   v   =>   parseInt (   v   )   ) ;

        // Extract the 1-based indices for the items and the discount value.
        let   x   =   tm [ 0 ] ; // Index for an item in 'refArg'.
        let   y   =   tm [ 1 ] ; // Index for an item in 'eleArg'.
        let   c   =   tm [ 2 ] ; // The discount amount to be applied.

        // Calculate the total cost if this specific discount offer is used.
        // Remember to convert 1-based indices to 0-based for array access.
        let   raw   =   refArg [ x - 1 ]   +   eleArg [ y - 1 ]   -   c ;

        // If this calculated 'raw' cost is less than our current overall 'min',
        // then we update our 'min' to this new lower value.
        if   (   min   >   raw   )   {
            min   =   raw ;
        }
    }   ) ;

    // Finally, print the lowest possible total cost found.
    console . log (   min   ) ;

} // End of the Main function block.


// ************************************************************************************************************
// * The following line should not be modified. It is responsible for handling standard input/output.         *
// * It reads all data from standard input, passes it to the 'Main' function, and then executes the script. *
// ************************************************************************************************************
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;