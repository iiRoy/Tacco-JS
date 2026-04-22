let input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )


// This is the main function that processes the input and determines the output.
function main ( { input , load , yesno , math_sum , log_json } ) {

  // Load the first two numbers from the input: N and M.
  const [ N , M ] = load ( 2 )

  // Load M pairs of numbers, representing connections (A[i], B[i]).
  const [ A , B ] = load ( M , 2 )


  // Initialize an array to store the "sign" (parent room) for each room.
  // The size is N+1 because rooms are 1-indexed.
  const rooms = new Array ( N + 1 ) . fill ( 0 ) // rooms[room_number] = parent_room_number or 0 if unvisited

  // Mark room 0 as visited (and invalid) and room 1 as the starting point.
  // Room 1 is its own "parent" in this context.
  rooms [ 0 ] = -1
  rooms [ 1 ] = -1


  // Initialize a queue for a Breadth-First Search (BFS) or similar traversal.
  const rest = [ 1 ]

  // Continue as long as there are rooms to process in the queue.
  while ( rest . length ) {

    // Prevent infinite loops during execution, especially in competitive programming.
    inifinite_loop_preventer ( )

    // Get the next room to process from the front of the queue.
    const room = rest . shift ( )

    // Iterate through all M connections to find those involving the current room.
    for ( let i = 0 ; i < M ; i ++ ) {

      let from = null , to = null

      // Check if the current room is A[i] in the connection.
      if ( A [ i ] === room ) {
        [ from , to ] = [ B [ i ] , A [ i ] ]
      }

      // Check if the current room is B[i] in the connection.
      // This allows for undirected connections.
      if ( B [ i ] === room ) {
        [ from , to ] = [ A [ i ] , B [ i ] ]
      }

      // If the current room is not part of this connection, skip it.
      if ( from === null ) {
        continue
      }

      // If the 'from' room has not been visited yet (its sign is 0).
      if ( ! rooms [ from ] ) {
        // Assign the current room ('to') as its parent/sign.
        rooms [ from ] = to
        // Add the 'from' room to the queue for further processing.
        rest . push ( from )
      }

    }
  }


  // After the traversal, check if any room remains unvisited (sign is 0).
  if ( rooms . includes ( 0 ) ) {
    return 'No' // If any room is unvisited, it's not fully connected.
  }

  // If all rooms are visited, it's a 'Yes' scenario.
  console . log ( 'Yes' )

  // Return the signs of rooms from 2 onwards, joined by newlines.
  // Rooms[0] and Rooms[1] are special cases and not part of the output.
  return rooms . slice ( 2 ) . join ( '\n' )

}



// This section handles the input parsing and execution of the main function.

// The `input` variable contains the raw string from stdin.
let inputs = input . split ( /[\s\n]/ ) . filter ( s => s !== '' ) // Split by whitespace and newlines, filter out empty strings.

// Counter to prevent accidental infinite loops in processing.
let inifinite_loop_prevent_counter = 0

// Execute the main function with necessary helper utilities.
let result = main ( {
    input , // Raw input string
    yesno : value => value ? 'Yes' : 'No' , // Helper for boolean to 'Yes'/'No' string conversion
    math_sum : numbers => numbers . reduce ( ( acc , cur ) => acc + cur , 0 ) , // Helper for summing an array of numbers
    load ( rows = 1 , cols = 1 , type = Number ) {
        // This function loads data from the `inputs` array.
        // `rows` specifies the number of rows (or items if cols=1).
        // `cols` specifies the number of columns.
        // `type` specifies the type to cast the input values to (e.g., Number, String).

        const length = rows * cols // Calculate total number of elements to load.
        let result = inputs . splice ( 0 , length ) // Extract elements from the global `inputs` array.

        // If the type is not String, map the elements to the specified type.
        if ( type !== String ) {
          result = result . map ( type )
        }

        // If there are multiple columns, restructure the result into an array of arrays.
        if ( cols > 1 ) {
            const arrays = new Array ( cols )
            for ( let col = 0 ; col < cols ; col ++ ) {
                arrays [ col ] = new Array ( )
                for ( let row = 0 ; row < rows ; row ++ ) {
                    // Populate columns first, then rows.
                    arrays [ col ] . push ( result [ row * cols + col ] )
                }
            }
            result = arrays // Update result to the 2D array.
        }
        return result
    } ,
    log_json ( value ) {
        // Utility to log a value as a JSON string for debugging.
        console . log ( JSON . stringify ( value ) )
    } ,
} )

// Check the result returned by the main function and print it.
if ( result === undefined ) {
    console . warn ( "result is undefined" ) // Warn if the main function didn't explicitly return a value.
} else {
    console . log ( result ) // Print the final result.
}


// Helper function to prevent infinite loops in while/for constructs.
function inifinite_loop_preventer ( max = 1e5 ) {
    inifinite_loop_prevent_counter ++ // Increment the global counter.
    if ( inifinite_loop_prevent_counter >= max ) {
        // If the counter exceeds the maximum, throw an error.
        throw new Error ( "Infinite loop detected: counter exceeded " + max )
    }
}

// Function to find the maximum value in an array of numbers.
function math_max ( numbers , initial_value = null ) {
    let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value // Initialize result.
    for ( const n of numbers ) {
        if ( n > result ) {
            result = n // Update result if a larger number is found.
        }
    }
    return result
}

// Function to find the minimum value in an array of numbers.
function math_min ( numbers , initial_value = null ) {
    let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value // Initialize result.
    for ( const n of numbers ) {
        if ( n < result ) {
            result = n // Update result if a smaller number is found.
        }
    }
    return result
}

// Function to perform prime factorization of a number.
// Returns an object where keys are prime factors and values are their exponents.
function math_prime_factors ( n ) {
    const result = { } // Object to store prime factors and their counts.

    // Iterate from 2 up to the square root of n.
    for ( let i = 2 ; i * i <= n ; i ++ ) {
        if ( n % i === 0 ) { // If i is a factor of n.
            n /= i // Divide n by i.
            result [ i ] = 1 // Initialize count for this prime factor.

            while ( n % i === 0 ) { // Keep dividing until i is no longer a factor.
                n /= i
                result [ i ] ++ // Increment count.
            }
        }
    }

    if ( n > 1 ) { // If n is still greater than 1, it means n itself is a prime factor.
      result [ n ] = 1
    }

    return result // Return the prime factorization.
}