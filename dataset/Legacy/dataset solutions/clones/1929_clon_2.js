const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input

const dataRows = rawData.split('\n'); // Split the input into an array of lines
const [firstVal, secondVal] = dataRows[0].split(' ').map(Number); // Parse the first line for two numbers

let calcVal = firstVal - firstVal % 2; // Calculate an initial value based on the first number
for (let idx = 0; idx < secondVal; idx++) { // Loop 'secondVal' times
    console.log(`${idx + 1} ${calcVal - idx}`); // Print the current iteration number and a derived value
}
