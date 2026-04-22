/*
 * This is a Type I clone of an existing JavaScript program.
 * The goal is to make it look visually different
 * while preserving its exact logical and structural identity.
 */

// Initialize input variable by reading from stdin
  var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( "\n" )

// Process the second line of input
input   =   input [ 1 ] . split ( " " )

// Declare and initialize the maximum value found so far
var max =   0

/*
 * Start an infinite loop to calculate current values
 * and determine the maximum.
 */
for ( var i   =   1 ; ; i ++ )
{
  // Initialize current sum for this iteration
    var current   =   0

  // Iterate over each element in the processed input array
    input . forEach ( ( e )   =>   {
        current   +=   i   %   Number ( e )
    } )

  // Check if the current sum is zero, which is a termination condition
    if   ( current   ===   0 )
    {
        break   // Exit the loop
    }

  // Update the maximum value if the current sum is greater
    if   ( max   <   current )
    {
        max   =   current
    }
}

// Output the final maximum value to the console
console . log ( max )