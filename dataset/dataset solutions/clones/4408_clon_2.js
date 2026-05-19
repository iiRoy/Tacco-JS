function computeAreaOfRectangle(countOfItems, inputSegments) {
  // Arrange elements in descending order
  inputSegments.sort(function(firstVal, secondVal) {
    if (firstVal > secondVal) {
      return -1;
    }
    if (firstVal < secondVal) {
      return 1;
    }
    return 0;
  });

  // Find two pairs of equal length segments to form the sides of a rectangle
  let lengthOne = 0,
    lengthTwo = 0;
  for (let idx = 0; idx < inputSegments.length - 1; idx++) {
    if (lengthOne !== 0 && lengthTwo !== 0) {
      break; // Both sides found, exit loop
    }

    if (inputSegments[idx] === inputSegments[idx + 1]) {
      if (lengthOne === 0) {
        lengthOne = inputSegments[idx];
      } else {
        lengthTwo = inputSegments[idx];
      }
      idx++; // Skip the next element as it's already paired
    }
  }

  return lengthOne * lengthTwo; // If any side is not found, its value remains 0, resulting in an area of 0
}
