"use strict";

const processInput = (rawData) => {
  const obtainFirstSegment = (sourceString) => Number(sourceString.substring(0, 2));
  const obtainSecondSegment = (sourceString) => Number(sourceString.substring(2));

  const firstNumericValue = obtainFirstSegment(rawData);
  const secondNumericValue = obtainSecondSegment(rawData);

  const determineIfValidMonth = (candidateNumber) => candidateNumber >= 1 && candidateNumber <= 12;

  const firstSegmentIsMonth = determineIfValidMonth(firstNumericValue);
  const secondSegmentIsMonth = determineIfValidMonth(secondNumericValue);

  const resolutionKey = `${firstSegmentIsMonth}_${secondSegmentIsMonth}`;

  const outcomeMapping = {
    'true_true': 'AMBIGUOUS',
    'true_false': 'MMYY',
    'false_true': 'YYMM',
    'false_false': 'NA'
  };

  console.log(outcomeMapping[resolutionKey]);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
