function processInputData(inputString) {
  const inputLines = inputString.split("\n");
  const initialLine = inputLines[0]; // Corresponds to firstRow
  const dataElements = inputLines[1].split(" ").map(Number); // Corresponds to secondRow, converted to numbers

  const exitWithError = () => {
    console.log("No");
    return;
  };

  const elementCount = dataElements.length;

  // First pass: check for specific decrements and order
  for (let currentIndex = 0; currentIndex < elementCount - 1; currentIndex++) {
    const currentElementValue = dataElements[currentIndex];
    const nextElementValue = dataElements[currentIndex + 1];

    // Original: if( secondRow[i+1] - secondRow[i] < -1 )
    // Equivalent: if (nextElementValue < currentElementValue - 1)
    if (nextElementValue < currentElementValue - 1) {
      return exitWithError();
    }

    // Original: if( secondRow[i+1] - secondRow[i] === -1 )
    // Equivalent: if (nextElementValue === currentElementValue - 1)
    if (nextElementValue === currentElementValue - 1) {
      dataElements[currentIndex] = currentElementValue - 1; // Modify the array in place

      // Original: if( secondRow[i-1] > secondRow[i]){
      // This check only applies if currentIndex > 0.
      // If currentIndex is 0, dataElements[currentIndex - 1] is undefined, and undefined > any_number is false.
      // So, the original behavior is to only check when currentIndex > 0.
      if (currentIndex > 0 && dataElements[currentIndex - 1] > dataElements[currentIndex]) {
        return exitWithError();
      }
    }
  }

  // Output the modified array state, as per original behavior
  console.log(dataElements);

  // Second pass: ensure non-decreasing order after modifications
  for (let checkIndex = 0; checkIndex < elementCount - 1; checkIndex++) {
    const currentCheckValue = dataElements[checkIndex];
    const nextCheckValue = dataElements[checkIndex + 1];

    // Original: if( secondRow[i+1] < secondRow[i] )
    if (nextCheckValue < currentCheckValue) {
      return exitWithError();
    }
  }

  console.log("Yes");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
