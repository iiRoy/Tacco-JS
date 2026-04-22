'use strict';
const UtilityOperations = {
  processGridChallenge: (sourceMaterial) => {
    const processedSegments = sourceMaterial.trim().split('\n');
    const [rowDimension, colDimension, targetHashCount] = processedSegments[0].split(' ').map(Number);

    const booleanMatrix = processedSegments.slice(1).map(lineContent =>
      Array.from(lineContent).map(charSymbol => charSymbol === '#')
    );

    const produceAllIndexSubsets = (totalElements) => {
      const allIndices = Array.from({ length: totalElements }, (_, idx) => idx);

      const generateRecursive = (currentElementsList) => {
        if (currentElementsList.length === 0) {
          return [new Set()];
        }

        const firstElement = currentElementsList[0];
        const remainingElements = currentElementsList.slice(1);

        const subsetsExcludingFirst = generateRecursive(remainingElements);

        const subsetsIncludingFirst = subsetsExcludingFirst.map(existingSet => {
          const newSetWithFirst = new Set(existingSet);
          newSetWithFirst.add(firstElement);
          return newSetWithFirst;
        });

        return [...subsetsExcludingFirst, ...subsetsIncludingFirst];
      };

      return generateRecursive(allIndices);
    };

    const potentialRowKeepers = produceAllIndexSubsets(rowDimension);
    const potentialColKeepers = produceAllIndexSubsets(colDimension);

    let finalAccumulatedResult = 0;

    finalAccumulatedResult = potentialRowKeepers.reduce((currentTotalFromRows, selectedRowIndices) => {
      return currentTotalFromRows + potentialColKeepers.reduce((currentTotalFromCols, selectedColIndices) => {
        let currentIterationHashTally = 0;

        for (let rIdx = 0; rIdx < rowDimension; rIdx++) {
          if (!selectedRowIndices.has(rIdx)) {
            continue;
          }
          for (let cIdx = 0; cIdx < colDimension; cIdx++) {
            if (!selectedColIndices.has(cIdx)) {
              continue;
            }
            if (booleanMatrix[rIdx][cIdx]) {
              currentIterationHashTally++;
            }
          }
        }
        return currentTotalFromCols + (currentIterationHashTally === targetHashCount ? 1 : 0);
      }, 0);
    }, 0);

    console.log(finalAccumulatedResult);
  }
};