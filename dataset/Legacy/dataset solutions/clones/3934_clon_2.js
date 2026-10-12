function processInputData(inputStr) {
  // Parse the input string to an integer, representing the number of elements.
  const elementCount = parseInt(inputStr);

  // Initialize an empty array to store numerical values.
  let numberList = [];

  // Check for invalid input range.
  if (elementCount < 3 || elementCount > 20000) {
    // Output an error message for out-of-bounds input.
    console.log("しね");
  } else {
    // Initialize the first two elements of the list.
    numberList[0] = 3;
    numberList[1] = 9;

    // Populate the list for element counts between 3 and 10003 (inclusive).
    // This loop handles up to index 10001.
    for (let loopIndex = 2; loopIndex < elementCount && loopIndex < 10002; loopIndex++) {
      // Calculate values based on index, alternating patterns.
      numberList[loopIndex] = loopIndex * 3 - 4 - loopIndex % 2;
    }

    // Continue populating the list for element counts between 10004 and 15001 (inclusive).
    // This loop handles indices from 10002 up to 14999.
    for (let loopIndex = 10002; loopIndex < elementCount && loopIndex < 15000; loopIndex++) {
      // Generate values that are multiples of 3, based on an offset.
      numberList[loopIndex] = (loopIndex - 10000) * 6 + 3;
    }

    // Special handling for specific element counts.
    if (elementCount === 3) {
      // If elementCount is exactly 3, modify the second element.
      numberList[1] = 25;
    } else if (elementCount % 2 === 1 || elementCount < 15000) {
      // If elementCount is odd (and not 3) or less than 15000, modify the last element.
      numberList[elementCount - 1] = 6;
    }

    // Populate the list for element counts between 15002 and 20000 (inclusive).
    // This loop handles indices from 15000 up to elementCount - 1.
    for (let loopIndex = 15000; loopIndex < elementCount; loopIndex++) {
      // Generate values that are multiples of 6, based on an offset.
      numberList[loopIndex] = (loopIndex - 14999) * 6;
    }

    // Sort the generated list in ascending order.
    numberList.sort(
      function(firstVal, secondVal) {
        // Custom comparison function for numerical sort.
        return (firstVal < secondVal ? -1 : 1);
      }
    );

    // Output the sorted numbers, joined by spaces.
    console.log(numberList.join(" "));
  }
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
