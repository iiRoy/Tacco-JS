const getMiddleValue = (inputArr) => {
  const currentLength = inputArr.length;
  const sortedArr = [...inputArr].sort();
  const middleIndex = Math.floor(currentLength / 2);
  return sortedArr[middleIndex];
};

const processData = (rawInputStr) => {
  const inputLines = rawInputStr.split("\n");
  const elementCount = parseInt(inputLines[0], 10);
  const stringNumbers = inputLines[1].split(" ");
  const subsequenceMedians = [];

  const outerLoopLimit = elementCount;
  const innerLoopUpperLimit = elementCount + 1;

  for (let startIdx = 0; startIdx < outerLoopLimit; startIdx++) {
    for (let endIdx = startIdx + 1; endIdx < innerLoopUpperLimit; endIdx++) {
      const currentSubarray = stringNumbers.slice(startIdx, endIdx);
      subsequenceMedians.push(getMiddleValue(currentSubarray));
    }
  }

  console.log(getMiddleValue(subsequenceMedians));
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
