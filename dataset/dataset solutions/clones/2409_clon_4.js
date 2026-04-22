'use strict';

const getPartialSum = (collection, limitExclusive) => {
  if (limitExclusive <= 0) {
    return 0;
  }
  if (limitExclusive > collection.length) {
    return NaN;
  }
  return collection.slice(0, limitExclusive).reduce((accumulator, value) => accumulator + value, 0);
};

const processSegments = dataStream => {
  const allLines = dataStream.trim().split('\n');
  const segmentStrings = allLines[1].split(' ');

  const numericalSegments = segmentStrings.map(s => parseInt(s, 10));

  const grandTotal = numericalSegments.reduce((sum, num) => sum + num, 0);
  const separationPoint = grandTotal / 2;

  let finalPosition;
  let accumulatedValue;

  if (separationPoint <= 0) {
    finalPosition = 0;
    accumulatedValue = 0;
  } else {
    const cumulativeRecords = numericalSegments.reduce((acc, currentVal, idx) => {
      const prevSum = acc.length > 0 ? acc[acc.length - 1].sum : 0;
      acc.push({ sum: prevSum + currentVal, index: idx });
      return acc;
    }, []);

    const firstExceedingRecord = cumulativeRecords.find(record => record.sum >= separationPoint);

    if (firstExceedingRecord) {
      finalPosition = firstExceedingRecord.index + 1;
      accumulatedValue = firstExceedingRecord.sum;
    } else {
      finalPosition = numericalSegments.length + 1;
      accumulatedValue = NaN;
    }
  }

  const leftPartitionSumA = getPartialSum(numericalSegments, finalPosition);
  const leftPartitionSumB = getPartialSum(numericalSegments, finalPosition + 1);

  let outcomeA;
  if (leftPartitionSumA === accumulatedValue && grandTotal - leftPartitionSumA === accumulatedValue) {
    outcomeA = 0;
  } else {
    outcomeA = grandTotal - leftPartitionSumA;
  }

  let outcomeB;
  if (leftPartitionSumB === grandTotal) {
    outcomeB = Infinity;
  } else {
    outcomeB = grandTotal - leftPartitionSumB;
  }

  console.log(Math.min(outcomeA, outcomeB));
};

processSegments(require('fs').readFileSync('/dev/stdin', 'utf8'));