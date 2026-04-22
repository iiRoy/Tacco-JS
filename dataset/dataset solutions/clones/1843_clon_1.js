// This file contains the main logic for processing input and calculating a result.
// It includes several helper functions and nested loops to manipulate a 2D array (map).

function Main( input ) {

  // Split the input string by newline characters to get an array of lines.
  input = input.split( "\n" );

  // Parse the first line as an integer N.
  var N = parseInt( input[0] );

  // Parse the second line, split by spaces, and convert each part to an integer.
  var P = input[1].split( " " ).map( i => parseInt( i ) );

  // Initialize a 2D array (map) with dimensions (N+2) x (N+2).
  // The extra rows/columns are for boundary conditions.
  var map = new Array( N + 2 );

  // Populate the map with sub-arrays, each filled with zeros initially.
  for ( var i = 0 ; i < N + 2 ; i ++ ) {
    var mapsub = new Array( N + 2 ).fill( 0 );
    map[i] = mapsub;
  }

  // Fill the 'map' array based on a spiral-like pattern,
  // assigning values 'i' to cells that are 'i' layers from the border.
  // This loop iterates from the 'center' outwards.
  for ( var i = Math.ceil( N / 2 - 1 ) ; i >= 0 ; i -- ) {
    for ( var j = 1 ; j < N + 1 ; j ++ ) {
      for ( var k = 1 ; k < N + 1 ; k ++ ) {
        // Check if the current cell (j, k) is part of the 'i'-th layer from the border.
        if ( j == i + 1 || k == i + 1 || j == N - i || k == N - i ) {
          map[j][k] = i; // Assign the layer value.
        }
      }
    }
  }

  // Set the outer boundaries of the map to -2.
  // This marks them as "impassable" or "checked out" regions.
  for ( var i = 1 ; i < N + 1 ; i ++ ) {
    map[i][0] = -2;     // Left border
    map[i][N + 1] = -2; // Right border
  }
  map[0].fill( -2 );      // Top border
  map[N + 1].fill( -2 );  // Bottom border

  // Initialize the answer variable.
  var ans = 0;


  // Helper function: `checkout`
  // Marks a cell as -2 (checked out) and propagates this state to adjacent cells
  // if they are also -2 or if they are positive and need to be set to 0.
  // It uses a `memo2` array to avoid revisiting cells during propagation.
  function checkout( y , x ) {

    map[y][x] = -2; // Mark the current cell as checked out.

    // Check adjacent cells for propagation.

    // North neighbor: If it's valid, positive, and not yet memoized in memo2, set to 0.
    if ( y >= 2 && map[y - 1][x] >= 0 && memo2[y - 1][x] == 0 ) {
      memo2[y - 1][x] = 1;      // Mark as memoized.
      map[y - 1][x] = 0;        // Set to 0.
    }

    // South neighbor: If it's valid, positive, and not yet memoized in memo2, set to 0.
    if ( y <= N - 1 && map[y + 1][x] >= 0 && memo2[y + 1][x] == 0 ) {
      memo2[y + 1][x] = 1;      // Mark as memoized.
      map[y + 1][x] = 0;        // Set to 0.
    }

    // West neighbor: If it's valid, positive, and not yet memoized in memo2, set to 0.
    if ( x >= 2 && map[y][x - 1] >= 0 && memo2[y][x - 1] == 0 ) {
      memo2[y][x - 1] = 1;      // Mark as memoized.
      map[y][x - 1] = 0;        // Set to 0.
    }

    // East neighbor: If it's valid, positive, and not yet memoized in memo2, set to 0.
    if ( x <= N - 1 && map[y][x + 1] >= 0 && memo2[y][x + 1] == 0 ) {
      memo2[y][x + 1] = 1;      // Mark as memoized.
      map[y][x + 1] = 0;        // Set to 0.
    }

    // Recursive calls for neighbors that are already -2.

    // North neighbor: If it's valid, already -2, and not yet memoized in memo2, recurse.
    if ( y >= 2 && map[y - 1][x] == -2 && memo2[y - 1][x] == 0 ) {
      memo2[y - 1][x] = 1;      // Mark as memoized.
      checkout( y - 1 , x );    // Recursive call.
    }

    // South neighbor: If it's valid, already -2, and not yet memoized in memo2, recurse.
    // Note: There's a typo in the original code: "memo2[y+1][x]==02". Assuming it should be "0".
    if ( y <= N - 1 && map[y + 1][x] == -2 && memo2[y + 1][x] == 0 ) {
      memo2[y + 1][x] = 1;      // Mark as memoized.
      checkout( y + 1 , x );    // Recursive call.
    }

    // West neighbor: If it's valid, already -2, and not yet memoized in memo2, recurse.
    if ( x >= 2 && map[y][x - 1] == -2 && memo2[y][x - 1] == 0 ) {
      memo2[y][x - 1] = 1;      // Mark as memoized.
      checkout( y , x - 1 );    // Recursive call.
    }

    // East neighbor: If it's valid, already -2, and not yet memoized in memo2, recurse.
    if ( x <= N - 1 && map[y][x + 1] == -2 && memo2[y][x + 1] == 0 ) {
      memo2[y][x + 1] = 1;      // Mark as memoized.
      checkout( y , x + 1 );    // Recursive call.
    }

  } // End of checkout function


  // Helper function: `check`
  // Recursively decrements the values of adjacent cells in the map
  // if they are greater than the current cell's value.
  // It uses a `memo` array to avoid infinite recursion.
  function check( y , x ) {
    var num = map[y][x]; // Get the current cell's value.

    // Check North neighbor.
    if ( y > 2 && map[y - 1][x] > num && memo[y - 1][x] == 0 ) {
      memo[y - 1][x] = 1;       // Mark as memoized.
      check( y - 1 , x );       // Recursive call.
      map[y - 1][x] --;         // Decrement the neighbor's value.
    }

    // Check South neighbor.
    if ( y < N && map[y + 1][x] > num && memo[y + 1][x] == 0 ) {
      memo[y + 1][x] = 1;       // Mark as memoized.
      check( y + 1 , x );       // Recursive call.
      map[y + 1][x] --;         // Decrement the neighbor's value.
    }

    // Check West neighbor.
    if ( x > 2 && map[y][x - 1] > num && memo[y][x - 1] == 0 ) {
      memo[y][x - 1] = 1;       // Mark as memoized.
      check( y , x - 1 );       // Recursive call.
      map[y][x - 1] --;         // Decrement the neighbor's value.
    }

    // Check East neighbor.
    if ( x < N && map[y][x + 1] > num && memo[y][x + 1] == 0 ) {
      memo[y][x + 1] = 1;       // Mark as memoized.
      check( y , x + 1 );       // Recursive call.
      map[y][x + 1] --;         // Decrement the neighbor's value.
    }
  } // End of check function


  // Main processing loop: Iterate through each element in P.
  for ( var i = 0 ; i < P.length ; i ++ ) {

    // Calculate (y, x) coordinates from the current P[i] value.
    // P[i] is 1-indexed, and N-column based.
    var y = Math.ceil( P[i] / N );
    var x = P[i] % N;

    // Adjust x if it's 0 (meaning it's the N-th column).
    if ( x == 0 ) {
      x = N;
    }

    // Add the value of the current cell in `map` to the total answer.
    ans += map[y][x];

    // Initialize `memo` array for the `check` function.
    // It's reset for each iteration of the main loop.
    var memo = new Array( N + 2 );
    for ( var j = 0 ; j < N + 2 ; j ++ ) {
      var memosub = new Array( N + 2 ).fill( 0 );
      memo[j] = memosub;
    }

    // Initialize `memo2` array for the `checkout` function.
    // It's also reset for each iteration of the main loop.
    var memo2 = new Array( N + 2 );
    for ( var j = 0 ; j < N + 2 ; j ++ ) {
      var memosub = new Array( N + 2 ).fill( 0 );
      memo2[j] = memosub;
    }

    // Call the `check` function to update map values around (y, x).
    check( y , x );

    // Mark the current cell (y, x) as -1 (initially removed).
    map[y][x] = -1;

    // Check if any adjacent cell is already marked as -2 (checked out).
    // If so, this cell also becomes -2, and `checkout` propagation begins.
    if ( map[y - 1][x] == -2 || map[y + 1][x] == -2 || map[y][x - 1] == -2 || map[y][x + 1] == -2 ) {

      map[y][x] = -2; // Mark the current cell as checked out.

      // If North neighbor is valid and positive, set it to 0.
      if ( y >= 2 && map[y - 1][x] >= 0 ) {
        map[y - 1][x] = 0;
      }
      // If South neighbor is valid and positive, set it to 0.
      if ( y <= N - 1 && map[y + 1][x] >= 0 ) {
        map[y + 1][x] = 0;
      }
      // If West neighbor is valid and positive, set it to 0.
      if ( x >= 2 && map[y][x - 1] >= 0 ) {
        map[y][x - 1] = 0;
      }
      // If East neighbor is valid and positive, set it to 0.
      if ( x <= N - 1 && map[y][x + 1] >= 0 ) {
        map[y][x + 1] = 0;
      }

      // If North neighbor is -1 (removed), mark it -2 and propagate checkout.
      if ( y >= 2 && map[y - 1][x] == -1 ) {
        map[y - 1][x] = -2;
        checkout( y - 1 , x );
      }
      // If South neighbor is -1 (removed), mark it -2 and propagate checkout.
      if ( y <= N - 1 && map[y + 1][x] == -1 ) {
        map[y + 1][x] = -2;
        checkout( y + 1 , x );
      }
      // If West neighbor is -1 (removed), mark it -2 and propagate checkout.
      if ( x >= 2 && map[y][x - 1] == -1 ) {
        map[y][x - 1] = -2;
        checkout( y , x - 1 );
      }
      // If East neighbor is -1 (removed), mark it -2 and propagate checkout.
      if ( x <= N - 1 && map[y][x + 1] == -1 ) {
        map[y][x + 1] = -2;
        checkout( y , x + 1 );
      }

    } // End of conditional checkout propagation.

  } // End of main processing loop.

  // Output the final calculated answer to the console.
  console.log( '%s' , ans );

  // Return the answer.
  return ans;

} // End of Main function.


// This is a debug utility function, not part of the core algorithm.
// It simulates running the Main function with predefined input from HTML elements
// and displays the result (AC/WA) based on a comparison with an expected output.
function debug( n ) {
  // Get input from a text area.
  var input = document.getElementById( "input" + n ).value;
  // Run the main logic.
  var ans = Main( input );
  // Initialize result status.
  var result = "WA";
  // Compare calculated answer with expected output.
  if ( ans == document.getElementById( "output" + n ).value.split( "\n" )[0] ) {
    result = "AC"; // If they match, it's Accepted.
  }
  // Display the result in a designated HTML element.
  document.getElementById( "result" + n ).innerHTML = result;
}

// Entry point for competitive programming environments.
// Reads input synchronously from stdin and passes it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );