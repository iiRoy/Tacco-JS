function processInputData(rawData) {
  const allInputLines = rawData.split("\n");

  const firstDataLine = allInputLines.shift();
  const numberOfElements = Number(firstDataLine);

  const elementValueMap = new Map();
  for (let elementIdCounter = 1; elementIdCounter <= numberOfElements; elementIdCounter++) {
    elementValueMap.set(String(elementIdCounter), 0);
  }

  const pairLinesCount = allInputLines.length - 1;

  for (let currentLineIndex = 0; currentLineIndex < pairLinesCount; currentLineIndex++) {
    const currentPairString = allInputLines[currentLineIndex];
    const pairComponents = currentPairString.split(' ');

    const firstComponentId = pairComponents[0];
    const secondComponentId = pairComponents[1];

    const currentCountFirst = elementValueMap.get(firstComponentId);
    elementValueMap.set(firstComponentId, currentCountFirst + 1);

    const currentCountSecond = elementValueMap.get(secondComponentId);
    elementValueMap.set(secondComponentId, currentCountSecond + 1);
  }

  const elementIdSorter = (idA, idB) => {
    const countA = elementValueMap.get(idA);
    const countB = elementValueMap.get(idB);
    return countA - countB;
  };
  const sortedElementIdsByCount = Array.from(elementValueMap.keys()).sort(elementIdSorter);

  const lastInputLine = allInputLines[allInputLines.length - 1];
  const rawAssignmentValues = lastInputLine.split(' ');
  const numericValueSorter = (valA, valB) => Number(valA) - Number(valB);
  const sortedAssignmentValues = rawAssignmentValues.sort(numericValueSorter);

  for (let assignmentIndex = 0; assignmentIndex < sortedElementIdsByCount.length; assignmentIndex++) {
    const targetElementId = sortedElementIdsByCount[assignmentIndex];
    const newValue = sortedAssignmentValues[assignmentIndex];
    elementValueMap.set(targetElementId, Number(newValue));
  }

  let accumulatedSum = 0;
  for (let lineIterator = 0; lineIterator < pairLinesCount; lineIterator++) {
    const currentPairString = allInputLines[lineIterator];
    const pairParts = currentPairString.split(' ');

    const firstElementKey = pairParts[0];
    const secondElementKey = pairParts[1];

    const valueOfFirst = elementValueMap.get(firstElementKey);
    const valueOfSecond = elementValueMap.get(secondElementKey);

    accumulatedSum += Math.min(valueOfFirst, valueOfSecond);
  }

  console.log(String(accumulatedSum));

  const finalOutputValues = [];
  for (let outputElementId = 1; outputElementId <= numberOfElements; outputElementId++) {
    finalOutputValues.push(elementValueMap.get(String(outputElementId)));
  }
  console.log(finalOutputValues.join(' '));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
