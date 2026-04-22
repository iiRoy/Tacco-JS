var incomingLines = []; /* Stores all lines read from standard input */
var inputHandler = require('readline');

var lineStream = inputHandler.createInterface({
  input: process.stdin, // Standard input source
  output: process.stdout, // Standard output sink
});

lineStream.on(
  'line',
  function (currentInputLine) {
    // Add the received line to our collection
    incomingLines.push(currentInputLine);
  }
);

lineStream.on('close', function () {
  // Processing begins once all input lines are received and the stream closes
  var firstDataSegment = incomingLines.shift(); // Get the first line of input

  // Parse the initial parameters from the first line
  var totalElements = firstDataSegment.split(' ')[0];
  var subsetSizeA = firstDataSegment.split(' ')[1];
  var subsetSizeB = firstDataSegment.split(' ')[2];

  // Initialize an array to hold parsed numerical data
  var numericalData = Array(totalElements);

  // Read the second line of input and populate the numerical data array
  var dataValuesStr = incomingLines.shift().split(' ');
  for (var index = 0; index < totalElements; index++) {
    numericalData[index] = Number(dataValuesStr[index]); // Convert string to number
  }

  // Sort the numerical data in descending order
  numericalData.sort(function (firstVal, secondVal) {
    return secondVal - firstVal;
  });

  var calculatedMean = 0; // Variable to store the maximum average
  var elementFrequencies = {}; // Map to store counts of each unique element

  // Calculate the sum for the average and count element frequencies
  for (var dataIdx = 0; dataIdx < totalElements; dataIdx++) {
    if (dataIdx < subsetSizeA) {
      calculatedMean += numericalData[dataIdx]; // Sum for the average of the top A elements
    }

    // Initialize frequency if element is seen for the first time
    if (elementFrequencies[numericalData[dataIdx]] === undefined) {
      elementFrequencies[numericalData[dataIdx]] = 0;
    }
    elementFrequencies[numericalData[dataIdx]]++; // Increment frequency count
  }

  calculatedMean /= subsetSizeA; // Final average calculation
  console.log(calculatedMean); // Output the calculated average

  // --- Start of combination calculation logic ---
  var currentProcessedCount = 0;
  var temporaryValue = 1; // Unused in original, but keeping for structural similarity.

  var finalCombinations = 0;

  // Check if the A-th element is different from the first element
  if (numericalData[0] !== numericalData[subsetSizeA]) {
    finalCombinations = 1; // Initialize combination result

    // Iterate through unique elements (up to the number of unique elements)
    // using indices of the sorted numericalData array.
    for (var freqIdx = 0; freqIdx < Object.keys(elementFrequencies).length; freqIdx++) {
      var currentElementCount = elementFrequencies[numericalData[freqIdx]]; // Count of the current element

      // If the current element has a frequency of 2 or more
      if (currentElementCount >= 2) {
        var itemsToChoose; // Number of items to choose for combination
        // Determine 'itemsToChoose' based on remaining capacity for subsetSizeA
        if (currentElementCount > (subsetSizeA - currentProcessedCount)) {
          itemsToChoose = subsetSizeA - currentProcessedCount;
        } else {
          itemsToChoose = currentElementCount;
        }
        finalCombinations *= getCombinations(currentElementCount, itemsToChoose); // Multiply combinations
        currentProcessedCount += currentElementCount; // Update processed count
      } else {
        currentProcessedCount += currentElementCount; // Just update processed count for elements with frequency 1
      }
    }
  } else {
    // Special case: if the first and A-th elements are identical (all top A elements are the same value)
    finalCombinations = 0; // Reset combinations for this path
    // Sum combinations for values from 1 up to subsetSizeB
    for (var loopCounter = 1; loopCounter <= subsetSizeB; loopCounter++) {
      // The '50' here seems like a hardcoded value, which is unusual.
      finalCombinations += getCombinations(50, loopCounter);
    }
  }
  console.log(finalCombinations); // Output the final combination count
});

// --- Helper Functions ---

// Calculates the number of permutations P(n, r)
function sequentialProduct(totalItems, itemsSelected) {
  var runningProduct = 1; // Initialize product for permutation calculation
  // Calculate n * (n-1) * ... * (n-r+1)
  for (var counterVar = 0; counterVar < itemsSelected; counterVar++) {
    runningProduct *= totalItems - counterVar;
  }
  return runningProduct;
}

// Calculates the number of combinations C(n, r)
function getCombinations(populationSize, selectionSize) {
  // Calculate C(n, r) = P(n, r) / P(r, r)
  return sequentialProduct(populationSize, selectionSize) / sequentialProduct(selectionSize, selectionSize);
}