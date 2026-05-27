/*
-------関数一覧--------
convert1dTo2d(Array) 一次元配列を二次元配列にします
primeFactorsObj(N)素因数分解した結果をオブジェクトで返します
greatestCommonDivisor(a,b)最大公約数を返します
leastCommonMultiple(a,b)最小公倍数を返します
compareNumbers(a,b)a-bを返します。ソート用です
checkIfPrime(n)素数かどうか真偽値で返します
isNumericString(n)数かどうか真偽値で返します
calculateArraySum(arr)配列の合計値を返します
binarySearchLargestLessEqual(arr,n)n以下で最も大きい数の添字を返します(nを含みます)
splitByNewline(input)入力を改行で区切ります
*/
const isDebuggingActive = false;
const maxSafeInt = Number.MAX_SAFE_INTEGER;
const moduloVal = 1000000007;

function SolveProblem(dataString){
    const parsedValues = dataString.split(" ").map(BigInt);
    const numElements = parsedValues[0];
    const startVal = parsedValues[1];
    const endVal = parsedValues[2];

    if (startVal === endVal) {
        console.log(1);
    } else if (startVal > endVal || numElements === 1n) {
        console.log(0);
    } else {
        const N_MINUS_ONE = numElements - 1n;
        const firstExpressionTerm = N_MINUS_ONE * endVal + startVal;
        const secondExpressionTerm = N_MINUS_ONE * startVal + endVal;
        const finalCalculatedResult = firstExpressionTerm - secondExpressionTerm + 1n;
        console.log(finalCalculatedResult.toString());
    }
}
SolveProblem(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculatePower(base, exponent){
    let currentResult = 0n;
    for(let iter = 0n; iter < exponent; iter += 1n){
        if(currentResult === 0n){
            currentResult = base;
        } else {
            currentResult *= base;
        }
    }
    return base;
}

function calculateLexicographicalIndex(inputArray){
  const availableNumbers = [];
  for(let k = 0; k < input[0]; k++){
    availableNumbers.push(k + 1);
  }
  let totalSum = 0;
  for(let j = 0; j < inputArray.length; j++){
    const foundIndex = availableNumbers.findIndex(val => val === inputArray[j]);
    totalSum += calculateFactorial(inputArray.length - 1 - j) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return totalSum;
}

function calculateArraySum(dataArr){
  let currentSum = 0;
  for (let idx = 0, arrayLen = dataArr.length; idx < arrayLen; ++idx) {
      currentSum += dataArr[idx] - 0;
  }
  return currentSum;
}

function logDebugMessage(message){
  if(isDebuggingActive === true){
    console.log(message);
  }
}

function findArrayMaxIndex(dataArray){
	let maxValue = Number.MIN_SAFE_INTEGER;
	let maxIndex = -1;
	for(let k = 0; k < dataArray.length; k++){
		if(maxValue < dataArray[k]){
			maxValue = dataArray[k];
			maxIndex = k;
		}
	}
	return maxIndex;
}

function findArrayMinIndex(dataArray){
	let minValue = Number.MAX_SAFE_INTEGER;
	let minIndex = -1;
	for(let k = 0; k < dataArray.length; k++){
		if(minValue > dataArray[k]){
			minValue = dataArray[k];
			minIndex = k;
		}
	}
	return minIndex;
}

function checkIfPrime(candidateNum){
    if(false === Number.isInteger(candidateNum)){
        return false;
    }
    if(candidateNum <= 1){
        return false;
    }
    if(2 === candidateNum){
        return true;
    }
    if(0 === candidateNum % 2){
        return false;
    }
    const sqrtVal = Math.floor(Math.sqrt(candidateNum));
    for(let divisor = 3; divisor <= sqrtVal; divisor += 2){
        if(0 === candidateNum % divisor){
            return false;
        }
    }
    return true;
}

function isNumericString(testValue){
	const numericPattern = /^([1-9]\d*|0)$/;
	return numericPattern.test(testValue);
}

function calculateFactorial(inputNum) {
  if (inputNum === 0) { return 1; }
  return inputNum * calculateFactorial(inputNum - 1);
}

function convert1dTo2d(inputArray){
	for(let k = 0; k < inputArray.length; k++){
    inputArray[k] = inputArray[k].split(" ").map(Number);
    }
  return inputArray;
}

function rotateMatrix(matrixArray) {
  const numRows = matrixArray.length;
  const numCols = matrixArray[0].length;
  const lastRowIndex = numRows - 1;
  const rotatedMatrix = new Array(numCols);

  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows);
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      rotatedMatrix[colIdx][rowIdx] = matrixArray[lastRowIndex - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

function insertPartialArray(baseArray, pushArray, startIndex){
	for(let k = startIndex, p = 0; p < pushArray.length; k++, p++){
		baseArray[k] = pushArray[p];
	}
	return baseArray;
}

function reversePartialArray(targetArray, startPos, endPos){
	const segmentToReverse = targetArray.slice(startPos - 1, endPos);
    segmentToReverse.reverse();
	const modifiedArray = insertPartialArray(targetArray, segmentToReverse, startPos - 1);
	return modifiedArray;
}

function padNumberWithZeros(numValue, desiredLength){
    const longZeroString = '000000000000000000000000000000000';
    return (numValue + longZeroString).slice(0, desiredLength);
}

function primeFactorsObj(numberToFactor){
    const factorResult = {};

    if (numberToFactor === 1) {
        return {"1":1};
    }

    let currentDivisor = 2;

    while (numberToFactor !== 1) {
        let i = currentDivisor;
        while (i < maxSafeInt) {
            if (numberToFactor % i === 0) {
                numberToFactor /= i;
                if (factorResult[i] === undefined) {
                    factorResult[i] = 0;
                }
                factorResult[i]++;
                break;
            }
            i++;
        }
        currentDivisor = i;
    }
    return factorResult;
}

function greatestCommonDivisor(valA, valB) {
    if (valB === 0){
        return valA;
    }
    return greatestCommonDivisor(valB, valA % valB);
}

function leastCommonMultiple(valA, valB) {
    const calculateGCDInternal = (x, y) => {
        if (y === 0) return x;
        return calculateGCDInternal(y, x % y);
    };
    return valA * valB / calculateGCDInternal(valA, valB);
}

function compareNumbers(valA, valB) {
  return valA - valB;
}

function binarySearchLargestLessEqual(sortedArray, targetValue){
	let foundIndex = -1;

	let leftBound = 0;
	let rightBound = sortedArray.length - 1;

	while(leftBound <= rightBound){
        const midIndex = Math.floor((leftBound + rightBound) / 2);

        if(sortedArray[midIndex] === targetValue){
            foundIndex = midIndex;
            break;
        } else if(sortedArray[midIndex] < targetValue){
            leftBound = midIndex + 1;
        } else {
            rightBound = midIndex - 1;
        }
	}
	if(foundIndex !== -1) return foundIndex;
	else return leftBound;
}

function splitByNewline(inputString){
  return inputString.split("\n");
}

function isArraySorted(inputArray){
  let sortedFlag = true;
  for(let k = 1; k < inputArray.length; k++){
    if(inputArray[k - 1] > inputArray[k]){
      sortedFlag = false;
      break;
    }
  }
  return sortedFlag;
}

function getPrimeFactorization(numberVal) {
	const sqrtOfNum = Math.floor(Math.sqrt(numberVal));
	let exponentCount = 0;
	const primeFactorsMap = {};

	for (let divisor = 2; divisor <= sqrtOfNum; divisor++) {
		if ((numberVal % divisor) === 0) {
			exponentCount = 0;
			do {
				exponentCount++;
				numberVal = numberVal / divisor;
			} while ((numberVal % divisor) === 0);
			primeFactorsMap[divisor] = exponentCount;
		}
	}

	if (numberVal > sqrtOfNum) {
		primeFactorsMap[numberVal] = 1;
	}

	return primeFactorsMap;
}
