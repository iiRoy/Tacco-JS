/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript syntax and features.
 */
'use strict' /* Ensure strict mode is enabled. */

/**
 * The main function processes the input to generate a framed output.
 * @param {string} input - The raw input string, typically from stdin.
 */
function     main ( input )     {

  // Split the input string into an array of lines.
  input = input . split ( '\n' ) ;

  // Process the first line to extract height and width.
  // The `~~v` is a double bitwise NOT operator, coercing the string to an integer.
  input[0] = input[0] . split ( ' ' ) . map ( v => ~~v ) ;

  /*
   * Extract the height from the processed first line.
   * This represents the number of rows for the internal content.
   */
  const h = input [ 0 ] [ 0 ] ;

  // Extract the width from the processed first line.
  // This represents the number of columns for the internal content.
  const w = input [ 0 ] [ 1 ] ;


  /*
   * Initialize a temporary string `tmp` with the top border.
   * The border width is `w + 2` because of the '#' characters on each side.
   * A newline character is appended to move to the next line.
   */
  let tmp = '#'.repeat(w + 2) + '\n' ;

  // Loop through each line of the input content, from 1 to h.
  for ( let i = 1 ; i <= h ; i ++ )
  {
    // Append the left border, the current input line, the right border, and a newline.
    tmp += '#' + input[i] + '#\n' ;
  }


  // Append the bottom border to the temporary string.
  // This border also has a width of `w + 2`.
  tmp += '#'.repeat(w + 2) ;

  /*
   * Finally, print the entire constructed string to the console.
   * This string now contains the framed output.
   */
  console . log ( tmp ) ;

} /* End of the main function definition. */


/*
 * This part of the code is responsible for reading input and invoking the main function.
 * It reads the entire content of `/dev/stdin` as a UTF-8 string
 * and passes it as an argument to the `main` function.
 */
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;