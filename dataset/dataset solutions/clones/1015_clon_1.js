( function ( input ) {

    // Initialize an array 'p' by splitting the input string by newline characters.
    var p = input.split( '\n' ) ;

    // Extract the first element from 'p' and store it in 'n'.
    var n = p.shift( ) ;

    // Create a new array 'a' containing elements from 'p' up to index 'n'.
    var a = p.slice( 0 , n ) ;

    // Initialize a counter variable 'count' to 0. This will track comparisons.
    var count = 0 ;

    // Initialize an empty array 'g' which will store the gap sequence.
    var g = [ ] ;

    // Loop to generate the gap sequence (Knuth's sequence: 2^k - 1, or similar powers of 2).
    // This loop generates powers of 2 until they exceed the length of array 'a'.
    for ( var i = 0 ; ; i ++ ) {

        // Calculate the current power of 2.
        var m = Math.pow( 2 , i ) ;

        // If the calculated gap 'm' is greater than the array length, break the loop.
        if ( m > a.length ) {
            break ;
        }

        // Add the gap 'm' to the beginning of the 'g' array (unshift).
        g.unshift( m ) ;
    }

    // Call the shell sort function to sort array 'a' using the generated gaps 'g'.
    sortShell( a , g ) ;

    // Output the number of gaps used for sorting.
    console.log( g.length ) ;

    // Output the gap sequence, joined by spaces.
    console.log( g.join( ' ' ) ) ;

    // Output the total count of comparisons made during sorting.
    console.log( count ) ;

    // Output the sorted array 'a', with elements joined by newlines.
    console.log( a.join( '\n' ) ) ;


    // Define the main Shell Sort function.
    function sortShell ( a , g ) {

        // Iterate through each gap in the 'g' array.
        for ( var i = 0 ; i < g.length ; i ++ ) {

            // For each gap, perform an insertion sort on the array 'a'.
            sortInsertion( a , g[ i ] ) ;
        }


        // Define the Insertion Sort function, adapted for a specific gap.
        function sortInsertion ( a , g ) {

            // console.log(a.join(' ')); // Optional: uncomment to see array state before inner loop

            // Iterate through the array starting from the gap 'g'.
            // This loop processes elements that are 'g' positions apart.
            for ( var i = g ; i < a.length ; i += g ) {

                // Store the current element to be inserted.
                var v = a[ i ] ;

                // Initialize 'j' to the position 'g' steps before 'i'.
                var j = i - g ;

                // Shift elements greater than 'v' to the right by 'g' positions.
                while ( j >= 0 && a[ j ] > v ) {

                    // Move the element 'g' positions to the right.
                    a[ j + g ] = a[ j ] ;

                    // Move 'j' back by 'g' positions.
                    j -= g ;

                    // Increment the comparison counter.
                    count ++ ;
                }

                // Place the stored element 'v' into its correct sorted position.
                a[ j + g ] = v ;

                // console.log(a.join(' ')); // Optional: uncomment to see array state after each insertion
            }
        }
    }

} ) ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;