/*
 *   This JavaScript code processes numerical input.
 *   It reads from standard input, performs calculations,
 *   and writes the result to standard output.
 */
main =
  input =>
  {
    /*
     *   Step 1: Parse the input string into a 2D array of numbers.
     *   The input is expected to be newline-separated lines,
     *   with each line containing space-separated floating-point numbers.
     */
    input =
      input
        .split(
          '\n'
        ) // Split the raw input string by newline characters
        .map(
          x =>
            x.split(
              ' '
            ) // For each line, split by space to get string numbers
        )
        .map(
          x =>
            x.map(
              parseFloat
            ) // Convert each string number to a floating-point number
        )
    ;

    // Step 2: Initialize variables N and B from the parsed input.
    var N =
      input[0]
    ; // N is the first element of the first line of input

    var B =
      input[1]
    ; // B is the second line of input, an array of numbers

    /*
     *   Step 3: Modify array B.
     *   Prepend the first element of B and append the last element of B.
     *   This modification is crucial for the subsequent reduction logic.
     */
    B =
      [ B[0] ] // Create a new array starting with the first element of B
        .concat(
          B
        ) // Concatenate the original B array
        .concat(
          B.slice(
            -1
          )
        ) // Concatenate the last element of B (obtained via slice)
    ;

    // Step 4: Initialize an accumulator variable A to zero.
    var A =
      0
    ;

    /*
     *   Step 5: Perform a reduction operation on the modified array B.
     *   The reducer iterates through adjacent pairs of numbers,
     *   adding the minimum of each pair to the accumulator A.
     */
    B.reduce(
      (
        N_current_val, // The current value from the array in the reduction
        nextToN // The next value from the array in the reduction
      ) =>
      {
        // Add the minimum of the two adjacent values to A
        A +=
          Math.min(
            N_current_val,
            nextToN
          )
        ;
        // Return the 'nextToN' value to become 'N_current_val' in the subsequent iteration
        return nextToN
        ;
      }
    )
    ; // Semicolon for the reduce method call

    // Step 6: Write the final accumulated value A to standard output.
    process
      .stdout
      .write(
        A
      )
    ;
  }
; // Semicolon for the main function assignment

/*
 *   Execute the main function.
 *   Reads the entire content of '/dev/stdin' as a UTF-8 string
 *   and passes it as the 'input' argument to the main function.
 */
main(
  require(
    'fs'
  )
    .readFileSync(
      '/dev/stdin',
      'utf8'
    )
)
;