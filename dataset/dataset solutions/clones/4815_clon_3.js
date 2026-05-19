function logOutput(message) {
  console.log(message);
}

function ProcessInput(rawData) {
  const processedLines = rawData.trim().split("\n");

  const parseNumberString = (lineString) => lineString.split(" ").map((numStr) => Number(numStr));

  const dataLength = parseInt(processedLines[0], 10);
  const numberSequence = parseNumberString(processedLines[1]);

  const frequencyMap = {};
  for (let idx = 0; idx < dataLength; idx++) {
    const currentNumber = numberSequence[idx];
    if (frequencyMap[currentNumber] === undefined) {
      frequencyMap[currentNumber] = 1;
    } else if (frequencyMap[currentNumber] === 1) {
      frequencyMap[currentNumber] = 2;
    }
  }

  let uniqueSortedNumbers = Array.from(new Set(numberSequence)).sort((valA, valB) => valA - valB);

  let finalResult = 1;

  const isTotalLengthOdd = (dataLength % 2 === 1);

  for (let idx = 0; idx < uniqueSortedNumbers.length; idx++) {
    const currentUniqueValue = uniqueSortedNumbers[idx];
    const currentFrequency = frequencyMap[currentUniqueValue];

    if (isTotalLengthOdd && currentUniqueValue === 0) {
      if (currentFrequency !== 1) {
        logOutput("0");
        return;
      }
      continue;
    }

    if (currentFrequency !== 2) {
      logOutput("0");
      return;
    }
  }

  if (isTotalLengthOdd) {
    uniqueSortedNumbers.shift();
  }

  finalResult *= Math.pow(2, uniqueSortedNumbers);

  logOutput(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
