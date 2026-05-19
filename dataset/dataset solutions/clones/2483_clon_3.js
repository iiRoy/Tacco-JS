function ProcessInput(rawData) {
  let lines = rawData.split("\n");
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  const firstLineParts = lines[0].split(' ');
  const itemCount = Number(firstLineParts[0]);
  const maxOperations = Number(firstLineParts[1]);

  const parseAndSortNumericArray = (lineIndex, sortComparator) => {
    return lines[lineIndex].split(' ').map(elementStr => Number(elementStr)).sort(sortComparator);
  };

  const costArray = parseAndSortNumericArray(1, (valA, valB) => valA - valB);
  const factorArray = parseAndSortNumericArray(2, (valA, valB) => valB - valA);

  let lowerBound = 0;
  for (let idx = 0; idx < itemCount; idx++) {
    const currentProduct = costArray[idx] * factorArray[idx];
    lowerBound = Math.max(lowerBound, currentProduct);
  }

  let upperBound = -1;
  let currentMidpoint;
  let requiredOperationsCount;

  while (lowerBound - upperBound > 1) {
    const rawMidValue = (upperBound + lowerBound) / 2;
    currentMidpoint = Math.ceil(rawMidValue);

    requiredOperationsCount = 0;
    for (let idx = 0; idx < itemCount; idx++) {
      const divisionResult = currentMidpoint / factorArray[idx];
      const floorDivisionValue = Math.floor(divisionResult);
      const difference = costArray[idx] - floorDivisionValue;
      requiredOperationsCount += Math.max(0, difference);
    }

    if (requiredOperationsCount <= maxOperations) {
      lowerBound = currentMidpoint;
    } else {
      upperBound = currentMidpoint;
    }
  }

  console.log(lowerBound);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
