// This module defines a primary routine for evaluating numerical properties.
function AnalyzeProductParity( initialPayload )
{
    // Step 1: Sanitize the raw string by removing any extraneous whitespace.
    let  cleanedPayload  =  initialPayload.trim()  ;

    // Step 2: Decompose the refined string into its constituent numeric components,
    //         assuming they are separated by a single space character.
    let  valueComponents  =  cleanedPayload.split( " " ) ;

    // Step 3: Convert the first string component into an integer base 10.
    const  operandOne  =  parseInt( valueComponents[0], 10 ) ;

    // Step 4: Convert the second string component into an integer base 10.
    const  operandTwo  =  parseInt( valueComponents[1], 10 ) ;

    // Step 5: Compute the mathematical product of the two integer operands.
    const  computedProduct  =  operandOne  *  operandTwo ;

    // Step 6: Determine if the resulting product is an even number.
    //         An even number yields a remainder of zero when divided by two.
    if  ( ( computedProduct  %  2 )  ===  0 )
    {
        // If the product is even, log a specific outcome message.
        console.log( "ProductIsEven" ) ;
    }
    else
    {
        // If the product is not even (i.e., it's odd), log a different outcome.
        console.log( "ProductIsOdd" ) ;
    }
}

// Invoke the analysis routine by feeding it data retrieved from the standard input stream.
AnalyzeProductParity(
    require( "fs" )
        .readFileSync( "/dev/stdin", "utf8" )
);