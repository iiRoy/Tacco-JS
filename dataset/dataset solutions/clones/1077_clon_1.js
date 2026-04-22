/*
 * This file contains a JavaScript implementation
 * for a specific sorting algorithm with cost calculation.
 * It processes input from stdin to determine the minimum cost.
 */
function createAlignedBaggage  (  baggage  ) {

    // Initialize an empty array to store the aligned elements.
    const    aligned    =    [ ]    ;

    /*
     * Iterate over each element 'e' in the input 'baggage' array.
     * The goal is to place each element at its own index,
     * effectively creating a sparse array where index == value.
     */
    baggage . forEach ( e =>   aligned [ e ]   =   e ) ;

    // Filter out any undefined elements that might have been created
    // if there were gaps in the original baggage values.
    return   aligned . filter ( e =>   e   !==   undefined ) ;

}



/*
 * This function recursively calculates the minimum cost
 * to sort the 'baggage' array according to some criteria.
 *
 * @param {Array<number>} baggage - The array of baggage items to be sorted.
 * @param {number} len - The length of the baggage array.
 * @param {Array<number>} cost - An array holding the accumulated cost (passed by reference).
 * @param {Array<number>} aligned - The target sorted state of the baggage.
 */
function  minimumCostSort (  baggage  ,  len  ,  cost  ,  aligned  )
{

    // Initialize 'min' with the last element of the 'aligned' array.
    let   min   =   aligned [ len   -   1 ] ;
    // 'count' tracks the number of misplaced elements.
    let   count   =   0 ;


    // Iterate through the baggage array to find misplaced elements
    // and determine the minimum value among them.
    for   (   let   i   =   0   ;   i   <   len   ;   i ++   )
    {
        // If an element is not in its correct position (compared to 'aligned')
        if (   baggage [ i ]   !==   aligned [ i ]   )
        {
            count ++ ; // Increment the count of misplaced items.
            // Update 'min' if the current baggage item is smaller.
            min   =   baggage [ i ]   <   min   ?   baggage [ i ]   :   min ;
        }
    }


    /*
     * Special handling for a specific condition:
     * If the first baggage item is 0 AND there are more than 2 misplaced items.
     * This logic seems to move the smallest misplaced item to the beginning
     * and replace its original position with 0.
     */
    if (   baggage [ 0 ]   ===   0   &&   count   >   2   )
    {
        // Find the index of the 'min' value and replace it with 0.
        baggage [ baggage . indexOf ( min ) ]   =   0 ;
        // Place the 'min' value at the beginning of the baggage array.
        baggage [ 0 ]   =   min ;
        // Add 'min' to the total cost.
        cost [ 0 ]   +=   min ;
        // Reset 'min' to 0 for subsequent calculations.
        min   =   0 ;
    }


    // If there are any misplaced items (count > 0), perform a swap operation.
    if (   count   )
    {
        /* Find the current index of the 'min' value.
         * This 'min' is the smallest value among the misplaced elements. */
        const   index   =   baggage . indexOf ( min ) ;

        // Determine the element that should *actually* be at the 'min's current position.
        // This is obtained from the 'aligned' (sorted) array at 'index'.
        const   target   =   baggage . indexOf ( aligned [ index ] ) ;

        // Temporarily store the value at the target position.
        const   temp   =   baggage [ target ] ;

        // Perform the swap:
        // Move 'min' to its correct position (which is 'target' based on the 'aligned' array).
        baggage [ target ]   =   min ;
        // Move the temporarily stored value ('temp') to the 'min's original position.
        baggage [ index ]   =   temp ;

        // Update the total cost by adding 'min' and 'temp'.
        cost [ 0 ]   +=   min   +   temp ;

        // Recursively call the function to continue sorting.
        minimumCostSort (   baggage   ,   len   ,   cost   G,   aligned   ) ;
    }
}


/*
 * The main function responsible for reading input,
 * initializing data structures, calling the sorting algorithm,
 * and printing the final cost.
 */
function   main   (   stdin   )
{
    // Split the standard input into lines.
    const   input   =   stdin . split ( "\n" ) ;

    // Parse the first line as the length of the baggage array.
    const   length   =   parseInt ( input . shift ( )   ,   10 ) ;

    // Parse the second line to create the baggage array.
    // Each element is space-separated and converted to an integer.
    const   baggage   =   input [ 0 ] . split ( ' ' ) . map ( ( e )   =>   parseInt ( e   ,   10 ) ) ;

    // Initialize the cost array. It's an array to allow pass-by-reference.
    const   cost   =   [ 0 ] ;

    // Create the 'aligned' (sorted reference) version of the baggage array.
    const   aligned   =   createAlignedBaggage ( baggage ) ;


    // Call the recursive sorting function to calculate the minimum cost.
    minimumCostSort (   baggage   ,   length   ,   cost   ,   aligned   ) ;

    // Print the final calculated minimum cost to the console.
    console . log ( cost [ 0 ] ) ;
}

// Read input from /dev/stdin and pass it to the main function.
main (   require ( "fs" ) . readFileSync ( "/dev/stdin"   ,   "utf8" )   ) ;