/*
 * This is a Type I clone of the original JavaScript code.
 * It performs the same operations but with different formatting and comments.
 */
function
  main
  (

    input
  )
{
  // Declare a constant 'hoge' and convert the input to a number.
  const   hoge    =   Number  ( input )   ;

  /*
   * Calculate the sum: hoge + hoge^2 + hoge^3
   * and print the result to the console.
   */
  console
    .
    log
    (
      hoge
      +
      Math.pow
      (
        hoge,
        2
      )
      +
      Math.pow
      (
        hoge,
        3
      )
    )
  ;
}


// Call the main function with input read from standard input.
main
(
  require( 'fs' )
    .
    readFileSync
    (
      '/dev/stdin',
      'utf8'
    )
)
; // End of program execution.