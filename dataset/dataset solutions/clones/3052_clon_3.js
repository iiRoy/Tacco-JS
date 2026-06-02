let numElements;
let heightsArray;

function parseNumberListString(inputLine) {
  const numberStrings = inputLine.split(" ");
  const parsedNumbers = numberStrings.map(function (strValue) {
    return Number(strValue);
  });
  return parsedNumbers;
}

function initializeProcessing(rawInputData) {
  const inputLines = rawInputData.split("\n");
  const firstLineValue = inputLines[0];
  numElements = Number(firstLineValue);

  const secondLineValue = inputLines[1];
  heightsArray = parseNumberListString(secondLineValue);

  processData();
}

function processData() {
  let visibleCount = 0;
  let currentMaxHeight = 0;

  for (let index = 0; index < heightsArray.length; index++) {
    const individualHeight = heightsArray[index];
    if (currentMaxHeight <= individualHeight) {
      visibleCount++;
      currentMaxHeight = individualHeight;
    }
  }
  console.log(visibleCount);
}

initializeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
