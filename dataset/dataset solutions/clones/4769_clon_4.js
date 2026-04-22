'use strict';

const dataAcquirer = (() => {
  const fileSystemUtility = require("fs");
  let storedInputLines = null;
  let currentLineIndex = 0;

  const ensureInputLoaded = () => {
    if (storedInputLines === null) {
      storedInputLines = fileSystemUtility.readFileSync("/dev/stdin", "utf8").split('\n');
    }
  };

  const extractNumericArray = () => {
    ensureInputLoaded();
    if (currentLineIndex >= storedInputLines.length) {
      throw new Error("Source data exhausted.");
    }
    const retrievedLine = storedInputLines[currentLineIndex++];
    return retrievedLine.split(' ').map(textualNumber => Number(textualNumber));
  };

  return {
    obtainNumericSequence: extractNumericArray
  };
})();

function computeAggregatedValue(operationalSettings, numericProgression) {
  const rateFactor = operationalSettings[1];
  const ceilingValue = operationalSettings[2];

  if (numericProgression.length < 2) {
    return 0; 
  }

  const processingResult = numericProgression.slice(1).reduce((stateContainer, currentElement) => {
    const elementalVariation = currentElement - stateContainer.priorElement;
    const individualContribution = Math.min(elementalVariation * rateFactor, ceilingValue);
    
    return {
      accumulatedSum: stateContainer.accumulatedSum + individualContribution,
      priorElement: currentElement
    };
  }, { accumulatedSum: 0, priorElement: numericProgression[0] });

  return processingResult.accumulatedSum;
}

function deliverOutput(finalComputedValue) {
  if (finalComputedValue === true) {
    console.log('Yes');
  } else if (finalComputedValue === false) {
    console.log('No');
  } else {
    console.log(finalComputedValue);
  }
}

const configurationParameters = dataAcquirer.obtainNumericSequence();
const sequenceData = dataAcquirer.obtainNumericSequence();

const totalCalculatedMetric = computeAggregatedValue(configurationParameters, sequenceData);

deliverOutput(totalCalculatedMetric);