/*
 * This JavaScript file contains logic for simulating dice movements
 * and processing input to find a specific dice orientation.
 *
 * The 'move' function updates the dice's face configuration based on a direction.
 * The main part reads input, initializes the dice, and then iteratively
 * moves the dice until a target configuration is met, finally printing a specific face.
 */

// Define the 'move' function which updates the dice's orientation
function  move ( x , arr )
{
    // Extract current dice faces from the input array 'arr'
    var  d1  =  arr[0] ;  // Top face
    var  d2  =  arr[1] ;  // North face
    var  d3  =  arr[2] ;  // East face
    var  d4  =  arr[3] ;  // West face
    var  d5  =  arr[4] ;  // South face
    var  d6  =  arr[5] ;  // Bottom face

    // Initialize an empty array to store the new dice configuration
    var  after  =  [ ] ;


    // Determine the new arrangement based on the movement direction 'x'
    if ( x  ==  "N" )  {
        // Move North: Top becomes South, North becomes Bottom, etc.
        after  =  [d2, d6, d3, d4, d1, d5] ;
    }

    if ( x  ==  "S" )  {
        // Move South: Top becomes North, South becomes Bottom, etc.
        after  =  [d5, d1, d3, d4, d6, d2] ;
    }

    if ( x  ==  "E" )  {
        // Move East: Top becomes West, East becomes Bottom, etc.
        after  =  [d4, d2, d1, d6, d5, d3] ;
    }

    if ( x  ==  "W" )  {
        // Move West: Top becomes East, West becomes Bottom, etc.
        after  =  [d3, d2, d6, d1, d5, d4] ;
    }

    // Return the updated dice configuration
    return  after ;
}


// --- Main Program Execution ---


// Read the entire input from standard input as a string
var  input  =  require('fs').readFileSync('/dev/stdin',  'utf8') ;

// Trim whitespace and split the input into an array of lines
var  Arr  =  ( input . trim ( ) ) . split ( "\n" ) ;

// The first line of input represents the initial dice configuration
// Split by space and convert to numbers
var  dice  =  Arr[0] . split ( " " ) . map ( Number ) ;

// Remove the first two lines from the 'Arr' array; they are no longer needed
Arr . shift ( ) ;  // Remove initial dice setup line
Arr . shift ( ) ;  // Remove the line that's usually target coordinates or empty

// Define possible movement directions as an array of characters
var  NSEW  =  "NSEW" . split ( "" ) ;


// Iterate over the remaining lines in 'Arr', each representing a target state
Arr . forEach ( function ( v )  {
   // Parse the target top (a) and north (b) faces from the current line 'v'
   var  a  =  ( v . split ( " " ) ) [0]  -  0 ; // Convert string to number
   var  b  =  ( v . split ( " " ) ) [1]  -  0 ; // Convert string to number

   // Keep moving the dice randomly until its top (dice[0]) and north (dice[1])
   // faces match the target 'a' and 'b'.
   while ( ( dice[0]  ==  a  &&  dice[1]  ==  b )  ==  false )  {
      // Generate a random number (0-3) to pick a direction
      var  r  =  Math . floor ( Math . random ( )  *  4 )  ;

      // Apply the random move to the dice
      dice  =  move ( NSEW[r] ,  dice ) ;
   }

   // Once the target orientation is achieved, print the East face (dice[2])
   console . log ( dice[2] ) ;
} ) ;