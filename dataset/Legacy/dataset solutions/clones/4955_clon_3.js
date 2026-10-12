function processInputData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const numberStrings = inputLines[1].split(" ");
  const numberArray = numberStrings.map(numStr => Number(numStr));

  let matchingPairs = 0;

  for (let currentIndex = 0; currentIndex < numberArray.length; currentIndex++) {
    const currentValue = numberArray[currentIndex];
    const targetIndex = currentValue - 1;

    if (numberArray[targetIndex] === currentIndex + 1) {
      matchingPairs++;
    }
  }

  console.log(matchingPairs / 2);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
