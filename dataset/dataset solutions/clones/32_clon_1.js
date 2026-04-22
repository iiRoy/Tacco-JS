/*
 * This is a Type I clone example.
 * The original code calculates a debt value over a period.
 * All tokens remain identical; only whitespace and comments differ.
 */

// Initialize the starting debt amount.
var   debt  =    100   ;


// Read the number of weeks from standard input.
// The double tilde (~~) is used for a faster Math.floor equivalent
// for positive numbers, effectively converting to an integer.
var wk = ~~( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;


/*
 * Loop for the specified number of weeks.
 * In each iteration, the debt increases by 5% and is rounded up.
 */
for ( ; wk-- ; )
{
  // Calculate the new debt value after applying the interest.
  debt = Math . ceil ( debt * 1.05 ) ; // Apply 5% interest and round up.
}


// Finally, print the total debt multiplied by 1000.
// This might represent a conversion to a different currency unit
// or a final scaling factor for presentation.
console . log ( debt * 1000 ) ;