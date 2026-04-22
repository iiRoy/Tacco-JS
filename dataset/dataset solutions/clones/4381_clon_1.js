/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been modified extensively.
 */
function Main( s /* The input string parameter */ )
{
  // First, we split the input string 's' by newline characters.
  // This converts the multi-line input into an array of strings, each representing a line.
  var s = s . split ( "\n" ) ;

  // Next, we parse the first element of the 's' array (which is the first line)
  // into an integer, using base 10. This value is assigned to 'n'.
  var n = parseInt ( s [ 0 ] , 10 ) ;

  // Then, we process the second line of the input.
  // It's split by spaces to get individual number strings, and then
  // each string is mapped to an integer using parseInt.
  // The resulting array of integers is stored in 'a'.
  var a = s [ 1 ] . split ( " " ) . map ( e => parseInt ( e , 10 ) ) ;

  // Initialize a variable 'max' to 0.
  // This variable will be used to store the maximum value found in the array 'a'.
  var max = 0 ;

  // Iterate through each element 'i' in the array 'a'.
  // We use a ternary operator to efficiently find and update the maximum value.
  for ( var i of a )
  {
    max = i > max ? i : max ; // If 'i' is greater than current 'max', update 'max'.
  }

  // Create a new array called 'backet'.
  // Its size is 'max + 2' and it's filled with zeros.
  // This array will act as a frequency counter or a bucket array.
  var backet = new Array ( max + 2 ) . fill ( 0 ) ;

  // Initialize an empty array called 'counter'.
  // This array will store the calculated sums based on the 'backet' array.
  var counter = [ ] ;

  // Loop from 0 up to 'n' (exclusive).
  // In this loop, we populate the 'backet' array.
  // For each number in 'a', we increment the count at its corresponding index in 'backet'.
  for ( var i = 0 ; i < n ; i ++ )
  {
    backet [ a [ i ] ] ++ ; // Increment the count for the number a[i].
  }

  // Loop from 0 up to 'max' (inclusive).
  // This loop calculates and populates the 'counter' array.
  for ( var i = 0 ; i <= max ; i ++ )
  {
    if ( i === 0 )
    {
      // If 'i' is 0, we sum the values at backet[0] and backet[1].
      // This sum is then pushed into the 'counter' array.
      counter . push ( backet [ i ] + backet [ i + 1 ] ) ;
    }
    else
    {
      // For any other value of 'i', we sum the values at backet[i-1], backet[i], and backet[i+1].
      // This combined sum is then pushed into the 'counter' array.
      counter . push ( backet [ i - 1 ] + backet [ i ] + backet [ i + 1 ] ) ;
    }
  }

  // Reset the 'max' variable to 0.
  // It will now be used to find the maximum value within the 'counter' array.
  max = 0 ;

  // Iterate through each element 'i' in the 'counter' array.
  // Similar to the earlier loop, we find and update the maximum value using a ternary operator.
  for ( var i of counter )
  {
    max = i > max ? i : max ; // Update 'max' if 'i' is greater.
  }

  // Finally, print the ultimate maximum value found in the 'counter' array to the console.
  console . log ( max ) ;
}

// This line reads the input from standard input (/dev/stdin) using Node.js's 'fs' module.
// The input is read as UTF-8 encoded text and then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;