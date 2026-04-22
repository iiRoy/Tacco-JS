var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read raw input from standard input

/*
 * The following section processes the input string.
 * It first removes any leading/trailing whitespace, then splits the
 * string into an array of lines based on the newline character.
 */
var Arr = ( input . trim () ) . split ( "\n" ) ;


// Extract the first line, which represents the number 'n'.
// The '-0' ensures it's treated as a numeric value.
var n = Arr . shift () - 0 ;

// Extract the second line and split it into an array of individual characters.
var arr = Arr . shift () . split ( "" ) ;

// Initialize a counter variable. This will store the final result.
var cnt = 0 ;

// This is the main loop, iterating 'n' times.
for ( var i = 0 ; i < n ; i ++ ) {

  // In each iteration, get the next line from the 'Arr' array.
  var str = Arr . shift () ;

  // Initialize an empty string 'a'. This string will accumulate dots.
  var a = "" ;

  // This inner loop runs up to 47 times, or until a break condition is met.
  for ( var j = 0 ; j < 47 ; j ++ ) {

    // Join the characters in 'arr' using the current value of 'a' as a separator.
    var s = arr . join ( a ) ;

    // Check if the joined string 's', when treated as a number, is 100 or greater.
    // If true, it breaks out of the inner loop.
    if ( s >= 100 ) {
      break ;
    }

    // Create a new regular expression object using 's' as the pattern.
    var re = new RegExp ( s ) ;

    // Test if the current 'str' matches the regular expression 're'.
    if ( re . test ( str ) ) {
      // If a match is found, increment the counter 'cnt' and break the inner loop.
      cnt ++ ;
      break ;
    }

    // Append a dot '.' to the string 'a' for the next iteration.
    a += "." ;

  } // End of inner loop (j)

} // End of outer loop (i)

// Print the final count to the console.
console . log ( cnt ) ;