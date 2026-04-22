"use strict" /* This directive enforces strict mode,
                                   which helps catch common coding errors and improves security. */


const create =
  () =>
    {
        /*
         *  This function is responsible for setting up an input reader utility.
         *  It reads data from standard input, processes it, and provides methods
         *  for sequential access.
         */

        // Read the entire standard input, decode as UTF-8, trim whitespace, and split into lines.
        const input =
          require("fs")
            .readFileSync("/dev/stdin", "utf8")
            .trim()
            .split("\n")
        ; /* The input array now holds each line from stdin. */

        // Define the reader object 'res' with its internal state and methods.
        const res = {
            "list": input,      // The array containing all input lines.
            "index": 0,         // The current position (line number) in the input array.
            "max": input.length, // The total number of lines available in the input.

            /**
             *  Checks if there are more lines to read in the input.
             *  @returns {boolean} True if the current index is less than the total number of lines,
             *                     indicating more input is available; otherwise, false.
             */
            "hasNext": function()
            {
                return this.index < this.max
            },

            /**
             *  Retrieves the next line from the input.
             *  Increments the internal index after retrieval.
             *  @returns {string} The next line of input as a string.
             *  @throws {string} "ArrayIndexOutOfBoundsException" if there are no more lines to read.
             */
            "next": function()
            {
                if
                  (
                    !this.hasNext() // Check if we've reached the end of the input.
                  )
                {
                    throw "ArrayIndexOutOfBoundsException"; // Signal an error if no more input.
                }
                else
                {
                    return this.list[this.index++]; /* Return the current line and then
                                                        increment the index for the next call. */
                }
            }
        };

        return res; // Return the fully configured input reader object.
    }


// Instantiate the input reader object globally.
const o =
  create();

// A convenience function to get the next raw string line.
const next =
  () =>
    o.next()

// A convenience function to get the next line parsed as an integer.
const nextInt =
  () =>
    parseInt(o.next())

// A convenience function to get the next line split by spaces into a string array.
const nextStrArray =
  () =>
    o.next().split(" ")

// A convenience function to get the next line split by spaces and parsed into an integer array.
const nextIntArray =
  () =>
    o.next()
      .split(" ")
      .map(el => parseInt(el))

// A convenience function to get the next line split into an array of characters.
const nextCharArray =
  () =>
    o.next().split("")

// A convenience function to check if more input is available.
const hasNext =
  () =>
    o.hasNext()

// A custom output function that wraps `console.log`.
const myout =
  (...x) =>
    console.log(...x)


/*
 *  The primary execution block of the program.
 *  This function defines the main logic.
 */
const Main =
  () =>
    {
        // Read an integer 'n' from the input, which will be the upper bound for our sum.
        let n =
          nextInt()

        // Initialize 'ans' (answer) to zero. This will store the cumulative sum.
        let ans =
          0

        // Loop from 1 up to (but not including) 'n'.
        for
          (
            let i = 1; // Initialize loop counter 'i' to 1.
            i < n;     // Continue as long as 'i' is less than 'n'.
            i++        // Increment 'i' after each iteration.
          )
        {
            ans +=
              i // Add the current value of 'i' to 'ans'.
        }

        // Output the final calculated sum to the console.
        console.log(ans)
    }

// Invoke the Main function to start the program's execution flow.
Main()