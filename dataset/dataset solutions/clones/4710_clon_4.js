'use strict';

function processGameOutcome(inputData) {
  const parseAndExtract = (textLine) => {
    return textLine.split(' ').reduce((acc, currentSegment) => {
      acc.push(parseInt(currentSegment, 10));
      return acc;
    }, []);
  };

  const transformValueForComparison = (initialNumericValue) => {
    return initialNumericValue === 1 ? 14 : initialNumericValue;
  };

  const [firstPlayerCard, secondPlayerCard] = parseAndExtract(inputData.split('\n')[0]);

  const adjustedFirstCard = transformValueForComparison(firstPlayerCard);
  const adjustedSecondCard = transformValueForComparison(secondPlayerCard);

  const comparisonResultIndicator = Math.sign(adjustedFirstCard - adjustedSecondCard);

  const outcomeMapping = {
    '1': 'Alice',
    '-1': 'Bob',
    '0': 'Draw'
  };

  console.log(outcomeMapping[comparisonResultIndicator]);
}

processGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
