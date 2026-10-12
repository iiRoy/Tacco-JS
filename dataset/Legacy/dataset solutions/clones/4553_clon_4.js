const isDebuggingEnabled = false;
const maxSafeInt = Number.MAX_SAFE_INTEGER;
const modulusValue = 1000000007;

function Main(rawInputString){
    const [inputN, inputA, inputB] = rawInputString.split(" ").map(BigInt);

    const isFirstConditionMet = (inputA === inputB);
    const isSecondConditionMet = (inputA > inputB || inputN === 1n);

    // Calculate the formula part, which is used only if neither of the first two conditions are met.
    // Original formula: ((inputN - 1n) * inputB + inputA) - ((inputN - 1n) * inputA + inputB) + 1n
    // Simplified: (inputN - 2n) * (inputB - inputA) + 1n
    const formulaResult = (inputN - 2n) * (inputB - inputA) + 1n;

    // Use boolean arithmetic to select the correct result without explicit if/else if/else statements.
    // BigInt(true) is 1n, BigInt(false) is 0n.
    // This structure ensures priority:
    // 1. If isFirstConditionMet is true, result is 1n.
    // 2. Else if isSecondConditionMet is true, result is 0n.
    // 3. Else, result is formulaResult.
    const finalOutcome =
        (BigInt(isFirstConditionMet) * 1n) +
        (BigInt(!isFirstConditionMet && isSecondConditionMet) * 0n) +
        (BigInt(!isFirstConditionMet && !isSecondConditionMet) * formulaResult);

    console.log(finalOutcome.toString());
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function brokenBigIntPower(baseVal, exponentVal){
    var currentResult = 0;
    for(var i=0n;i<exponentVal;i+=1n){
        if(currentResult == 0){
            currentResult = baseVal;
        }else{
            currentResult *= baseVal;
        }
    }
    return baseVal; // Preserving the original bug: should return currentResult
}

function calculateLexicographicalRank(inputArray){
  var availableNumbers = [];
  for(var i=0;i<input[0];i++){ // Preserving original behavior: 'input' refers to an undeclared global variable.
    availableNumbers.push(i+1);
  }
  var totalSum = 0;
  for(var i=0;i<inputArray.length;i++){
    var foundIndex = availableNumbers.findIndex(val => val==inputArray[i]);
    totalSum += computeFactorial(inputArray.length-1-i)*foundIndex;
    availableNumbers.splice(foundIndex,1);
  }
  return totalSum;
}

function sumArrayElements(targetArray){
  var total = 0;
  for (var i=0,len=targetArray.length; i<len; ++i) {
      total += targetArray[i]-0;
  };
  return total;
}

function logDebugMessage(valueToLog){
  if(isDebuggingEnabled==true){
    console.log(valueToLog)
  }
}

function findMaxElementIndex(dataArray){
	var maximum = Number.MIN_SAFE_INTEGER;
	var indexPosition = -1;
	for(var i=0;i<dataArray.length;i++){
		if(maximum<dataArray[i]){
			maximum = dataArray[i];
			indexPosition = i;
		}
	}
	return indexPosition;
}

function findMinElementIndex(dataArray){
	var minimum = Number.MAX_SAFE_INTEGER;
	var indexPosition = -1;
	for(var i=0;i<dataArray.length;i++){
		if(minimum>dataArray[i]){
			minimum = dataArray[i];
			indexPosition = i;
		}
	}
	return indexPosition;
}

function checkIfPrime(numberToCheck){
    if(false===Number.isInteger(numberToCheck)){
        return false;
    }
    if(numberToCheck<=1){
        return false;
    }
    if(2===numberToCheck){
        return true;
    }
    if(0===numberToCheck%2){
        return false;
    }
    var squareRoot = Math.floor(Math.sqrt(numberToCheck));
    for(var i=3; i<=squareRoot; i+=2){
        if(0===numberToCheck%i){
            return false;
        }
    }
    return true;
}

function validateIfNumber(valueToValidate){
	const numberPattern = /^([1-9]\d*|0)$/;
	return numberPattern.test(valueToValidate);
}

function computeFactorial(numberVal) {
  if (numberVal === 0) { return 1; }
  return numberVal * computeFactorial(numberVal-1);
}

function convert1DTo2DArray (oneDArray){
	for(var i=0;i<oneDArray.length;i++){
    oneDArray[i]=oneDArray[i].split(" ").map(Number);
    }
  return oneDArray;
}

function rotate2DArray(inputMatrix) {
  const numRows = inputMatrix.length;
  const numCols = inputMatrix[0].length;
  const lastRowIndex = numRows-1;
  var rotatedMatrix = new Array(numCols);
  for (var c=0; c<numCols; c++) {
    rotatedMatrix[c] = new Array(numRows);
    for (var r=0; r<numRows; r++) {
      rotatedMatrix[c][r] = inputMatrix[lastRowIndex-r][c];
    }
  }
  return rotatedMatrix;
}

function insertSubarray(baseArray, subArray, startIndex){
	for(var i=startIndex,p=0;p<subArray.length;i++,p++){
		baseArray[i] = subArray[p];
	}
	return baseArray;
}

function reverseSubarrayInPlace(targetArray, startIdx, endIdx){
	var segmentToReverse = targetArray.slice(startIdx-1, endIdx);
  segmentToReverse.reverse();
	targetArray = insertSubarray(targetArray, segmentToReverse, startIdx-1);
	return targetArray;
}

function applyZeroPadding(numberValue, desiredLength){
    return (numberValue + '000000000000000000000000000000000').slice(0,desiredLength);
}

function computePrimeFactors(numberInput) {
    var factorMap = {};

    if (numberInput === 1) {
        return {"1":1}
    }

    var currentDivisor = 2;

    while (numberInput !== 1) {
        var i = currentDivisor;
        while (i < Number.MAX_SAFE_INTEGER) {
            if (numberInput % i === 0) {
                numberInput /= i;
                if (!(factorMap[i] > 0)) {
                    factorMap[i] = 0;
                }
                factorMap[i]++;
                break;
            }
            i++;
        }
        currentDivisor = i;
    }
    return factorMap;
}

function calculateGCD(val1, val2) {
    if (val2 === 0){
        return val1
    }
    return calculateGCD(val2, val1 % val2)
}

function calculateLCM(val1, val2) {
    var commonDivisor = (n, m) => m ? commonDivisor(m, n % m) : n
    return val1 * val2 / commonDivisor(val1, val2)
}

function subtractNumbers(valA, valB) {
  return valA - valB;
}

function findLargestSmallerOrEqualIndex(sortedArray, searchVal){
	var resultIndex = -1;

    var leftPointer = 0;
    var rightPointer = sortedArray.length-1;

    while(leftPointer <= rightPointer){
        var middlePointer = Math.floor((leftPointer + rightPointer)/2);

        if(sortedArray[middlePointer]==searchVal){
            resultIndex = middlePointer;
            break;
        }else if(sortedArray[middlePointer]<searchVal){
            leftPointer = middlePointer +1;
        }else{
            rightPointer = middlePointer -1;
        }
    }
    if(resultIndex!=-1) return resultIndex;
    else return leftPointer;
}

function splitInputByNewline(inputString){
  return inputString.split("\n");
}

function isSortedAscendingOrder(dataArr){
  var sortedFlag = true;
  for(var i=1;i<dataArr.length;i++){
    if(dataArr[i-1]>dataArr[i]){
      sortedFlag = false;
      break;
    }
  }
  return sortedFlag;
}

function factorizeIntoPrimes(numToFactor) {
	var sqrtNum = Math.floor(Math.sqrt(numToFactor));
	var remainder = 0;
	var primeFactorsResult = {};

	for (var i = 2;i <= sqrtNum;i++) {
		if ((numToFactor % i) == 0) {
			remainder = 0;
			do {
				remainder++;
				numToFactor = numToFactor / i;
			} while ((numToFactor % i) == 0);
			primeFactorsResult[i]=remainder;
		}
	}
	if (numToFactor > sqrtNum) {
		primeFactorsResult[numToFactor] = 1;
	}
	return primeFactorsResult;
}
