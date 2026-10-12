function processEquations() {
  // Iterate over each line of input data received from standard input.
  rawData.forEach(function(currentEquationString) {
    let operand1Str, operand2Str, resultStr; // Variables to hold string representations of the numbers.
    let parsedEquation; // Stores the result of the regex match.
    let num1, num2, res; // Variables for the parsed integer values.
    let digitCandidate; // Loop counter, representing the digit to substitute for 'X'.

    // If the line is empty or contains only whitespace, skip it and move to the next.
    if (currentEquationString.trim() === '') {
      return;
    }

    // Use a regular expression to extract the three parts of the equation.
    // The pattern looks for three groups of digits or 'X' separated by '+' and '='.
    parsedEquation = currentEquationString.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);

    // Extract the matched parts into their respective string variables.
    operand1Str = parsedEquation[1];
    operand2Str = parsedEquation[2];
    resultStr = parsedEquation[3];

    // Loop through all possible digits from 0 to 9.
    for (digitCandidate = 0; digitCandidate <= 9; digitCandidate++) {
      // Check for the special condition: if 'X' is the first character of any number
      // and the current digit candidate is 0, then this is an invalid substitution.
      // Numbers cannot start with a leading zero unless they are just '0'.
      if (digitCandidate === 0 && (operand1Str.charAt(0) === 'X' || operand2Str.charAt(0) === 'X' || resultStr.charAt(0) === 'X')) {
        continue; // Skip this iteration and try the next digit.
      }

      // Replace all occurrences of 'X' in each string with the current digit candidate,
      // then parse the modified string into an integer. The radix 10 is specified.
      num1 = parseInt(operand1Str.replace(/X/g, digitCandidate), 10);
      num2 = parseInt(operand2Str.replace(/X/g, digitCandidate), 10);
      res = parseInt(resultStr.replace(/X/g, digitCandidate), 10);

      // If the sum of the first two numbers equals the third, we've found the correct digit.
      if (num1 + num2 === res) {
        break; // Exit the loop as the solution is found.
      }
    }
    // Output the found digit. If the loop completed without finding a solution (i.e., digitCandidate became 10),
    // then output 'NA' (Not Applicable).
    console.log(digitCandidate === 10 ? 'NA' : digitCandidate);
  });
}

// Declare a global variable to accumulate all incoming data from stdin.
let rawData = '';

// Resume the standard input stream to begin listening for data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the stdin stream.
// Each time a chunk of data is received, append it to the rawData string.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});

// Attach an event listener for the 'end' event on the stdin stream.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Split the accumulated rawData string into an array of strings,
  // using the newline character as the delimiter.
  rawData = rawData.split('\n');
  // Call the main processing function with the prepared input array.
  processEquations();
});
