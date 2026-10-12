const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;
const mod = 1000000007;

function Main(rawData){
    const lines = rawData.split("\n");
    let priceComponents = lines[0].split(" ").map(Number);
    const targetQuantity = Number(lines[1]);

    const applyPriceAdjustment = (currentPrice, previousPrice) => {
        const doubledPreviousPrice = previousPrice * 2;
        return currentPrice < doubledPreviousPrice ? currentPrice : doubledPreviousPrice;
    };

    priceComponents[1] = applyPriceAdjustment(priceComponents[1], priceComponents[0]);
    priceComponents[2] = applyPriceAdjustment(priceComponents[2], priceComponents[1]);
    priceComponents[3] = applyPriceAdjustment(priceComponents[3], priceComponents[2]);

    const priceForTwoUnits = priceComponents[3];
    const priceForOneUnit = priceComponents[2];

    const numberOfPairs = Math.floor(targetQuantity / 2);
    const remainingSingleUnits = targetQuantity % 2;

    const totalCalculatedCost = (numberOfPairs * priceForTwoUnits) + (remainingSingleUnits * priceForOneUnit);
    console.log(totalCalculatedCost);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function zisyozyunn(sequence){
  var availableNumbers = [];
  // The original code refers to a global 'input[0]' here.
  // This variable is not defined within this snippet's scope.
  // Preserving the reference as 'globalInputZero' to maintain original behavior.
  const globalInputZero = input[0];
  for(var i = 0; i < globalInputZero; i++){
    availableNumbers.push(i + 1);
  }
  var permutationSum = 0;
  for(var i = 0; i < sequence.length; i++){
    var foundElementIndex = availableNumbers.findIndex(val => val === sequence[i]);
    permutationSum += factorialize(sequence.length - 1 - i) * foundElementIndex;
    availableNumbers.splice(foundElementIndex, 1);
  }
  return permutationSum;
}

function calculateArraySum(numericArray){
  let totalSum = 0;
  for (let idx = 0, arrayLength = numericArray.length; idx < arrayLength; ++idx) {
      totalSum += numericArray[idx] - 0;
  };
  return totalSum;
}

function debug(messageContent){
  if(debugMode === true){
    console.log(messageContent);
  }
}

function findArrayMaxPoint(dataArray){
	let maxValue = Number.MIN_SAFE_INTEGER;
	let maxIndex = -1;
	for(let idx = 0; idx < dataArray.length; idx++){
		if(maxValue < dataArray[idx]){
			maxValue = dataArray[idx];
			maxIndex = idx;
		}
	}
	return maxIndex;
}

function findArrayMinPoint(dataArray){
	let minValue = Number.MAX_SAFE_INTEGER;
	let minIndex = -1;
	for(let idx = 0; idx < dataArray.length; idx++){
		if(minValue > dataArray[idx]){
			minValue = dataArray[idx];
			minIndex = idx;
		}
	}
	return minIndex;
}

function convert1dTo2d(stringMatrix){
    // Using map for a more functional and concise transformation
    const transformedMatrix = stringMatrix.map(rowString => rowString.split(""));
    return transformedMatrix;
}

function isPrime(candidateNum){
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

function isNumber(testValue){
	const numericPattern = /^([1-9]\d*|0)$/;
	return numericPattern.test(testValue);
}

function factorialize(inputNumber) {
  if (inputNumber === 0) { return 1; }
  return inputNumber * factorialize(inputNumber - 1);
}

function rotate(originalMatrix) {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;
  const lastRowIndex = numRows - 1;
  var rotatedMatrix = new Array(numCols);
  for (var colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows);
    for (var rowIdx = 0; rowIdx < numRows; rowIdx++) {
      rotatedMatrix[colIdx][rowIdx] = originalMatrix[lastRowIndex - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

function part_in(targetArray, sourceElements, startIndex){
	for(let targetIdx = startIndex, sourceIdx = 0; sourceIdx < sourceElements.length; targetIdx++, sourceIdx++){
		targetArray[targetIdx] = sourceElements[sourceIdx];
	}
	return targetArray;
}

function part_reverse(dataCollection, startPosition, endPosition){
	let subArrayToReverse = dataCollection.slice(startPosition - 1, endPosition);
    subArrayToReverse.reverse();
	dataCollection = part_in(dataCollection, subArrayToReverse, startPosition - 1);
	return dataCollection;
}

function zeroPadding(valueToPad, desiredLength){
    return (valueToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

function pf(numberToFactor) {
    const primeFactorsMap = {};

    if (numberToFactor === 1) {
        return {"1": 1};
    }

    let currentDivisorCandidate = 2;

    while (numberToFactor > 1) {
        let divisorIterator = currentDivisorCandidate;
        // The original uses Number.MAX_SAFE_INTEGER, which is effectively an unbounded search.
        // This loop will always find a factor or eventually hit numberToFactor itself.
        while (true) {
            if (numberToFactor % divisorIterator === 0) {
                numberToFactor /= divisorIterator;
                primeFactorsMap[divisorIterator] = (primeFactorsMap[divisorIterator] || 0) + 1;
                break;
            }
            divisorIterator++;
        }
        currentDivisorCandidate = divisorIterator;
    }
    return primeFactorsMap;
}

function gcd(numA, numB) {
    if (numB === 0){
        return numA;
    }
    return gcd(numB, numA % numB);
}

function lcm(valA, valB) {
    const greatestCommonDivisorFn = (n, m) => m ? greatestCommonDivisorFn(m, n % m) : n;
    return valA * valB / greatestCommonDivisorFn(valA, valB);
}

function num(val1, val2) {
  return val1 - val2;
}

function nibu(sortedArray, targetValue){
	let foundIndex = -1;

    let leftBound = 0;
    let rightBound = sortedArray.length - 1;

    while(leftBound <= rightBound){
        const midPoint = Math.floor((leftBound + rightBound) / 2);

        if(sortedArray[midPoint] === targetValue){
            foundIndex = midPoint;
            break;
        } else if(sortedArray[midPoint] < targetValue){
            leftBound = midPoint + 1;
        } else {
            rightBound = midPoint - 1;
        }
    }
    // The original returns `left` if not found, which is the insertion point.
    // This behavior is preserved.
    return foundIndex !== -1 ? foundIndex : leftBound;
}

function br(rawInputString){
  return rawInputString.split("\n");
}

function is_sortred(inputArray){
  let isSortedFlag = true;
  for(let elementIndex = 1; elementIndex < inputArray.length; elementIndex++){
    if(inputArray[elementIndex - 1] > inputArray[elementIndex]){
      isSortedFlag = false;
      break;
    }
  }
  return isSortedFlag;
}

function primeFactorization(numberToFactorize) {
	// Store the initial square root of the original number
	const initialSqrt = Math.floor(Math.sqrt(numberToFactorize));
	let exponentCount = 0;
	const factorMap = {};

	// Find prime factors from 2 up to the initial square root
	for (let currentFactor = 2; currentFactor <= initialSqrt; currentFactor++) {
		if ((numberToFactorize % currentFactor) === 0) {
			exponentCount = 0; // Reset exponent counter for the current factor
			do {
				exponentCount++; // Increment exponent
				numberToFactorize /= currentFactor; // Divide the number by the factor
			} while ((numberToFactorize % currentFactor) === 0);
			// Store the prime factor and its exponent in the map
			factorMap[currentFactor] = exponentCount;
		}
	}

	// If the remaining numberToFactorize is greater than the initial square root,
	// it means it's a prime factor itself (as per original logic).
	if (numberToFactorize > initialSqrt) {
		factorMap[numberToFactorize] = 1;
	}

	return factorMap;
}
