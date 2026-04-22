function ProcessData(rawInput) {
  const lineSet = rawInput.split(/\r?\n/);
  const quantity = Number(lineSet[0].trim());
  const initialValues = lineSet[1].trim().split(" ").map(Number);

  const orderedValues = initialValues.reduce((accumulator, currentValue) => {
    let insertionPosition = 0;
    while (insertionPosition < accumulator.length && currentValue >= accumulator[insertionPosition]) {
      insertionPosition++;
    }
    accumulator.splice(insertionPosition, 0, currentValue);
    return accumulator;
  }, []);

  const firstMedian = orderedValues[quantity / 2 - 1];
  const secondMedian = orderedValues[quantity / 2];

  const outcomeCollection = initialValues.map(element => {
    return element <= firstMedian ? secondMedian : firstMedian;
  });

  console.log(outcomeCollection.join("\n"));
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));