function processInput(rawData) {
  const [firstValStr, secondValStr] = rawData.split(" ");

  if (secondValStr === '1') {
    console.log("0");
    return;
  }

  const numA = parseInt(firstValStr, 10);
  const numB = parseInt(secondValStr, 10);

  const incrementStep = numA - 1;

  let currentSum = numA;
  let iterationCount = 1;

  while (currentSum < numB) {
    iterationCount++;
    currentSum += incrementStep;
  }

  console.log(iterationCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
