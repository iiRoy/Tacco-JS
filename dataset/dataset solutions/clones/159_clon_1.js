/*
 * This JavaScript program reads Roman numerals from standard input,
 * converts each line of Roman numerals into its corresponding integer value,
 * and prints the result to standard output.
 *
 * It employs a highly compact and golfed approach for Roman numeral conversion.
 *
 * Author: Code Clone Generation Expert
 * Date: 2023-10-27
 */

// Initialize variables and setup input reading for the Roman numeral converter.
// The main loop iterates through each character of the input stream.
for (
    // 'r' stores the mapping for Roman numeral characters.
    // The leading '.' is a placeholder character. Its presence ensures that
    // 'I' corresponds to index 1, 'V' to index 2, 'X' to index 3, and so forth,
    // which is a key part of the mathematical calculation of their values.
    r = ".IVXLCDM",

    // Initialize multiple variables to zero using chained assignment:
    // 'k': Serves as the loop index, tracking the current character position in the input string.
    // 'n': A versatile variable that temporarily holds both the character's index within 'r'
    //      and its final calculated numerical value during the conversion process.
    // 's': Accumulates the sum of the Roman numeral values for the current line of input.
    // 'p': Stores the numerical value of the *previous* Roman numeral character processed,
    //      essential for applying the subtraction rule (e.g., IV, IX).
    k = n = s = p = 0,

    // 'j': This variable will hold the entire input content read from standard input.
    //      The 'fs' (file system) module is used to read data synchronously.
    //      "/dev/stdin" is the standard input file path on Unix-like operating systems.
    //      "utf8" specifies the character encoding for the input stream.
    j = require("fs").readFileSync("/dev/stdin", "utf8");

    // Loop condition: The loop continues as long as a character 'i' exists at the current index 'k'.
    // The character 'i' is assigned the value of 'j[k]' in this condition check.
    i = j[k];

    // Post-loop expression: Increment the index 'k' after each iteration,
    // moving the loop to the next character in the input string.
    k++
)
    // The entire body of the for loop is a single ternary operator,
    // which evaluates whether the current character 'i' is a newline.
    i == '\n'
        ? // IF 'i' IS A NEWLINE:
          // This block is executed if a newline character is encountered.
          // It's a comma-separated sequence of expressions, executed in order.
          (
              // First, print the total accumulated sum 's' for the completed Roman numeral string.
              console.log(s),

              // Second, reset 'n', 's', and 'p' to 0. This prepares the variables
              // for processing the next line of Roman numerals, if any.
              n = s = p = 0
          )
        : // ELSE ('i' IS NOT A NEWLINE, IT'S A ROMAN NUMERAL CHARACTER):
          // This block is executed to process a Roman numeral character.
          // It is also a single, complex, comma-separated sequence of expressions.
          (
              // FIRST EXPRESSION IN THE COMMA SEQUENCE:
              // Calculate the numerical value of the current Roman numeral character
              // and add it to the running sum 's'.
              // This expression is highly golfed and reuses the 'n' variable:
              //   1. `n = r.indexOf(i)`: The innermost assignment. 'n' first stores the
              //      index of the current character 'i' within the 'r' string (e.g., 'I' is 1, 'V' is 2).
              //   2. `~~((n=r.indexOf(i))/2)`: The index (now in 'n') is divided by 2,
              //      and `~~` performs a floor division (converts to integer).
              //      This result determines the exponent for `Math.pow(10, ...)`.
              //   3. `Math.pow(10, ...)`: Raises 10 to the calculated power.
              //   4. `(2 - (n % 2))`: Calculates the divisor. If 'n' (the character's index)
              //      is odd (e.g., I, X), `n % 2` is 1, so the divisor is `2 - 1 = 1`.
              //      If 'n' is even (e.g., V, L), `n % 2` is 0, so the divisor is `2 - 0 = 2`.
              //   5. `... / (2 - (n % 2))`: The power of 10 is divided by this divisor
              //      to yield the correct Roman numeral value (e.g., 10/2=5 for V, 10/1=10 for X).
              //   6. `n = ...`: The final calculated numerical value is then assigned back to 'n'.
              //   7. `s += n`: This numerical value is added to the total sum 's'.
              s += (n = Math.pow(10, ~~((n = r.indexOf(i)) / 2)) / (2 - (n % 2))),

              // SECOND EXPRESSION IN THE COMMA SEQUENCE:
              // Apply the Roman numeral subtraction rule (e.g., IV = 4, IX = 9).
              // This ternary operator checks if the current numeral's numerical value ('n')
              // is greater than the previous numeral's numerical value ('p').
              // If true, it indicates a subtractive pairing (e.g., 'I' followed by 'V').
              // To correct the sum, 'p * 2' is subtracted: 'p' was incorrectly added,
              // so subtracting 'p' once removes it, and subtracting 'p' again
              // effectively makes it a subtraction from the total.
              n > p
                  ? s -= p * 2 // If 'n' is greater than 'p', perform the subtraction correction.
                  : 0,         // Otherwise, if 'n' is not greater than 'p', do nothing (0 is a no-op).

              // THIRD EXPRESSION IN THE COMMA SEQUENCE:
              // Update 'p' to store the numerical value of the current character.
              // This updated 'p' will be used as the 'previous value' in the next iteration of the loop.
              p = n
          )
; // An explicit semicolon marks the end of the 'for' loop's single statement body.