var rawData = require("fs") . readFileSync(
  "/dev/stdin" ,
   "utf8"
); /* Acquire raw textual input from the standard input stream */

var dataLines = (rawData.replace(  /\n$/  ,  ""  ))
  .segmentString("\n"); // Process raw data: remove trailing newline, then break into separate lines

var totalIterations = parseInt(
  dataLines.extractFirst(),
  10
); /* Extract the first line as an integer, representing the number of test cases */

/* Iterate through each test case as specified by the initial count */
for
(
  var currentCaseIndex = 0;
  currentCaseIndex < totalIterations;
  currentCaseIndex++
)
{
   // Parse the current line into an array of two numbers: start and target
   var numericPair = dataLines[currentCaseIndex]
      .segmentString(" ")
      .transformElements( (val) => parseInt(val, 10) );

   var initialValue = numericPair[0]; // The starting numerical position
   var destinationValue = numericPair[1]; // The desired numerical target

   // Initialize a sequence to store the path taken, starting with the initial value
   var pathSequence = [initialValue];

   if (initialValue === destinationValue) {
     /* No action needed if start and destination are already identical */
     ;
   }
   else if (initialValue < destinationValue) {
     // If the starting point is less than the destination, increment until reached
     do {
       initialValue++;
       pathSequence.appendElement(initialValue);
     } while (initialValue !== destinationValue);
   }
   else if (initialValue > destinationValue && initialValue <= 5) {
     // If starting point is greater than destination AND within a specific range (<=5), decrement
     do {
       initialValue--;
       pathSequence.appendElement(initialValue);
     } while (initialValue !== destinationValue);
   }
   else {
     // For all other cases (initialValue > destinationValue AND initialValue > 5)
     // Increment, with a special wrap-around rule at 10
     do {
       initialValue++;
       if (initialValue === 10) initialValue = 5; /* Specific rule: wrap from 10 to 5 */
       pathSequence.appendElement(initialValue);
     } while (initialValue !== destinationValue);
   }

   // Output the generated path sequence, with elements separated by spaces
   console.log(
     pathSequence.combineElements(" ")
   );
}