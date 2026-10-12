let rawInputData = '';

function determineItemPrice(itemCount, basePrice, bulkThreshold, discountRate) {
    const fullPriceUnits = itemCount % bulkThreshold;
    const discountedBulkUnits = Math.floor(itemCount / bulkThreshold);
    return (fullPriceUnits * basePrice) + (discountedBulkUnits * bulkThreshold * basePrice * discountRate);
}

function calculateMinimumCost(targetWeight) {
    const itemSpecifications = [
        { weight: 200, unitPrice: 380, bulkQuantity: 5, bulkDiscount: 0.8 },
        { weight: 300, unitPrice: 550, bulkQuantity: 4, bulkDiscount: 0.85 },
        { weight: 500, unitPrice: 850, bulkQuantity: 3, bulkDiscount: 0.88 }
    ];

    let overallLowestCost = Infinity;

    const maxCountItemA = Math.floor(targetWeight / itemSpecifications[0].weight);
    const maxCountItemB = Math.floor(targetWeight / itemSpecifications[1].weight);
    const maxCountItemC = Math.floor(targetWeight / itemSpecifications[2].weight);

    for (let countA = 0; countA <= maxCountItemA; countA++) {
        for (let countB = 0; countB <= maxCountItemB; countB++) {
            for (let countC = 0; countC <= maxCountItemC; countC++) {
                const currentCombinedWeight =
                    (countA * itemSpecifications[0].weight) +
                    (countB * itemSpecifications[1].weight) +
                    (countC * itemSpecifications[2].weight);

                if (currentCombinedWeight === targetWeight) {
                    const costForA = determineItemPrice(
                        countA,
                        itemSpecifications[0].unitPrice,
                        itemSpecifications[0].bulkQuantity,
                        itemSpecifications[0].bulkDiscount
                    );
                    const costForB = determineItemPrice(
                        countB,
                        itemSpecifications[1].unitPrice,
                        itemSpecifications[1].bulkQuantity,
                        itemSpecifications[1].bulkDiscount
                    );
                    const costForC = determineItemPrice(
                        countC,
                        itemSpecifications[2].unitPrice,
                        itemSpecifications[2].bulkQuantity,
                        itemSpecifications[2].bulkDiscount
                    );

                    const currentTotalCalculatedCost = costForA + costForB + costForC;

                    if (currentTotalCalculatedCost < overallLowestCost) {
                        overallLowestCost = currentTotalCalculatedCost;
                    }
                }
            }
        }
    }
    return overallLowestCost;
}

function processApplication() {
  const processInputLines = (lines) => {
    let shouldHaltProcessing = false;
    for (const currentInputLine of lines) {
      const cleanedLine = currentInputLine.trim();
      if (cleanedLine === '' || shouldHaltProcessing) {
        continue;
      }
      if (cleanedLine === '0') {
        shouldHaltProcessing = true;
        continue;
      }
      const quantityInGrams = parseInt(cleanedLine, 10);
      console.log(calculateMinimumCost(quantityInGrams));
    }
  };
  processInputLines(rawInputData.split('\n'));
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputData += chunk;
});
process.stdin.on('end', function() {
  processApplication();
});
