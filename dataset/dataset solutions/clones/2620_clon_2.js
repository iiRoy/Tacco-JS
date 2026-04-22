function ProcessInputData(initialText) {
    // Process the raw input text to extract numerical parameters and an array.
    // The input is expected to be multi-line.
    initialText = initialText . split ( "\n" ) ;

    // Parse the first line for the main array length and the multiplier factor.
    const firstLineTokens = initialText[0] . split ( " " ) ;
    const dataSize = parseInt ( firstLineTokens[0] ) ;
    const repeatFactor = parseInt ( firstLineTokens[1] ) ;

    // Parse the second line into an array of integers.
    const integerList = initialText[1] . split ( " " ) . map ( ( stringValue ) => parseInt ( stringValue ) ) ;

    // Initialize an accumulator for the final calculation result.
    let finalCalculationResult = 0 ;

    // Define the modulus for calculations to prevent overflow.
    const MODULUS_VALUE = 1000000000 + 7;

    // Iterate through each element of the integer list.
    for ( let arrayPosition = 0 ; arrayPosition < dataSize ; arrayPosition ++ ) {

        // Count elements after the current position that are smaller than the current element.
        let postCurrentSmaller = integerList . slice ( arrayPosition + 1 ) . filter ( ( elementValue ) => elementValue < integerList[arrayPosition] ) . length ;

        // Count all elements in the entire list that are smaller than the current element.
        let totalSmallerElements = integerList . filter ( ( elementVal ) => elementVal < integerList[arrayPosition] ) . length ;

        // Add the first component to the result, multiplied by the repeat factor.
        finalCalculationResult += ( postCurrentSmaller * repeatFactor ) ;
        finalCalculationResult %= MODULUS_VALUE ; // Apply modulus

        // Add the second component, which involves a sum of an arithmetic series.
        // This corresponds to (totalSmallerElements * (repeatFactor - 1) * repeatFactor / 2).
        finalCalculationResult += ( totalSmallerElements * ( ( repeatFactor - 1 ) * repeatFactor / 2 ) ) % MODULUS_VALUE ;
        finalCalculationResult %= MODULUS_VALUE ; // Apply modulus again

    } // End of iteration

    // Output the final computed result.
    console.log ( finalCalculationResult ) ;

}

// Read input from standard input and pass it to the processing function.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;