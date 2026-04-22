/*
 * This file contains a JavaScript utility function and a main program.
 * The 'zeroPadding' method is added to String.prototype for convenience.
 * The 'Main' function solves a specific algorithmic problem.
 *
 * All original identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered to create a Type I clone.
 */


// --- String.prototype.zeroPadding Definition ---

String.prototype.zeroPadding = function ( num , zero ) {
  // Get the current string instance
  var str = this;

  // If 'zero' character is not provided, default to '0'
  if ( typeof zero == 'undefined' ) {
    zero = "0";
  }

  // Check if the string's length exceeds the intended padded length
  if ( str.length > zero.length * num ) {
    // If it does, throw an error indicating the overflow
    throw new Error ( "" + str + ".length = " + str.length + " > " + ( zero.length * num ) );
  }

  // Generate the padding and slice the combined string to the correct length
  return ( zero.repeat ( num ) + this ).slice ( -1 * zero.length * num );
};


// --- Main Function Definition ---

function Main ( input ) {
  // Split the input string by newlines into an array of strings
  input = input.split ( "\n" );

  // Parse the first line for D and G values
  // D: number of problem types, G: target score (divided by 100 later)
  var DG = input.shift ( ).split ( " " ).map ( a => ~~a );
  var D = DG[0];
  var G = DG[1] / 100; // Convert target score to hundreds

  // Initialize arrays to store problem points and bonus points
  var p = [ ]; // p[d] stores the number of problems for type d
  var c = [ ]; // c[d] stores the bonus points for completing all problems of type d

  var sum = 0; // This variable seems unused in the final logic, but must be kept.

  // Loop through D lines to populate p and c arrays
  for ( var i = 0 ; i < D ; i++ ) {
    // Parse each line for problem count and bonus, then store them
    var pc = input.shift ( ).split ( " " ).map ( a => ~~a );
    p.push ( pc[0] ); // Number of problems for this type
    c.push ( pc[1] / 100 ); // Bonus points for this type (converted to hundreds)
  }

  // Calculate the total number of combinations (2^D) for selecting problem types
  var a = Math.pow ( 2 , D );

  // Initialize an array to store the number of solved problems for valid combinations
  var min = [ ];

  // Iterate through all possible combinations of problem types
  for ( var i = 0 ; i < a ; i++ ) {
    // Convert the combination index to a binary string, padded to D bits
    var select = i.toString ( 2 ).zeroPadding ( D );
    var point = 0; // Current total score for this combination
    var solved = 0; // Current total number of problems solved for this combination

    // Calculate score and solved problems for the selected types
    for ( var d = 0 ; d < D ; d++ ) {
      if ( select[d] == "1" ) { // If problem type 'd' is selected
        solved += p[d]; // Add all problems of this type
        point += p[d] * ( d + 1 ) + c[d]; // Add score from problems and bonus
      }
    }

    // If the target score G is already met or exceeded
    if ( G <= point ) {
      min.push ( solved ); // This is a valid solution, record the number of solved problems
      continue; // Move to the next combination
    }

    // If G is not yet met, try to solve additional problems from unselected types
    // Iterate through problem types in reverse order (to prioritize higher-scoring problems)
    for ( var d = D - 1 ; d >= 0 ; d-- ) {
      // If this problem type 'd' was already selected, skip it
      if ( select[d] == "1" ) {
        continue;
      }

      // Calculate how many problems of type 'd' are needed to reach G
      var hoge = Math.floor ( ( G - point ) / ( d + 1 ) );

      // If 'hoge' is greater than the available problems of type 'd' minus one
      // (meaning we'd need to solve all of them and potentially more, but we can't solve all to get bonus)
      // Or if 'hoge' is negative (meaning point is already > G), which is handled by the G <= point check
      if ( hoge >= p[d] ) {
        continue; // Cannot solve enough without getting the bonus, or already solved enough
      }

      // If we can solve 'hoge' problems of type 'd' without completing the set
      // and potentially reach G
      if ( hoge > 0 ) {
        min.push ( solved + hoge ); // Record this as a possible solution
      }
    }
  }

  // Return the minimum number of problems solved among all valid combinations
  return Math.min ( ...min );
}


// --- Execution Block (for competitive programming platforms) ---

// This self-executing anonymous function handles input/output.
// It detects if running in a Node.js environment or a browser-like environment.
( ( b , c , d ) =>
  "undefined" != typeof require ? // Check if 'require' is defined (Node.js environment)
    console.log ( Main ( require ( "fs" ).readFileSync ( "/dev/stdin" , "utf8" ) ) ) : // Read from stdin, pass to Main, print result
    [ // Browser-like environment (for testing/debugging in a web page)
      b = b.split ( "\n" ).slice ( 1 , -1 ).join ( "\n" ) , // Process input string (remove first/last lines, join remaining)
      c = function ( ) { // Define a function to execute Main and catch errors
        try {
          return Main ( b );
        } catch ( f ) {
          return f.stack || f.message;
        }
      } ( ) , // Immediately invoke the function to get the result
      d = typeof c , // Get the type of the result
      "string" == d || ( c = JSON.stringify ( c ) ) , // If not string, stringify it
      $ ( "<form>" ).append ( // Create a form and append elements
        [ // Array of elements to append
          [ 10 , b ] , // Textarea for input (rows=10, text=b)
          0 , // Break line
          [ 1 , d ] , // Textarea for type (rows=1, text=d)
          0 , // Break line
          [ 10 , c ] // Textarea for output (rows=10, text=c)
        ].map ( f => $ ( f ? "<textarea>" : "<br>" , // Map to create textarea or br elements
          f && { rows : f[0] , cols : 40 , text : f[1] } // Textarea attributes if 'f' is truthy
        ) )
      ).appendTo ( "body" ) // Append the form to the body
    ]
) ( // Input string for the browser-like environment
  `
2 700
3 500
5 800
`
);

// The comment below is from the original source.
// If you are interested in the algorithms I used,
// there is no need to read down from this line.