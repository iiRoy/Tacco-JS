/*
-------関数一覧--------
convert1dTo2dArray(Array) 一次元配列を二次元配列にします
primeFactorize(N)素因数分解した結果をオブジェクトで返します
greatestCommonDivisor(a,b)最大公約数を返します
leastCommonMultiple(a,b)最小公倍数を返します
numericDifference(a,b)a-bを返します。ソート用です
checkIfPrime(n)素数かどうか真偽値で返します
validateIsNumber(n)数かどうか真偽値で返します
calculateArraySum(arr)配列の合計値を返します
binarySearchClosest(arr,n)n以下で最も大きい数の添字を返します(nを含みます)
splitByNewline(input)入力を改行で区切ります
*/
const isDebuggingEnabled = false;
const maxSafeIntegerVal = Number.MAX_SAFE_INTEGER;
const moduloConstant = 1000000007;

const parseNumericLine = (lineString) => lineString.split(" ").map(Number);

const computeXorSum = (numbersArray) => {
    let accumulator = 0;
    for (const num of numbersArray) {
        accumulator ^= num;
    }
    return accumulator;
};

const applyXorTransformation = (originalNumbers, xorSum) => {
    const results = [];
    for (const num of originalNumbers) {
        results.push(xorSum ^ num);
    }
    return results;
};

function processInputData(rawData){
    const inputLines = rawData.split("\n");
    const dataLineIndex = 1;
    const inputNumbers = parseNumericLine(inputLines[dataLineIndex]);

    const totalXorSum = computeXorSum(inputNumbers);

    const finalResults = applyXorTransformation(inputNumbers, totalXorSum);

    console.log(finalResults.join(" "));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculatePower(base, exponent){
    let result = 1;
    for(let i = 0; i < exponent; i++){
        result *= base;
    }
    return result;
}

function calculateLexicographicalRank(elementsToRank, totalCount) {
  let availableNumbers = [];
  for (let i = 0; i < totalCount; i++) {
    availableNumbers.push(i + 1);
  }
  let rankSum = 0;
  for (let i = 0; i < elementsToRank.length; i++) {
    let foundIndex = availableNumbers.findIndex(val => val === elementsToRank[i]);
    rankSum += computeFactorial(elementsToRank.length - 1 - i) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return rankSum;
}

function calculateArraySum(inputArray){
  let totalSum = 0;
  for (let i=0,len=inputArray.length; i<len; ++i) {
      totalSum += inputArray[i] - 0;
  }
  return totalSum;
}

function logDebugMessage(valueToLog){
  if(isDebuggingEnabled === true){
    console.log(valueToLog);
  }
}

function findMaxElementIndex(inputArray){
	let maxValue = Number.MIN_SAFE_INTEGER;
	let maxIndex = -1;
	for(let i=0; i < inputArray.length; i++){
		if(maxValue < inputArray[i]){
			maxValue = inputArray[i];
			maxIndex = i;
		}
	}
	return maxIndex;
}

function findMinElementIndex(inputArray){
	let minValue = Number.MAX_SAFE_INTEGER;
	let minIndex = -1;
	for(let i=0; i < inputArray.length; i++){
		if(minValue > inputArray[i]){
			minValue = inputArray[i];
			minIndex = i;
		}
	}
	return minIndex;
}

function checkIfPrime(numToCheck){
    if(false === Number.isInteger(numToCheck)){
        return false;
    }
    if(numToCheck <= 1){
        return false;
    }
    if(2 === numToCheck){
        return true;
    }
    if(0 === numToCheck % 2){
        return false;
    }
    let squareRoot = Math.floor(Math.sqrt(numToCheck));
    for(let i=3; i <= squareRoot; i += 2){
        if(0 === numToCheck % i){
            return false;
        }
    }
    return true;
}

function validateIsNumber(valueToValidate){
	const numberPattern = /^([1-9]\d*|0)$/;
	return numberPattern.test(valueToValidate);
}

function computeFactorial(num){
  if (num === 0) { return 1; }
  return num * computeFactorial(num - 1);
}

function convert1dTo2dArray(inputArray){
	for(let i=0; i < inputArray.length; i++){
    inputArray[i] = inputArray[i].split(" ").map(Number);
    }
  return inputArray;
}

function rotateMatrix(matrix){
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const lastRowIndex = numRows - 1;
  let rotatedMatrix = new Array(numCols);
  for (let c = 0; c < numCols; c++) {
    rotatedMatrix[c] = new Array(numRows);
    for (let r = 0; r < numRows; r++) {
      rotatedMatrix[c][r] = matrix[lastRowIndex - r][c];
    }
  }
  return rotatedMatrix;
}

function insertPartialArray(baseArray, elementsToPush, startIndex){
	for(let i = startIndex, p = 0; p < elementsToPush.length; i++, p++){
		baseArray[i] = elementsToPush[p];
	}
	return baseArray;
}

function reversePartialArray(targetArray, startIdx, endIdx){
	let segmentToReverse = targetArray.slice(startIdx - 1, endIdx);
  segmentToReverse.reverse();
	targetArray = insertPartialArray(targetArray, segmentToReverse, startIdx - 1);
	return targetArray;
}

function applyZeroPadding(num, desiredLength){
    return (num + '000000000000000000000000000000000').slice(0, desiredLength);
}

function primeFactorize(numberToFactor){
    let factorizationResult = {};

    if (numberToFactor === 1) {
        return {"1":1};
    }

    let currentDivisor = 2;

    while (numberToFactor !== 1) {
        let i = currentDivisor;
        while (i < maxSafeIntegerVal) {
            if (numberToFactor % i === 0) {
                numberToFactor /= i;
                if (!(factorizationResult[i] > 0)) {
                    factorizationResult[i] = 0;
                }
                factorizationResult[i]++;
                break;
            }
            i++;
        }
        currentDivisor = i;
    }
    return factorizationResult;
}

function greatestCommonDivisor(valA, valB){
    if (valB === 0){
        return valA;
    }
    return greatestCommonDivisor(valB, valA % valB);
}

function leastCommonMultiple(valA, valB){
    return (valA * valB) / greatestCommonDivisor(valA, valB);
}

function numericDifference(valA, valB){
  return valA - valB;
}

function binarySearchClosest(sortedArray, targetValue){
	let foundIndex = -1;

    let leftBound = 0;
    let rightBound = sortedArray.length - 1;

    while(leftBound <= rightBound){
        let middleIndex = Math.floor((leftBound + rightBound) / 2);

        if(sortedArray[middleIndex] === targetValue){
            foundIndex = middleIndex;
            break;
        } else if(sortedArray[middleIndex] < targetValue){
            leftBound = middleIndex + 1;
        } else {
            rightBound = middleIndex - 1;
        }
    }
    if(foundIndex !== -1) return foundIndex;
    else return leftBound;
}

function splitByNewline(inputString){
  return inputString.split("\n");
}

function isSortedAscending(inputArray){
  let isArraySorted = true;
  for(let i = 1; i < inputArray.length; i++){
    if(inputArray[i-1] > inputArray[i]){
      isArraySorted = false;
      break;
    }
  }
  return isArraySorted;
}
