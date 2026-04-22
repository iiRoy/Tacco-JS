function processInput ( rawData )
{
    // Split the incoming string by spaces to get individual components.
    let tokens = rawData.split ( ' ' ) ;

    // Parse the first token into an integer, assuming base 10.
    let firstNum = parseInt ( tokens [ 0 ] , 10 ) ;

    // Parse the second token into an integer, also base 10.
    let secondNum = parseInt ( tokens [ 1 ] , 10 ) ;

    /*
     * Determine if the product of the two numbers is even or odd.
     * An even number divided by 2 has a remainder of 0.
     */
    if ( ( firstNum * secondNum ) % 2 === 0 )
    {
        // Output result for an even product.
        console . log ( 'Even' ) ;
    }
    else
    {
        // Output result for an odd product.
        console . log ( 'Odd' ) ;
    }
}


// Read the standard input synchronously and pass it to our processing function.
// The file system module is required for this operation.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;