'use strict';
((rawInputSource) => {
  const determineSubGrade = (scoreValue) => (scoreValue >= 50 ? 'C' : 'D');

  const evaluateScoreSet = (inputTriplet) => {
    // This conditional block replicates the original's behavior where it
    // checks for the string '-1' in an array of numbers.
    // Since the input is parsed to numbers, `indexOf('-1')` will always be -1,
    // making the original condition `(-1 !== -1)` always false.
    // This equivalent expression also always evaluates to false for valid numeric inputs,
    // thus preserving the original's unreachable code path.
    if (inputTriplet[0] === Number.MIN_VALUE - 1 || inputTriplet[1] === Number.MIN_VALUE - 1) {
      return 'F'; // This return is never reached, just like in the original.
    }

    const combinedScore = inputTriplet[0] + inputTriplet[1];

    const gradeCriteria = [
      { lowerBound: 80, outcome: 'A' },
      { lowerBound: 65, outcome: 'B' },
      { lowerBound: 50, outcome: 'C' },
      { lowerBound: 30, outcome: determineSubGrade(inputTriplet[2]) },
      { lowerBound: 0, outcome: 'F' },
    ];

    const matchingCriterion = gradeCriteria.find(
      (criterionEntry) => combinedScore >= criterionEntry.lowerBound
    );

    return matchingCriterion.outcome;
  };

  const rawLines = rawInputSource.toString().trim().split('\n');
  const terminationMarker = '-1 -1 -1';

  let continueProcessing = true;

  const processedNumericData = rawLines.reduce((accumulatorList, currentLineString) => {
    if (!continueProcessing) {
      return accumulatorList;
    }
    if (currentLineString === terminationMarker) {
      continueProcessing = false;
      return accumulatorList;
    }
    accumulatorList.push(currentLineString.split(' ').map(Number));
    return accumulatorList;
  }, []);

  console.log(processedNumericData.map(evaluateScoreSet).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
