var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input to get individual equation lines
var equationLineGroups = (rawInputData.trim()).split("\n");

equationLineGroups.forEach(function(currentEquationLine) {
  // Parse the numeric factors for the current equation
  var numericFactors = currentEquationLine.split(" ").map(Number);

  var factorA = numericFactors[0];
  var factorB = numericFactors[1];
  var factorC = numericFactors[2];
  var factorD = numericFactors[3];
  var factorE = numericFactors[4];
  var factorF = numericFactors[5];

  var solutionX;
  var solutionY;

  // The system of equations is:
  // a*x + b*y = c
  // d*x + e*y = f
  // Solving for x using Cramer's rule or substitution:
  // x = (c*e - f*b) / (a*e - d*b)
  solutionX = (factorC * factorE - factorF * factorB) / (factorA * factorE - factorD * factorB);

  // Solving for y using the first equation:
  // y = (c - a*x) / b
  solutionY = (factorC - factorA * solutionX) / factorB;

  // Output the calculated solutions for x and y, separated by a space
  console.log([solutionX, solutionY].join(" "));
});
