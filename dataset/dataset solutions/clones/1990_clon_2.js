// This section contains some initial thoughts or alternative approaches that were considered.
// For instance, checking conditions like (j - i === k - j) or specific character mismatches.
// These are currently commented out as they represent exploration, not active logic.
// if (secondIdx - firstIdx === thirdIdx - secondIdx) {
//   continue; // Skip if the distances are equal
// }
// if (charSequence[firstIdx] !== charSequence[secondIdx] && charSequence[secondIdx] !== charSequence[thirdIdx] && charSequence[firstIdx] !== charSequence[thirdIdx]) {
//   totalCombinations++; // Increment if all characters are distinct
// }

function processInput(rawData) {
  const parsedLines = rawData.split('\n');
  const totalLength = Number(parsedLines[0]);
  const charSequence = parsedLines[1];

  // Arrays to store indices of 'R', 'G', 'B' characters
  const redIndices = [];
  const greenIndices = [];
  const blueIndices = [];

  // Populate the index arrays based on the character sequence
  charSequence.split('').forEach((charVal, charIdx) => {
    if (charVal === 'R') {
      redIndices.push(charIdx);
    }
    if (charVal === 'G') {
      greenIndices.push(charIdx);
    }
    if (charVal === 'B') {
      blueIndices.push(charIdx);
    }
  });

  // console.log("Red indices:", redIndices, "Green indices:", greenIndices, "Blue indices:", blueIndices);

  // An alternative, more direct (greedy) approach was considered here.
  // It involved iterating through all possible triplets (first, second, third) and checking conditions.
  // This block is commented out as it's not the chosen algorithm for the final solution.
  /*
  {
    let directCount = 0;
    for (let first = 0; first < totalLength - 2; first++) {
      for (let second = first + 1; second < totalLength - 1; second++) {
        // If the first two characters are the same, skip this pair
        if (charSequence[first] === charSequence[second]) continue;
        const distanceFS = second - first; // Distance between first and second
        for (let third = second + 1; third < totalLength; third++) {
          // If the second and third characters are the same, skip
          if (charSequence[second] === charSequence[third]) continue;
          // If the distance between second and third is the same as first and second, skip
          if (third - second === distanceFS) continue;
          // If the first and third characters are the same, skip
          if (charSequence[first] === charSequence[third]) continue;

          // If all conditions pass, this is a valid triplet
          // console.log('Valid RGB triplet found at indices:', first, second, third);
          directCount++;
        }
      }
    }
    // console.log('Greedy approach total:', directCount);
  }
  */

  // Calculate the total possible combinations of R, G, B without considering distance constraints.
  // This is simply the product of the counts of each color.
  let totalCombinations = redIndices.length * blueIndices.length * greenIndices.length;
  // console.log("Initial total combinations:", totalCombinations);

  // Initialize a counter for triplets that violate the distance constraint (j-i === k-j)
  // and also have distinct characters. These need to be subtracted from the total.
  let invalidTriplets = 0;

  // Iterate through all possible pairs (firstIdx, secondIdx)
  for (let firstIdx = 0; firstIdx < totalLength; firstIdx++) {
    for (let secondIdx = firstIdx + 1; secondIdx < totalLength - 1; secondIdx++) {
      // Calculate the third index based on the distance constraint: k = j + (j - i) = 2j - i
      const thirdIdx = secondIdx * 2 - firstIdx;

      // Check if the calculated third index is within the bounds of the sequence
      if (thirdIdx < totalLength) {
        // console.log("Checking triplet:", firstIdx, secondIdx, thirdIdx,
        //             charSequence[firstIdx], charSequence[secondIdx], charSequence[thirdIdx]);

        // If the characters at firstIdx, secondIdx, and thirdIdx are all distinct,
        // AND they satisfy the distance constraint (which is implicit in how thirdIdx is calculated),
        // then this triplet is an "invalid" one that needs to be subtracted.
        if (charSequence[firstIdx] !== charSequence[secondIdx] &&
            charSequence[secondIdx] !== charSequence[thirdIdx] &&
            charSequence[firstIdx] !== charSequence[thirdIdx]) {
          // console.log('Found an invalid triplet to subtract.');
          invalidTriplets++;
        }
      }
    }
  }

  // The final result is the total combinations minus the invalid triplets.
  console.log(totalCombinations - invalidTriplets);
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
