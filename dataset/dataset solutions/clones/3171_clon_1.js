"use strict" ; /* This is a Type I clone.
   The following code is functionally identical to the original.
   Only whitespace and comments have been altered.
   No identifiers, operators, or expressions have been changed.
*/


function   Main
(
  input
)
{
  let
    lines
    =
    input
      .
      split
      (
        "\n"
      )
  ; // Split the input string by newline characters into an array of lines.


  let N = lines [ 0 ] - 0 ; // The first line contains the number N. Convert it to a number.

  let sum = 0 ; // Initialize the sum variable to zero.

  // Loop from 1 to N (inclusive) to process the subsequent N lines of input.
  for
  (
    let n = 1 ;
    n <= N ;
    n ++
  )
  {
    // For each line, split it by any whitespace character to get the value and currency type.
    let
      xv
      =
      lines
        [
          n
        ]
        .
        split
        (
          / \s /
        )
    ;

    let x = xv [ 0 ] - 0 ; // Extract the numerical value from the first part and convert it.

    // If the currency type is 'BTC', multiply x by 380000.0 before adding to sum.
    // Otherwise, add x directly to sum.
    sum
      +=
      (
        xv
          [
            1
          ]
        ==
        'BTC'
      )
      ?
      x
      *
      380000.0
      :
      x
    ;
  }

  // Print the final calculated sum to the console.
  console . log ( sum ) ;
}


// This line reads the input from /dev/stdin (standard input)
// and passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // End of the program.