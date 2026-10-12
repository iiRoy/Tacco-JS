function verifyStability(dataCollection) {
  // This function was empty in the original and is not called.
  // Keeping it empty to match the original structure and contract.
}

function performBubbleSort(dataLength, dataArray) {
  let swappedInPass;
  for (let passIndex = 0; passIndex < dataLength - 1; passIndex++) {
    swappedInPass = false;
    for (let elementIndex = 0; elementIndex < dataLength - 1 - passIndex; elementIndex++) {
      if (Number(dataArray[elementIndex][1]) > Number(dataArray[elementIndex + 1][1])) {
        [dataArray[elementIndex], dataArray[elementIndex + 1]] = [dataArray[elementIndex + 1], dataArray[elementIndex]];
        swappedInPass = true;
      }
    }
    if (!swappedInPass) {
      break; // Array is sorted, no need for further passes
    }
  }
  console.log(dataArray.join(" "));
  return "Stable";
}

function executeSelectionSort(dataLength, dataArray) {
  for (let currentPosition = 0; currentPosition < dataLength - 1; currentPosition++) {
    // Find the index of the minimum element in the remaining unsorted portion
    const minimumRelativeIndex = dataArray
      .slice(currentPosition, dataLength) // Get the unsorted part
      .reduce((minIdxAcc, _, relativeIdx) => {
        const absoluteMinIdx = currentPosition + minIdxAcc;
        const absoluteCurrentIdx = currentPosition + relativeIdx;
        if (Number(dataArray[absoluteCurrentIdx][1]) < Number(dataArray[absoluteMinIdx][1])) {
          return relativeIdx; // Update relative index of minimum
        }
        return minIdxAcc; // Keep current relative minimum index
      }, 0); // Initial relative minimum index is 0 (first element of slice)

    const absoluteMinimumIndex = currentPosition + minimumRelativeIndex;

    if (currentPosition !== absoluteMinimumIndex) {
      // Swap the element at currentPosition with the found minimum element
      [dataArray[currentPosition], dataArray[absoluteMinimumIndex]] = [dataArray[absoluteMinimumIndex], dataArray[currentPosition]];
    }
  }
  console.log(dataArray.join(" "));
}

function processInputAndSort(rawInput) {
  const [firstLineContent, secondLineContent] = rawInput.split("\n");
  const dataSize = Number(firstLineContent);

  const bubbleSortTarget = secondLineContent.split(" ");
  const selectionSortTarget = secondLineContent.split(" ");

  console.log(performBubbleSort(dataSize, bubbleSortTarget));
  executeSelectionSort(dataSize, selectionSortTarget);

  console.log(selectionSortTarget.join() === bubbleSortTarget.join() ? "Stable" : "Not stable");
}

processInputAndSort(require("fs").readFileSync("/dev/stdin", "utf8"));
