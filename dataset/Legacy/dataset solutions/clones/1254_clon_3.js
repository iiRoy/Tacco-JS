let collectedInput = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(dataChunk) {
  collectedInput += dataChunk;
});

process.stdin.on('end', function() {
  const lines = collectedInput.split("\n");
  const stringNumbers = lines[1].split(" ");

  const numericValues = stringNumbers.map(Number);

  let smallestVal;
  let largestVal;
  let cumulativeSum = 0;

  if (numericValues.length > 0) {
    smallestVal = numericValues[0];
    largestVal = numericValues[0];
    cumulativeSum = numericValues[0];

    for (let currentIndex = 1; currentIndex < numericValues.length; ++currentIndex) {
      const currentNum = numericValues[currentIndex];
      if (currentNum < smallestVal) {
        smallestVal = currentNum;
      }
      if (currentNum > largestVal) {
        largestVal = currentNum;
      }
      cumulativeSum += currentNum;
    }
  } else {
    // Handle case where stringNumbers is empty (e.g., input[1] was empty string)
    // The original code would result in 0 0 0 for Math.min/max.apply(null, [""])
    // and sum of 0.
    smallestVal = 0;
    largestVal = 0;
    cumulativeSum = 0;
  }

  console.log(smallestVal + " " + largestVal + " " + cumulativeSum);
});
