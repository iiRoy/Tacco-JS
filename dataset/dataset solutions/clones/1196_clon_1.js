/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   remain completely unchanged.
 * - The only permitted changes are variations in whitespace and comments.
 *
 * This file demonstrates extensive modifications to whitespace and comments
 * to achieve a visually distinct, yet logically and structurally identical clone.
 */

"use strict" ; /* Enable strict mode for the entire script. */


// The main function processes input lines.
main (
  require ( "fs" ) // Access the file system module.
    . readFileSync ( // Read the file synchronously.
      "/dev/stdin" , // Path to standard input.
      "utf8"       // Specify UTF-8 encoding.
    ) . replace ( // Remove trailing newline characters.
      /\r?\n$/ ,
      ""
    ) . split ( // Split the input into an array of lines.
      /\r?\n/
    )
) ;


function main (
  lines // Input array of strings, each representing a line.
) {


  // Constructor function for a Dice object.
  function Dice (
    labels // An array of 6 labels for the dice faces.
  ) {
    // Assign labels to the corresponding faces.
    this . t = labels [ 0 ] ; // Top face
    this . s = labels [ 1 ] ; // South face
    this . e = labels [ 2 ] ; // East face
    this . w = labels [ 3 ] ; // West face
    this . n = labels [ 4 ] ; // North face
    this . b = labels [ 5 ] ; // Bottom face
  }


  // Add a method to the Dice prototype for rolling the dice.
  Dice . prototype . roll = function (
    dir // Direction to roll: "N", "S", "W", "E".
  ) {
    var temp ; // Temporary variable to hold a face value during rotation.

    // Handle rolling North.
    if ( dir == "N" ) {
      temp = this . t ; // Store current top.
      this . t = this . s ; // New top is old south.
      this . s = this . b ; // New south is old bottom.
      this . b = this . n ; // New bottom is old north.
      this . n = temp ; // New north is old top.
    }
    // Handle rolling South.
    else if ( dir == "S" ) {
      temp = this . t ; // Store current top.
      this . t = this . n ; // New top is old north.
      this . n = this . b ; // New north is old bottom.
      this . b = this . s ; // New bottom is old south.
      this . s = temp ; // New south is old top.
    }
    // Handle rolling West.
    else if ( dir == "W" ) {
      temp = this . t ; // Store current top.
      this . t = this . e ; // New top is old east.
      this . e = this . b ; // New east is old bottom.
      this . b = this . w ; // New bottom is old west.
      this . w = temp ; // New west is old top.
    }
    // Handle rolling East.
    else if ( dir == "E" ) {
      temp = this . t ; // Store current top.
      this . t = this . w ; // New top is old west.
      this . w = this . b ; // New west is old bottom.
      this . b = this . e ; // New bottom is old east.
      this . e = temp ; // New east is old top.
    }
  } ; // End of roll method.


  // Add a method to the Dice prototype to check if two dice are "same".
  // Two dice are considered "same" if one can be rotated to match the other.
  Dice . prototype . isSame = function (
    other // Another Dice object to compare against.
  ) {
    // Create copies to avoid modifying the original dice objects.
    var dice1 = new Dice ( [ this . t , this . s , this . e , this . w , this . n , this . b ] ) ;
    var dice2 = new Dice ( [ other . t , other . s , other . e , other . w , other . n , other . b ] ) ;

    // Sequence of rolls to bring dice2 into all possible orientations
    // relative to dice1's top face.
    // This sequence covers rotations around the Z-axis (E,W) and X-axis (N,S).
    var dirs = "EEEENEEEENEEEENEEENEEEENNEEEE" ;

    // Iterate through all possible orientations.
    for ( var c of dirs ) {
      // Check if all faces match in the current orientation.
      if (
        dice1 . t == dice2 . t &&
        dice1 . s == dice2 . s &&
        dice1 . e == dice2 . e &&
        dice1 . w == dice2 . w &&
        dice1 . n == dice2 . n &&
        dice1 . b == dice2 . b
      ) {
        return true ; // Found a matching orientation.
      }
      dice2 . roll ( c ) ; // Roll dice2 to the next orientation.
    }
    return false ; // No matching orientation found after checking all possibilities.
  } ; // End of isSame method.


  // Parse the first line for the labels of the first dice.
  var dice1 = new Dice ( lines [ 0 ] . split ( " " ) ) ;
  // Parse the second line for the labels of the second dice.
  var dice2 = new Dice ( lines [ 1 ] . split ( " " ) ) ;

  // Output "Yes" if the dice are the same, otherwise "No".
  console . log ( dice1 . isSame ( dice2 ) ? "Yes" : "No" ) ;

} // End of main function.