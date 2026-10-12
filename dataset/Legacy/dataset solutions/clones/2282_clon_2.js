process.stdin.resume();
process.stdin.setEncoding('utf8');

// Storage for all incoming lines from standard input
var inputData = [];

// Create an interface for reading input line by line
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each new line received
inputProcessor.on('line', (currentLine) => {
  inputData.push(currentLine); // Add the line to our collection
});

// Event listener for when the input stream closes
inputProcessor.on('close', () => {
  // Parse the first line as the main count
  var countVal = Number(inputData[0]);
  // Initialize variables to store permutation indices
  var firstIndex = 0;
  var secondIndex = 0;
  // Array to hold the base sequence for permutations
  var baseSequence = [];

  // Process the second line for the first target permutation
  var targetPermA = inputData[1].split(' ');
  targetPermA = targetPermA.map(function(stringItem) { return Number(stringItem)});

  // Process the third line for the second target permutation
  var targetPermB = inputData[2].split(' ');
  targetPermB = targetPermB.map(function(stringItem) { return Number(stringItem)});
 
  /**
   * Recursively generates all permutations of a given array of elements.
   * @param {Array<number>} elements - The array of numbers to permute.
   * @param {number} selectionSize - The number of elements to select for each permutation.
   * @returns {Array<Array<number>>} An array of arrays, where each inner array is a permutation.
   */
  function generatePermutations(elements, selectionSize){
    var resultPerms, idx1, idx2, totalElements, subPerms, remainingElements;
    resultPerms = []; // Initialize the array to store generated permutations
    totalElements = elements.length; // Get the total number of elements available

    // Base case: If selection size is greater than available elements, no permutations possible
    if(totalElements < selectionSize){
      return;
    }
    // Base case: If we need to select only one element, each element is a permutation
    else if(selectionSize === 1){
      for(idx1 = 0; idx1 < totalElements; idx1 ++){
        resultPerms[idx1] = [elements[idx1]];
      }
    }
    // Recursive case: Generate permutations for selectionSize > 1
    else{
      for(idx1 = 0; idx1 < totalElements; idx1 ++){
        remainingElements = elements.slice(0); // Create a copy of the elements
        remainingElements.splice(idx1, 1)[0]; // Remove the current element from the copy

        // Recursively get permutations of the remaining elements for a smaller selection size
        subPerms = generatePermutations(remainingElements, selectionSize - 1);

        // Combine the current element with each sub-permutation
        for(idx2 = 0; idx2 < subPerms.length; idx2 ++){
          resultPerms.push([elements[idx1]].concat(subPerms[idx2]));
        }
      }
    }
    return resultPerms; // Return all generated permutations
  }

  // Populate the base sequence with numbers from 1 to countVal
  for(let idxA = 1; idxA <= countVal; idxA++){
    baseSequence.push(idxA);
  }

  // Generate all permutations of the base sequence
  var allPermutations = generatePermutations(baseSequence, countVal);

  // Initialize a counter for permutation order
  let permCounter = 0;

  // Iterate through all generated permutations
  allPermutations.forEach(currentPerm => {
    permCounter++; // Increment the counter for each permutation

    // Check if the current permutation matches the first target permutation
    if(JSON.stringify(currentPerm) === JSON.stringify(targetPermA)){
      firstIndex = permCounter; // Store its order
    }
    // Check if the current permutation matches the second target permutation
    if(JSON.stringify(currentPerm) === JSON.stringify(targetPermB)){
      secondIndex = permCounter; // Store its order
    }
  });
  
  // Output the absolute difference between the orders of the two target permutations
  console.log(Math.abs(firstIndex - secondIndex));
});
