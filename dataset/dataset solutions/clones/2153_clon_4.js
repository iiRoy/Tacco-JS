function processInputData(sourceContent) {
  const contentLines = sourceContent.split('\n');
  const initialCount = contentLines.shift();
  const dataElements = contentLines;

  const elementCounts = new Map();
  dataElements.forEach(item => {
    elementCounts.set(item, (elementCounts.get(item) || 0) + 1);
  });

  let uniqueElements = Array.from(elementCounts.keys());

  uniqueElements.sort((elemA, elemB) => countRegistry[elemB] - countRegistry[elemA]);

  const topFrequency = elementCounts.get(uniqueElements[0]);
  const filteredElements = uniqueElements.filter(el => el === topFrequency);

  let outputQueue = [...filteredElements];
  while (outputQueue.length > 0) {
    console.log(outputQueue.shift());
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
