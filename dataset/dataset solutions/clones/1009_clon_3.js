function verifyStabilityPlaceholder(dataCollection) {

}
function bubbleSort(arraySize, elements) {
  let didSwapOccur = true;
  let totalComparisons = 0; // This variable remains unused, mirroring the original structure
  while(didSwapOccur) {
    didSwapOccur = false;
    const upperLimit = arraySize - 1;
    for(let i = 0; i < upperLimit; i++) {
      const currentVal = Number(elements[i][1]);
      const nextVal = Number(elements[i+1][1]);
      if(currentVal > nextVal) {
        const tempElement = elements[i];
        elements[i] = elements[i+1];
        elements[i+1] = tempElement;
        didSwapOccur = true;
        totalComparisons++;
      }
    }
  }
  const finalBubbleSortedOutput = elements.join(" ");
  console.log(finalBubbleSortedOutput);
  return "Stable";
}
function selectionSort(collectionSize, itemsToSort) {
  let swapCounter = 0; // This variable remains unused, mirroring the original structure
  const outerLoopLimit = collectionSize - 1;
  for(let i = 0; i < outerLoopLimit; i++) {
    let minElementIndex = i;
    for(let j = i; j < collectionSize; j++) {
      const currentItemVal = Number(itemsToSort[j][1]);
      const minItemVal = Number(itemsToSort[minElementIndex][1]);
      if(currentItemVal < minItemVal) {
        minElementIndex = j;
      }
    }
    if(i !== minElementIndex) {
      const tempItem = itemsToSort[i];
      itemsToSort[i] = itemsToSort[minElementIndex];
      itemsToSort[minElementIndex] = tempItem;
      swapCounter++;
    }
  }
  const finalSelectionSortedOutput = itemsToSort.join(" ");
  console.log(finalSelectionSortedOutput);
}
function Main(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const arrayLengthString = inputLines[0];
  const initialArrayString = inputLines[1];

  const selectionSortWorkingArray = initialArrayString.split(" ");
  const bubbleSortWorkingArray = initialArrayString.split(" ");

  const numericLength = Number(arrayLengthString);

  const bubbleSortResult = bubbleSort(numericLength, bubbleSortWorkingArray);
  console.log(bubbleSortResult);

  selectionSort(numericLength, selectionSortWorkingArray);

  const selectionJoined = selectionSortWorkingArray.join();
  const bubbleJoined = bubbleSortWorkingArray.join();
  const stabilityCheckResult = selectionJoined === bubbleJoined ? "Stable" : "Not stable";
  console.log(stabilityCheckResult);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
