function processInputData(rawData) {
  const lineSegments = rawData.split('\n');

  const firstLineValue = lineSegments[0];
  const blueItemCount = parseInt(firstLineValue, 10);

  const redItemCountLineIndex = blueItemCount + 1;
  const redItemCountValue = lineSegments[redItemCountLineIndex];
  const redItemCount = parseInt(redItemCountValue, 10);

  const itemTallies = {};
  let maxDifference = undefined;

  const blueItems = lineSegments.slice(1, blueItemCount + 1);

  const redItemsStartIndex = blueItemCount + 2;
  const redItemsEndIndex = blueItemCount + redItemCount + 2;
  const redItems = lineSegments.slice(redItemsStartIndex, redItemsEndIndex);

  for (const currentItem of blueItems) {
    itemTallies[currentItem] = (itemTallies[currentItem] || 0) + 1;
  }

  for (const currentItem of redItems) {
    itemTallies[currentItem] = (itemTallies[currentItem] || 0) - 1;
  }

  for (const tallyKey in itemTallies) {
    const currentTallyValue = itemTallies[tallyKey];
    if (maxDifference === undefined || currentTallyValue > maxDifference) {
      maxDifference = currentTallyValue;
    }
  }

  if (maxDifference < 0) {
    console.log(0);
  } else {
    console.log(maxDifference);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
