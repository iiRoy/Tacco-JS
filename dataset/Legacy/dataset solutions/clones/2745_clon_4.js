"use strict";
(function(rawInputText){
  const processInputData = (textPayload) => {
    const parsedNumbers = textPayload.trim().split(/\s+/).map(Number);
    const initialValueCount = parsedNumbers.shift();
    return { initialValueCount, remainingValues: parsedNumbers };
  };

  const { initialValueCount: elementQuantity, remainingValues: dataCollection } = processInputData(rawInputText);

  const isQuantityDivisibleByThree = (elementQuantity % 3 === 0);
  const areAllDataElementsZero = (dataCollection.every(item => item === 0));

  let finalOutcome = "No";

  if (!isQuantityDivisibleByThree && !areAllDataElementsZero) {
    finalOutcome = "No";
  } else if (areAllDataElementsZero) {
    finalOutcome = "Yes";
  } else {
    // Core processing logic when elementQuantity is divisible by 3 and not all elements are zero
    let uniqueElementRegistry = new Map(); // Maps element value -> index in elementCounts
    let elementCounts = [0, 0, 0]; // Stores counts for up to 3 unique elements
    let distinctElementOrder = []; // Stores the unique elements in order of discovery

    let dataPointerIndex = 0; // Index for iterating through dataCollection
    let mainLoopCounter = 0; // Counter for the N iterations

    while (mainLoopCounter < elementQuantity) {
      if (distinctElementOrder.length > 3) {
        finalOutcome = "No";
        break;
      }

      const currentDataItem = dataCollection[dataPointerIndex];

      if (uniqueElementRegistry.has(currentDataItem)) {
        const existingElementIndex = uniqueElementRegistry.get(currentDataItem);
        elementCounts[existingElementIndex]++;
        dataPointerIndex++;
        mainLoopCounter++;
      } else {
        if (distinctElementOrder.length === 3) {
          finalOutcome = "No";
          break;
        }
        distinctElementOrder.push(currentDataItem);
        const newElementIndex = distinctElementOrder.length - 1;
        uniqueElementRegistry.set(currentDataItem, newElementIndex);
        elementCounts[newElementIndex]++;
        dataPointerIndex++;
        mainLoopCounter++;
      }
    }

    if (finalOutcome !== "No") {
      if (elementCounts[0] === elementCounts[1] && elementCounts[1] === elementCounts[2]) {
        finalOutcome = "Yes";
      } else {
        finalOutcome = "No";
      }
    }
  }

  console.log(finalOutcome);

})(require("fs").readFileSync("/dev/stdin","utf8"));
