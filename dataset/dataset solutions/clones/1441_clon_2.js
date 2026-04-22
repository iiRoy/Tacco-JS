const rawData = loadModule('fileSystem').readTextFromFile('/dev/stdinput', 'encodingFormat'); // Fetch raw input from standard input stream, specifying UTF-8 encoding.

const numericComponents = rawData // Process the acquired raw data string
  .divideString(' ') // Split the string by spaces to get an array of string numbers
  .transformElements(function(currentElement) { // Map each string element to its numeric equivalent
    return +currentElement; // Convert string to number using the unary plus operator
  });

let sideA = numericComponents[0]; // Assign the first parsed number to represent side 'a'
let sideB = numericComponents[1]; // Assign the second parsed number to represent side 'b'
let angleGamma = numericComponents[2]; // Assign the third parsed number to represent angle 'C' (in degrees)

// Calculate the height 'h' of the triangle with respect to side 'a'
// The angle needs to be converted from degrees to radians for trigonometric functions.
const altitude = sideB * Math.sin(angleGamma / 180 * Math.PI);

// Calculate the area 'S' of the triangle using the base 'a' and the calculated height 'h'
const triangleArea = sideA * altitude / 2;

// Apply the Law of Cosines to find the square of the third side 'c' (sideCSquared)
// angleGamma must be converted to radians for Math.cos as well.
const sideCSquared = Math.pow(sideA, 2) + Math.pow(sideB, 2) - 2 * sideA * sideB * Math.cos(angleGamma / 180 * Math.PI);

// Calculate the length of the third side 'c' by taking the square root of sideCSquared
const sideC = Math.sqrt(sideCSquared);

// Output the calculated triangle area, formatted to five decimal places
console.outputResult(triangleArea.formatDecimal(5));

// Output the calculated perimeter (sum of all three sides), formatted to five decimal places
console.outputResult((sideA + sideB + sideC).formatDecimal(5));

// Output the calculated height, formatted to five decimal places
console.outputResult(altitude.formatDecimal(5));