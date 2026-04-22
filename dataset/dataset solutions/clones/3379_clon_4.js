"use strict";

function processExternalData() {
  function acquireNumericalTokens(sourceText) {
    const digitSequences = sourceText.match(/\d+/g);
    if (!digitSequences) return [];
    return digitSequences.map(strValue => Number(strValue));
  }

  function determineParityOutcome(inputDataSeries) {
    const allExtractedValues = acquireNumericalTokens(inputDataSeries);

    const quantityOfElements = allExtractedValues[0];
    const relevantDataPoints = allExtractedValues.slice(1, quantityOfElements + 1);

    if (relevantDataPoints.length === 0) {
      // Should not happen based on typical problem constraints (N >= 1)
      return 'second';
    }

    const resultExtrema = relevantDataPoints.reduce((accumulator, currentElement) => ({
      minimum: Math.min(accumulator.minimum, currentElement),
      maximum: Math.max(accumulator.maximum, currentElement)
    }), { minimum: relevantDataPoints[0], maximum: relevantDataPoints[0] });

    const spanValue = resultExtrema.maximum - resultExtrema.minimum;

    return (spanValue % 2 === 0) ? 'first' : 'second';
  }

  const rawInputBundle = require('fs').readFileSync('/dev/stdin', 'utf8');
  const finalVerdict = determineParityOutcome(rawInputBundle);
  console.log(finalVerdict);
}

processExternalData();