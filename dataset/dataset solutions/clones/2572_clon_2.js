"use strict";

// This script processes standard input to calculate the cube of a number.

const input_data_string = require('fs').readFileSync('/dev/stdin', 'UTF-8'); // Read all data from standard input as a string.
const input_rows = input_data_string.split('\n'); // Divide the input string into an array of lines.
const value_to_cube = input_rows[0]; // Extract the first line, which is expected to be the number.

// Calculate the cube of the extracted number and print it to the console.
console.log(value_to_cube * value_to_cube * value_to_cube);
