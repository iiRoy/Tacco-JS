// This JavaScript program processes an array of numbers to find a specific pattern.
// It calculates how many numbers in the array are NOT divisible by any other distinct number in the same array.

function   main  ( lines )
{
  // Step 1: Parse the input string to extract the array of numbers.
  const   input   =   lines.split ( '\n' ) ; // Split the input by newline characters.

  /*
   * The problem statement implies the actual data is on the second line (index 1).
   * This line is split by spaces, and each resulting string is converted to a Number.
   */
  const   array   =   input [ 1 ] .split ( ' ' ) .map ( Number ) ;


  // Initialize a counter. This counter will store the number of elements
  // that *are* divisible by another distinct element in the array.
  let   count   =   0 ;


  // Outer loop: Iterate through each element of the array.
  // 'i' represents the index of the number currently being tested for divisibility.
  for
  (
    let   i   =   0 ;
    i   <   array.length ;
    i++
  )
  {
      let   test   =   array [ i ] ; // Get the current number to be tested.

      // Inner loop: Iterate through the array again to find potential divisors for 'test'.
      // 'j' represents the index of the potential divisor.
      for
      (
        let   j   =   0 ;
        j   <   array.length ;
        j++
      )
      {
          // Condition check:
          // 1. Ensure the divisor is not the same number as the one being tested (i.e., i != j).
          // 2. Check if 'test' is perfectly divisible by 'array[j]' (remainder is 0).
          if
          (
            i   !=   j
            &&
            test   %   array [ j ]   ===   0
          )
          {
              count ++ ; // If both conditions met, increment the counter.
              break ; // Once a divisor is found, no need to check further for 'test'. Move to the next 'test' number.
          }
      }
  }

  // The final output is the total number of elements in the array minus the 'count'.
  // This effectively gives the number of elements that were NOT divisible by any other distinct element.
  console.log ( array.length   -   count ) ;
}


// --- Program Execution Start ---
// This part reads the input from standard input (e.g., from a file or console pipe)
// and passes it as a string to the 'main' function.
main
(
  require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' )
)
;