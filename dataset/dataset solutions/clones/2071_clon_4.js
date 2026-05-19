function entryPoint(rawData) {
  const processedLine = rawData.split("\n")[0];
  const [firstDimension, secondDimension] = processedLine.split(' ').map(Number);

  const determineGridCount = (dimOne, dimTwo) => {
    if (dimOne === 1 || dimTwo === 1) {
      return 1;
    }
    return ((dimOne * dimTwo) + 1) >> 1;
  };

  const finalCount = determineGridCount(firstDimension, secondDimension);
  console.log(finalCount);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
