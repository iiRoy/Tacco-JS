/*
 * This file contains the implementation for a specific
 * algorithm to calculate a minimum sum based on array permutations.
 * It reads input from stdin and prints the result to stdout.
 */

function solve  (  arr  ,  len  ) { /* Main function to solve the problem */

    // Initialize the answer variable to zero.
    let ans = 0 ;

    // Declare several arrays and variables needed for the algorithm.
    const V = [ ] ;
    const sorted = [ ] ;
    const mapTable = [ ] ;

    // Find the minimum element in the input array.
    const min = Math . min ( ... arr ) ;

    // Populate 'sorted' array and initialize 'V' (visited) array.
    for  (  let  i  =  0  ;  i  <  len  ;  i ++  )
    {
        sorted [ i ]  =  arr [ i ] ; // Copy elements to 'sorted'.
        V [ i ]  =  false ;        // Mark all elements as not visited initially.
    }

    // Sort the 'sorted' array in ascending order.
    sorted . sort (  ( a , b )  =>  a - b  ) ;


    // Create a mapping from sorted value to its index.
    for  (  let  i  =  0  ;  i  <  len  ;  i ++  )
    {
        mapTable [ sorted [ i ] ]  =  i ;
    }

    // Main loop to iterate through elements and find cycles.
    for  (  let  i  =  0  ;  i  <  len  ;  i ++  )
    {
        // If the element has already been visited as part of a cycle, skip it.
        if  (  V [ i ]  )
            continue ;

        let cur = i ; // Current index in the cycle.
        let s = 0 ;   // Sum of elements in the current cycle.
        let m = 10000 ; // Minimum element in the current cycle (initialized to a large value).
        let an = 0 ;  // Count of elements in the current cycle.

        // Loop to traverse the cycle.
        while  (  1  )
        {
            V [ cur ]  =  true ; // Mark the current element as visited.
            an ++ ;              // Increment cycle element count.

            let v = arr [ cur ] ; // Get the value at the current index.
            m = Math . min ( m , v ) ; // Update minimum value in the cycle.
            s += v ;                   // Add value to the cycle sum.

            cur = mapTable [ v ] ; // Move to the next element in the cycle using the mapTable.

            // Break condition: if the next element is already visited, the cycle is complete.
            if  (  V [ cur ]  )
                break ;
        }

        // Add the minimum cost for this cycle to the total answer.
        // There are two options for cost, we take the minimum of them.
        ans  +=  Math . min (  s + ( an - 2 ) * m  ,  m + s + ( an + 1 ) * min  ) ;
    }

    // Return the final calculated answer.
    return ans ;
}


/**
 * main function to handle input and output.
 * @param {string} _stdin - The raw input string from standard input.
 */
function  main  (  _stdin  ) {

    // Split the input string by newlines to get an array of lines.
    const stdin  =  _stdin . split ( '\n' ) ;

    // Parse the first line as the length of the sequence.
    const len  =  parseInt ( stdin . shift ( ) , 10 ) ;

    // Parse the second line as the sequence of numbers.
    const seq  =  stdin . shift ( ) . split ( ' ' ) . map (  e  =>  parseInt ( e , 10 )  ) ;

    // Call the solve function with the parsed sequence and length.
    const ans  =  solve ( seq , len ) ;

    // Print the result to the console.
    console . log ( ans ) ;
}


// Execute the main function, reading input from the standard input file.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )  ) ;