/*
 * This JavaScript module is designed to simulate the manipulation of a six-sided die.
 * It includes functions for changing the die's orientation (moving it along cardinal directions)
 * and rotating it on its current face. The primary goal is to determine if a given set of
 * initial dice configurations can lead to a duplicate state when subjected to a specific
 * sequence of movements and rotations.
 */

// Function to alter the die's orientation based on a specified cardinal direction.
// It takes the current arrangement of faces and returns a new arrangement.
function shiftOrientation( directionIndicator , currentFaces )
{
  // Extract individual face values from the current array for clarity.
  const topFace    = currentFaces[0] ; // The face currently at the top.
  const northFace  = currentFaces[1] ; // The face currently facing the North direction.
  const eastFace   = currentFaces[2] ; // The face currently facing the East direction.
  const westFace   = currentFaces[3] ; // The face currently facing the West direction.
  const southFace  = currentFaces[4] ; // The face currently facing the South direction.
  const bottomFace = currentFaces[5] ; // The face currently at the bottom.

  // Initialize an array to hold the new sequence of faces after the shift.
  let newFaceOrder = [ ] ;

  // Apply the transformation rules based on the movement direction.
  if ( directionIndicator === "N" )
  {
    // Moving North: Top becomes North, North becomes Bottom, Bottom becomes South, South becomes Top.
    // East and West faces remain in their relative positions.
    newFaceOrder = [ northFace , bottomFace , eastFace , westFace , topFace , southFace ] ;
  }
  if ( directionIndicator === "S" )
  {
    // Moving South: Top becomes South, South becomes Bottom, Bottom becomes North, North becomes Top.
    // East and West faces remain in their relative positions.
    newFaceOrder = [ southFace , topFace , eastFace , westFace , bottomFace , northFace ] ;
  }
  if ( directionIndicator === "E" )
  {
    // Moving East: Top becomes West, West becomes Bottom, Bottom becomes East, East becomes Top.
    // North and South faces remain in their relative positions.
    newFaceOrder = [ westFace , northFace , topFace , bottomFace , southFace , eastFace ] ;
  }
  if ( directionIndicator === "W" )
  {
    // Moving West: Top becomes East, East becomes Bottom, Bottom becomes West, West becomes Top.
    // North and South faces remain in their relative positions.
    newFaceOrder = [ eastFace , northFace , bottomFace , topFace , southFace , westFace ] ;
  }

  // Return the array representing the die's new state.
  return newFaceOrder ;
}


// Function to simulate a clockwise rotation of the die while keeping its top face unchanged.
// This rotates the four side faces around the vertical axis.
function rotateClockwise( initialPositions )
{
  // Deconstruct the input array into individual face identifiers.
  const faceOne   = initialPositions[0] ; // The top face.
  const faceTwo   = initialPositions[1] ; // The face currently at the 'front' (North).
  const faceThree = initialPositions[2] ; // The face currently at the 'right' (East).
  const faceFour  = initialPositions[3] ; // The face currently at the 'left' (West).
  const faceFive  = initialPositions[4] ; // The face currently at the 'back' (South).
  const faceSix   = initialPositions[5] ; // The bottom face.

  // The new arrangement after a clockwise turn:
  // Top and Bottom faces stay the same.
  // Front (Two) moves to Left (Four's old position).
  // Right (Three) moves to Front (Two's old position).
  // Back (Five) moves to Right (Three's old position).
  // Left (Four) moves to Back (Five's old position).
  const rotatedState = [ faceOne , faceThree , faceFive , faceTwo , faceFour , faceSix ] ;

  // Provide the new configuration.
  return rotatedState ;
}


// A global object used to maintain a record of all unique dice configurations
// encountered across all test scenarios. Keys are string representations of dice states,
// and values are boolean `true` indicating presence.
let GLOBAL_TRACKER = {} ;

// A global string variable that stores the final determination of whether
// any duplicate dice states were found. Initialized to "YES" (no duplicates yet).
let FINAL_OUTCOME = "YES" ;


// This function systematically processes all four possible 90-degree clockwise rotations
// for a given dice configuration. It checks these rotated states against the global tracker
// for duplicates and adds new unique states.
function processAllRotations( diceState )
{
  // A temporary local object to store configurations seen during the current set of rotations.
  const seenConfigurations = {} ;

  // Loop four times to generate all four rotational states (0, 90, 180, 270 degrees).
  for ( let rotationIndex = 0 ; rotationIndex < 4 ; rotationIndex++ )
  {
    // Convert the current dice state array into a unique comma-separated string identifier.
    let stateKey = diceState . join ( "," ) ;

    // If this specific rotational state has not been recorded in the current local set,
    // add it to prevent redundant checks within this rotation cycle.
    if ( ! seenConfigurations . hasOwnProperty ( stateKey ) )
    {
      seenConfigurations[stateKey] = true ;
    }

    // Perform a clockwise rotation to get the next state for the loop.
    diceState = rotateClockwise ( diceState ) ;
  }

  // After generating all four rotational variations, iterate through them.
  for ( const keyString in seenConfigurations )
  {
    // Check if any of these rotated configurations already exist in the global tracker.
    if ( GLOBAL_TRACKER . hasOwnProperty ( keyString ) )
    {
      // If a duplicate is found, set the global outcome to "No" and no further checks are needed.
      FINAL_OUTCOME = "No" ;
    }
    else
    {
      // If the configuration is unique, add it to the global tracker.
      GLOBAL_TRACKER[keyString] = true ;
    }
  }
}


// --- Main Program Execution Flow ---

// Utilize Node.js's 'fs' module to read all input data from standard input.
const rawData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input: trim whitespace, then split into an array of lines.
let inputLines = ( rawData . trim ( ) ) . split ( "\n" ) ;

// The very first line of input specifies the total number of test cases.
// Convert this string to a numerical value. The `- 0` is a concise way to do this.
const numCases = inputLines . shift ( ) - 0 ;


// Begin processing each individual test case provided in the input.
for ( let caseIterator = 0 ; caseIterator < numCases ; caseIterator++ )
{
  // For the current test case, parse the line of space-separated numbers
  // representing the initial face values of the die.
  let currentDice = inputLines[caseIterator] . split ( " " ) . map ( Number ) ;

  // Sequence of operations for the first set of movements:
  // Perform 4 cycles of processing rotations and then moving North.
  for ( let movementCounter = 0 ; movementCounter < 4 ; movementCounter++ )
  {
    processAllRotations ( currentDice ) ; // Check all rotations of the current state for duplicates.
    currentDice = shiftOrientation ( "N" , currentDice ) ; // Move the die one step North.
  }

  // After the North movements, perform one East movement.
  currentDice = shiftOrientation ( "E" , currentDice ) ;
  processAllRotations ( currentDice ) ; // Check rotations after the East move.

  // Then, perform two consecutive South movements.
  currentDice = shiftOrientation ( "S" , currentDice ) ;
  currentDice = shiftOrientation ( "S" , currentDice ) ;
  processAllRotations ( currentDice ) ; // Check rotations after the two South moves.

  // If at any point during the processing of a test case, a duplicate configuration
  // is detected (i.e., FINAL_OUTCOME becomes "No"), there's no need to continue.
  if ( FINAL_OUTCOME === "No" )
  {
    break ; // Exit the main loop immediately.
  }
}

// Output the final verdict to the console.
// This will be "YES" if all configurations encountered were unique, or "No" otherwise.
console . log ( FINAL_OUTCOME ) ;