var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input into individual lines for processing.
var equationLines = rawData.split('\n');

var currentLine; // Declare a variable to hold each line as it's processed.

// Loop through each line of input until no more lines are available.
while (currentLine = equationLines.shift()) {
  // Parse the current line, splitting by space and converting each part to a number.
  var numericValues = currentLine.split(' ').map(function(numStr) {
    return +numStr; // Convert string to number using unary plus.
  });

  // Assign the parsed numeric values to specific coefficient and constant variables.
  var coeffA = numericValues[0];
  var coeffB = numericValues[1];
  var constC = numericValues[2];
  var coeffD = numericValues[3];
  var coeffE = numericValues[4];
  var constF = numericValues[5];

  // Calculate a multiplier to eliminate one variable (e.g., 'y') from the second equation.
  var factorOne = -(coeffB / coeffE);

  // Apply the multiplier to the second equation's coefficients and constant.
  coeffD = coeffD * factorOne;
  coeffE = coeffE * factorOne; // This term will become zero or near zero.
  constF = constF * factorOne;

  // Sum the 'x' coefficients from both equations (after modification).
  var sumCoeffs = coeffA + coeffD;

  // Solve for 'x' using the modified equations.
  var solutionX = (constC + constF) / sumCoeffs;

  // Solve for 'y' using the first original equation and the calculated 'x'.
  var solutionY = (-coeffA * solutionX + constC) / coeffB;

  // Format the 'x' solution to three decimal places.
  var formattedX = Math.round(solutionX * 1000) + '';
  formattedX = formattedX.replace(/(\d{3})$/, '.$1');

  // Format the 'y' solution to three decimal places.
  var formattedY = Math.round(solutionY * 1000) + '';
  formattedY = formattedY.replace(/(\d{3})$/, '.$1');

  // Output the formatted solutions for 'x' and 'y'.
  console.log(formattedX + ' ' + formattedY);
}
