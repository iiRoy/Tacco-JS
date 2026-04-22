const processInputData = (rawData) => {
  // The initial raw data is passed into this function.
  let primaryString;
  const processedLines = rawData.split("\n");
  primaryString = processedLines[0];
  let minimumTransformations = -1;


  // Iterate through all possible lowercase characters from 'a' to 'z'
  for (let charCode = "a".charCodeAt(0); charCode <= "z".charCodeAt(0); charCode++) {

    // If the primary string is already uniform with a single character, no transformations needed.
    if ( /^(?:[a-z])\1*$/.test(primaryString) ) {
      minimumTransformations = 0;
      break;
    }

    let currentStringState = primaryString;
    let subsequentString = "";
    const characterToFocus = String.fromCharCode(charCode);
    let transformationsCount = 0;

    // Continue evolving the string until it becomes monochromatic.
    while (true) {

      // Iterate through the current string state to construct the next generation.
      // Each character in the subsequent string is determined by looking at the current and next character of the current string state.
      // If either matches the characterToFocus, then characterToFocus is used. Otherwise, the current character is used.
      for (let charPosition = 0; charPosition < currentStringState.length - 1; charPosition++) {
        if (characterToFocus === currentStringState.charAt(charPosition)) {
          subsequentString += characterToFocus;
        } else if (characterToFocus === currentStringState.charAt(charPosition + 1)) {
          subsequentString += characterToFocus;
        } else {
          subsequentString += currentStringState.charAt(charPosition);
        }
      }

      transformationsCount++;

      // Check if the newly formed string is uniform.
      if ( /^(?:[a-z])\1*$/.test(subsequentString) ) {
        break; // Exit the inner loop if it's uniform.
      }
      currentStringState = subsequentString;
      subsequentString = ""; // Reset for the next iteration.

    }

    // Update the overall minimum transformations if the current count is lower or if it's the first valid count.
    if (minimumTransformations === -1 || minimumTransformations > transformationsCount) {
      minimumTransformations = transformationsCount;
    }

  }
  console.log(minimumTransformations);

};

// This section handles standard input/output and should not be altered.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));