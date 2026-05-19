function ProcessInput(inputStringData) {
  // Split the input string by newline characters to get individual lines.
  let processedLines = inputStringData.split("\n");

  // The first line contains the integer 'n'. Convert it to a number.
  const lengthOfSubstring = +processedLines[0];

  // The second line contains the string 's'.
  let originalSubstring = processedLines[1];

  // Create a reversed version of the original substring.
  const reversedSubstring = originalSubstring.split("").reverse().join("");

  // Calculate the total number of combinations (2^n).
  const totalCombinations = 1 << lengthOfSubstring;

  // Initialize two maps (objects) to store counts of generated string pairs.
  const firstMap = {};
  const secondMap = {};

  // Iterate through all possible combinations from 0 to 2^n - 1.
  for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) {
    // Initialize temporary strings for building parts of the combinations.
    let firstPartCombined = "";
    let secondPartCombined = "";
    let firstPartReversedCombined = "";
    let secondPartReversedCombined = "";

    // Iterate through each character position in the substring.
    for (let charIndex = 0; charIndex < lengthOfSubstring; charIndex++) {
      // Check if the j-th bit is set in the current combination index.
      if (combinationIndex & (1 << charIndex)) {
        // If the bit is set, append characters from original and reversed substrings to 'first' parts.
        firstPartCombined += originalSubstring[charIndex];
        firstPartReversedCombined += reversedSubstring[charIndex];
      } else {
        // If the bit is not set, append characters to 'second' parts.
        secondPartCombined += originalSubstring[charIndex];
        secondPartReversedCombined += reversedSubstring[charIndex];
      }
    }

    // Combine the two parts with a comma separator to form the map keys.
    firstPartCombined += "," + secondPartCombined;
    firstPartReversedCombined += "," + secondPartReversedCombined;

    // Increment the count for the generated key in the first map.
    if (!firstMap[firstPartCombined]) {
      firstMap[firstPartCombined] = 1;
    } else {
      firstMap[firstPartCombined]++;
    }

    // Increment the count for the generated key in the second map.
    if (!secondMap[firstPartReversedCombined]) {
      secondMap[firstPartReversedCombined] = 1;
    } else {
      secondMap[firstPartReversedCombined]++;
    }
  }

  // Initialize a variable to store the final calculated result.
  let finalResult = 0;

  // Iterate over the keys in the first map.
  for (const mapKey in firstMap) {
    // If the current key does not exist in the second map, skip it.
    if (!secondMap[mapKey]) {
      continue;
    }
    // Add the product of counts from both maps for the common key to the total result.
    finalResult += firstMap[mapKey] * secondMap[mapKey];
  }

  // Output the final calculated result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
