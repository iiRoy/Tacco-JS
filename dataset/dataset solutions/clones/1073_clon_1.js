// This is the main immediately-invoked function expression (IIFE)
// It takes the entire input as a single string from standard input.
( function ( input ) {

    // First, we split the entire input string by newline characters.
    // This creates an array where each element is a line from the input.
    var p = input.split( '\n' );

    // The very first line of the input contains the total number of data elements.
    // We extract this number, convert it from string to Number, and store it in 'n'.
    // The `shift()` method also removes this first element from array 'p'.
    var n = Number( p.shift() );

    // Now, we take the next 'n' elements from array 'p' to form our main data array 'A'.
    // These 'n' elements represent the cards that need to be sorted.
    var A = p.slice( 0, n );

    // To check for sorting stability later, we need an exact copy of the original array 'A'.
    // We create this copy, named 'C', using the `concat()` method for a shallow copy.
    var C = [].concat( A );

    // We invoke the `partition` function to perform the sorting operation on array 'A'.
    // The initial call covers the entire array, from index 0 to its last element.
    partition( A, 0, A.length - 1 );

    // After sorting, we check if the sorting algorithm maintained stability.
    // The `check` function compares the original array 'C' with the sorted array 'A'.
    // Based on its return value, we print "Stable" or "Not stable" to the console.
    console.log( check( C, A ) ? 'Stable' : 'Not stable' );

    // Finally, we print the completely sorted array 'A' to the console.
    // The elements are joined back together with newline characters for output formatting.
    console.log( A.join( '\n' ) );

// The input for this IIFE is read from the file system, specifically standard input (`/dev/stdin`).
// The content is read as a UTF-8 encoded string.
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );


// This helper function is responsible for extracting the numeric value from a card string.
// For instance, if the input string 'a' is "H3" or "S10", this function will return 3 or 10 respectively.
function getNumber ( a ) {
    // The numeric part of the card string always starts from the second character (index 1)
    // and extends to the end of the string. We parse this substring into a Number.
    return Number( a.slice( 1, a.length ) );
}


// The `getWords` function constructs a string by concatenating all cards from an input array 'a'
// that share a specific numeric value 'n'. This is crucial for stability checking.
function getWords ( a, n ) {
    var r = ''; // Initialize an empty string to accumulate the matching cards.

    // We iterate through each card in the provided array 'a'.
    for ( var i = 0; i < a.length; i++ ) {
        // For each card, we extract its numeric value using `getNumber`.
        // If this value matches the target number 'n'...
        if ( getNumber( a[ i ] ) === n ) {
            // ...we append the entire card string to our result string 'r'.
            r += a[ i ];
        }
    }

    // After checking all cards, we return the concatenated string.
    return r;
}


// The `check` function determines if the sorting process was "stable".
// It compares the relative order of elements with equal keys in the original array 'c'
// against their order in the sorted array 'a'.
function check ( c, a ) {
    var i = 0; // Initialize an index to traverse the arrays.

    // We loop through the elements of the sorted array 'a' (which should have the same length as 'c').
    while ( i < a.length ) {
        // For the current position 'i', we get the numeric value of the card from the original array 'c'.
        var n = getNumber( c[ i ] );

        // We then compare the concatenated string of all cards with this number 'n'
        // in both the original array 'c' and the sorted array 'a'.
        // If these concatenated strings are not identical, it means their relative order changed,
        // indicating an unstable sort.
        if ( getWords( c, n ) !== getWords( a, n ) ) {
            return false; // The sort is not stable.
        }

        i++; // Move to the next position.
    }

    // If the loop completes without finding any discrepancies, the sort is stable.
    return true;
}


// This `partition` function implements a recursive sorting algorithm,
// likely a variation of QuickSort, to sort the array 'A' in place.
// 'p' is the starting index and 'r' is the ending index of the current sub-array.
function partition ( A, p, r ) {

    // Base case: If the sub-array has one element or fewer, it's considered sorted.
    if ( p >= r ) {
        return;
    }

    // The pivot element 'x' is chosen as the last element of the current sub-array.
    var x = A[ r ];

    // 'i' keeps track of the boundary between elements less than or equal to the pivot
    // and elements greater than the pivot. It's initialized to one less than the start.
    var i = p - 1;

    // We iterate through the sub-array from the start 'p' up to (but not including) the pivot 'r'.
    for ( var j = p; j <= r - 1; j++ ) {

        // If the numeric value of the current element A[j] is less than or equal to the pivot's value...
        if ( getNumber( A[ j ] ) <= getNumber( x ) ) {
            i++; // Increment 'i', as we found another element for the "less than or equal" partition.

            // Swap A[i] and A[j]. This moves smaller elements to the left side of 'i'.
            var tmp = A[ i ];
            A[ i ] = A[ j ];
            A[ j ] = tmp;
        }
    }

    // After the loop, 'i' is the index of the last element that was less than or equal to the pivot.
    // The pivot should be placed at index i + 1.
    // If i + 1 is already equal to 'r' (the pivot's original position), it means all elements
    // were less than or equal to the pivot, or the sub-array was trivial, so no swap is needed for the pivot.
    if ( i + 1 == r ) {
        return;
    }

    // Swap the pivot (originally at A[r]) with the element at A[i + 1].
    // This places the pivot in its final sorted position.
    var tmp = A[ i + 1 ];
    A[ i + 1 ] = A[ r ];
    A[ r ] = tmp;

    // Recursively call partition on the left sub-array, including the pivot's final position.
    // This sorts the elements from 'p' up to 'i + 1'.
    partition( A, p, i + 1 );

    // Recursively call partition on the right sub-array, also including the pivot's final position.
    // This sorts the elements from 'i + 1' up to 'r'.
    partition( A, i + 1, r );
}