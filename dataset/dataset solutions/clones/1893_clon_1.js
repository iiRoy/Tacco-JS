/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input from standard input, processes data about snacks,
 * and then outputs a final count.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */


// --- VARIABLE DECLARATION AND INPUT READING SECTION ---

// The 'fs' module is required for file system operations, specifically reading from stdin.
  var   input   =   require ( 'fs' )
                         . readFileSync ( '/dev/stdin' ,   'utf8' )
                         . split ( '\n' ) ; // Split the entire input by newline characters.


/*
 *   The first line of the input contains two numbers:
 *   N - representing the total number of people.
 *   K - representing the total number of distinct snack types.
 */
var   [ N ,   K ]

=

input [ 0 ] . split ( ' ' ) . map ( Number ) ; // Parse N and K from the first line.


// 'sunuke' is an array that will keep track of how many snacks each person has.
// It's initialized with N elements, all set to 0, corresponding to N people.
var   sunuke   =   new   Array ( N ) . fill ( 0 ) ;


// --- SNACK PROCESSING LOOP SECTION ---

/*
 *   This loop iterates K times, once for each type of snack.
 *   The input format specifies that for each snack type 'i':
 *   - The line at index `i*2+1` contains the number of people who have snack 'i'.
 *   - The line at index `i*2+2` contains the space-separated list of people who have snack 'i'.
 *   We are interested in the list of people, which is at `input[i*2+2]`.
 */
for

(

var   i = 0 ; // Initialize loop counter 'i' to 0.

i < K ;     // Continue as long as 'i' is less than K (number of snack types).

i ++        // Increment 'i' after each iteration.

)

{

  // For the current snack type 'i', retrieve the line containing the people.
  //   1. Split the line by spaces to get individual person IDs (as strings).
  //   2. Map each string ID to a Number.
  //   3. For each person 'v' in this list:
  //      - Decrement 'v' by 1 to get a 0-based index.
  //      - Increment the count at that index in the 'sunuke' array.
  input [ i * 2 + 2 ] . split ( ' ' ) . map ( Number ) . forEach ( ( v )

  =>

  sunuke [ v - 1 ]   ++

  ) ; // End of forEach callback and statement.

} // End of the main processing loop.


// --- FINAL CALCULATION AND OUTPUT SECTION ---

/*
 *   After processing all snack types, we need to find out how many people
 *   have received absolutely no snacks.
 *   This corresponds to elements in the 'sunuke' array that are still 0.
 */
console . log (
                  sunuke . filter ( v   =>   v   ===   0 ) // Filter the array to keep only elements equal to 0.
                         . length                          // Get the count of the filtered elements.
              ) ; // Output the final count to the console.

// End of JavaScript program.