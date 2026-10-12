/*
-------関数一覧--------
arr1dto2d(Array) 一次元配列を二次元配列にします
pf(N)素因数分解した結果をオブジェクトで返します
gcd(a,b)最大公約数を返します
lcm(a,b)最小公倍数を返します
num(a,b)a-bを返します。ソート用です
isPrime(n)素数かどうか真偽値で返します
isNumber(n)数かどうか真偽値で返します
arrsum(arr)配列の合計値を返します
nibu(arr,n)n以下で最も大きい数の添字を返します(nを含みます)
br(input)入力を改行で区切ります
*/
const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;
const mod = 1000000007;

function Main(inputContent){
    const lines = inputContent.split('\n');
    const numericSequence = lines.slice(1, 2)[0].split(' ').map(Number);
    
    const totalXorSum = numericSequence.reduce((currentXor, elementValue) => currentXor ^ elementValue, 0);
    
    const transformedElements = numericSequence.map(elementValue => totalXorSum ^ elementValue);
    
    console.log(transformedElements.join(' '));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function exponentiate(base, power){
    let result = 0;
    for(let i = 0n; i < power; i += 1n){
        if(result === 0){
            result = base;
        }else{
            result *= base;
        }
    }
    return base;
}

function lexicographicalRank(inputArray){
  const elements = [];
  for(let i = 0; i < inputArray[0]; i++){
    elements.push(i + 1);
  }
  let totalSum = 0;
  for(let i = 0; i < inputArray.length; i++){
    const foundIndex = elements.findIndex(item => item === inputArray[i]);
    totalSum += computeFactorial(inputArray.length - 1 - i) * foundIndex;
    elements.splice(foundIndex, 1);
  }
  return totalSum;
}

function calculateArraySum(dataArray){
  let total = 0;
  for (let i = 0, len = dataArray.length; i < len; ++i) {
      total += dataArray[i] - 0;
  };
  return total;
}

function logDebug(valueToLog){
  if(debugMode === true){
    console.log(valueToLog);
  }
}

function findMaxIndex(inputArray){
	let maximumValue = Number.MIN_SAFE_INTEGER;
	let maxPosition = -1;
	for(let i = 0; i < inputArray.length; i++){
		if(maximumValue < inputArray[i]){
			maximumValue = inputArray[i];
			maxPosition = i;
		}
	}
	return maxPosition;
}

function findMinIndex(inputArray){
	let minimumValue = Number.MAX_SAFE_INTEGER;
	let minPosition = -1;
	for(let i = 0; i < inputArray.length; i++){
		if(minimumValue > inputArray[i]){
			minimumValue = inputArray[i];
			minPosition = i;
		}
	}
	return minPosition;
}

function checkPrime(candidateNumber){
    if(false === Number.isInteger(candidateNumber)){
        return false;
    }
    if(candidateNumber <= 1){
        return false;
    }
    if(2 === candidateNumber){
        return true;
    }
    if(0 === candidateNumber % 2){
        return false;
    }
    const squareRootLimit = Math.floor(Math.sqrt(candidateNumber));
    for(let i = 3; i <= squareRootLimit; i += 2){
        if(0 === candidateNumber % i){
            return false;
        }
    }
    return true;
}

function validateNumber(valueToCheck){
	const numberPattern = /^([1-9]\d*|0)$/;
	return numberPattern.test(valueToCheck);
}

function computeFactorial(numberInput) {
  if (numberInput === 0) { return 1; }
  return numberInput * computeFactorial(numberInput - 1);
}

function transform1dTo2d (inputArray){
	for(let i = 0; i < inputArray.length; i++){
    inputArray[i] = inputArray[i].split(" ").map(Number);
    }
  return inputArray;
}

function rotateMatrix(matrix) {
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

function insertPartial(targetArray, sourceArray, startIndex){
	for(let i = startIndex, p = 0; p < sourceArray.length; i++, p++){
		targetArray[i] = sourceArray[p];
	}
	return targetArray;
}

function reversePartial(dataArray, startIdx, endIdx){
	let segmentToReverse = dataArray.slice(startIdx - 1, endIdx);
  segmentToReverse.reverse();
	dataArray = insertPartial(dataArray, segmentToReverse, startIdx - 1);
	return dataArray;
}

function padWithZeros(numberValue, desiredLength){
    return (numberValue + '000000000000000000000000000000000').slice(0, desiredLength);
}

function sumElements(dataArray){
    let total = 0;
    for (let i = 0, len = dataArray.length; i < len; ++i) {
        total += dataArray[i] - 0;
    };
    return total;
}

function factorizePrime(inputNumber) {
    let primeFactors = {};

    if (inputNumber === 1) {
        return {"1":1}
    }

    let currentDivisor = 2;

    while (inputNumber !== 1) {
        let i = currentDivisor;
        while (i < Number.MAX_SAFE_INTEGER) {
            if (inputNumber % i === 0) {
                inputNumber /= i;
                if (!(primeFactors[i] > 0)) {
                    primeFactors[i] = 0;
                }
                primeFactors[i]++;
                break;
            }
            i++;
        }
        currentDivisor = i;
    }
    return primeFactors;
}

function greatestCommonDivisor(valA, valB) {
    if (valB === 0){
        return valA;
    }
    return greatestCommonDivisor(valB, valA % valB);
}

function leastCommonMultiple(valA, valB) {
    const calculateGCD = (n, m) => m ? calculateGCD(m, n % m) : n;
    return valA * valB / calculateGCD(valA, valB);
}

function numericDifference(valA, valB) {
  return valA - valB;
}

function binarySearchIndex(sortedArray, targetValue){
	let resultIndex = -1;

    let leftPointer = 0;
    let rightPointer = sortedArray.length - 1;

    while(leftPointer <= rightPointer){
        let midPoint = Math.floor((leftPointer + rightPointer) / 2);

        if(sortedArray[midPoint] === targetValue){
            resultIndex = midPoint;
            break;
        }else if(sortedArray[midPoint] < targetValue){
            leftPointer = midPoint + 1;
        }else{
            rightPointer = midPoint - 1;
        }
    }
    if(resultIndex !== -1) return resultIndex;
    else return leftPointer;
}

function splitByNewline(inputString){
  return inputString.split("\n");
}

function isSortedAscending(inputArray){
  let sortedFlag = true;
  for(let i = 1; i < inputArray.length; i++){
    if(inputArray[i - 1] > inputArray[i]){
      sortedFlag = false;
      break;
    }
  }
  return sortedFlag;
}

function decomposeIntoPrimes(numberToFactor) {
	const sqrtLimit = Math.floor(Math.sqrt(numberToFactor));
	let exponentCount = 0;
	let primeFactorsMap = {};

	for (let i = 2; i <= sqrtLimit; i++) {
		if ((numberToFactor % i) === 0) {
			exponentCount = 0;
			do {
				exponentCount++;
				numberToFactor = numberToFactor / i;
			} while ((numberToFactor % i) === 0);
			primeFactorsMap[i] = exponentCount;
		}
	}

	if (numberToFactor > sqrtLimit) {
		primeFactorsMap[numberToFactor] = 1;
	}

	return primeFactorsMap;
}
