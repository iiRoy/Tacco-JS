"use strict";

// Ensure ES module compatibility for Node.js environments
Object.defineProperty(exports, "__esModule", { value: true });

// Import the file system module
var fileSystemModule = require("fs");

// Read input data from standard input, assuming UTF-8 encoding
var rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Parse the raw input string into an integer, using base 10
var circleRadiusValue = parseInt(rawInputData, 10);

// Calculate and print the area (assuming pi is approximately 3)
console.log(3 * circleRadiusValue * circleRadiusValue);
