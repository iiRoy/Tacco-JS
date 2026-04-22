const calculateRange = (valueA, valueB) => {
  return (valueA > valueB) ? (valueA - valueB) : (valueB - valueA);
};

const determineCloseness = (sourceText) => {
  const numberSeries = sourceText.match(/\d+/g).map(Number);
  const [centralValue, competitorOne, competitorTwo] = numberSeries;

  const distanceOne = calculateRange(centralValue, competitorOne);
  const distanceTwo = calculateRange(centralValue, competitorTwo);

  const finalResult = (distanceOne > distanceTwo) ? "B" : "A";
  process.stdout.write(finalResult + "\n");
};

determineCloseness(require("node:fs").readFileSync("/dev/stdin", "utf8"));