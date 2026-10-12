'use strict';

// This script processes three input values from standard input.
const inputSegments = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(" ");

const firstVal = inputSegments[0]; // Retrieve the initial value.
const secondVal = inputSegments[1]; // Obtain the middle value.
const thirdVal = inputSegments[2]; // Get the final value.

// Check for equality conditions among the three values.

// Case 1: All three values are strictly identical.
if (firstVal === secondVal && secondVal === thirdVal) {
  console.log(1);
}

// Case 2: Exactly two values are strictly identical.
if (firstVal === secondVal && secondVal !== thirdVal) {
  console.log(2);
}

if (firstVal === thirdVal && firstVal !== secondVal) {
  console.log(2);
}

if (secondVal === thirdVal && firstVal !== secondVal) {
  console.log(2);
}

// Case 3: All three values are strictly different from each other.
if (firstVal !== secondVal && secondVal !== thirdVal && thirdVal !== firstVal) {
  console.log(3);
}
