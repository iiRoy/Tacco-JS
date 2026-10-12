function calculateCeiledAverage(sourceText) {
  const stringRepresentations = sourceText.split(/\s/);

  const aggregateSum = stringRepresentations.reduce((currentTotal, currentRepresentation) => {
    return currentTotal + Number.parseInt(currentRepresentation, 10);
  }, 0);

  const finalAverage = aggregateSum / stringRepresentations.length;

  console.log(Math.ceil(finalAverage));
}

calculateCeiledAverage(require("fs").readFileSync("/dev/stdin", "utf8"));
