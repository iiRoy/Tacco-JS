function main( input ) {
    // This function processes the main logic of the problem.
    var n = input.split( "\n" )[0] ; // Extracts the first line as 'n'.
    var v = input.split( "\n" )[1] ; // Extracts the second line as 'v'.

    var vArray = v.split( " " ) ; // Splits the 'v' string into an array of strings.

    var countAddMap = { } ; // Initializes a map to store counts for elements at odd indices (0-based).
    var countOddMap = { } ; // Initializes a map to store counts for elements at even indices (0-based).
    var isAllSame = true ; // Flag to check if all corresponding pairs are identical.

    // Loop iterates n/2 times, processing pairs of elements from vArray.
    for  (  var i = 0  ;  i < n / 2  ;  i++  )
    {
        // Increment count for the element at an even index (i*2) in countOddMap.
        countOddMap[ vArray[ i*2 ] ] = ( countOddMap[ vArray[ i*2 ] ] || 0 ) + 1 ;
        // Increment count for the element at an odd index (i*2+1) in countAddMap.
        countAddMap[ vArray[ i*2+1 ] ] = ( countAddMap[ vArray[ i*2+1 ] ] || 0 ) + 1 ;

        // Check if the current pair of elements are different.
        // If they are, and the 'isAllSame' flag was true, set it to false.
        if ( isAllSame  &&  ( vArray[ i*2 ] != vArray[ i*2+1 ] ) )
        {
            isAllSame = false ;
        }
    }

    // If all elements in the array were found to be identical (meaning all pairs were same).
    if ( isAllSame )
    {
        return n / 2 ; // In this scenario, the answer is simply half of 'n'.
    }

    // If not all elements are the same, calculate the result using helper functions.
    // This sums the counts of non-maximum elements from both maps.
    return count( countOddMap ) + count( countAddMap ) ;
}


// This helper function calculates the total count of elements in a map,
// excluding the count of the element that has the maximum occurrences.
function count( map ) {
    var max = maxNum( map ) ; // Determines the key with the highest frequency in the map.
    var count = 0 ; // Initializes a variable to accumulate the sum.

    // Iterates through each key (number) in the provided map.
    for ( var num in map )
    {
        // If the current number is NOT the one with the maximum occurrences,
        // add its count to the total.
        if ( num != max )
        {
            count += map[ num ] ;
        }
    }
    return count ; // Returns the calculated total.
}


// This function identifies and returns the key (number) that appears most frequently in a given map.
function maxNum( map ) {
    var max = 0 ; // Keeps track of the highest frequency encountered.
    var maxNum = -1 ; // Stores the key corresponding to the highest frequency.

    // Iterates over each key in the map using Object.keys() and forEach().
    Object.keys( map ) . forEach( function ( num ) {
        // If the frequency of the current number is greater than the current maximum frequency,
        if ( map[ num ] > max )
        {
            max = map[ num ] ; // Update the maximum frequency.
            maxNum = num ; // Update the key associated with the maximum frequency.
        }
    } ) ;
    return maxNum ; // Returns the key that has the highest frequency.
}

// Executes the main function with input read from standard input and prints the result to the console.
console.log( main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) ) ;