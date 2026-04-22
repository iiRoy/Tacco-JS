"use strict" /* This enforces strict parsing and error handling in the script. */


// Function to create an input reader utility
const create = () => {

  // Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
  const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

  // Initialize a reader object with the input lines.
  const res = {
    "list": input, // The array of input lines.
    "index": 0,    // Current position in the input array.
    "max": input.length, // Total number of lines.

    // Checks if there are more lines to read.
    "hasNext": function () {
      return this.index < this.max
    },

    // Retrieves the next line from the input.
    "next": function () {
      if (!this.hasNext()) {
        // Throws an error if no more input is available.
        throw "ArrayIndexOutOfBoundsException";
      } else {
        // Returns the current line and increments the index.
        return this.list[this.index++];
      }
    }
  };

  // Return the configured reader object.
  return res;
}


// Instantiate the input reader.
const o = create();


// Helper function to get the next raw string token.
const next = () => o.next()

// Helper function to get the next token as an integer.
const nextInt = () => parseInt(o.next())

// Helper function to get the next line as an array of strings.
const nextStrArray = () => o.next().split(" ")

// Helper function to get the next line as an array of integers.
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))

// Helper function to get the next line as an array of characters.
const nextCharArray = () => o.next().split("")

// Helper function to check if there is more input.
const hasNext = () => o.hasNext()

// Helper function for console output.
const myout = (...x) => console.log(...x)


// Main logic of the program.
const Main = () => {
  // Read two integers, n and m, from the input.
  const [n, m] = nextIntArray()

  let ans = m <= 2 * n ? Math.floor(m / 2) : Math.floor((2 * n + m) / 4) // Calculate the answer based on n and m.

  // Print the calculated answer to the console.
  console.log(ans)
}


// Execute the main function.
Main()