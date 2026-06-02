'use strict';

// This script processes input from standard input.
// It reads the entire content, then removes leading/trailing whitespace.
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Trim any extraneous whitespace from the beginning or end of the input.
rawData = rawData.trim();

// The core logic involves checking if the input string matches a specific pattern.
// The pattern is designed to recognize variations of "AKIHABARA".
// '?' makes the preceding character optional.
// '^' anchors the match to the beginning of the string.
// This regular expression checks for "AKIHABARA", "AKIHBARA", "AKIHABRA", "AKIHABAR", etc.
let resultString = rawData.match(/^A?KIHA?BA?RA?/) ? "YES" : "NO";

// Output the determined result to the console.
console.log(resultString);
