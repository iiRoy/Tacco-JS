function ProcessData( sourceData )
{
    // The incoming raw text is split into individual lines for processing.
    sourceData = sourceData . split ( "\n" ) ;

    // An index to keep track of the current line being processed from the source.
    var dataPointer = 0;

    // This loop continues indefinitely until an explicit break condition is met.
    while ( true )
    {
        // The current line is further split by spaces to isolate numerical values.
        sourceData [ dataPointer ] = sourceData [ dataPointer ] . split ( " " ) ;

        // The first number on the line represents the size of the first collection.
        var firstSetSize = parseInt ( sourceData [ dataPointer ] [ 0 ] , 10 ) ;
        // The second number on the line represents the size of the second collection.
        // The dataPointer is incremented after reading the second number.
        var secondSetSize = parseInt ( sourceData [ dataPointer++ ] [ 1 ] , 10 ) ;

        // If both collection sizes are zero, it signifies the end of input, so the loop terminates.
        if ( firstSetSize === 0 && secondSetSize === 0 )
        {
            break ;
        }

        // Initialize two arrays to hold the elements of the collections and their respective sum accumulators.
        var valuesAlpha = [ ] , valuesBeta = [ ] , alphaSum = 0 , betaSum = 0 ;

        // Populate the first collection 'valuesAlpha' and compute its total sum.
        for ( var primaryIndex = 0 ; primaryIndex < firstSetSize ; primaryIndex++ )
        {
            valuesAlpha [ primaryIndex ] = parseInt ( sourceData [ dataPointer++ ] , 10 ) ;
            alphaSum += valuesAlpha [ primaryIndex ] ;
        }

        // Populate the second collection 'valuesBeta' and compute its total sum.
        for ( var primaryIndex = 0 ; primaryIndex < secondSetSize ; primaryIndex++ )
        {
            valuesBeta [ primaryIndex ] = parseInt ( sourceData [ dataPointer++ ] , 10 ) ;
            betaSum += valuesBeta [ primaryIndex ] ;
        }

        // If the combined sum of both collections is odd, it's impossible to balance them with a single swap.
        if ( ( alphaSum + betaSum ) % 2 !== 0 )
        {
            console . log ( "-1" ) ; // Output -1 indicating no solution.
            continue ; // Proceed to the next set of input data.
        }

        // A flag to indicate whether a suitable pair of elements for swapping has been located.
        var matchFound = true ;

        // Iterate through each element in the first collection.
        for ( var primaryIndex = 0 ; primaryIndex < firstSetSize ; primaryIndex++ )
        {
            // For each element in the first collection, iterate through every element in the second collection.
            for ( var secondaryIndex = 0 ; secondaryIndex < secondSetSize ; secondaryIndex++ )
            {
               // Check if swapping valuesAlpha[primaryIndex] and valuesBeta[secondaryIndex] would equalize the sums.
               // The condition simplifies to alphaSum - valuesAlpha[primaryIndex] + valuesBeta[secondaryIndex] == betaSum + valuesAlpha[primaryIndex] - valuesBeta[secondaryIndex]
               if ( alphaSum - valuesAlpha [ primaryIndex ] + valuesBeta [ secondaryIndex ] === betaSum + valuesAlpha [ primaryIndex ] - valuesBeta [ secondaryIndex ] )
               {
                   matchFound = false ; // A matching pair has been found.
                   console . log ( valuesAlpha [ primaryIndex ] + " " + valuesBeta [ secondaryIndex ] ) ; // Output the found pair.
                   break ; // Exit the inner loop as only one such pair is required.
               }
            }
            // If a pair was found in the inner loop, break from the outer loop as well.
            if ( ! matchFound )
            {
                break ;
            }
        }
        // If, after checking all combinations, no suitable pair was found.
        if ( matchFound )
        {
            console . log ( "-1" ) ; // Output -1 indicating no solution.
        }
    }
}

// Execute the main processing function by reading input from standard input.
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;