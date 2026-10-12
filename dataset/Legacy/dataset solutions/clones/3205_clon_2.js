const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire input data from standard input stream

const tokenizedData = rawData.split(' '); // Divide the raw input string into an array of substrings using space as a delimiter

const valK = Number(tokenizedData[0]); // Convert the first token to a numerical value and assign it to 'valK'

const valA = Number(tokenizedData[1]); // Convert the second token to a numerical value and assign it to 'valA'

const valB = Number(tokenizedData[2]); // Convert the third token to a numerical value and assign it to 'valB'

const processAndDisplay = () => {
  // This function encapsulates the core logic to compute and output the result based on the input values.
  if (valK < valA + 1) {
    // If 'valK' is less than 'valA' plus one, print 'valK' plus one.
    console.log(valK + 1);
  } else if (valB <= valA + 2) {
    // Otherwise, if 'valB' is less than or equal to 'valA' plus two, print 'valK' plus one.
    console.log(valK + 1);
  } else if ((valK - valA + 1) % 2 === 0) {
    // Otherwise, if the expression (valK - valA + 1) is an even number, calculate and print a specific value.
    console.log(valA + (valB - valA) * (valK - valA + 1) / 2);
  } else {
    // In all other cases, calculate and print a different specific value.
    console.log(valA + (valB - valA) * (valK - valA) / 2 + 1);
  }
};

processAndDisplay(); // Invoke the function to execute the processing and display the final outcome.
