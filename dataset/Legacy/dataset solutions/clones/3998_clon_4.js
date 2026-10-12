function Main(sourceData) {
  const dimensionStrings = sourceData.split(" ");
  const primaryDimension = Number(dimensionStrings[0]);
  const secondaryDimension = Number(dimensionStrings[1]);

  function determineInnerCount(valA, valB) {
    if (valA === 1 && valB === 1) {
      return 0;
    } else if (valA === 1) {
      return valB - 2;
    } else if (valB === 1) {
      return valA - 2;
    } else {
      // Both dimensions are greater than 1
      return (valA - 2) * (valB - 2);
    }
  }

  const finalResult = determineInnerCount(primaryDimension, secondaryDimension);
  console.log(finalResult);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
