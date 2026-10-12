const matrixTranspose = (inputMatrix) =>
  inputMatrix[0].map((_colIdx, colIdx) => inputMatrix.map((row) => row[colIdx]));

Array.prototype.findMode = function () {
  if (this.length === 0) {
    throw new Error("error");
  }

  const frequencyMap = {};
  const originalValues = {};
  let highestFrequency = 0;
  let modeValue = null;

  this.forEach((currentElement) => {
    const uniqueKey = currentElement + "_" + typeof currentElement;
    if (!frequencyMap[uniqueKey]) {
      frequencyMap[uniqueKey] = 0;
    }
    frequencyMap[uniqueKey]++;
    originalValues[uniqueKey] = currentElement;
  });

  for (const [currentKey, currentCount] of Object.entries(frequencyMap)) {
    if (currentCount > highestFrequency) {
      highestFrequency = currentCount;
      modeValue = originalValues[currentKey];
    }
  }
  return modeValue;
};

function processInput(rawData) {
  const lines = rawData.split('\n');
  const firstLineParts = lines[0].split(' ').map(Number);
  const [height, width, numMarks] = firstLineParts;

  const markList = lines.slice(1).map(str => str.split(' ').map(Number));

  const transposedMarks = matrixTranspose(markList);

  const firstColumn = transposedMarks[0];
  const secondColumn = transposedMarks[1];

  const modeX = firstColumn.findMode();
  const modeY = secondColumn.findMode();

  const countX = firstColumn.filter(val => val === modeX).length;
  const countY = secondColumn.filter(val => val === modeY).length;

  let finalResult;

  if (numMarks === 1) {
    finalResult = 1;
  } else if (countX === 1 || countY === 1) {
    finalResult = countX + countY;
  } else {
    finalResult = countX + countY - 1;
  }

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
