'use strict';

const processInputString = (textSource) => {
  const numericComponents = textSource.match(/\d+/g).map(val => parseInt(val, 10));
  return { initialValue: numericComponents[0], finalValue: numericComponents[1], stepCount: numericComponents[2] };
};

const computeSequence = (parameters) => {
  const { initialValue, finalValue, stepCount } = parameters;

  if (initialValue > finalValue) {
    return '';
  }

  const maximumIndexConsidered = Math.min(stepCount - 1, finalValue - initialValue);
  const actualIterationAmount = Math.max(0, maximumIndexConsidered + 1);

  const rawNumberList = Array.from({ length: actualIterationAmount }, (_, currentIdx) => currentIdx)
                             .flatMap(indexOffset => [initialValue + indexOffset, finalValue - indexOffset]);

  const seenNumbers = {};
  rawNumberList.forEach(num => {
    seenNumbers[num] = true;
  });

  const uniqueOrderedValues = Object.keys(seenNumbers)
                                    .map(Number)
                                    .reduce((accumulator, currentNumber) => {
                                      let insertionPoint = 0;
                                      while (insertionPoint < accumulator.length && accumulator[insertionPoint] < currentNumber) {
                                        insertionPoint++;
                                      }
                                      accumulator.splice(insertionPoint, 0, currentNumber);
                                      return accumulator;
                                    }, []);

  return uniqueOrderedValues.join('\n');
};

const orchestrateExecution = (dataSource) => {
  const parsedData = processInputString(dataSource);
  const resultantSequence = computeSequence(parsedData);
  console.log(resultantSequence);
};

orchestrateExecution(require("fs").readFileSync("/dev/stdin", "utf8"));