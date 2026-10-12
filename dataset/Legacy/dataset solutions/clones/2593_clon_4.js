function processData(rawData) {
  const [initialValue, upperLimit] = rawData[0].split(" ").map(Number);

  if (initialValue === 1) {
    if (upperLimit <= 1) {
      console.log(1);
    } else {
      while (true) {
        // This loop replicates the original's infinite loop behavior
        // when initialValue is 1 and upperLimit is greater than 1.
      }
    }
  } else {
    const stepSize = initialValue - 1;
    let iterationCount;

    if (upperLimit <= initialValue) {
      iterationCount = 0;
    } else {
      iterationCount = Math.ceil((upperLimit - initialValue) / stepSize);
    }

    const finalResult = 1 + iterationCount;
    console.log(finalResult);
  }
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
