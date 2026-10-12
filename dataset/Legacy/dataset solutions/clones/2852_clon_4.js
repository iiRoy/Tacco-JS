const createInputProcessor = (sourceText) => {
  const allLines = sourceText.trim().split("\n");
  let currentLineIndex = 0;
  let currentLineTokens = [];

  const getSingleValue = (returnAsString = false) => {
    if (currentLineTokens.length === 0) {
      if (currentLineIndex >= allLines.length) {
        throw new Error("Attempted to read past end of input.");
      }
      currentLineTokens = allLines[currentLineIndex].split(" ").reverse();
      currentLineIndex++;
    }
    const token = currentLineTokens.pop();
    return returnAsString ? token : Number(token);
  };

  const getLineValues = (returnAsStrings = false) => {
    if (currentLineIndex >= allLines.length) {
      throw new Error("Attempted to read past end of input.");
    }
    const line = allLines[currentLineIndex++];
    const tokens = line.split(" ");
    return returnAsStrings ? tokens : tokens.map(Number);
  };

  const getMultiLineValues = (count, returnAsStrings = false) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(getLineValues(returnAsStrings));
    }
    return result;
  };

  const getRawLines = (count, returnAsStrings = false) => {
    const result = allLines.slice(currentLineIndex, currentLineIndex + count);
    currentLineIndex += count;
    return returnAsStrings ? result : result.map(Number);
  };

  return {
    getSingleValue,
    getLineValues,
    getMultiLineValues,
    getRawLines,
  };
};

const createMultiDimArray = (dimensions, valueInitializer) => {
  if (dimensions.length === 0) {
    return valueInitializer();
  }
  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);
  return Array.from({ length: currentDimensionSize }, () =>
    createMultiDimArray(remainingDimensions, valueInitializer)
  );
};

const inputProcessor = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
  const initialAmount = inputProcessor.getSingleValue();
  const costsArray = inputProcessor.getLineValues();
  const profitsArray = inputProcessor.getLineValues();

  const firstOperationItems = costsArray.reduce((acc, currentCost, idx) => {
    if (currentCost < profitsArray[idx]) {
      acc.push({ cost: currentCost, profit: profitsArray[idx] });
    }
    return acc;
  }, []);

  const intermediateResult = calculateMaxProfit(initialAmount, firstOperationItems);

  const secondOperationItems = costsArray.reduce((acc, currentCost, idx) => {
    if (profitsArray[idx] < currentCost) {
      acc.push({ cost: profitsArray[idx], profit: currentCost });
    }
    return acc;
  }, []);

  return calculateMaxProfit(intermediateResult, secondOperationItems);
}

function calculateMaxProfit(currentFunds, itemPairs) {
  const numberOfItems = itemPairs.length;

  if (numberOfItems === 0) {
    return currentFunds;
  }

  if (numberOfItems === 1) {
    const { cost: singleCost, profit: singleProfit } = itemPairs[0];
    const purchaseQuantity = Math.floor(currentFunds / singleCost);
    return currentFunds - purchaseQuantity * singleCost + purchaseQuantity * singleProfit;
  }

  if (numberOfItems === 3) {
    let maxFundsForSpentAmount = new Map([[0, currentFunds]]);

    itemPairs.forEach(({ cost: itemCost, profit: itemProfit }) => {
      const nextMaxFundsForSpentAmount = new Map(maxFundsForSpentAmount);

      for (const [spentAmount, currentTotal] of maxFundsForSpentAmount.entries()) {
        let tempSpent = spentAmount;
        let tempTotal = currentTotal;

        while (tempTotal >= itemCost) {
          tempSpent += itemCost;
          tempTotal -= itemCost;
          tempTotal += itemProfit;

          if (tempSpent <= currentFunds) {
            nextMaxFundsForSpentAmount.set(
              tempSpent,
              Math.max(nextMaxFundsForSpentAmount.get(tempSpent) || -Infinity, tempTotal)
            );
          }
        }
      }
      maxFundsForSpentAmount = nextMaxFundsForSpentAmount;
    });

    return Math.max(...Array.from(maxFundsForSpentAmount.values()));
  }

  const [primaryItem, secondaryItem] = itemPairs.sort(
    (a, b) => (b.profit - b.cost) / b.cost - (a.profit - a.cost) / a.cost
  );

  let overallMaxResult = 0;
  const maxPrimaryItemCount = Math.floor(currentFunds / primaryItem.cost);

  let currentPrimaryItemCount = maxPrimaryItemCount;
  let iterationLimitCounter = 0;

  while (currentPrimaryItemCount >= 0 && iterationLimitCounter <= 5000) {
    const fundsAfterPrimary = currentFunds - currentPrimaryItemCount * primaryItem.cost;
    const secondaryItemCount = Math.floor(fundsAfterPrimary / secondaryItem.cost);

    const remainingFundsAfterAllPurchases = fundsAfterPrimary - secondaryItemCount * secondaryItem.cost;
    const totalFundsAfterOperations =
      remainingFundsAfterAllPurchases +
      currentPrimaryItemCount * primaryItem.profit +
      secondaryItemCount * secondaryItem.profit;

    overallMaxResult = Math.max(overallMaxResult, totalFundsAfterOperations);

    currentPrimaryItemCount--;
    iterationLimitCounter++;
  }

  return overallMaxResult;
}
