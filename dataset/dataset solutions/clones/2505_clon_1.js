/*
 * This is a JavaScript program designed to process an array of numbers.
 * The Main function takes an input string, parses it, and performs
 * several operations to calculate and print results based on frequency counts.
 */
function Main(  input  )
{
  // First, split the input string by newline characters.
  input = input . split ( "\n" ) ;

  // Check if the last element is an empty string, and remove it if so.
  if ( input[ input.length - 1 ] === '' )
  {
    input.pop() ; // Remove the empty string from the end.
  }

  // Parse N from the first line of input.
  // It's expected to be the first number on the line.
  const N = input[0] . split ( ' ' ) [0] - 0 ;

  // Parse array A from the second line of input.
  // Map elements to numbers and then sort them in ascending order.
  const A = input[1] . split ( ' ' ) . map (
    e =>
    {
      // Convert string element 'e' to a number.
      return e - 0 ;
    }
  ) . sort (
    (a, b) =>
    {
      // Standard numeric sort.
      return a - b ;
    }
  ) ;

  // Initialize variables for frequency counting.
  var array = [ ] ;
  var temp = 0 ;
  var previous = 0 ; // Stores the previously processed element.

  // Iterate through the sorted array A to count frequencies of consecutive identical elements.
  A . forEach (
    e =>
    {
      // If the current element is different from the previous one,
      // it means a new sequence of numbers has started.
      if ( e !== previous )
      {
        array.push(temp) ; // Store the count of the previous sequence.
        previous = e ;     // Update the previous element.
        temp = 1 ;         // Start counting for the new sequence.
      }
      else
      {
        // If the element is the same, increment the counter.
        temp++ ;
      }
    }
  ) ;
  // After the loop, push the last count.
  array.push(temp) ;

  // Remove the first element (which corresponds to the initial `previous=0` and `temp=0` state).
  array.shift() ;

  // Sort the array of frequencies in ascending order.
  array.sort (
    ( a, b ) =>
    {
      return a - b ;
    }
  ) ;

  /*
   * console.log(array); // This line was commented out in the original.
   */

  // Declare a variable to store the upper bound calculation.
  var upperbound ;

  // Main loop: iterate from 1 up to N.
  for ( var i = 1 ; i <= N ; i++ )
  {
    upperbound = 0 ; // Reset upperbound for each iteration of 'i'.

    // Inner loop: sum up elements from the frequency array.
    // The range depends on 'i'.
    for ( var j = 0 ; j < array.length - i + 1 ; j++ )
    {
      upperbound += array[j] ; // Accumulate the sum.
    }

    // Calculate and print the minimum of two values:
    // 1. N divided by i (integer division).
    // 2. The accumulated upperbound multiplied by i.
    console.log ( Math.min ( Math.floor ( N / i ) , upperbound * i ) ) ;
  }
}

/*
 * DO NOT EDIT BELOW THIS LINE.
 * This part handles standard input/output and calls the Main function.
 * It reads the entire standard input and passes it as a string.
 */
Main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;