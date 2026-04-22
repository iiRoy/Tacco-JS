// This module facilitates file system operations.
const   fileSystemModule  =   require('fs');

// Read raw content from standard input, interpreting it as UTF-8 text.
// The '/dev/stdin' path is standard for receiving input in many Unix-like systems.
var fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the acquired text data:
// 1. Remove leading/trailing whitespace using trim().
// 2. Split the cleaned string into an array of lines based on newline characters.
var dataLines = (fileContent.  trim()  ).split("\n");

// Extract the total number of processing cycles from the first line.
// The shift() method removes the first element from the array and returns it.
// Number() explicitly converts the string to a numeric type.
var totalIterations = Number(dataLines.shift());

// Begin the main processing loop.
// This loop iterates 'totalIterations' times, handling each subsequent line of input.
for (let loopIndex = 0; loopIndex < totalIterations; loopIndex++) {
  // Check for an early exit condition: if the current line's value is '0', break the loop.
  // This implies '0' serves as a sentinel value to terminate processing.
  if (dataLines[loopIndex] == 0)
    break;

  // Parse the current line:
  // 1. Split the line into individual string components based on spaces.
  // 2. Map each string component to its numeric representation.
  var currentNumberSet = dataLines[loopIndex].split(" ").map(Number);

  // Assign the first four numeric values to variables representing the components
  // of the first operand (e.g., a quaternion or a vector-like structure).
  var firstComponentScalar = currentNumberSet[0];
  var firstComponentI = currentNumberSet[1];
  var firstComponentJ = currentNumberSet[2];
  var firstComponentK = currentNumberSet[3];

  // Assign the next four numeric values to variables representing the components
  // of the second operand.
  var secondComponentScalar = currentNumberSet[4];
  var secondComponentI = currentNumberSet[5];
  var secondComponentJ = currentNumberSet[6];
  var secondComponentK = currentNumberSet[7];

  // --- Start of quaternion-like multiplication or similar algebraic operation ---
  // Initialize the result components based on the first term of the multiplication.

  var resultComponentA = firstComponentScalar * secondComponentScalar;
  var resultComponentB = firstComponentScalar * secondComponentI;
  var resultComponentC = firstComponentScalar * secondComponentJ;
  var resultComponentD = firstComponentScalar * secondComponentK;

  // Incorporate terms involving the 'i' component of the first operand.
  // This block updates all four result components based on 'firstComponentI'.
  resultComponentB += firstComponentI * secondComponentScalar;
  resultComponentA -= firstComponentI * secondComponentI;
  resultComponentD += firstComponentI * secondComponentJ;
  resultComponentC -= firstComponentI * secondComponentK;

  // Incorporate terms involving the 'j' component of the first operand.
  // This block updates all four result components based on 'firstComponentJ'.
  resultComponentC += firstComponentJ * secondComponentScalar;
  resultComponentD -= firstComponentJ * secondComponentI;
  resultComponentA -= firstComponentJ * secondComponentJ;
  resultComponentB += firstComponentJ * secondComponentK;

  // Incorporate terms involving the 'k' component of the first operand.
  // This block updates all four result components based on 'firstComponentK'.
  resultComponentD += firstComponentK * secondComponentScalar;
  resultComponentC += firstComponentK * secondComponentI;
  resultComponentB -= firstComponentK * secondComponentJ;
  resultComponentA -= firstComponentK * secondComponentK;

  // Output the calculated result components, separated by spaces.
  // This displays the final state of the four result variables for the current iteration.
  console.log(resultComponentA + " " + resultComponentB + " " + resultComponentC + " " + resultComponentD);
}