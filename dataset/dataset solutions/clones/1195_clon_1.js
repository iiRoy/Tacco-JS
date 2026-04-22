/*
 * This file is part of a JavaScript application designed to
 * process input related to dice configurations and determine
 * if two given dice are physically identical, allowing for
 * various rotations.
 *
 * It utilizes Node.js standard input/output streams.
 *
 * Developed by: CloneGenius
 * Version: 1.0.1
 * License: MIT (Hypothetical)
 */

let content = '' ; // This variable will accumulate all incoming data from stdin.

// Resume the standard input stream, ensuring it doesn't pause automatically.
 process
  . stdin
  . resume ( ) ;

// Set the encoding for the standard input stream to UTF-8.
 process
  . stdin
  . setEncoding ( 'utf8' ) ;


// Attach an event listener for 'data' events on stdin.
// Each time data is received, it's appended to the 'content' variable.
process . stdin . on ( 'data' , ( buf ) =>
{
  // Concatenate the buffer chunk to the existing content string.
  content += buf ;
} ) ;


// Attach an event listener for the 'end' event on stdin.
// This signifies that all input has been received.
process . stdin . on ( 'end' , ( ) =>
{
  // Destructure the processed input into two dice objects, diceA and diceB.
  const [ diceA , diceB ] = content

    . trim ( ) // First, remove any leading or trailing whitespace from the accumulated content.

    . split ( '\n' ) // Then, split the content string into an array of lines based on newline characters.

    . map ( ( line ) => // For each line...
      line
        . split ( ' ' ) // ...split the line into an array of strings, using space as a delimiter.
        . map ( ( n ) => parseInt ( n , 10 ) ) // ...and convert each string number to an integer (base 10).
    )

    . map ( ( nums ) => createDice ( nums ) ) ; // Finally, transform the array of numbers into a structured dice object.

  // Compare the two dice objects and print "Yes" if they are the same, "No" otherwise.
  console . log ( isSameDice ( diceA , diceB ) ? 'Yes' : 'No' ) ;
} ) ;


/**
 * Checks if two dice configurations are functionally identical, considering all possible rotations.
 * This is achieved by randomly rolling `diceA` for a short period and checking for a match.
 *
 * @param {object} diceA - The first dice object, which will be rotated.
 * @param {object} diceB - The second dice object, used as the target for comparison.
 * @returns {boolean} - Returns `true` if a match is found within the timeout, `false` otherwise.
 */
const isSameDice = ( diceA , diceB ) =>
{
  const timeout = Date . now ( ) + 400 ; // Set a timeout (400 milliseconds from now) to limit computation time.

  // Loop until the current time exceeds the defined timeout.
  while ( Date . now ( ) < timeout )
  {
    const dirs = [ 'N' , 'W' , 'S' , 'E' ] ; // Define the four possible rolling directions (North, West, South, East).
    const dir = dirs [ Math . floor ( Math . random ( ) * dirs . length ) ] ; // Randomly select one of the directions.

    diceA = roll ( diceA , dir ) ; // Apply the chosen random roll to `diceA`, updating its state.

    // Check if the 'right' faces and 'top' faces of both dice match completely.
    const isSame = diceA . right . every ( ( n , i ) => n === diceB . right [ i ] )
                 && diceA . top . every ( ( n , i ) => n === diceB . top [ i ] ) ;

    if ( isSame ) // If both top and right faces match after a roll...
    {
      return true ; // ...then the dice are considered the same.
    }
  }

  return false ; // If no match was found within the timeout period, they are not considered the same.
} ;


/**
 * This function appears to be a utility to orient a dice such that its top and front faces
 * match specified values. It performs random rolls until the desired orientation is achieved.
 * NOTE: This function is not called in the provided main execution flow.
 *
 * @param {object} dice - The dice object to be resolved.
 * @param {number[]} [top, front] - An array containing the target value for the top face and the front face.
 * @returns {object} - The dice object oriented to the specified top and front faces.
 */
const resolve = ( dice , [ top , front ] ) =>
{
  const dirs = [ 'N' , 'W' , 'S' , 'E' ] ; // Array of possible roll directions.

  // Continue rolling the dice until its top-front orientation matches the target.
  while ( dice . top [ 0 ] !== top || dice . top [ 3 ] !== front )
  {
    const dir = dirs [ Math . floor ( Math . random ( ) * dirs . length ) ] ; // Select a random roll direction.
    dice = roll ( dice , dir ) ; // Apply the roll.
  }

  return dice ; // Return the dice in its resolved orientation.
} ;


/*
 * createDice: A factory function to construct a dice object from an array of numbers.
 * The input `nums` array represents the initial numbering of the physical die's faces.
 * The `top` and `right` properties are arrays representing the values visible on
 * the top and right faces, respectively, in a specific order (e.g., clockwise from a certain point).
 */
const createDice = ( nums ) => ( {
  top : [ 1 , 5 , 6 , 2 ] . map ( ( n ) => nums [ n - 1 ] ) , // Defines the initial top face configuration based on input numbers.
  right : [ 1 , 3 , 6 , 4 ] . map ( ( n ) => nums [ n - 1 ] ) , // Defines the initial right face configuration.
} ) ;


/**
 * Simulates rolling a dice in a given direction.
 * It returns a NEW dice object with the updated 'top' and 'right' face configurations.
 * The original dice object remains unchanged (immutable operation).
 *
 * @param {object} dice - The current state of the dice (an object with 'top' and 'right' arrays).
 * @param {string} dir - The direction to roll the dice: 'N' (North), 'S' (South), 'E' (East), 'W' (West).
 * @returns {object} - A new dice object representing the state after the roll.
 */
const roll = ( dice , dir ) =>
{
  switch ( dir )
  {
    case 'W' : // Rolling the dice towards the West.
    {
      return Object . assign ( { } , dice , { // Create a new object by merging an empty object, the old dice, and new properties.
        top : [ dice . right [ 1 ] , dice . top [ 1 ] , dice . right [ 3 ] , dice . top [ 3 ] ] , // Update top faces based on right faces.
        right : dice . right . slice ( 1 ) . concat ( [ dice . right [ 0 ] ] ) , // Rotate right faces.
      } ) ;
    }
    case 'E' : // Rolling the dice towards the East.
    {
      return Object . assign ( { } , dice , {
        top : [
          dice . right [ dice . right . length - 1 ] , // The last element of the right array moves to the top's first position.
          dice . top [ 1 ] ,
          dice . right [ 1 ] ,
          dice . top [ 3 ] ,
        ] ,
        right : [ dice . right [ 3 ] ] . concat ( dice . right . slice ( 0 , -1 ) ) , // Rotate right faces (last element becomes first).
      } ) ;
    }
    case 'S' : // Rolling the dice towards the South.
    {
      return Object . assign ( { } , dice , {
        top : dice . top . slice ( 1 ) . concat ( [ dice . top [ 0 ] ] ) , // Rotate top faces (first element moves to end).
        right : [ dice . top [ 1 ] , dice . right [ 1 ] , dice . top [ 3 ] , dice . right [ 3 ] ] , // Update right faces based on top faces.
      } ) ;
    }
    case 'N' : // Rolling the dice towards the North.
    {
      return Object . assign ( { } , dice , {
        top : [ dice . top [ 3 ] ] . concat ( dice . top . slice ( 0 , -1 ) ) , // Rotate top faces (last element moves to start).
        right : [ dice . top [ 3 ] , dice . right [ 1 ] , dice . top [ 1 ] , dice . right [ 3 ] ] , // Update right faces based on top faces.
      } ) ;
    }
  }
} ;