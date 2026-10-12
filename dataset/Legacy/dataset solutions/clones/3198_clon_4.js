function processInputData(rawData) {
  const lineSegments = rawData.split('\n')[0].split(' ');

  const [firstNumericValue, secondNumericValue] = lineSegments.reduce((accumulator, segment, index) => {
    if (index < 2) {
      accumulator.push(parseInt(segment, 10));
    }
    return accumulator;
  }, []);

  const primaryCount = firstNumericValue;
  const secondaryLimit = secondNumericValue;

  const calculatedThreshold = Math.floor((primaryCount + 1) / 2);

  const finalDecision = (calculatedThreshold >= secondaryLimit) ? "YES" : "NO";

  console.log(finalDecision);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
