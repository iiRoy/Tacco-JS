function processInputData(rawData) {
  const dataLines = rawData.trim().split("\n");

  const totalElements = Number.parseInt(dataLines[0].split(' ')[0], 10);
  const sortedValues = dataLines[1].split(' ').map(Number).sort((valA, valB) => valA - valB);

  const valueFrequencies = new Map();
  for (const currentItem of sortedValues) {
    valueFrequencies.set(currentItem, (valueFrequencies.get(currentItem) || 0) + 1);
  }

  const frequencyCounts = Array.from(valueFrequencies.values()).sort((countA, countB) => countA - countB);

  const cumulativeSums = [0];
  let runningSum = 0;
  for (const individualCount of frequencyCounts) {
    runningSum += individualCount;
    cumulativeSums.push(runningSum);
  }

  const distinctValueCount = frequencyCounts.length;

  for (let groupSize = 1; groupSize <= totalElements; groupSize++) {
    const sumRangeEndIndex = distinctValueCount - groupSize + 1;
    
    let currentUpperLimitSum = 0;
    if (sumRangeEndIndex > 0 && sumRangeEndIndex <= distinctValueCount) {
        currentUpperLimitSum = cumulativeSums[sumRangeEndIndex];
    }

    const finalResult = Math.min(Math.floor(totalElements / groupSize), currentUpperLimitSum * groupSize);
    console.log(finalResult);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
