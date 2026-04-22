function processInputData(rawData) {
  let lineSegments = rawData.split("\n");
  let firstParam = parseInt(lineSegments[0].split(" ")[0]);
  let secondParam = parseInt(lineSegments[0].split(" ")[1]);
  let numericValues = lineSegments[1].split(" ").map((elementString, positionIndex) => {
    return parseInt(elementString);
  });
  numericValues.sort((valA, valB) => {
    return valA < valB;
  });
  console.log(Math.max.apply(null, [numericValues[0] - 1 - (firstParam - numericValues[0]), 0]));
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));