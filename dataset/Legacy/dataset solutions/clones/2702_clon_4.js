function processInputData(rawData) {
  const dataLines = rawData.split('\n');
  const totalItemCount = Number(dataLines[0]);
  const resourceLevels = dataLines[1].split(' ').map(Number);
  const demandQuantities = dataLines[2].split(' ').map(Number);

  let totalCollectedAmount = 0;

  demandQuantities.forEach((currentDemandQuantity, currentIdx) => {
    const currentResourceA = resourceLevels[currentIdx];
    const nextResourceAIndex = currentIdx + 1;
    const nextResourceAValue = resourceLevels[nextResourceAIndex];

    let collectedFromCurrentA = Math.min(currentDemandQuantity, currentResourceA);
    let remainingDemand = currentDemandQuantity - collectedFromCurrentA;

    let collectedFromNextA = 0;
    let updatedNextResourceA = nextResourceAValue;

    if (remainingDemand > 0) {
      if (nextResourceAValue === undefined) {
        // This scenario corresponds to the original's 'else' block when tmpA2 is undefined.
        // Original behavior: output += tmpA1 + undefined (resulting in NaN), Alist[i+1] = 0.
        collectedFromNextA = undefined; // Propagate NaN to totalCollectedAmount
        updatedNextResourceA = 0; // Set the next resource to 0, potentially extending the array.
      } else {
        collectedFromNextA = Math.min(remainingDemand, nextResourceAValue);
        updatedNextResourceA = nextResourceAValue - collectedFromNextA;
      }
    }

    totalCollectedAmount += collectedFromCurrentA + collectedFromNextA;
    resourceLevels[nextResourceAIndex] = updatedNextResourceA;
  });

  console.log(totalCollectedAmount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
