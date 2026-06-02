function parseInputContent(rawContent) {
  const contentLines = rawContent.split("\n");
  const elementCountStr = contentLines[0];
  const dataLineStr = contentLines[1];

  const totalElements = Number(elementCountStr);
  const initialArray = dataLineStr.split(" ").map(value => parseInt(value, 10));

  return {
    totalElements: totalElements,
    dataArray: initialArray
  };
}

function outputArrayState(arr) {
  console.log(arr.join(" "));
}

function processInputData(rawInputString) {
  const parsedData = parseInputContent(rawInputString);
  const totalElements = parsedData.totalElements;
  let numericData = parsedData.dataArray;

  outputArrayState(numericData);

  for (let currentPassIndex = 1; currentPassIndex < totalElements; currentPassIndex++) {
    const elementToInsert = numericData[currentPassIndex];
    let comparisonIndex = currentPassIndex - 1;

    while (comparisonIndex >= 0 && numericData[comparisonIndex] > elementToInsert) {
      numericData[comparisonIndex + 1] = numericData[comparisonIndex];
      comparisonIndex = comparisonIndex - 1;
    }

    numericData[comparisonIndex + 1] = elementToInsert;
    outputArrayState(numericData);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
