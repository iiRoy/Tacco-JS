/*
 * This JavaScript file processes a series of data sets, each containing a budget
 * and a list of prices. For each data set, it calculates the highest possible sum
 * of any two distinct prices from the list that does not exceed the given budget.
 *
 * This version of the code is a Type I clone, meaning it is functionally identical
 * to the original, with variations only in whitespace and comments.
 * All identifiers, operators, and expressions are preserved exactly as in the original.
 */

const   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// The above line reads the entire content of the standard input as a UTF-8 string.

const   lines   =   input . trim ( ) . split ( '\n' ) ;
// The input string is then trimmed of leading/trailing whitespace and split into an array of lines.


/**
 *  @function   getMax
 *  @description    This function identifies the largest number within an array
 *                  that is also less than or equal to a specified limit.
 *  @param  {number}    limit       The maximum permissible value for the number.
 *  @param  {number[]}  numbers     An array of numerical values to be evaluated.
 *  @returns    {number}    The highest number from the 'numbers' array that respects the 'limit',
 *                          or 0 if no such number is found or the array is empty.
 */
const   getMax   =   (   limit ,   numbers   )   =>   {
    return   numbers . reduce (   (   acc ,   next   )   =>   {
        // Check if the current number 'next' is greater than the current accumulated maximum 'acc'.
        if   (   next   >   acc   )   {
            // If 'next' is indeed greater, then further check if it respects the 'limit'.
            if   (   next   <=   limit   )   {
                return   next ; // If 'next' is within the limit, it becomes the new 'acc'.
            }
            return   acc ; // If 'next' exceeds the 'limit', the 'acc' remains unchanged.
        }
        return   acc ; // If 'next' is not greater than 'acc', 'acc' remains unchanged.
    } ,   0   ) ; // The reduction starts with an initial accumulator value of 0.
} ;


/**
 *  @function   getHighestPriceSum
 *  @description    Calculates all unique pairs' sums from a given price list,
 *                  and then finds the maximum sum that does not exceed a specified budget.
 *  @param  {number}    budget      The maximum allowable sum for any two prices.
 *  @param  {number[]}  priceList   An array containing various price values.
 *  @returns    {number}    The largest sum of two distinct prices from 'priceList' that is
 *                          within the 'budget'.
 */
const   getHighestPriceSum   =   (   budget ,   priceList   )   =>   {
    const   sums   =   [ ] ; // Initialize an empty array to store all calculated sums.

    // First loop: Iterates through each price to use as the first addend.
    for   (   i   =   0 ;   i   <   priceList . length ;   i ++   )   {
        const   leftAddend   =   priceList [ i ] ; // Assign the current price as the left operand.

        // Second loop: Iterates through each price to use as the second addend.
        for   (   j   =   0 ;   j   <   priceList . length ;   j ++   )   {
            // Ensure that the two addends are distinct items from the original list (different indices).
            if   (   i   !==   j   )   {
                const   rightAddend   =   priceList [ j ] ; // Assign the current price as the right operand.
                sums . push (   leftAddend   +   rightAddend   ) ; // Add their sum to the 'sums' array.
            }
        }
    }

    // Previous debugging line, now commented out: // console . log ( sums )
    return   getMax (   budget ,   sums   ) ; // Determine and return the highest valid sum.
} ;


let   ctr   =   0 ; // A counter variable, initialized to zero, used for tracking line numbers.

const   dataSets   =   [ ] ; // An array to hold structured data sets, each containing a budget and a price list.

const   objHolder   =   { } ; // A temporary object used to assemble budget and price list before pushing to dataSets.


// This loop processes input lines, alternating between budget and price list data.
while   (   line   =   lines . shift ( )   )   { // Continuously extract lines until none are left.
    // Check if the current line represents a budget (even counter) or a price list (odd counter).
    if   (   ctr   %   2   ===   0   )   {
        // If 'ctr' is even, parse the budget from the line.
        const   budget   =   line . split ( ' ' ) . map ( Number ) [ 1 ] ; // Splits, converts to numbers, and takes the second element.
        objHolder . budget   =   budget ; // Stores the extracted budget in the temporary object.
    }   else   {
        // If 'ctr' is odd, parse the price list from the line.
        const   priceList   =   line . split ( ' ' ) . map ( Number ) ; // Splits and converts all elements to numbers.
        objHolder . priceList   =   priceList ; // Stores the extracted price list in the temporary object.
        dataSets . push (   {
            ... objHolder // Pushes a new object, spreading the contents of objHolder, into dataSets.
        }   ) ;
    }
    ctr ++ ; // Increment the line counter for the next iteration.
}


// Iterate through each prepared data set and print the result.
dataSets . forEach (   obj   =>   {
    // Destructure the 'budget' and 'priceList' properties from the current object.
    const   {   budget ,   priceList   }   =   obj ;

    // Call the main calculation function and output its result to the console.
    console . log (   getHighestPriceSum (   budget ,   priceList   )   ) ;
    // An alternative commented-out call, possibly for debugging or without direct console output:
    // getHighestPriceSum ( budget , priceList ) ;
}   ) ;