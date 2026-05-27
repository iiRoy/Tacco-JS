function processKnapsack(inputLines) {
  const [firstLineContent, ...remainingLinesContent] = inputLines;
  const [itemCount, maxCapacity] = firstLineContent.split(' ').map(Number);
  const itemSpecifications = remainingLinesContent.map(line => line.split(' ').map(Number));

  const maxValuesForWeight = new Array(maxCapacity + 1).fill(0);

  for (const [currentItemWeight, currentValueItem] of itemSpecifications) {
    for (let currentCapacity = maxCapacity; currentCapacity >= currentItemWeight; --currentCapacity) {
      maxValuesForWeight[currentCapacity] = Math.max(
        maxValuesForWeight[currentCapacity],
        maxValuesForWeight[currentCapacity - currentItemWeight] + currentValueItem
      );
    }
  }

  const finalMaximumValue = Math.max(...maxValuesForWeight);
  console.log(finalMaximumValue);
}

processKnapsack(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
