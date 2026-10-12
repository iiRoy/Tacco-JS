function ProcessInputData(rawData) {
  const processedLines = rawData.split("\n");

  const elementCount = parseInt(processedLines[0], 10);

  const numberStrings = processedLines[1].split(" ");

  const parseNumberArray = (strArr, count) => {
    const parsedNumbers = new Array(count);
    for (let idx = 0; idx < count; idx++) {
      parsedNumbers[idx] = parseInt(strArr[idx], 10);
    }
    return parsedNumbers;
  };

  const numericValues = parseNumberArray(numberStrings, elementCount);

  let oddNumberCount = 0;
  let fourMultipleCount = 0;

  for (const currentValue of numericValues) {
    if (currentValue % 2 === 1) {
      oddNumberCount++;
    } else if (currentValue % 4 === 0) {
      fourMultipleCount++;
    }
  }

  let finalOutcome = "No";

  const isElementCountOdd = (elementCount % 2 === 1);
  const hasAnyFourMultiples = (fourMultipleCount > 0);
  const oddVsFourDifference = oddNumberCount - fourMultipleCount;

  if (oddNumberCount === 0) {
    finalOutcome = "Yes";
  } else if (oddVsFourDifference <= 0) {
    finalOutcome = "Yes";
  } else if (isElementCountOdd && oddVsFourDifference <= 1 && hasAnyFourMultiples) {
    finalOutcome = "Yes";
  }
  
  console.log('%s', finalOutcome);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
