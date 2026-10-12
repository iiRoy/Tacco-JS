"use strict";

// This script processes two numbers from standard input.
// It reads them, applies a condition (if > 1, keep; otherwise, 0),
// and then prints their product.

const fileSystem = require('fs'); // Load the Node.js file system module

// Read the entire content from standard input as a UTF-8 string
const rawData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Convert the raw buffer to a string and split it by space to get an array of string values
const valueStrings = rawData.toString().split(" ");

// Parse the first string value into an integer
const firstNum = parseInt(valueStrings[0]);

// Apply a conditional transformation: if the number is greater than 1, use it; otherwise, use 0.
const processedFirst = firstNum > 1 ? firstNum : 0;

// Parse the second string value into an integer
const secondNum = parseInt(valueStrings[1]);

// Apply the same conditional transformation to the second number
const processedSecond = secondNum > 1 ? secondNum : 0;

// Calculate the product of the two processed numbers and print it to the console
console.log(processedFirst * processedSecond);
