function processInputData(rawData) {
  const dataLines = rawData.split("\n");
  const initialValue = parseInt(dataLines[0], 10);
  const elementStrings = dataLines[1].split(" ");

  const uniqueElementTracker = new Set();
  let totalElementCount = 0;

  for (const currentElement of elementStrings) {
    uniqueElementTracker.add(currentElement);
    totalElementCount++;
  }

  const distinctElementCount = uniqueElementTracker.size;
  const excessElementCount = totalElementCount - distinctElementCount;

  const adjustmentFactor = excessElementCount + (excessElementCount % 2);

  console.log(initialValue - adjustmentFactor);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
