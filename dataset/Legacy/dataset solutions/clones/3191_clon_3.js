function processInputData(rawData) {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");
  const elementCount = Number(firstLineParts[0]);

  let numericArray = lines[1].split(" ").map(Number);

  let zeroCount = 0;
  while (zeroCount !== elementCount) {
    zeroCount = 0;
    const iterationMin = Math.min(...numericArray);

    const nextIterationArray = [];
    for (let currentIndex = 0; currentIndex < elementCount; currentIndex++) {
      const currentVal = numericArray[currentIndex];
      const calculatedRemainder = currentVal % iterationMin;

      if (calculatedRemainder !== 0) {
        nextIterationArray.push(calculatedRemainder);
      } else {
        nextIterationArray.push(iterationMin);
        zeroCount++;
      }
    }
    numericArray = nextIterationArray;
  }

  console.log(Math.min(...numericArray));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
