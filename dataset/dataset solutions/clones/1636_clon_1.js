/*
 * This JavaScript code snippet is an immediately invoked async function expression (IIFE).
 * It's designed to read input from standard input, process numerical data,
 * and then output a calculated result based on a specific algorithm.
 *
 * The core logic involves parsing an initial array of numbers, and then
 * iteratively adjusting these numbers based on a 'k' factor.
 */
(
  async () => {
    // A variable to accumulate all incoming data chunks from standard input.
    let input = '';


    // Asynchronously iterates over chunks received from standard input.
    // Each chunk is appended to the 'input' string.
    for await (const chunk of process.stdin) {
      input += chunk;
    }


    // Divides the entire accumulated input string into an array of lines.
    // The split is performed using the newline character as a delimiter.
    const lines = input.split(/\n/);


    /*
     * Extracts the first line from the 'lines' array (using 'shift()'),
     * splits it by any whitespace characters, and then converts each resulting
     * string part into a number. These numbers are then destructured
     * into two constant variables: 'n' and 'k'.
     */
    const [n, k] = lines.shift().split(/\s/).map(v => +v);


    /*
     * Processes the new first line (originally the second line of input).
     * It splits this line by whitespace, takes only the first 'n' elements,
     * and maps each element. Each mapped element becomes a new array of three values:
     * [original_value_as_number, original_value_as_number, 1].
     * This forms the initial state of array 'a'.
     */
    let a = lines[0].split(/\s/).slice(0, n).map(v => [+v, +v, 1]);


    // This loop executes 'k' times, performing the main iterative calculation.
    for (
      let i = 0;
      i < k;
      i++
    ) {
      /*
       * Inside the loop, it finds the element within array 'a' that has
       * the maximum value at its second index (index 1).
       * The 'reduce' method is used to iterate and compare elements.
       */
      let max = a.reduce((prev, current) => prev[1] > current[1] ? prev : current);


      // Increments the value at the third index (index 2) of the identified 'max' element.
      max[2]++;


      // Recalculates the value at the second index (index 1) of 'max'.
      // This is done by dividing the value at its first index (index 0)
      // by the newly incremented value at its third index (index 2).
      max[1] = max[0] / max[2];
    }


    /*
     * After the loop has completed all 'k' iterations,
     * this line finds the element in 'a' that currently holds the maximum
     * value at its second index (index 1) one final time.
     */
    let max = a.reduce((prev, current) => prev[1] > current[1] ? prev : current);


    // Finally, the ceiling of the value at the second index (index 1)
    // of the last 'max' element found is calculated and printed to the console.
    console.log(Math.ceil(max[1]));

  }
)(); // End of the Immediately Invoked Async Function Expression.