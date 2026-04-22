function    processInputValues( sourceDataString   )    {
    // Split the incoming string by spaces to get individual numeric components.
    const   extractedParts = sourceDataString.split(  ' '  )   ;

    // Calculate the product of the first two extracted parts.
    // Implicit type conversion from string to number occurs here due to multiplication.
    var     multipliedOutcome = extractedParts[0] * extractedParts[1]   ;

    // Retrieve the third extracted part for comparison.
    var     comparisonNumber = extractedParts[2]   ;

    // Determine which of the two calculated values is smaller and print it.
    if   (   multipliedOutcome  <  comparisonNumber   )   {
        console.log (multipliedOutcome)  ; // Output the product if it's the minimum.
    }
    else    {
        console.log(  comparisonNumber  )  ; // Otherwise, output the comparison number.
    }
}

// Execute the main logic by reading input from standard input.
processInputValues (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8'   )  ) ;