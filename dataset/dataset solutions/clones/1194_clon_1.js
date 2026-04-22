/*
 * This JavaScript code defines a Dice object that simulates a six-sided die.
 * It also includes logic to compare two dice configurations based on user input.
 *
 * Author: Code Clone Generator
 * Version: 1.0
 * Date: 2023-10-27
 */

function Dice( num )
{
    // Initialize the dice faces based on the input array.
    // Index 0: Top face
    this.top    = num[0] ;
    // Index 1: Front face
    this.front  = num[1] ;
    // Index 2: Right face
    this.right  = num[2] ;
    // Index 3: Left face
    this.left   = num[3] ;
    // Index 4: Back face
    this.back   = num[4] ;
    // Index 5: Bottom face
    this.bottom = num[5] ;


    /**
     * Simulates rolling the dice in a specific direction (N, S, E, W).
     * @param {string} direction - The direction to roll ('N', 'S', 'E', 'W').
     */
    this.roll = function(  direction  ) {
        var    tmp   ; // Temporary variable to hold a face value during rotation.

        switch (  direction  ) {
            case 'E': // Roll East: Top -> Left -> Bottom -> Right -> Top
                tmp         = this.top    ;
                this.top    = this.left   ;
                this.left   = this.bottom ;
                this.bottom = this.right  ;
                this.right  = tmp         ;
                break;

            case 'N': // Roll North: Top -> Front -> Bottom -> Back -> Top
                tmp         = this.top    ;
                this.top    = this.front  ;
                this.front  = this.bottom ;
                this.bottom = this.back   ;
                this.back   = tmp         ;
                break;

            case 'S': // Roll South: Top -> Back -> Bottom -> Front -> Top
                tmp         = this.top    ;
                this.top    = this.back   ;
                this.back   = this.bottom ;
                this.bottom = this.front  ;
                this.front  = tmp         ;
                break;

            case 'W': // Roll West: Top -> Right -> Bottom -> Left -> Top
                tmp         = this.top    ;
                this.top    = this.right  ;
                this.right  = this.bottom ;
                this.bottom = this.left   ;
                this.left   = tmp         ;
                break;
        }
    }; // End of roll method


    /**
     * Simulates turning the dice on its top face (R, L).
     * This changes the front, right, back, and left faces, but not top/bottom.
     * @param {string} direction - The direction to turn ('R', 'L').
     */
    this.turn = function(  direction  ) {
        switch (  direction  ) {
            case 'R': // Turn Right: Front -> Right -> Back -> Left -> Front
                tmp        = this.front ;
                this.front = this.right ;
                this.right = this.back  ;
                this.back  = this.left  ;
                this.left  = tmp        ;
                break;

            case 'L': // Turn Left: Front -> Left -> Back -> Right -> Front
                tmp        = this.front ;
                this.front = this.left  ;
                this.left  = this.back  ;
                this.back  = this.right ;
                this.right = tmp        ;
                break;
        }
    }; // End of turn method


    /**
     * Orients the dice so a specific number is on the top face.
     * It achieves this by performing a series of rolls.
     * @param {number} topNum - The number that should be on the top face.
     */
    this.setTop = function( topNum ) {
        switch ( topNum ) {
            case this.top:
                // Already on top, no action needed.
                break;
            case this.front:
                this.roll('N'); // Roll North once.
                break;
            case this.right:
                this.roll('W'); // Roll West once.
                break;
            case this.left:
                this.roll('E'); // Roll East once.
                break;
            case this.back:
                this.roll('S'); // Roll South once.
                break;
            case this.bottom:
                // To bring bottom to top, roll North twice.
                this.roll('N');
                this.roll('N');
                break;
        }
    }; // End of setTop method


    /**
     * Orients the dice so a specific number is on the front face,
     * assuming the top face is already correctly oriented.
     * @param {number} frontNum - The number that should be on the front face.
     */
    this.setFront = function( frontNum ) {
        switch ( frontNum ) {
            case this.top:
                // This case should ideally not be reachable if setTop was called first,
                // as setFront assumes top is fixed.
                break;
            case this.front:
                // Already on front, no action needed.
                break;
            case this.right:
                this.turn('R'); // Turn Right once.
                break;
            case this.left:
                this.turn('L'); // Turn Left once.
                break;
            case this.back:
                // To bring back to front, turn Right twice.
                this.turn('R');
                this.turn('R');
                break;
            case this.bottom:
                // This case should not be reachable if setTop was called first.
                break;
        }
    }; // End of setFront method
} // End of Dice constructor


// Global variable to accumulate input from stdin.
var    input    = "" ;

// Resume stdin to start reading data.
process.stdin.resume();

// Set encoding for the input stream.
process.stdin.setEncoding('utf-8');

// Event listener for incoming data chunks.
process.stdin.on(  'data',  function(  chunk  ) {
  input += chunk ;
});

// Event listener for the end of input stream.
process.stdin.on(  'end',  function() {
  /*
   * Main processing logic after all input has been received.
   * It compares two dice configurations by trying all possible orientations
   * of the target dice against the origin dice.
   */
  input = input.split( "\n" ) ; // Split input into lines.

  // Create the first dice object from the first line of input.
  var origin_dice = new Dice(  input[0].split(' ').map(Number)  ) ;
  // Create the second dice object from the second line of input.
  var target_dice = new Dice(  input[1].split(' ').map(Number)  ) ;
  var result      = 'No' ; // Initialize result to 'No'.

  // Iterate through 8 possible orientations for the top face of the target dice.
  // 4 rotations around the N-S axis, then roll W and 4 rotations, etc.
  for (  var i = 0 ;  i < 8 ;  i++  ) {
    // For each top face orientation, iterate through 4 possible front face orientations.
    for (  var j = 0 ;  j < 4 ;  j++  ) {
      target_dice.turn('R'); // Rotate the target dice right.

      // Check if all faces of the origin dice match the target dice.
      if (
            origin_dice.top    == target_dice.top    &&
            origin_dice.front  == target_dice.front  &&
            origin_dice.right  == target_dice.right  &&
            origin_dice.left   == target_dice.left   &&
            origin_dice.back   == target_dice.back   &&
            origin_dice.bottom == target_dice.bottom
         )
      {
        result = 'Yes' ; // If all faces match, set result to 'Yes'.
      }
    } // End of inner loop (front face rotations)

    // After checking all 4 front orientations, change the top face orientation.
    if (  i < 4  ) {
      target_dice.roll('N'); // Roll North to change top face.
    } else {
      target_dice.roll('W'); // After 4 N rolls, roll W then continue N rolls (effectively).
    }
  } // End of outer loop (top face rotations)

  // Output the final result.
  console.log( result ) ;
}); // End of stdin 'end' event listener