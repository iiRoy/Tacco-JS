function Main(sourceText) {
  const lineSegments = sourceText.split("\n");

  const [_, rangeCountStr] = lineSegments[0].split(" ");
  const totalRanges = Number(rangeCountStr);

  const parsedRanges = lineSegments.slice(1, totalRanges + 1).map(rangeLine => {
    const [lowerBoundStr, upperBoundStr] = rangeLine.split(" ");
    return {
      lower: Number(lowerBoundStr),
      upper: Number(upperBoundStr)
    };
  });

  const aggregatedBounds = parsedRanges.reduce((currentExtremes, singleRange) => {
    return {
      highestLower: Math.max(currentExtremes.highestLower, singleRange.lower),
      lowestUpper: Math.min(currentExtremes.lowestUpper, singleRange.upper)
    };
  }, { highestLower: -Infinity, lowestUpper: Infinity });

  const resultQuantity = aggregatedBounds.lowestUpper - aggregatedBounds.highestLower + 1;
  console.log(resultQuantity);
}

Main(require("fs").readFileSync("./inputdata.txt", "utf8"));
