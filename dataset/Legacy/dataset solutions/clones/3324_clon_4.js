'use strict';

const processInputData = (rawTextContent) => {
  const contentLines = rawTextContent.trim().split(/\n/);
  const totalExperimentCount = Number(contentLines[0]);
  const successRateSequence = contentLines[1].split(/\s+/).map(Number);
  return { totalExperimentCount, successRateSequence };
};

const constructInitialProbabilityTable = (experimentCount) => {
  const tableStructure = Array.from({ length: experimentCount + 3 }, (_, rowIndex) =>
    Array.from({ length: rowIndex + 1 }, () => 0)
  );
  tableStructure[2][1] = 1;
  return tableStructure;
};

const calculateFullProbabilityTable = (baseTable, experimentCount, ratesArray) => {
  return Array.from({ length: experimentCount }, (_, k) => k + 3).reduce((currentTableState, currentRowIndex) => {
    const currentRowCalculations = Array.from({ length: currentRowIndex + 1 }, (_, successOutcomeIndex) => {
      if (successOutcomeIndex === 0 || successOutcomeIndex > currentRowIndex - 1) {
        return 0;
      }

      const currentTrialSuccessProbability = ratesArray[currentRowIndex - 3];
      const previousRowSuccessProbability = currentTableState[currentRowIndex - 1][successOutcomeIndex - 1];
      const previousRowNoSuccessProbability = currentTableState[currentRowIndex - 1][successOutcomeIndex];

      return currentTrialSuccessProbability * previousRowSuccessProbability + (1 - currentTrialSuccessProbability) * previousRowNoSuccessProbability;
    });
    currentTableState[currentRowIndex] = currentRowCalculations;
    return currentTableState;
  }, baseTable);
};

const aggregateFinalProbability = (completedTable, experimentCount) => {
  const lowerBoundForAggregation = (experimentCount + 3) / 2;
  const upperBoundForAggregation = experimentCount + 1;

  const relevantIndices = Array.from(
    { length: Math.floor(upperBoundForAggregation - lowerBoundForAggregation + 1) },
    (_, k) => lowerBoundForAggregation + k
  );

  return relevantIndices.reduce((accumulatedSum, currentColumnIndex) => {
    return accumulatedSum + completedTable[experimentCount + 2][currentColumnIndex];
  }, 0);
};

const executeProbabilityAnalysis = (sourceInput) => {
  const { totalExperimentCount, successRateSequence } = processInputData(sourceInput);

  const initialProbabilityDistribution = constructInitialProbabilityTable(totalExperimentCount);

  const finalProbabilityDistribution = calculateFullProbabilityTable(
    initialProbabilityDistribution,
    totalExperimentCount,
    successRateSequence
  );

  const overallResultProbability = aggregateFinalProbability(finalProbabilityDistribution, totalExperimentCount);

  console.log(overallResultProbability);
};

executeProbabilityAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));
