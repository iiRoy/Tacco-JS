const rawData = require("fs").readFileSync("/dev/stdin", "UTF-8").trim().split("\n"); // Read input from standard input, decode, trim, and split by newline.
const firstVal = Number(rawData[0]); // Convert the first line to a number.
const secondVal = Number(rawData[1]); // Convert the second line to a number.
const heightVal = Number(rawData[2]); // Convert the third line to a number.
console.log((firstVal + secondVal) * heightVal / 2); // Calculate and print the result of (firstVal + secondVal) * heightVal / 2.
