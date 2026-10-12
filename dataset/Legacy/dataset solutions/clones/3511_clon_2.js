function ProcessInput(rawData) {
  // Split the entire input string into individual lines
  let parsedLines = rawData.split('\n');

  // The first line contains the total number of elements, but it's not directly used in the core logic
  const totalElements = Number(parsedLines[0]);

  // The second line contains space-separated string representations of elements
  let elementStrings = parsedLines[1].split(' ');

  // This map operation is present in the original but its result is not assigned,
  // so it effectively does nothing to 'elementStrings'. We preserve this behavior.
  elementStrings.map(item => Number(item));

  // A helper function to determine if a list consists of mostly identical items
  function checkHomogeneity(inputList) {
    let firstItem = ''; // Stores the initial element for comparison
    let matchCount = 0; // Counts how many elements match the first one

    // Iterate through the provided list
    for (let currentIdx = 0; currentIdx < inputList.length; currentIdx++) {
      // For the very first element, initialize the comparison buffer
      if (currentIdx === 0) {
        firstItem = inputList[0];
      }
      // If the current element matches the first one, increment the counter
      if (firstItem === inputList[currentIdx]) {
        matchCount++;
      }
    }
    return matchCount; // Return the total count of matching elements
  }

  // Perform an initial check on the entire array of elements
  const homogeneityCount = checkHomogeneity(elementStrings);

  // If all elements are identical, a specific calculation is performed
  if (homogeneityCount === elementStrings.length) {
    console.log("%d", parseInt(elementStrings.length / 2, 10));
    return; // Exit early as per original logic
  }

  // Another specific condition for early exit, based on homogeneity and length
  // Note: homogeneityCount === 1 is always true for non-empty arrays,
  // so this effectively checks if elementStrings.length >= 4
  if (homogeneityCount === 1 && elementStrings.length >= 4) {
    console.log("%d", parseInt(elementStrings.length / 2, 10));
    return; // Exit early as per original logic
  }

  // Initialize maps to store frequencies of elements at even and odd indices
  let evenIndexFrequencies = new Map(); // Frequencies for elements at 0, 2, 4... indices
  let oddIndexFrequencies = new Map(); // Frequencies for elements at 1, 3, 5... indices

  // Populate the frequency maps by iterating through the element strings
  for (let currentIdx = 0; currentIdx < elementStrings.length; currentIdx++) {
    if (currentIdx % 2 === 0) {
      // For even indices
      let currentCount = evenIndexFrequencies.get(elementStrings[currentIdx]);
      if (!currentCount) {
        currentCount = 0; // If not found, initialize count to 0
        evenIndexFrequencies.set(elementStrings[currentIdx], currentCount);
      }
      currentCount++; // Increment the count
      evenIndexFrequencies.set(elementStrings[currentIdx], currentCount);
    } else {
      // For odd indices
      let currentCount = oddIndexFrequencies.get(elementStrings[currentIdx]);
      if (!currentCount) {
        currentCount = 0; // If not found, initialize count to 0
        oddIndexFrequencies.set(elementStrings[currentIdx], currentCount);
      }
      currentCount++; // Increment the count
      oddIndexFrequencies.set(elementStrings[currentIdx], currentCount);
    }
  }

  // A function to calculate the minimum replacements needed for a given frequency map
  function calculateMinReplacements(frequencyMap) {
    let countsArray = []; // Array to hold just the frequency counts
    let replacementsNeeded = 0; // Accumulator for replacements

    // Extract all frequency values from the map
    for (let entry of frequencyMap) {
      countsArray.push(entry[1]); // The second element of the entry is the count
    }

    // If there are two or more distinct elements (frequencies)
    if (countsArray.length >= 2) {
      // Sort the frequencies in descending order
      countsArray.sort((valA, valB) => valB - valA);
      // Sum all frequencies except the largest one
      for (let i = 1; i < countsArray.length; i++) {
        replacementsNeeded += countsArray[i];
      }
    } else if (countsArray.length <= 1) {
      // If there's one or zero distinct elements, no replacements are needed
      replacementsNeeded = 0;
    }
    return replacementsNeeded;
  }

  // Calculate replacements for even-indexed elements
  let totalReplacements = calculateMinReplacements(evenIndexFrequencies);
  // Add replacements for odd-indexed elements
  totalReplacements += calculateMinReplacements(oddIndexFrequencies);

  // Output the final calculated total replacements
  console.log("%d", totalReplacements);
}

// This part handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
