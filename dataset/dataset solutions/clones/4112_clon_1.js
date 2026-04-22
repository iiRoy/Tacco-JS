"use strict"; /* This directive enables strict mode for the entire script. */

/*
 * This JavaScript program processes input data to determine the minimum number of
 * attacks required to defeat an enemy with a certain health 'H'.
 * It employs a strategy of first using powerful "throw" attacks and then
 * resorting to "direct" attacks if the enemy still has health remaining.
 *
 * This is a Type I clone, meaning its functionality and structure are identical
 * to the original code. Only whitespace (indentation, spacing, blank lines)
 * and comments have been extensively altered to create visual distinction
 * without impacting its execution.
 */


// The primary function of the program, taking raw input as its argument.
const main = ( arg ) => {

  // Step 1: Pre-process the raw input string.
  // Remove any leading or trailing whitespace, then split the string
  // into an array of lines based on newline characters.
  arg = arg.trim().split( "\n" );


  // Step 2: Parse the initial game parameters from the first line of input.
  // The first element is 'N', representing the number of available attack types.
  const N = parseInt( arg[0].split( " " )[0] );
  // The second element is 'H', representing the enemy's starting health.
  let H = parseInt( arg[0].split( " " )[1] );


  // Step 3: Parse all attack details from the subsequent input lines.
  // The 'ab' array will store pairs of [attack_damage_A, throw_damage_B].
  let ab = arg.slice( 1, N + 1 ) // Extract lines containing attack data.
             .map( n => n.split( " " ) // Split each line by space to get individual numbers.
                          .map( l => parseInt( l ) ) ); // Convert string numbers to integers.


  // Step 4: Sort the 'ab' array based on the 'a' (direct attack damage) value.
  // This sorting is done in descending order to easily find the maximum 'aMax'.
  ab.sort( ( a, b ) => b[0] - a[0] );


  // Step 5: Determine the maximum possible 'a' (direct attack damage).
  // This is the 'a' value of the first element after sorting by 'a' descending.
  const aMax = ab[0][0];


  // Step 6: Filter and re-sort the 'ab' array for effective 'throw' attacks.
  // Only consider 'throw' attacks (b value) that deal more damage than the 'aMax'.
  // These are the most efficient 'throw' attacks to use initially.
  ab = ab.sort( ( a, b ) => b[1] - a[1] ) // Sort by 'b' value in descending order.
           .filter( n => n[1] > aMax );    // Filter out 'throw' attacks less than or equal to aMax.


  // Initialize variables to track the total damage dealt (not used in final logic)
  // and the count of 'throw' attacks performed.
  let damage = 0; // This variable is declared but not utilized in the original logic.
  let throwAttack = 0; // Counter for the number of throw attacks.


  // Step 7: Execute 'throw' attacks as long as the enemy's health is positive.
  // Iterate through the filtered and sorted 'ab' array (containing effective throw attacks).
  for ( let i in ab ) {

    H -= ab[i][1]; // Reduce enemy health by the 'b' value of the current throw attack.
    throwAttack++; // Increment the count of throw attacks.

    // Check if the enemy's health has dropped to zero or below.
    if ( H <= 0 ) {

      console.log( throwAttack ); // If so, output the total throw attacks.
      return; // And terminate the function, as the enemy is defeated.

    }

  } // End of throw attack loop.


  // Step 8: If the enemy's health is still positive after all effective throw attacks,
  // resort to 'direct' attacks using the 'aMax' damage.
  // Calculate the number of 'direct' attacks needed. Math.ceil is used to ensure
  // even partial health requires a full attack.
  const directAttack = Math.ceil( H / aMax );


  // Step 9: Output the final total number of attacks.
  // This is the sum of 'throw' attacks performed and 'direct' attacks calculated.
  console.log( throwAttack + directAttack );

}; // End of the main function definition.


// Execute the 'main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it as the 'arg' parameter to the 'main' function.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );