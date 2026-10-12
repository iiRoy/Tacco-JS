function processData(rawInput) {
  const inputLines = rawInput.split("\n");

  const dataCount = Number(inputLines[0]);

  const numberLineString = inputLines[1];
  const originalValues = numberLineString.split(" ").map(valueStr => Number(valueStr));

  const sortedValues = [...originalValues].sort((valA, valB) => valA - valB);

  const lowerMedianIndex = (dataCount / 2) - 1;
  const upperMedianIndex = (dataCount / 2);

  const lowerMedianValue = sortedValues[lowerMedianIndex];
  const upperMedianValue = sortedValues[upperMedianIndex];

  const determineOutputForValue = (currentElement, medLower, medUpper) => {
    if (currentElement <= medLower) {
      return medUpper;
    } else {
      return medLower;
    }
  };

  for (let currentIndex = 0; currentIndex < dataCount; currentIndex++) {
    const currentOriginalValue = originalValues[currentIndex];
    const outputResult = determineOutputForValue(currentOriginalValue, lowerMedianValue, upperMedianValue);
    console.log(outputResult);
  }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processData(fileContent);
