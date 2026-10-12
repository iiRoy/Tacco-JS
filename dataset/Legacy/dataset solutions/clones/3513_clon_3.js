function parseInputData(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const elementCount = parseInt(inputLines[0], 10);
  const dataElements = inputLines[1].split(" ");
  return {
    totalElements: elementCount,
    elementsArray: dataElements
  };
}

function analyzeElementFrequencies(elements) {
  const frequencyCounter = {};
  const uniqueElementKeys = [];

  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];
    if (frequencyCounter[currentElement] === undefined) {
      frequencyCounter[currentElement] = 1;
      uniqueElementKeys.push(currentElement);
    } else {
      frequencyCounter[currentElement]++;
    }
  }
  return {
    frequencies: frequencyCounter,
    uniqueKeys: uniqueElementKeys
  };
}

function processInputData(rawInput) {
  const parsedData = parseInputData(rawInput);
  const totalCount = parsedData.totalElements;
  const dataItems = parsedData.elementsArray;

  const analysisResult = analyzeElementFrequencies(dataItems);
  const itemFrequencies = analysisResult.frequencies;
  let distinctElements = analysisResult.uniqueKeys;

  const numberOfDistinctElements = distinctElements.length;
  let finalCalculatedValue = 0;

  const frequencyComparator = (itemA, itemB) => {
    return itemFrequencies[itemB] - itemFrequencies[itemA];
  };

  if (numberOfDistinctElements === 1) {
    finalCalculatedValue = totalCount / 2;
  } else if (numberOfDistinctElements === 2) {
    distinctElements.sort(frequencyComparator);

    const firstMostFrequentKey = distinctElements[0];
    const secondMostFrequentKey = distinctElements[1];

    const firstFrequency = itemFrequencies[firstMostFrequentKey];
    const secondFrequency = itemFrequencies[secondMostFrequentKey];

    if (firstFrequency === secondFrequency) {
      finalCalculatedValue = 0;
    } else {
      finalCalculatedValue = (firstFrequency - secondFrequency) / 2;
    }
  } else {
    distinctElements.sort(frequencyComparator);

    distinctElements.splice(0, 2);

    finalCalculatedValue = distinctElements.reduce((accumulator, currentKey) => {
      return accumulator + itemFrequencies[currentKey];
    }, 0);
  }

  console.log(finalCalculatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
