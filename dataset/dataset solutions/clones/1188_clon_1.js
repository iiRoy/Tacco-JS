/* This file defines a Dice object and handles input/output for simulating dice rolls.
 * The Dice object represents a standard six-sided die with faces.
 */

// Define the Dice constructor function.
// It initializes the six faces of the die based on an input array.
function   Dice  (  num  )   {
    // Initialize the top face of the die.
    this.top    =   num[0]  ;
    // Initialize the front face.
    this.front  =   num[1]  ;
    // Initialize the right face.
    this.right  =   num[2]  ;
    // Initialize the left face.
    this.left   =   num[3]  ;
    // Initialize the back face.
    this.back   =   num[4]  ;
    // Initialize the bottom face.
    this.bottom =   num[5]  ;

    // Define the roll method for the Dice object.
    // This method simulates rolling the die in a specific direction.
    this.roll   =   function  (  direction  )   {
        var   tmp   ;   // Temporary variable to hold a face value during rotation.

        /*
         *   The switch statement handles different roll directions:
         *   'E': East (rotates along the horizontal axis)
         *   'N': North (rotates along the vertical axis, towards the back)
         *   'S': South (rotates along the vertical axis, towards the front)
         *   'W': West (rotates along the horizontal axis)
         */
        switch  (  direction  )   {

            case  'E'   :
                // Roll East: top -> left -> bottom -> right -> top
                tmp          =  this.top        ;
                this.top     =  this.left       ;
                this.left    =  this.bottom     ;
                this.bottom  =  this.right      ;
                this.right   =  tmp             ;
                break   ; // Exit the switch after handling 'E'.

            case  'N'   :
                // Roll North: top -> front -> bottom -> back -> top
                tmp          =  this.top        ;
                this.top     =  this.front      ;
                this.front   =  this.bottom     ;
                this.bottom  =  this.back       ;
                this.back    =  tmp             ;
                break   ; // Exit the switch after handling 'N'.

            case  'S'   :
                // Roll South: top -> back -> bottom -> front -> top
                tmp          =  this.top        ;
                this.top     =  this.back       ;
                this.back    =  this.bottom     ;
                this.bottom  =  this.front      ;
                this.front   =  tmp             ;
                break   ; // Exit the switch after handling 'S'.

            case  'W'   :
                // Roll West: top -> right -> bottom -> left -> top
                tmp          =  this.top        ;
                this.top     =  this.right      ;
                this.right   =  this.bottom     ;
                this.bottom  =  this.left       ;
                this.left    =  tmp             ;
                break   ; // Exit the switch after handling 'W'.
        }
    }
}


// Declare a variable to store incoming standard input.
var   input   =   ""  ;

// Resume standard input stream to listen for data.
process.stdin.resume  (  )  ;
// Set the encoding for the standard input stream.
process.stdin.setEncoding  (  'utf-8'  )  ;

// Register an event listener for 'data' events on stdin.
// This function appends each chunk of data to the 'input' variable.
process.stdin.on  (  'data'  ,   function  (  chunk  )   {
    input   +=   chunk  ;
}  )  ;

// Register an event listener for the 'end' event on stdin.
// This function processes the accumulated input once all data has been received.
process.stdin.on  (  'end'  ,   function  (  )   {
    // Split the input string by newline characters into an array of lines.
    input   =   input.split  (  "\n"  )  ;

    // Parse the first line of input to get the initial dice face values.
    // It splits the string by spaces and converts each part to a number.
    var   num       =   input[0].split  (  ' '  )  .map  (  Number  )  ;
    // Parse the second line of input to get the sequence of roll directions.
    // It splits the string into an array of individual characters (directions).
    var   direction =   input[1].split  (  ''  )  ;

    // Create a new Dice object with the initial face values.
    var   dice      =   new   Dice  (  num  )  ;

    // Loop through each direction in the 'direction' array.
    for   (  i   =   0  ;   i   <   direction.length  ;   i  ++  )   {
        // Roll the dice according to the current direction.
        dice.roll  (  direction[i]  )  ;
    }

    // After all rolls are performed, print the value of the top face of the dice.
    console.log  (  dice.top  )  ;
}  )  ;