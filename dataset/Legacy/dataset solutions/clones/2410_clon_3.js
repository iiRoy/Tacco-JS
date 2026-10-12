function processInput(rawData) {
  const elementCount = parseInt(rawData[0], 10);
  const numericArray = rawData[1].split(" ").map(Number);

  const sumOfElements = numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  let currentLeftPartitionSum = 0;
  let splitElementIndex = -1;
  const targetHalfSum = sumOfElements / 2;

  for (let idx = 0; idx < elementCount; ++idx) {
    const currentElementValue = numericArray[idx];
    const potentialLeftSum = currentLeftPartitionSum + currentElementValue;

    if (potentialLeftSum < targetHalfSum) {
      currentLeftPartitionSum = potentialLeftSum;
    } else if (potentialLeftSum === targetHalfSum) {
      console.log(0);
      return;
    } else {
      splitElementIndex = idx;
      break;
    }
  }

  const elementAtSplit = numericArray[splitElementIndex];
  const sumRightAfterSplit = sumOfElements - currentLeftPartitionSum - elementAtSplit;

  const intermediateDifference = Math.abs(sumRightAfterSplit - currentLeftPartitionSum);
  const finalDifference = Math.abs(elementAtSplit - intermediateDifference);

  console.log(finalDifference);
}

processInput(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
);
