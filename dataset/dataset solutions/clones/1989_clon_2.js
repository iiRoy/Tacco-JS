function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  const lineSegments = rawData.split("\n");

  // The target string is the second line of the input
  const targetSequence = lineSegments[1];

  // Initialize a counter for iteration
  let idx = 1;

  // Create an array to store numbers from 1 up to the value of the first line
  let numberCollection = [];
  while (idx <= parseInt(lineSegments[0], 10)) {
    numberCollection.push(idx);
    idx++;
  }

  // Initialize a counter for valid combinations found
  let validCount = 0;

  // Helper function to check if three values are all distinct
  const verifyDistinct = (valA, valB, valC) => {
    return valA !== valB && valB !== valC && valC !== valA;
  };

  // Iterate through all possible combinations of three distinct indices
  numberCollection.forEach((firstIndex) => {
    numberCollection.forEach((secondIndex) => {
      numberCollection.forEach((thirdIndex) => {
        // Check conditions:
        // 1. The characters at (index-1) in the target string must be distinct.
        // 2. The indices must be strictly increasing (first < second < third).
        // 3. The indices must not form an arithmetic progression (second - first != third - second).
        if (
          verifyDistinct(
            targetSequence[firstIndex - 1],
            targetSequence[secondIndex - 1],
            targetSequence[thirdIndex - 1]
          ) &&
          firstIndex < secondIndex &&
          secondIndex < thirdIndex &&
          secondIndex - firstIndex !== thirdIndex - secondIndex
        ) {
          // If all conditions are met, print the combination and increment the counter
          console.log(firstIndex, secondIndex, thirdIndex);
          validCount++;
        }
      });
    });
  });

  // Output the total number of valid combinations found
  console.log(validCount);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
