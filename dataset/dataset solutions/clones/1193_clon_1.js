/*
 * This file defines the Dice object and its associated prototype methods.
 * It also includes an IIFE to process input and determine if two dice are equal.
 */

// Constructor for the Dice object.
// Initializes the six faces of the dice based on the provided labels array.
function Dice ( labels ) {

  // The top face of the die.
  this . top = labels[ 0 ] ;

  // The back face of the die.
  this . back = labels[ 1 ] ;

  // The right face of the die.
  this . right = labels[ 2 ] ;

  // The left face of the die.
  this . left = labels[ 3 ] ;

  // The front face of the die.
  this . front = labels[ 4 ] ;

  // The bottom face of the die.
  this . bottom = labels[ 5 ] ;

} ; // End of Dice constructor.


/**
 * Rolls the dice in a specified direction.
 *
 * @param {string} direction - The direction to roll ('W', 'N', 'E', 'S').
 */
Dice . prototype . roll = function ( direction ) {

  switch ( direction ) {

    case 'W' : // Roll West: left becomes top, top becomes right, right becomes bottom, bottom becomes old left.
      var tmp = this . left ;
      this . left = this . top ;
      this . top = this . right ;
      this . right = this . bottom ;
      this . bottom = tmp ;
      break ;

    case 'N' : // Roll North: front becomes top, top becomes back, back becomes bottom, bottom becomes old front.
      var tmp = this . front ;
      this . front = this . top ;
      this . top = this . back ;
      this . back = this . bottom ;
      this . bottom = tmp ;
      break ;

    case 'E' : // Roll East: right becomes top, top becomes left, left becomes bottom, bottom becomes old right.
      var tmp = this . right ;
      this . right = this . top ;
      this . top = this . left ;
      this . left = this . bottom ;
      this . bottom = tmp ;
      break ;

    case 'S' : // Roll South: back becomes top, top becomes front, front becomes bottom, bottom becomes old back.
      var tmp = this . back ;
      this . back = this . top ;
      this . top = this . front ;
      this . front = this . bottom ;
      this . bottom = tmp ;
      break ;

  } // End of switch statement.

} ; // End of Dice.prototype.roll method.


/*
 * Adjusts the dice orientation so that a specific label ends up on the top face.
 * This is achieved by rolling the dice appropriately.
 *
 * @param {any} top - The label that should be moved to the top face.
 */
Dice . prototype . rollToTop = function ( top ) {

  // If the desired top is currently on the right, roll West.
  if ( top === this . right ) {

    this . roll ( 'W' ) ;

  }
  // If the desired top is currently on the left, roll East.
  else if ( top === this . left ) {

    this . roll ( 'E' ) ;

  }
  // If the desired top is currently on the back, roll North.
  else if ( top === this . back ) {

    this . roll ( 'N' ) ;

  }
  // If the desired top is currently on the front, roll South.
  else if ( top === this . front ) {

    this . roll ( 'S' ) ;

  }

} ; // End of Dice.prototype.rollToTop method.


/**
 * Determines the label on the right face of the dice, given a desired top and back face.
 * This method effectively rotates the dice mentally to find the correct right face.
 *
 * @param {any} top - The label that is considered to be on the top face.
 * @param {any} back - The label that is considered to be on the back face.
 * @returns {any} The label that would be on the right face given the top and back.
 */
Dice . prototype . getRightWithTopAndBack = function ( top , back ) {

  // Scenario 1: The desired top face is currently on the physical top.
  if ( top === this . top ) {

    // If the back is also correctly positioned.
    if ( back === this . back ) { return this . right ; }
    // If back is left, right becomes back.
    if ( back === this . left ) { return this . back ; }
    // If back is front, right becomes left.
    if ( back === this . front ) { return this . left ; }
    // If back is right, right becomes front.
    if ( back === this . right ) { return this . front ; }

  }

  // Scenario 2: The desired top face is currently on the physical front.
  if ( top === this . front ) {

    // If back is top, right becomes right.
    if ( back === this . top ) { return this . right ; }
    // If back is left, right becomes top.
    if ( back === this . left ) { return this . top ; }
    // If back is bottom, right becomes left.
    if ( back === this . bottom ) { return this . left ; }
    // If back is right, right becomes bottom.
    if ( back === this . right ) { return this . bottom ; }

  }

  // Scenario 3: The desired top face is currently on the physical bottom.
  if ( top === this . bottom ) {

    // If back is front, right becomes right.
    if ( back === this . front ) { return this . right ; }
    // If back is left, right becomes front.
    if ( back === this . left ) { return this . front ; }
    // If back is back, right becomes left.
    if ( back === this . back ) { return this . left ; }
    // If back is right, right becomes back.
    if ( back === this . right ) { return this . back ; }

  }

  // Scenario 4: The desired top face is currently on the physical back.
  if ( top === this . back ) {

    // If back is bottom, right becomes right.
    if ( back === this . bottom ) { return this . right ; }
    // If back is left, right becomes bottom.
    if ( back === this . left ) { return this . bottom ; }
    // If back is top, right becomes left.
    if ( back === this . top ) { return this . left ; }
    // If back is right, right becomes top.
    if ( back === this . right ) { return this . top ; }

  }

  // Scenario 5: The desired top face is currently on the physical right.
  if ( top === this . right ) {

    // If back is bottom, right becomes front.
    if ( back === this . bottom ) { return this . front ; }
    // If back is back, right becomes bottom.
    if ( back === this . back ) { return this . bottom ; }
    // If back is top, right becomes back.
    if ( back === this . top ) { return this . back ; }
    // If back is front, right becomes top.
    if ( back === this . front ) { return this . top ; }

  }

  // Scenario 6: The desired top face is currently on the physical left.
  if ( top === this . left ) {

    // If back is top, right becomes front.
    if ( back === this . top ) { return this . front ; }
    // If back is front, right becomes bottom.
    if ( back === this . front ) { return this . bottom ; }
    // If back is bottom, right becomes back.
    if ( back === this . bottom ) { return this . back ; }
    // If back is back, right becomes top.
    if ( back === this . back ) { return this . top ; }

  }

} ; // End of Dice.prototype.getRightWithTopAndBack method.


/*
 * Compares this Dice instance with another Dice instance to check if they are "equal".
 * Equality is defined by comparing the right face after aligning the top and back faces.
 *
 * @param {Dice} other - The other Dice object to compare against.
 * @returns {boolean} True if the dice are considered equal, false otherwise.
 */
Dice . prototype . isEqual = function ( other ) {

  // The dice are equal if their right faces match when their top and back faces are aligned.
  return this . right === other . getRightWithTopAndBack ( this . top , this . back ) ;

} ; // End of Dice.prototype.isEqual method.


/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It reads input from stdin, processes it, creates two Dice objects,
 * and then prints 'Yes' or 'No' based on whether the dice are equal.
 */
( function ( input ) {

  // Split the input string into lines.
  var p = input . split ( '\n' ) ;

  // Get the labels for the first dice from the first line of input.
  // Split by space and convert to numbers.
  var labels1 = p . shift ( ) . split ( ' ' ) . map ( Number ) ;

  // Get the labels for the second dice from the second line of input.
  // Split by space and convert to numbers.
  var labels2 = p . shift ( ) . split ( ' ' ) . map ( Number ) ;

  // Create the first Dice object.
  var dice1 = new Dice ( labels1 ) ;

  // Create the second Dice object.
  var dice2 = new Dice ( labels2 ) ;

  // Compare the two dice and print the result.
  console . log ( dice1 . isEqual ( dice2 ) ? 'Yes' : 'No' ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // The IIFE is immediately invoked with file system input.