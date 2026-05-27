'use strict';

/*
 * This function serves as the primary entry point for processing input data.
 * It takes a raw string as an argument, processes it, and then performs
 * a series of operations based on queries embedded within the input.
 */
function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  // This helps in parsing different parts of the input.
  let processedLines = rawData.split("\n");

  // The second line (index 1) of the input is considered the main string
  // against which queries will be performed.
  const targetString = processedLines[1];

  // All lines from the third line (index 2) onwards are treated as individual queries.
  // These queries will be iterated over.
  const queryList = processedLines.slice(2);

  // Iterate through each query present in the query list.
  for (const currentQuery of queryList) {
    // For each query line, split it by space to get individual query parameters.
    // These parameters typically define a range or specific values for the query.
    const queryValues = currentQuery.split(" ");

    // Extract a substring from the target string based on the query parameters.
    // The first parameter (qv[0]) is the start index (1-based, so subtract 1),
    // and the second parameter (qv[1]) is the end index (inclusive).
    let subSegment = targetString.slice(parseInt(queryValues[0]) - 1, parseInt(queryValues[1]));

    // Count the occurrences of the substring 'AC' within the extracted segment.
    // This is done by splitting the segment by 'AC' and then subtracting 1 from the length
    // of the resulting array. For example, "ACAC" split by "AC" gives ["", "", ""], length 3, so 2 occurrences.
    // "BACA" split by "AC" gives ["B", "A"], length 2, so 1 occurrence.
    console.log(subSegment.split('AC').length - 1);
  }
}

// The program execution starts here.
// It reads the entire content of the standard input file synchronously,
// decodes it as UTF-8, and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
