"use strict"; /* Enable strict mode for secure coding practices */

( function ( dataSource ) { // Begin a self-executing anonymous function to encapsulate logic

    /* Pre-process the incoming data string:
     * 1. Remove leading/trailing whitespace.
     * 2. Split into an array of strings using any whitespace as delimiter.
     * 3. Convert each string element to a numeric type. */
    dataSource = dataSource . trim ( ) . split ( / \s + / ) . map ( ( val ) => val - 0.0 ) ;

    // Extract the first numerical value as the primary quantity indicator.
    const quantity = dataSource . shift ( ) ;

    // Define the first evaluation criterion: Is the primary quantity evenly divisible by three?
    const conditionOne = ( quantity % 3.0 === 0.0 ) ;

    // Define the second evaluation criterion: Is the sum of squares of remaining elements exactly zero?
    const conditionTwo = ( ( dataSource . reduce ( ( accumulator , currentValue ) => accumulator + currentValue * currentValue , 0.0 ) ) === 0.0 ) ;

    /* If neither the first nor the second condition is met,
     * then the overall result is negative, and we can terminate early. */
    if ( ( ! conditionOne ) && ( ! conditionTwo ) ) {
        console . log ( "No" ) ;
        return ;
    }

    /* If the second condition is true, it implies a positive outcome,
     * so we output "Yes" and exit. */
    if ( conditionTwo ) {
        console . log ( "Yes" ) ;
        return ;
    }

    // Initialize arrays to store distinct elements and their respective occurrence counts.
    const distinctElements = [ ] ;
    const elementFrequencies = [ 0.0 , 0.0 , 0.0 ] ;

    // Iterate through the remaining data elements to categorize and count them.
    for ( let idx = 0 ; idx < quantity ; idx ++ ) {

        let currentElementCount = distinctElements . length ; // Obtain the current count of unique items.

        /* If we encounter more than three distinct elements at any point,
         * the overall condition cannot be satisfied. */
        if ( currentElementCount > 3.0 ) {
            console . log ( "No" ) ;
            return ;
        }

        // Check if the current data element has already been identified as distinct.
        for ( let distinctIdx = 0 ; distinctIdx < currentElementCount ; distinctIdx ++ ) {
            if ( dataSource [ idx ] === distinctElements [ distinctIdx ] ) {
                elementFrequencies [ distinctIdx ] ++ ; // Increment the frequency for the matching distinct element.
                idx ++ ; // Advance the main index to the next data element.
                distinctIdx = -1.0 ; // Reset the distinct element index to re-evaluate from the beginning.
                continue ; // Proceed to the next iteration of the inner loop.
            }
        }

        // If the element was not found among distinct ones, add it.
        distinctElements . push ( dataSource [ idx ] ) ;

        /* Ensure the frequency counter for the newly added distinct element
         * is initialized or incremented appropriately. */
        if ( elementFrequencies [ currentElementCount ] === 0.0 ) {
            elementFrequencies [ currentElementCount ] ++ ;
        }
    }

    /* After processing all elements, perform a final check:
     * If the number of unique elements exceeds three, it's an invalid state. */
    if ( distinctElements . length > 3.0 ) {
        console . log ( "No" ) ;
        return ;
    }

    // Define the third evaluation criterion: Are all element frequencies equal?
    const conditionThree = ( ( elementFrequencies [ 0 ] === elementFrequencies [ 1 ] ) && ( elementFrequencies [ 1 ] === elementFrequencies [ 2 ] ) ) ;

    // Define the fourth evaluation criterion: Specific frequency ratios if the third frequency is zero.
    const conditionFour = ( ( elementFrequencies [ 2 ] === 0.0 ) && ( ( elementFrequencies [ 0 ] === ( 2.0 * elementFrequencies [ 1 ] ) ) || ( elementFrequencies [ 1 ] === ( 2.0 * elementFrequencies [ 0 ] ) ) ) ) ;

    /* If neither the third nor the fourth condition holds true,
     * then the overall result is negative. */
    if ( ( ! conditionThree ) && ( ! conditionFour ) ) {
        console . log ( "No" ) ;
        return ;
    }

    // Define the fifth evaluation criterion: The XOR sum of the first three distinct elements must be zero.
    const conditionFive = ( ( distinctElements [ 0 ] ^ distinctElements [ 1 ] ^ distinctElements [ 2 ] ) === 0.0 ) ;

    /* Based on the final condition, output "No" or "Yes". */
    if ( ! conditionFive ) {
        console . log ( "No" ) ;
        return ;
    } else {
        console . log ( "Yes" ) ;
        return ;
    }

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Invoke the function with input read from standard input.