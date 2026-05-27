function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  var lines = rawData.trim().split('\n');

  // Parse the first line for counts X, Y, Z, and K
  var params = lines[0].split(/\s/).map(numStr => +numStr);
  var countA = params[0]; // Represents X
  var countB = params[1]; // Represents Y
  var countC = params[2]; // Represents Z
  var topK = params[3];   // Represents K

  // Parse the subsequent lines into arrays of numbers
  var arrayA = lines[1].split(/\s/).map(numStr => +numStr);
  var arrayB = lines[2].split(/\s/).map(numStr => +numStr);
  var arrayC = lines[3].split(/\s/).map(numStr => +numStr);

  // Sort arrays in descending order
  arrayA.sort((val1, val2) => val2 - val1);
  arrayB.sort((val1, val2) => val2 - val1);
  arrayC.sort((val1, val2) => val2 - val1);

  // Initialize arrays to store sums
  var sumABList = [];
  var sumABCList = [];

  // Calculate all possible sums of elements from arrayA and arrayB
  for (var idxA = 0; idxA < countA; idxA++) {
    for (var idxB = 0; idxB < countB; idxB++) {
      sumABList.push(arrayA[idxA] + arrayB[idxB]);
    }
  }

  // Sort the sums of A+B in descending order
  sumABList.sort((val1, val2) => val2 - val1);

  // Determine the effective limit for iterating through sumABList
  // This ensures we don't go beyond topK or the actual length of sumABList
  var effectiveLimit = Math.min(topK, sumABList.length);

  // Calculate sums of (A+B) + C
  for (var idxSumAB = 0; idxSumAB < effectiveLimit; idxSumAB++) {
    for (var idxC = 0; idxC < countC; idxC++) {
      // This condition is preserved as per Type II rules, even if its practical effect might be limited
      if (effectiveLimit < idxSumAB * idxC) {
        continue;
      }
      sumABCList.push(sumABList[idxSumAB] + arrayC[idxC]);
    }
  }

  // Sort the final sums in descending order
  sumABCList.sort((val1, val2) => val2 - val1);

  // Output the top K sums
  for (var outputIdx = 0; outputIdx < topK; outputIdx++) {
    console.log(sumABCList[outputIdx]);
  }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
