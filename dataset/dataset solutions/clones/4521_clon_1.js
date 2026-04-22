/*
 * This is a utility script designed to process a string input.
 * It checks a condition based on the parsed numeric value derived from the input.
 * The primary goal is to determine if a specific computed number is divisible by four.
 */
function main ( s )
{
  // First, the input string 's' is split into an array of substrings.
  // The delimiter used for splitting is a single space character.
  // This effectively separates words or numbers in the input.
  s = s . split ( " " ) ;

  // Now, we proceed to log the result to the console.
  // The logic involves several steps:
  // 1. Joining the array 's' back into a single string.
  //    By default, `join()` uses a comma as a separator if no argument is provided.
  // 2. Parsing this joined string into an integer using `parseInt()`.
  // 3. Calculating the remainder of this integer when divided by 4 (modulo operation).
  // 4. Comparing this remainder to 0 to check for divisibility by 4.
  // 5. Based on the comparison, either "YES\n" or "NO\n" is printed.
  console . log (
    (
      parseInt (
        s . join ( ) // Joins array elements; e.g., ["1", "2", "3"] becomes "1,2,3"
      ) % 4          // Calculates the remainder after division by 4
      == 0           // Checks if the remainder is exactly zero
    )
      ? "YES\n"      // Output if the condition is true (divisible by 4)
      : "NO\n"       // Output if the condition is false (not divisible by 4)
  ) ;
}


// This section is responsible for executing the 'main' function.
// It first reads data from standard input.
// The 'fs' module is used for file system operations.
// 'readFileSync' reads the entire content of a file synchronously.
// '/dev/stdin' is the conventional path for standard input on Unix-like systems.
// 'utf8' specifies the character encoding for the input data.
main (
  require ( 'fs' ) . readFileSync (
    '/dev/stdin', // Source of input data
    'utf8'        // Encoding of the input data
  )
) ;

/*
 * End of the JavaScript program.
 * The script will exit after the 'main' function has completed its execution
 * and the result has been printed to standard output.
 */