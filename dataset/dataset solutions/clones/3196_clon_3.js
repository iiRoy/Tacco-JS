const parseNumericValue = (stringValue) => parseInt(stringValue, 10);

const convertStringArrayToNumbers = (stringArray) => stringArray.map(parseNumericValue);

try {
  const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  processInputData(rawInputData);
} catch (error) {
  console.error("An error occurred during program execution:", error.message);
  process.exit(1); 
}

function processInputData(rawInputContent) {
  const allInputLines = rawInputContent.split('\n');
  
  const firstLineParts = allInputLines[0].split(' ');
  const processedFirstLine = convertStringArrayToNumbers(firstLineParts);

  let targetSum = processedFirstLine[0];
  const availableDigitCount = processedFirstLine[1];

  let sortedAllowedDigits = [];
  if (allInputLines.length > 1 && allInputLines[1].trim() !== '') {
    const secondLineParts = allInputLines[1].split(' ');
    sortedAllowedDigits = convertStringArrayToNumbers(secondLineParts);
  }
  
  sortedAllowedDigits.sort((digitB, digitA) => digitA - digitB);

  const segmentCosts = [
    0, // Cost for digit 0 (not typically used in this problem)
    2, // Cost for digit 1
    5, // Cost for digit 2
    5, // Cost for digit 3
    4, // Cost for digit 4
    5, // Cost for digit 5
    6, // Cost for digit 6
    3, // Cost for digit 7
    7, // Cost for digit 8
    6  // Cost for digit 9
  ];

  const feasibleDigitOptions = [];
  const costsAlreadyAdded = new Set(); 

  for (let currentDigitValue of sortedAllowedDigits) {
    const currentDigitCost = segmentCosts[currentDigitValue];
    if (!costsAlreadyAdded.has(currentDigitCost)) {
      feasibleDigitOptions.push([currentDigitValue, currentDigitCost]);
      costsAlreadyAdded.add(currentDigitCost);
    }
  }
  
  feasibleDigitOptions.sort((optionA, optionB) => optionA[1] - optionB[1]);

  if (feasibleDigitOptions.length === 0) {
    console.log("");
    return 0;
  }

  const intermediateResultList = [];

  const cheapestDigitInfo = feasibleDigitOptions[0];
  const cheapestDigit = cheapestDigitInfo[0];
  const cheapestCost = cheapestDigitInfo[1];

  let initialCountOfCheapest = Math.floor(targetSum / cheapestCost);
  targetSum %= cheapestCost;

  intermediateResultList.push([cheapestDigit, initialCountOfCheapest]);

  const numberOfFeasibleOptions = feasibleDigitOptions.length;

  while (targetSum > 0) {
    targetSum += cheapestCost;
    intermediateResultList[0][1]--;

    if (intermediateResultList[0][1] < 0) {
        break; 
    }

    let bestReplacementDigitIndex = -1;
    let minimumRemainder = Infinity;

    for (let optionIndex = 1; optionIndex < numberOfFeasibleOptions; optionIndex++) {
      const currentOption = feasibleDigitOptions[optionIndex];
      const currentOptionCost = currentOption[1];
      
      const potentialRemainder = targetSum % currentOptionCost;

      if (potentialRemainder < minimumRemainder) {
        bestReplacementDigitIndex = optionIndex;
        minimumRemainder = potentialRemainder;
      }
    }

    if (bestReplacementDigitIndex !== -1 && minimumRemainder !== Infinity) {
      const chosenDigitInfo = feasibleDigitOptions[bestReplacementDigitIndex];
      const chosenDigit = chosenDigitInfo[0];
      const chosenCost = chosenDigitInfo[1];

      intermediateResultList.push([chosenDigit, Math.floor(targetSum / chosenCost)]);
      targetSum = minimumRemainder;
    } else {
        break; 
    }
  }

  intermediateResultList.sort((itemA, itemB) => itemB[0] - itemA[0]);

  let finalOutputString = '';

  const currentResultListLength = intermediateResultList.length;
  for (let processingIndex = 0; processingIndex < currentResultListLength; processingIndex++) {
    const [digitToRepeat, repeatCount] = intermediateResultList[processingIndex];
    if (repeatCount > 0) {
      finalOutputString += Array.from({ length: repeatCount }, () => String(digitToRepeat)).join('');
    }
  }

  console.log(finalOutputString);

  return 0;
}