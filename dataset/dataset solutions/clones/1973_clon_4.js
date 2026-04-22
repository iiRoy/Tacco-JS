"use strict";
const retrieveAllStreamData = () => new Promise(resolve => {
  let collectedText = '';
  process.stdin.on('data', fragment => { collectedText += fragment; });
  process.stdin.on('end', () => resolve(collectedText));
});

const processStreamContent = (fullText) => {
  let contentUnits = fullText.trim().split(/\s+/);
  let currentUnitIndex = 0;
  return {
    obtainNextValue: () => Number(contentUnits[currentUnitIndex++]),
  };
};

const buildMultiArray = (initialFill, ...dimensions) => {
  const constructLayer = (remainingDimensions) => {
    if (remainingDimensions.length === 0) {
      return initialFill;
    }
    const currentDimensionSize = remainingDimensions[0];
    return Array.from({ length: currentDimensionSize }, () => constructLayer(remainingDimensions.slice(1)));
  };
  return constructLayer(dimensions);
};

const orchestrateCalculation = (inputReader) => {
  const totalElements = inputReader.obtainNextValue();
  const itemCollection = [];
  for (let currentIdx = 0; currentIdx < totalElements; ++currentIdx) {
    itemCollection.push([inputReader.obtainNextValue(), currentIdx]);
  }

  itemCollection.sort((itemA, itemB) => itemB[0] - itemA[0]);

  let dynamicProjection = buildMultiArray(0, totalElements + 1);

  const finalProjection = itemCollection.reduce((currentScores, currentElementTuple, currentIteration) => {
    let futureScores = [...currentScores];

    const elementValue = currentElementTuple[0];
    const elementOriginalPosition = currentElementTuple[1];

    futureScores[currentIteration + 1] = currentScores[currentIteration] + (totalElements - currentIteration - elementOriginalPosition - 1) * elementValue;

    for (let subIteration = currentIteration; subIteration >= 1; --subIteration) {
      const termA = (elementOriginalPosition - (currentIteration - subIteration)) * elementValue;
      const termB = (totalElements - subIteration - elementOriginalPosition) * elementValue;

      const valueOption1 = currentScores[subIteration] + termA;
      const valueOption2 = currentScores[subIteration - 1] + termB;

      futureScores[subIteration] = Math.max(valueOption1, valueOption2);
    }

    futureScores[0] = currentScores[0] + (elementOriginalPosition - currentIteration) * elementValue;

    return futureScores;
  }, dynamicProjection);

  const retrieveMaximum = (valueArray) => {
    let currentMax = -Infinity;
    for (const val of valueArray) {
      if (val > currentMax) {
        currentMax = val;
      }
    }
    return currentMax;
  };

  return retrieveMaximum(finalProjection);
};

retrieveAllStreamData().then(dataContent => {
  const inputHandler = processStreamContent(dataContent);
  const finalOutcome = orchestrateCalculation(inputHandler);
  if (finalOutcome !== undefined) {
    console.log(finalOutcome);
  }
});