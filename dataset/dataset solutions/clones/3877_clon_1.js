"use strict" ; // Enforce strict mode for cleaner code and fewer errors

// This is the main function that processes the input argument.
const main = arg =>
{
    // First, remove any leading/trailing whitespace from the input string,
    // then split it into an array of strings based on newline characters.
    arg = arg . trim ( ) . split ( "\n" ) ;

    // Parse the individual components from the first line of input.
    // The components are separated by spaces.
    const A = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ; // Cost of one A-type item.
    const B = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ; // Cost of one B-type item.
    const C = parseInt ( arg [ 0 ] . split ( " " ) [ 2 ] ) ; // Cost of one AB-set (half A, half B).
    const X = parseInt ( arg [ 0 ] . split ( " " ) [ 3 ] ) ; // Required quantity of A-type items.
    const Y = parseInt ( arg [ 0 ] . split ( " " ) [ 4 ] ) ; // Required quantity of B-type items.

    // Calculate the effective price of buying an A and a B item individually,
    // when compared to buying two C-sets (which provide one A and one B).
    const AB = 2 * C ; // Cost of an AB-set (equivalent to one A and one B).

    // --- Decision Logic: Compare buying individually vs. using AB-sets ---

    // Check if buying an AB-set is cheaper than buying an A and a B item separately.
    if ( A + B > AB )
    {
        // If an AB-set is advantageous:
        // Calculate the base cost using the minimum required AB-sets.
        let priceAB = AB * Math . min ( X , Y ) ;

        // Initialize solo price for remaining items.
        let soloPrice = 0 ;

        // Determine the cost for the remaining items (if any) that cannot be covered by full AB-sets.
        if ( X > Y )
        {
            // If more A items are needed than B items, buy the excess A items individually.
            soloPrice = A * ( X - Y ) ;
        }
        else if ( Y > X )
        {
            // If more B items are needed than A items, buy the excess B items individually.
            soloPrice = B * ( Y - X ) ;
        }

        // Calculate the total cost by combining AB-sets and individual purchases.
        let partialAB = priceAB + soloPrice ;

        // Calculate the cost if all items are purchased as AB-sets,
        // even if it means buying more than necessary of one type.
        let allAB = AB * Math . max ( X , Y ) ;

        // Compare two strategies for purchasing:
        // 1. Buying enough AB-sets to cover the maximum requirement, potentially overbuying.
        // 2. Buying AB-sets for the minimum requirement, then buying the remainder individually.
        // Output the minimum cost between these two strategies.
        console . log ( Math . min ( allAB , partialAB ) ) ;
    }
    else
    {
        // If an AB-set is NOT advantageous (i.e., A + B <= AB),
        // it is always cheaper or equal to buy all items individually.
        　// Therefore, calculate the total cost by purchasing all A and B items separately.
        console . log ( ( A * X ) + ( B * Y ) ) ;
    }
} ; // End of the main function definition.


// Execute the main function with input read from standard input.
// The input is read as a UTF-8 string.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;