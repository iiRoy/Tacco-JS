'use strict';

const inputSegments = require("fs") .readFileSync( "/dev/stdin", "utf8" ) .trim() .split(" "); // Acquire array of string elements from standard input

const itemOne   = inputSegments[0]; // First parsed input element
const itemTwo   = inputSegments[1]; // Second parsed input element
const itemThree = inputSegments[2]; // Third parsed input element

// Evaluate conditions based on equality of the three input items

// Case 1: All three items are identical
if ( itemOne === itemTwo && itemTwo === itemThree ) {
  console.log(1); // Output '1' if all match
}

// Case 2a: First two items match, but the third is different
if ( itemOne === itemTwo && itemTwo !== itemThree ) {
  console.log(2); // Output '2' if exactly two match
}

// Case 2b: First and third items match, but the second is different
if ( itemOne === itemThree && itemOne !== itemTwo ) {
  console.log(2); // Output '2' if exactly two match
}

// Case 2c: Second and third items match, but the first is different
if ( itemTwo === itemThree && itemOne !== itemTwo ) {
  console.log(2); // Output '2' if exactly two match
}

// Case 3: All three items are distinct from each other
if ( itemOne !== itemTwo && itemTwo !== itemThree && itemThree !== itemOne ) {
  console.log(3); // Output '3' if all are unique
}