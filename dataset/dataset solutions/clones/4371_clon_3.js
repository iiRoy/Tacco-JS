function processInputData(rawData) {
  const NEWLINE_DELIMITER = "\n";

  let workingNumericValues = rawData.split(NEWLINE_DELIMITER).map(Number);

  // The original code extracts the first element (N) but doesn't use it later.
  // We preserve this behavior by capturing it.
  const initialHeaderValue = workingNumericValues[0];

  // The original code performs pop() then shift() on the input array.
  // This effectively removes the first and last elements from the array.
  // We ensure these operations are safe for arrays of various lengths.
  if (workingNumericValues.length > 0) {
    workingNumericValues.pop();
  }
  if (workingNumericValues.length > 0) {
    workingNumericValues.shift();
  }

  let oddFrequencyTracker = [];

  // The original code initializes 'now_j' with the first element of the
  // modified 'input' array, then removes that element from 'input'.
  // We replicate this behavior, including the case where 'input' might be empty,
  // leading to 'undefined' being pushed.
  if (workingNumericValues.length > 0) {
    const firstElementForTracking = workingNumericValues.shift();
    oddFrequencyTracker.push(firstElementForTracking);
  } else {
    // If the array is empty at this point, the original code would push 'undefined'.
    oddFrequencyTracker.push(undefined);
  }

  // Helper function to manage the presence of an element in the collection.
  // This encapsulates the logic of adding an element if not present, or removing it if present.
  const toggleElementInCollection = (collection, item) => {
    const itemPosition = collection.indexOf(item);
    if (itemPosition !== -1) {
      collection.splice(itemPosition, 1); // Remove if found
    } else {
      collection.push(item); // Add if not found
    }
  };

  // Iterate through the remaining numbers in the prepared array.
  workingNumericValues.forEach(elementValue => {
    toggleElementInCollection(oddFrequencyTracker, elementValue);
  });

  console.log(oddFrequencyTracker.length);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
