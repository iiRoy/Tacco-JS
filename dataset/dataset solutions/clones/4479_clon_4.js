"use strict";

const processInputData = (rawTextContent) => {
  const contentLines = rawTextContent.trim().split("\n");
  const arraySize = parseInt(contentLines[0], 10);
  const numberArray = contentLines[1].split(" ").map(Number);
  return { arraySize, numberArray };
};

const generateCumulativeSums = (sequence) => {
  if (sequence.length === 0) return [];
  return sequence.reduce((accumulator, currentValue, index) => {
    accumulator.push((index === 0 ? 0 : accumulator[index - 1]) + currentValue);
    return accumulator;
  }, []);
};

const deriveLeftPartitionValues = (sourceSequence, cumulativeSums) => {
  if (sourceSequence.length === 0) return [];
  const initialValue = sourceSequence[0];

  const subsequentValues = cumulativeSums
    .slice(0, sourceSequence.length - 1)
    .map(sum => initialValue + sum);

  return [initialValue, ...subsequentValues];
};

const calculateMinimumDifference = (processedData) => {
  const { numberArray } = processedData;

  if (numberArray.length === 0) {
    // Original code would error on A[0] if array is empty.
    // Assuming N >= 1 based on problem context and original code's behavior.
    return 0;
  }

  const totalArraySum = numberArray.reduce((acc, val) => acc + val, 0);
  const prefixSums = generateCumulativeSums(numberArray);
  const leftPartitionValues = deriveLeftPartitionValues(numberArray, prefixSums);

  const allDifferences = leftPartitionValues.map(currentLeftSum => {
    const currentRightSum = totalArraySum - currentLeftSum;
    return Math.abs(currentRightSum - currentLeftSum);
  });

  return Math.min(...allDifferences);
};

const executeProgram = (fileContent) => {
  const dataPayload = processInputData(fileContent);
  const finalResult = calculateMinimumDifference(dataPayload);
  console.log(finalResult);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
