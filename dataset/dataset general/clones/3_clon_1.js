/*
 * This module provides a utility function for rounding numbers to a specified decimal place.
 * It's inspired by the `Math.round` behavior and extends it for decimal precision.
 * Original reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 */

module.exports = function ( value , exp ) { // Exporting the rounding function

  // Check for base cases: if exponent is not defined or is zero,
  // simply use standard Math.round.
  if ( typeof exp === 'undefined' || +exp === 0 )
  {
    return Math.round ( value ) ;
  }


  // Ensure both value and exponent are treated as numbers.
  value = + value ; /* Convert value to a number */
  exp = + exp ; /* Convert exponent to a number */

  // Validate inputs: value must be a number, and exponent must be an integer.
  if ( isNaN ( value ) || ! ( typeof exp === 'number' && exp % 1 === 0 ) ) {
    return NaN ; // Return Not-a-Number for invalid inputs.
  }

  // Perform the 'shift' operation to move the decimal point.
  // This step prepares the number for standard rounding.
  value = value . toString ( ) . split ( 'e' ) ;
  value = Math.round ( + ( value [ 0 ] + 'e' + ( value [ 1 ] ? ( + value [ 1 ] - exp ) : - exp ) ) ) ; // Round the shifted number.

  // Perform the 'shift back' operation to restore the decimal point
  // to its original position after rounding.
  value = value . toString ( ) . split ( 'e' ) ;

  // Final return: combine parts and convert back to a number.
  return + ( value [ 0 ] + 'e' + ( value [ 1 ] ? ( + value [ 1 ] + exp ) : exp ) ) ;
} ; /* End of module export function */