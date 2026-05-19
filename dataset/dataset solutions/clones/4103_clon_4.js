function processInputData(rawData) {
  const segments = rawData.split("/n");
  console.log(segments);

  const firstElement = segments[0];
  const numericValues = segments.reduce((accumulator, currentSegment, index, arrayReference) => {
    if (index > 0 && index < arrayReference.length - 1) {
      accumulator.push(currentSegment);
    }
    return accumulator;
  }, []);

  const uniqueTracker = {};
  for (let i = 0; i < numericValues.length; i++) {
    const item = numericValues[i];
    if (!(item in uniqueTracker)) {
      uniqueTracker[item] = true;
    }
  }
  console.log(Object.keys(uniqueTracker).length);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
