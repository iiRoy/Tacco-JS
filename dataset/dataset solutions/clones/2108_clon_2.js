"use strict";

/**
 * Processes the input string to perform character manipulations.
 * This function simulates a sequence of operations on a character array.
 * @param {string} inputData - The raw input string, typically from standard input.
 */
const processInput = (inputData) => {
  // Normalize the input: remove leading/trailing whitespace and split into individual lines.
  inputData = inputData.trim().split("\n");

  // The first line of input is the initial string, which we convert to a character array.
  let charArray = inputData[0].split("");

  // The second line contains the total number of queries to be processed.
  // Using radix 10 for parseInt is good practice.
  const numQueries = parseInt(inputData[1], 10);

  // The subsequent lines (from index 2 up to numQueries + 2) are the actual queries.
  const queryList = inputData.slice(2, numQueries + 2);

  // Iterate through each query in the list.
  for (let idx = 0; idx < numQueries; idx++) {
    // Split the current query string into its constituent parts based on spaces.
    const currentQueryParts = queryList[idx].split(" ");

    // Determine the type of operation based on the number of parts in the query.
    // A query with a single part indicates a reversal operation.
    if (currentQueryParts.length === 1) {
      charArray = charArray.reverse(); // Reverse the order of elements in the character array.
    } else {
      // Queries with more than one part indicate an addition operation (prepend or append).
      // The second part of the query (index 1) determines the direction of addition.
      if (currentQueryParts[1] === "1") {
        charArray.unshift(currentQueryParts[2]); // Prepend the character (third part of query) to the array.
      } else {
        charArray.push(currentQueryParts[2]); // Append the character (third part of query) to the array.
      }
    }
  }

  // After all queries are processed, join the characters back into a single string and print it.
  console.log(charArray.join(""));
};

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
