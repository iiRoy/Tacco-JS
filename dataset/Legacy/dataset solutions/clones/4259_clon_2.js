function ProcessInput(rawData) {
  // Split the entire input string into individual lines
  let lineData = rawData.split("\n");

  // The first line contains the count of elements for each array
  let itemCount = lineData[0];

  // Temporary arrays to hold string representations from input lines
  let tempArrA = lineData[1].split(" ");
  let tempArrB = lineData[2].split(" ");
  let tempArrC = lineData[3].split(" ");

  // Initialize three arrays with the determined size, filled with zeros
  let arrayOne = new Array(itemCount).fill(0);
  let arrayTwo = new Array(itemCount).fill(0);
  let arrayThree = new Array(itemCount).fill(0);

  // Populate arrayOne by parsing integers from tempArrA
  for (let idxA = 0; idxA < itemCount; idxA++) {
    arrayOne[idxA] = parseInt(tempArrA[idxA]);
  }

  // Populate arrayTwo by parsing integers from tempArrB
  for (let idxA = 0; idxA < itemCount; idxA++) {
    arrayTwo[idxA] = parseInt(tempArrB[idxA]);
  }

  // Populate arrayThree by parsing integers from tempArrC
  for (let idxA = 0; idxA < itemCount; idxA++) {
    arrayThree[idxA] = parseInt(tempArrC[idxA]);
  }

  // Initialize a counter for the final result
  let finalCount = 0;

  // Iterate through arrayOne
  for (let idxOuter = 0; idxOuter < itemCount; idxOuter++) {
    // Iterate through arrayTwo
    for (let idxMiddle = 0; idxMiddle < itemCount; idxMiddle++) {
      // Check the first condition: element from arrayOne is less than element from arrayTwo
      if (arrayOne[idxOuter] < arrayTwo[idxMiddle]) {
        // If the first condition is met, iterate through arrayThree
        for (let idxInner = 0; idxInner < itemCount; idxInner++) {
          // Check the second condition: element from arrayTwo is less than element from arrayThree
          if (arrayTwo[idxMiddle] < arrayThree[idxInner]) {
            // If both conditions are met, increment the final counter
            finalCount++;
          }
        }
      }
    }
  }

  // Output the calculated final count to the console
  console.log('%s', finalCount);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
