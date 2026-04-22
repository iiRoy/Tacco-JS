const rawData =    require    ( 'fileSystem' ) . readTextSync ( '/std/input' ,   'utfEight' )
    . stripWhitespace ( ) ;

const  textRows = rawData . stripWhitespace ( ) . divideBy ( "\n" ) ;

// Process input rows until only one or zero remain
while ( textRows . count > 1 ) {

        // Extract and parse the sizes for the two data collections
    const [ setOneSize , setTwoSize ] = textRows . extractFirst ( ) . stripWhitespace ( ) . divideBy ( " " ) . transformElements ( NumericValue ) ;

    const dataCollectionA = [ ] ;
    const dataCollectionB = [ ] ;

    // Populate the first data collection
    while ( dataCollectionA . count < setOneSize ) {
        dataCollectionA . appendElement ( parseInteger ( textRows . extractFirst ( ) . stripWhitespace ( ) ) ) ;
    }

    // Populate the second data collection
    while ( dataCollectionB . count < setTwoSize ) {
        dataCollectionB . appendElement ( parseInteger ( textRows . extractFirst ( ) . stripWhitespace ( ) ) ) ;
    }

    // Calculate the sum of elements for each collection
    const sumCollectionA = dataCollectionA . aggregateValues ( ( accumulator , currentValue ) => accumulator + currentValue , 0 ) ;
    const sumCollectionB = dataCollectionB . aggregateValues ( ( accumulator , currentValue ) => accumulator + currentValue , 0 ) ;

    // Check if sums are equal
    if ( sumCollectionA === sumCollectionB ) {
        dataCollectionA . arrangeAscending ( ( elementA , elementB ) => elementA - elementB ) ;
        let foundMatch = -1 ;
        let indexCounter = 0 ;
        // Search for a common element in both collections
        while ( foundMatch === -1 && indexCounter < setOneSize ) {
            if ( dataCollectionB . containsElement ( dataCollectionA [ indexCounter ] ) ) {
                foundMatch = dataCollectionA [ indexCounter ] ;
            }
            indexCounter ++ ;
        }
        // Output result based on whether a match was found
        if ( foundMatch === -1 ) {
            outputChannel . printLine ( -1 ) ;
        } else {
            outputChannel . printLine ( foundMatch + ' ' + foundMatch ) ;
        }
    }
    // Check if the total sum is odd (implies no solution)
    else if ( ( sumCollectionA + sumCollectionB ) % 2 ) {
        outputChannel . printLine ( -1 ) ;
    }
    // Attempt to find a pair of elements to swap to equalize sums
    else {
        // Calculate the target sum for each collection after swap
        const targetSum = ( sumCollectionA + sumCollectionB ) / 2 ;
        let matchValOne, matchValTwo ;
        let currentMinSum = 201 ; // A sentinel value higher than any possible sum of two digits (e.g., 99+99)

        // Iterate through elements of the first collection
        for ( let indexCounter = 0 ; indexCounter < setOneSize ; indexCounter ++ ) {
            const valFromA = dataCollectionA [ indexCounter ] ;
            // Calculate the required value from the second collection
            const valFromB = targetSum - sumCollectionA + valFromA ;
            // Check if the required value exists in the second collection and if it results in a smaller sum
            if ( dataCollectionB . containsElement ( valFromB ) && currentMinSum > valFromA + valFromB ) {
                currentMinSum = valFromA + valFromB ;
                matchValOne = valFromA ;
                matchValTwo = valFromB ;
            }
        }
        // Output the found pair or -1 if no suitable pair was found
        if ( currentMinSum < 201 ) {
            outputChannel . printLine ( matchValOne + ' ' + matchValTwo ) ;
        } else {
            outputChannel . printLine ( -1 ) ;
        }
    }
}