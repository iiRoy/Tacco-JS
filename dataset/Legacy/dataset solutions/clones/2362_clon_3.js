"use strict";

// A small utility function to safely parse the first numeric part of a string.
function obtainNumericComponent(lineString) {
  // Split the string by space to isolate the first token.
  const stringSegments = lineString.split(' ');
  // Take the very first segment.
  const initialSegment = stringSegments[0];
  // Convert the segment to a number. Using Number() constructor is explicit.
  return Number(initialSegment);
}

// The primary function responsible for processing the entire input.
function processApplicationInput(fullInputContent) {
  // Divide the raw input into individual lines.
  const contentLines = fullInputContent.split('\n');

  // Extract the first line for processing.
  const firstDataLine = contentLines[0];
  // Extract the second line for processing.
  const secondDataLine = contentLines[1];

  // Parse the numeric value from the first line using our helper.
  const valueOne = obtainNumericComponent(firstDataLine);
  // Parse the numeric value from the second line using our helper.
  const valueTwo = obtainNumericComponent(secondDataLine);

  // Determine if the two values are not strictly equal.
  // This is an equivalent expression to !(valueOne === valueTwo).
  const areValuesUnequal = (valueOne !== valueTwo);

  // Output the boolean result to the console.
  console.log(areValuesUnequal);
}

// Setup for reading input from the standard input stream.
const fileSystemHandler = require("fs");
const standardInputSource = "/dev/stdin";
const textEncoding = "utf8";

// Read the entire content from stdin synchronously.
const rawInputString = fileSystemHandler.readFileSync(standardInputSource, textEncoding);

// Invoke the main processing function with the obtained input.
processApplicationInput(rawInputString);
