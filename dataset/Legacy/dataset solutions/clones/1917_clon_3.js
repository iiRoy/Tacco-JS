const dbgFlag = false;
const maxSafeInt = Number.MAX_SAFE_INTEGER;

function Main(rawInput){
  let currentValue = 100n;
  const targetValue = BigInt(rawInput);
  let iterationCount = 0;
  const growthFactor = 100n;
  while(currentValue < targetValue){
    const incrementAmount = currentValue / growthFactor;
    currentValue += incrementAmount;
    iterationCount++;
  }
  console.log(iterationCount);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculatePermutationIndex(inputSequence){
  const availableNumbers = [];
  const sequenceLengthForInit = input[0];
  for(let k=0; k < sequenceLengthForInit; k++){
    availableNumbers.push(k + 1);
  }
  let permutationSum = 0;
  for(let k=0; k < inputSequence.length; k++){
    const currentElement = inputSequence[k];
    const foundIndex = availableNumbers.findIndex(val => val === currentElement);
    const remainingElementsCount = inputSequence.length - 1 - k;
    permutationSum += calculateFactorial(remainingElementsCount) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return permutationSum;
}

function calculateArrayTotal(numericArray){
  let totalSum = 0;
  for (let k=0, arrayLength=numericArray.length; k < arrayLength; ++k) {
      totalSum += numericArray[k] - 0;
  }
  return totalSum;
}

function logDebugMessage(debugMessage){
  if(!dbgFlag){
    return;
  }
  console.log(debugMessage);
}

function findMaxElementIndex(dataArray){
  let currentMax = Number.MIN_SAFE_INTEGER;
  let maxIndex = -1;
  const arraySize = dataArray.length;
  for(let k=0; k < arraySize; k++){
    const element = dataArray[k];
    if(currentMax < element){
      currentMax = element;
      maxIndex = k;
    }
  }
  return maxIndex;
}

function findMinElementIndex(dataArray){
  let currentMin = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  const arraySize = dataArray.length;
  for(let k=0; k < arraySize; k++){
    const element = dataArray[k];
    if(currentMin > element){
      currentMin = element;
      minIndex = k;
    }
  }
  return minIndex;
}

function checkIsPrime(checkNum){
    if(!Number.isInteger(checkNum)){
        return false;
    }
    if(checkNum <= 1){
        return false;
    }
    if(checkNum === 2){
        return true;
    }
    const isEven = (checkNum % 2 === 0);
    if(isEven){
        return false;
    }
    const sqrtVal = Math.floor(Math.sqrt(checkNum));
    for(let k=3; k <= sqrtVal; k += 2){
        if(checkNum % k === 0){
            return false;
        }
    }
    return true;
}

function validateIsNumber(testString){
	const numberPattern = /^([1-9]\d*|0)$/;
	return numberPattern.test(testString);
}

function convert1dTo2dNumeric(inputArray){
	for(let k=0; k < inputArray.length; k++){
    inputArray[k] = inputArray[k].split(" ").map(Number);
    }
  return inputArray;
}

function calculateFactorial(factorialInput) {
  return (factorialInput === 0) ? 1 : factorialInput * calculateFactorial(factorialInput - 1);
}

function rotateMatrix(matrix) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const lastRowIdx = numRows - 1;
  const rotatedMatrix = new Array(numCols);
  for (let c=0; c < numCols; c++) {
    rotatedMatrix[c] = new Array(numRows);
    for (let r=0; r < numRows; r++) {
      rotatedMatrix[c][r] = matrix[lastRowIdx - r][c];
    }
  }
  return rotatedMatrix;
}

function insertPartialArray(targetArray, sourceElements, startIndex){
	for(let k=startIndex, p=0; p < sourceElements.length; k++, p++){
		targetArray[k] = sourceElements[p];
	}
	return targetArray;
}

function reversePartialArray(originalArray, startIdx, endIdx){
	const elementsToReverse = originalArray.slice(startIdx - 1, endIdx);
  elementsToReverse.reverse();
	originalArray = insertPartialArray(originalArray, elementsToReverse, startIdx - 1);
	return originalArray;
}

function applyZeroPadding(valueToPad, desiredLength){
    const paddedString = String(valueToPad) + '000000000000000000000000000000000';
    return paddedString.slice(0, desiredLength);
}

function primeFactorize(numberToFactor) {
    const primeFactors = {};

    if (numberToFactor === 1) {
        return {"1":1};
    }

    let currentDivisor = 2;

    while (numberToFactor !== 1) {
        let divisorCandidate = currentDivisor;
        while (divisorCandidate < Number.MAX_SAFE_INTEGER) {
            if (numberToFactor % divisorCandidate === 0) {
                numberToFactor /= divisorCandidate;
                if (!primeFactors[divisorCandidate]) {
                    primeFactors[divisorCandidate] = 0;
                }
                primeFactors[divisorCandidate]++;
                break;
            }
            divisorCandidate++;
        }
        currentDivisor = divisorCandidate;
    }
    return primeFactors;
}

function calculateGCD(valA, valB) {
    if (valB === 0){
        return valA;
    }
    return calculateGCD(valB, valA % valB);
}

function calculateLCM(numA, numB) {
    const gcdHelper = (n, m) => m ? gcdHelper(m, n % m) : n;
    return numA * numB / gcdHelper(numA, numB);
}

function compareNumbers(operandA, operandB) {
  return operandA - operandB;
}

function binarySearchClosest(sortedArray, targetValue){
	let foundIdx = -1;

	let leftBound = 0;
	let rightBound = sortedArray.length - 1;
    let midPoint;

	while(leftBound <= rightBound){
        midPoint = Math.floor((leftBound + rightBound) / 2);
        const midValue = sortedArray[midPoint];

        if(midValue === targetValue){
            foundIdx = midPoint;
            break;
        }else if(midValue < targetValue){
            leftBound = midPoint + 1;
        }else{
            rightBound = midPoint - 1;
        }
    }
    return (foundIdx !== -1) ? foundIdx : leftBound;
}

function splitByNewline(rawText){
  return rawText.split("\n");
}
