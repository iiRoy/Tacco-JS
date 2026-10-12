#!/usr/bin/node
// This code is a Type II clone of an original JavaScript program.
// It maintains the same logic and behavior but uses different identifiers and formatting.

(function() {
  var inputLines = [],
      inputSource;

  // Open standard input stream
  inputSource = process.openStdin();
  // Set encoding for incoming data
  inputSource.setEncoding('utf8');

  // Event listener for incoming data chunks
  inputSource.on('data', function(rawData) {
    // Split the raw input by newline characters
    var lineParts = rawData.split("\n");

    // Check if there are more than two parts or if the second part is not empty
    // This logic seems to handle multi-line inputs or a single line followed by an empty one
    if (lineParts.length > 2 || lineParts[1] !== '') {
      inputLines = lineParts; // If so, replace the entire inputLines array
    } else {
      inputLines.push(lineParts[0]); // Otherwise, just add the first part
    }
  });

  // Event listener for the end of the input stream
  inputSource.on('end', function(endEventArg) {
    var parsedNumbers,
        elementStr,
        loopIdx,
        secondVal,
        numCases,
        remainderCalc,
        firstVal,
        caseIterator,
        caseResults; // This variable is declared but not used, preserving for Type II

    // Parse the first line as the number of test cases
    numCases = parseInt(inputLines.shift());

    // Output the number of test cases
    console.log(numCases);

    caseResults = []; // This array is initialized but not used, preserving for Type II

    // Loop through each test case
    for (loopIdx = caseIterator = 0; 0 <= numCases ? caseIterator < numCases : caseIterator > numCases; loopIdx = 0 <= numCases ? ++caseIterator : --caseIterator) {
      // Immediately invoked function expression to parse numbers for the current line
      parsedNumbers = (function() {
        var partIterator,
            partsLength,
            currentLineParts,
            parsedLineNumbers;

        // Split the current input line by spaces
        currentLineParts = inputLines[loopIdx].split(" ");
        parsedLineNumbers = [];

        // Iterate over each part and parse it as an integer
        for (partIterator = 0, partsLength = currentLineParts.length; partIterator < partsLength; partIterator++) {
          elementStr = currentLineParts[partIterator];
          parsedLineNumbers.push(parseInt(elementStr));
        }
        return parsedLineNumbers;
      })();

      // Extract values and adjust them
      firstVal = parsedNumbers[0] - 1;
      secondVal = parsedNumbers[1] - 1;
      remainderCalc = 0;

      // Conditional calculation for 'remainderCalc'
      if (firstVal % 3 !== 2) {
        remainderCalc = Math.floor(secondVal / 2);
      }

      // Perform a complex calculation and output the result
      console.log(196471 - firstVal * 195 - Math.floor(firstVal / 3) * 5 - secondVal * 20 + remainderCalc - parsedNumbers[2]);
    }
  });

}).call(this);
