function ProcessInput(rawData) {
  const lineSegments = rawData.split("\n");
  const firstSegment = lineSegments[0];
  const dataItems = lineSegments[1].split(" ");

  const uniqueElementsSet = new Set();

  for (const currentItem of dataItems) {
    uniqueElementsSet.add(currentItem);
  }

  const finalCount = uniqueElementsSet.size;

  const outputValue = (finalCount % 2 === 1) ? finalCount : (finalCount - 1);
  console.log(outputValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
