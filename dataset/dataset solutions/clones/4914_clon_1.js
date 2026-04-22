/*
 * This JavaScript file processes input data to calculate a final sum based on specific rules.
 * It simulates a growth process with two variables 'a' and 'b' that are updated iteratively.
 * The core logic involves comparing current 'a' and 'b' values with incoming 'ta' and 'tb'
 * and applying specific scaling rules to ensure 'a' and 'b' always grow or remain at least
 * as large as required by the incoming values, or are scaled up proportionally.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27 (Example Date)
 * Version: 1.0.0
 */

function main ( input ) {

  // The first line of input specifies the number of subsequent data entries.
  // We parse it as an integer, ensuring numeric conversion with '- 0'.
  var n = input [ 0 ] - 0 ;


  // Initialize the two primary variables 'a' and 'b' to their starting values.
  var a = 1 , b = 1 ;


  // Begin a loop to process each of the 'n' data entries.
  // The loop starts from index 1 as index 0 was used for 'n'.
  for ( var i = 1 ; i <= n ; i ++ ) {

    // For each line, split the string by space to get two numeric parts.
    // 'ta' is the first number, 'tb' is the second.
    var ta = input [ i ] . split ( " " ) [ 0 ] - 0 ;
    var tb = input [ i ] . split ( " " ) [ 1 ] - 0 ;


    // --- Decision Logic for Updating 'a' and 'b' ---

    // Case 1: If both new values 'ta' and 'tb' are greater than or equal to
    // the current 'a' and 'b' respectively.
    if ( ta >= a && tb >= b ) {
      // In this scenario, we simply adopt the new, larger values.
      a = ta ;
      b = tb ;
    }
    // Case 2: If both current 'a' and 'b' are already greater than or equal to
    // the new 'ta' and 'tb' respectively.
    else if ( a >= ta && b >= tb ) {
      // Calculate scaling factors needed to make 'a' and 'b' multiples of 'ta' and 'tb'.
      // Math.ceil ensures we round up, guaranteeing 'a' >= 'ta' and 'b' >= 'tb'.
      var xa = Math . ceil ( a / ta ) ;
      var xb = Math . ceil ( b / tb ) ;

      // Determine which scaling factor is larger, as we must satisfy both conditions.
      if ( xa > xb ) {
        // If 'xa' is larger, apply 'xa' to both 'ta' and 'tb' to update 'a' and 'b'.
        a = xa * ta ;
        b = xa * tb ;
      } else {
        // Otherwise, apply 'xb' to both 'ta' and 'tb'.
        a = xb * ta ;
        b = xb * tb ;
      }
    }
    // Case 3: If only current 'a' is greater than or equal to 'ta'.
    else if ( a >= ta ) {
      // Calculate the scaling factor 'xa' based on 'a' and 'ta'.
      var xa = Math . ceil ( a / ta ) ;
      // Apply this 'xa' to both 'ta' and 'tb' to update 'a' and 'b'.
      a = xa * ta ;
      b = xa * tb ;
    }
    // Case 4: The remaining scenario, implying only current 'b' is greater than or equal to 'tb'.
    else {
      // Calculate the scaling factor 'xb' based on 'b' and 'tb'.
      var xb = Math . ceil ( b / tb ) ;
      // Apply this 'xb' to both 'ta' and 'tb' to update 'a' and 'b'.
      a = xb * ta ;
      b = xb * tb ;
    }
  }

  // After processing all input lines, print the sum of the final 'a' and 'b' values.
  console . log ( a + b ) ;

} // End of the main function definition.


// --- Input Handling and Function Call ---

// Read the entire standard input as a UTF-8 string.
// Trim any leading/trailing whitespace.
// Split the string into an array of lines based on newline characters.
// Finally, call the 'main' function with this processed array.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;

// --- End of File ---