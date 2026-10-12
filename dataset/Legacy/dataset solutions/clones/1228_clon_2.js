'use strict';

(function(inputData) {
  // Read all input as a string
  var rawInputString = inputData.toString();

  // Parse the first line of input into an array of numbers
  var numericParameters = rawInputString.split('\n')[0].split(' ').map(Number);

  // Execute the core logic with the parsed parameters
  (function(widthVal, heightVal, coordX, coordY, radiusVal) {
    // Check if the circle is outside the boundaries of the rectangle
    // Note: The comma operator evaluates all expressions but the 'if' condition
    // only uses the result of the last one. This behavior is preserved.
    if (coordX - radiusVal < 0,
        coordY - radiusVal < 0,
        coordX + radiusVal > widthVal,
        coordY + coordX > heightVal) {
      console.log('No'); // Output 'No' if any boundary condition (effectively the last one) is met
    } else {
      console.log('yes'); // Otherwise, output 'yes'
    }
  })(numericParameters[0], numericParameters[1], numericParameters[2], numericParameters[3], numericParameters[4]);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
