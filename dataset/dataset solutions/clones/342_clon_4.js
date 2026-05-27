function processInputData() {
  const itemDetails = [
    { unit: 200, basePrice: 380, packSize: 5, packDiscount: 0.8 },
    { unit: 300, basePrice: 550, packSize: 4, packDiscount: 0.85 },
    { unit: 500, basePrice: 850, packSize: 3, packDiscount: 0.88 }
  ];

  const calculateItemCost = (count, itemIndex) => {
    const item = itemDetails[itemIndex];
    const fullPacks = Math.floor(count / item.packSize);
    const remaining = count % item.packSize;
    return (fullPacks * item.packSize * item.basePrice * item.packDiscount) + (remaining * item.basePrice);
  };

  function determineMinimumCost(targetWeight) {
    let minTotalCost = Infinity;

    const maxCountType1 = Math.ceil(targetWeight / itemDetails[0].unit) + itemDetails[0].packSize;
    const maxCountType2 = Math.ceil(targetWeight / itemDetails[1].unit) + itemDetails[1].packSize;
    const maxCountType3 = Math.ceil(targetWeight / itemDetails[2].unit) + itemDetails[2].packSize;

    for (let count1 = 0; count1 <= maxCountType1; count1++) {
      for (let count2 = 0; count2 <= maxCountType2; count2++) {
        for (let count3 = 0; count3 <= maxCountType3; count3++) {
          const currentTotalWeight =
            (count1 * itemDetails[0].unit) +
            (count2 * itemDetails[1].unit) +
            (count3 * itemDetails[2].unit);

          if (currentTotalWeight >= targetWeight) {
            const currentCombinationCost =
              calculateItemCost(count1, 0) +
              calculateItemCost(count2, 1) +
              calculateItemCost(count3, 2);

            if (currentCombinationCost < minTotalCost) {
              minTotalCost = currentCombinationCost;
            }
          }
        }
      }
    }
    return minTotalCost;
  }

  let processingFinished = false;
  for (const currentLine of rawDataBuffer) {
    if (currentLine.trim() === '' || processingFinished) {
      continue;
    }
    if (currentLine === '0') {
      processingFinished = true;
      continue;
    }
    console.log(determineMinimumCost(parseInt(currentLine, 10)));
  }
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  rawDataBuffer += dataSegment;
});
process.stdin.on('end', function() {
  rawDataBuffer = rawDataBuffer.split('\n');
  processInputData();
});
