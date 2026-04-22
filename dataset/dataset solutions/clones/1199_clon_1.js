/*
 * This file contains JavaScript code for manipulating dice states.
 * It defines functions to move and roll a virtual die, and then
 * processes a series of dice configurations based on input.
 * The primary goal is to determine if any resulting die state
 * has been encountered before, indicating a "No" result.
 */

// Function to simulate moving the dice in a cardinal direction.
// x: The direction of movement ("N", "S", "E", "W").
// arr: An array representing the current state of the dice faces.
//      [d1, d2, d3, d4, d5, d6] where d1 is top, d6 is bottom.
function move ( x , arr ) {
    // Extract individual face values for clarity.
    var d1 = arr [ 0 ] ; // Top face
    var d2 = arr [ 1 ] ; // North face
    var d3 = arr [ 2 ] ; // East face
    var d4 = arr [ 3 ] ; // West face
    var d5 = arr [ 4 ] ; // South face
    var d6 = arr [ 5 ] ; // Bottom face

    var after = [ ] ; // Array to store the new state after movement.

    // Apply the transformation based on the direction.
    if ( x === "N" ) {
        // Moving North: Top becomes South, North becomes Bottom, etc.
        after = [ d2 , d6 , d3 , d4 , d1 , d5 ] ;
    }

    if ( x === "S" ) {
        // Moving South: Top becomes North, South becomes Bottom, etc.
        after = [ d5 , d1 , d3 , d4 , d6 , d2 ] ;
    }

    if ( x === "E" ) {
        // Moving East: Top becomes West, East becomes Bottom, etc.
        after = [ d4 , d2 , d1 , d6 , d5 , d3 ] ;
    }

    if ( x === "W" ) {
        // Moving West: Top becomes East, West becomes Bottom, etc.
        after = [ d3 , d2 , d6 , d1 , d5 , d4 ] ;
    }

    return after ; // Return the new dice state.
}


// Function to simulate rolling the dice (rotating along its vertical axis).
// arr: An array representing the current state of the dice faces.
//      [d1, d2, d3, d4, d5, d6]
function roll ( arr ) {
    // Extract individual face values.
    var d1 = arr [ 0 ] ; // Top face (stays)
    var d2 = arr [ 1 ] ; // North face
    var d3 = arr [ 2 ] ; // East face
    var d4 = arr [ 3 ] ; // West face
    var d5 = arr [ 4 ] ; // South face
    var d6 = arr [ 5 ] ; // Bottom face (stays)

    var after = [ ] ; // Array to store the new state after rolling.

    // Rolling transforms faces: North -> East -> South -> West -> North.
    after = [ d1 , d3 , d5 , d2 , d4 , d6 ] ;

    return after ; // Return the new dice state.
}


// Function to generate and check all four possible roll orientations for a given dice state.
// arr: An array representing a dice state.
function rolls ( arr ) {
    var obj = { } ; // Local object to store unique rolled states for the current dice.

    // Perform 4 rolls to get all unique orientations around the vertical axis.
    for ( var i = 0 ; i < 4 ; i ++ ) {
        var str = arr . join ( "," ) ; // Convert the array to a comma-separated string for keying.

        // If this specific orientation string is not yet in the local object, add it.
        if ( ! obj . hasOwnProperty ( str ) ) {
            obj [ str ] = true ;
        }

        arr = roll ( arr ) ; // Roll the dice to the next orientation.
    }

    // After generating all orientations for the current dice state,
    // check them against the global OBJ to see if any have been seen before.
    for ( var k in obj ) {
        // If the global OBJ already contains this rolled state, it's a "No" situation.
        if ( OBJ . hasOwnProperty ( k ) ) {
            result = "No" ;
        } else {
            // Otherwise, add this new unique state to the global OBJ.
            OBJ [ k ] = true ;
        }
    }
}


// Main program execution starts here.
// Read input from stdin.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim whitespace and split into lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// The first line of input is the number of dice configurations to process.
var n = Arr . shift ( ) - 0 ; // Convert to number.

var OBJ = { } ; // Global object to store all unique dice states encountered so far (as string keys).
var result = "YES" ; // Initialize the overall result to "YES".

// Iterate through each dice configuration provided in the input.
for ( var i = 0 ; i < n ; i ++ ) {
    // Parse the current dice configuration line: split by space and convert to numbers.
    var dice = Arr [ i ] . split ( " " ) . map ( Number ) ;

    // Perform a series of moves and rolls for each dice configuration.

    // 1. Initial 4 rolls while moving North.
    for ( var j = 0 ; j < 4 ; j ++ ) {
        rolls ( dice ) ; // Check all roll orientations of the current dice state.
        dice = move ( "N" , dice ) ; // Move the dice North.
    }

    // 2. Move East once.
    dice = move ( "E" , dice ) ;
    rolls ( dice ) ; // Check rolls after East move.

    // 3. Move South twice.
    dice = move ( "S" , dice ) ;
    dice = move ( "S" , dice ) ;
    rolls ( dice ) ; // Check rolls after two South moves.

    // If at any point 'result' becomes "No", we can stop processing.
    if ( result === "No" ) {
        break ;
    }
}

// Output the final result.
console . log ( result ) ;