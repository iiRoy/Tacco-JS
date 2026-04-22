const fileSystem = require('fs');

function executeProgram() {
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInputContent.split('\n');

  const productSpecifications = [
    { weightValue: 200, unitPrice: 380, discountThreshold: 5, discountRate: 0.8 },
    { weightValue: 300, unitPrice: 550, discountThreshold: 4, discountRate: 0.85 },
    { weightValue: 500, unitPrice: 850, discountThreshold: 3, discountRate: 0.88 }
  ];

  function evaluateItemCharge(quantityOfItem, specification) {
    const numberOfDiscountedPacks = Math.floor(quantityOfItem / specification.discountThreshold);
    const remainingIndividualUnits = quantityOfItem % specification.discountThreshold;
    return numberOfDiscountedPacks * specification.discountThreshold * specification.unitPrice * specification.discountRate + remainingIndividualUnits * specification.unitPrice;
  }

  function computeBestValue(targetMass) {
    let finalMinimumValue = Number.POSITIVE_INFINITY;

    const maxCountForProductA = Math.ceil(targetMass / productSpecifications[0].weightValue) + productSpecifications[0].discountThreshold;
    const maxCountForProductB = Math.ceil(targetMass / productSpecifications[1].weightValue) + productSpecifications[1].discountThreshold;
    const maxCountForProductC = Math.ceil(targetMass / productSpecifications[2].weightValue) + productSpecifications[2].discountThreshold;

    for (let itemQuantityA = 0; itemQuantityA <= maxCountForProductA; itemQuantityA++) {
      for (let itemQuantityB = 0; itemQuantityB <= maxCountForProductB; itemQuantityB++) {
        for (let itemQuantityC = 0; itemQuantityC <= maxCountForProductC; itemQuantityC++) {
          const currentCalculatedMass = itemQuantityA * productSpecifications[0].weightValue +
                                        itemQuantityB * productSpecifications[1].weightValue +
                                        itemQuantityC * productSpecifications[2].weightValue;

          if (currentCalculatedMass >= targetMass) {
            const currentTotalCharge = evaluateItemCharge(itemQuantityA, productSpecifications[0]) +
                                       evaluateItemCharge(itemQuantityB, productSpecifications[1]) +
                                       evaluateItemCharge(itemQuantityC, productSpecifications[2]);

            if (currentTotalCharge < finalMinimumValue) {
              finalMinimumValue = currentTotalCharge;
            }
          }
        }
      }
    }
    return finalMinimumValue;
  }

  let haltProcessing = false;
  for (const currentInputLine of inputLines) {
    const sanitizedLine = currentInputLine.trim();
    if (sanitizedLine === '' || haltProcessing) {
      continue;
    }

    const numericValue = Number.parseInt(sanitizedLine, 10);
    if (numericValue === 0) {
      haltProcessing = true;
      continue;
    }
    console.log(computeBestValue(numericValue));
  }
}

executeProgram();