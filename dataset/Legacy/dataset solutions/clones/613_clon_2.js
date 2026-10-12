var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream
var dataLines = (rawData.trim()).split("\n"); // Process the raw input: remove leading/trailing whitespace, then split into an array of strings by newline
var lineCount = dataLines.shift() - 0; // Extract the first element (which represents 'n'), convert it to a number, and remove it from the array
var resultArray = []; // Declare and initialize an empty array to store the results of calculations

// Begin nested loops to compute sums of pairs
for (var idx1 = 0; idx1 < lineCount; idx1++) { // Outer loop: iterates from the first element up to (but not including) 'lineCount'
   for (var idx2 = idx1 + 1; idx2 < lineCount; idx2++) { // Inner loop: iterates from the element after 'idx1' up to (but not including) 'lineCount'
      // Concatenate the string values of two elements from 'dataLines', then convert the resulting string to a number
      // and add it to the 'resultArray'. The '- 0' forces numeric conversion.
      resultArray.push((dataLines[idx1] + dataLines[idx2]) - 0);
   }
}

// Sort the 'resultArray' numerically in ascending order
resultArray.sort(function(valA, valB) {
   return valA - valB;
});

// Print the element at index 2 (the third smallest sum) from the sorted array to the console
console.log(resultArray[2]);
