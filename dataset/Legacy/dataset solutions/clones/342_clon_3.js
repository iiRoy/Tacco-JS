function calculateItemCost(itemCount, unitPrice, bundleSize, bundleDiscountFactor) {
  const individualItemsCount = itemCount % bundleSize;
  const numberOfBundles = Math.floor(itemCount / bundleSize);

  const costOfIndividualItems = individualItemsCount * unitPrice;
  const costOfBundles = numberOfBundles * bundleSize * unitPrice * bundleDiscountFactor;

  return costOfIndividualItems + costOfBundles;
}

function executePrimaryLogic() {
  const ITEM_UNIT_PRICES = Object.freeze([380, 550, 850]);
  const ITEM_BUNDLE_SIZES = Object.freeze([5, 4, 3]);
  const ITEM_BUNDLE_DISCOUNT_FACTORS = Object.freeze([0.8, 0.85, 0.88]);

  function calculateMinimumCost(targetWeightGrams) {
    let currentIterationPatterns = [[0, []]]; // [totalWeight, countsArray]
    let minimumCalculatedPrice = Infinity;

    const availableWeightUnits = Object.freeze([200, 300, 500]);

    for (let outerLoopIndex = 0; outerLoopIndex < 3; outerLoopIndex++) {
      const currentWeightUnit = availableWeightUnits[outerLoopIndex];
      let nextIterationPatterns = [];

      while (currentPatternEntry = currentIterationPatterns.shift()) {
        const currentTotalWeight = currentPatternEntry[0];
        const currentCountsArray = currentPatternEntry[1];

        for (let innerLoopCount = 0; ; innerLoopCount++) {
          const potentialWeight = innerLoopCount * currentWeightUnit + currentTotalWeight;
          const newCounts = currentCountsArray.concat(innerLoopCount);
          nextIterationPatterns.push([potentialWeight, newCounts]);
          if (potentialWeight > targetWeightGrams) {
            break;
          }
        }
      }
      currentIterationPatterns = nextIterationPatterns;
    }

    while (currentPatternEntry = currentIterationPatterns.shift()) {
      const currentTotalWeight = currentPatternEntry[0];
      if (currentTotalWeight < targetWeightGrams) {
        continue;
      }

      const currentCountsArray = currentPatternEntry[1];
      let currentCalculatedPrice = 0;

      currentCalculatedPrice += calculateItemCost(
        currentCountsArray[0],
        ITEM_UNIT_PRICES[0],
        ITEM_BUNDLE_SIZES[0],
        ITEM_BUNDLE_DISCOUNT_FACTORS[0]
      );
      currentCalculatedPrice += calculateItemCost(
        currentCountsArray[1],
        ITEM_UNIT_PRICES[1],
        ITEM_BUNDLE_SIZES[1],
        ITEM_BUNDLE_DISCOUNT_FACTORS[1]
      );
      currentCalculatedPrice += calculateItemCost(
        currentCountsArray[2],
        ITEM_UNIT_PRICES[2],
        ITEM_BUNDLE_SIZES[2],
        ITEM_BUNDLE_DISCOUNT_FACTORS[2]
      );

      if (currentCalculatedPrice < minimumCalculatedPrice) {
        minimumCalculatedPrice = currentCalculatedPrice;
      }
    }
    return minimumCalculatedPrice;
  }

  let inputProcessingFinished = false;
  rawInputBuffer.forEach(function(inputLineContent) {
    const trimmedLine = inputLineContent.trim();
    if (trimmedLine === '' || inputProcessingFinished) {
      return;
    }
    const parsedLineValue = Number.parseInt(inputLineContent, 10);
    if (parsedLineValue === 0) {
      inputProcessingFinished = true;
      return;
    }
    console.log(calculateMinimumCost(parsedLineValue));
  });
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawInputBuffer += dataChunk;
});
process.stdin.on('end', function() {
  rawInputBuffer = rawInputBuffer.split('\n');
  executePrimaryLogic();
});
