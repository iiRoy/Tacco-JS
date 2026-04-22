function Main( input ) {
  // This function processes the input to calculate a specific answer.
  // The input string is expected to contain multiple lines of data.

  input = input.split( "\n" ); // Split the entire input string by newline characters.

  var line = input[ 0 ].split( " " ); // The first line contains initial parameters, split by space.

  var num = parseInt( line[ 0 ] ); // The total number of enemies (N).
  var hi = parseInt( line[ 1 ] );  // The higher damage value (H).
  var lo = parseInt( line[ 2 ] );  // The lower damage value (L).

  var maxHP = 0; // Stores the maximum HP among all enemies.
  var maxInd = 0; // Stores the index of the enemy with maximum HP.
  var enm = [ ]; // An array to store the HP of each enemy.

  var killcount = 0; // This variable seems unused in the final logic.
  var ans = 0;       // The final answer, representing the number of attacks.

  /*
   * Loop through the enemy data to populate the 'enm' array
   * and identify the enemy with the highest HP.
   */
  for ( var i = 0; i < num; i++ ) {
    enm[ i ] = parseInt( input[ i + 1 ] ); // Parse enemy HP from subsequent input lines.

    // Check if the current enemy's HP is greater than the previously recorded maxHP.
    if ( enm[ i ] > maxHP ) {
      maxHP = enm[ i ]; // Update maxHP.
      maxInd = i;       // Update the index of the maxHP enemy.
    }
  }


  // Initialize variables for the binary search-like approach.
  var max = Math.ceil( maxHP / ( lo ) ); // Upper bound for the number of attacks.
  var min = 0;                           // Lower bound for the number of attacks.
  var temp = 0;                          // Temporary variable for swapping during search.

  // Initial guess for the answer.
  ans = Math.ceil( maxHP / ( 2 * lo ) );

  var basedamage = ans * lo; // Damage dealt by 'ans' attacks with lower damage.
  var flag = 0;              // Counter for iterations (debugging/safety).
  var extra = 0;             // Represents extra attacks needed due to 'hi' damage.


  // The main loop performs a kind of binary search to find the optimal 'ans'.
  while ( 1 ) { /* Loop indefinitely until a break condition is met. */

    flag++; // Increment iteration counter.

    basedamage = ans * lo; // Recalculate base damage for the current 'ans'.

    extra = 0; // Reset extra attacks needed for this iteration.

    // Calculate how many extra 'hi' damage attacks would be required.
    for ( var i = 0; i < num; i++ ) {
      if ( enm[ i ] > basedamage ) {
        // If an enemy's HP is higher than base damage, calculate extra 'hi' attacks.
        extra += Math.ceil( ( enm[ i ] - basedamage ) / ( hi - lo ) );
      }
    }


    // Adjust 'ans' based on the comparison of 'extra' attacks required vs. current 'ans'.
    if ( extra > ans ) {
      /*
       * If more 'extra' attacks are needed than the current 'ans',
       * it means 'ans' is too low. Shift the lower bound up.
       */
      temp = ans;
      ans = Math.ceil( ( max + ans ) / 2 );
      min = temp;

    } else if ( extra < ans ) {
      /*
       * If fewer 'extra' attacks are needed than the current 'ans',
       * it means 'ans' is too high. Shift the upper bound down.
       */
      temp = ans;
      ans = Math.ceil( ( min + ans ) / 2 );
      max = temp;

    } else {
      // If extra == ans, we've found the optimal number of attacks.
      break; // Exit the while loop.
    }

  }

  // Output the final calculated answer.
  console.log( ans );
}

// Read input from stdin and pass it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );