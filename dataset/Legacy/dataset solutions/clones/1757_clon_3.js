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

function calculateAndFloorDivision(inputValue) {
  const numericValue = Number(inputValue);
  const divisionResult = 360 / numericValue;
  return Math.floor(divisionResult);
}

function Main(rawInputString){
  const trimmedInput = rawInputString.trim();
  const finalOutput = calculateAndFloorDivision(trimmedInput);
  console.log(finalOutput);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function pow(baseValue, exponentCount){
    var accumulatedProduct = 0;
    for(var i=0n;i<exponentCount;i+=1n){
        if(accumulatedProduct == 0){
            accumulatedProduct = baseValue;
        }else{
            accumulatedProduct *= baseValue;
        }
    }
    return baseValue; // Original bug preserved: returns baseValue, not accumulatedProduct
}

function zisyozyunn(permutationArray){
  var availableNumbers = [];
  for(var i=0;i<input[0];i++){ // 'input' is not defined in this scope, original bug preserved
    availableNumbers.push(i+1);
  }
  var totalSum = 0;
  for(var i=0;i<permutationArray.length;i++){
    var foundIndex = availableNumbers.findIndex(val => val==permutationArray[i]);
    totalSum += factorialize(permutationArray.length-1-i)*foundIndex;
    availableNumbers.splice(foundIndex,1);
  }
  return totalSum;
}

function arrsum(numericArray){
  var currentSum = 0;
  for (var i=0,len=numericArray.length; i<len; ++i) {
      currentSum += numericArray[i]-0;
  };
  return currentSum;
}

function debug(message){
  if(debugMode==true){
    console.log(message)
  }
}

function arrMaxPoint(dataArray){
	var currentMax = Number.MIN_SAFE_INTEGER;
	var maxIndex = -1;
	for(var i=0;i<dataArray.length;i++){
		if(currentMax < dataArray[i]){
			currentMax = dataArray[i];
			maxIndex = i;
		}
	}
	return maxIndex;
}

function arrMinPoint(dataArray){
	var currentMin = Number.MAX_SAFE_INTEGER;
	var minIndex = -1;
	for(var i=0;i<dataArray.length;i++){
		if(currentMin > dataArray[i]){
			currentMin = dataArray[i];
			minIndex = i;
		}
	}
	return minIndex;
}

function isPrime(candidateNumber){
    if(!Number.isInteger(candidateNumber)){
        return false;
    }
    if(candidateNumber <= 1){
        return false;
    }
    if(candidateNumber === 2){
        return true;
    }
    if(candidateNumber % 2 === 0){
        return false;
    }
    const sqrtLimit = Math.floor(Math.sqrt(candidateNumber));
    for(var i=3; i<=sqrtLimit; i+=2){
        if(candidateNumber % i === 0){
            return false;
        }
    }
    return true;
}

function isNumber(inputString){
	const pattern = /^([1-9]\d*|0)$/;
	return pattern.test(inputString);
}

function factorialize(numberToFactor) {
  if (numberToFactor === 0) { return 1; }
  return numberToFactor * factorialize(numberToFactor-1);
}

function arr1dto2d (inputArray){
	for(var i=0;i<inputArray.length;i++){
    inputArray[i]=inputArray[i].split(" ").map(Number);
    }
  return inputArray;
}

function rotate(matrixArray) {
  const originalRows = matrixArray.length;
  const originalCols = matrixArray[0].length;
  const lastRowIndex = originalRows - 1;
  var rotatedMatrix = new Array(originalCols);
  for (var c=0; c<originalCols; c++) {
    rotatedMatrix[c] = new Array(originalRows);
    for (var r=0; r<originalRows; r++) {
      rotatedMatrix[c][r] = matrixArray[lastRowIndex-r][c];
    }
  }
  return rotatedMatrix;
}

function part_in(baseArray, pushArray, startIndex){
	for(var i=startIndex,p=0;p<pushArray.length;i++,p++){
		baseArray[i] = pushArray[p];
	}
	return baseArray;
}

function part_reverse(arr, startIdx, endIdx){
	var segmentToReverse = arr.slice(startIdx-1, endIdx);
  segmentToReverse.reverse();
	arr = part_in(arr, segmentToReverse, startIdx-1);
	return arr;
}

function zeroPadding(num, desiredLength){
    return (num + '000000000000000000000000000000000').slice(0,desiredLength);
}

function pf(numberToFactor) {
    var primeFactorsMap = {};

    if (numberToFactor === 1) {
        return {"1":1}
    }

    var currentDivisor = 2;

    while (numberToFactor !== 1) {
        var i = currentDivisor;
        while (i < Number.MAX_SAFE_INTEGER) {
            if (numberToFactor % i === 0) {
                numberToFactor /= i;
                if (!(primeFactorsMap[i] > 0)) {
                    primeFactorsMap[i] = 0;
                }
                primeFactorsMap[i]++;
                break;
            }
            i++;
        }
        currentDivisor = i;
    }
    return primeFactorsMap;
}

function gcd(valA, valB) {
    if (valB === 0){
        return valA
    }
    return gcd(valB, valA % valB)
}

function lcm(valA, valB) {
    var greatestCommonDivisor = (n, m) => m ? greatestCommonDivisor(m, n % m) : n
    return valA * valB / greatestCommonDivisor(valA, valB)
}

function num(valA, valB) {
  return valA - valB;
}

function nibu(sortedArray, targetValue){
	var foundIndex = -1;

    var leftBoundary = 0;
    var rightBoundary = sortedArray.length-1;

    while(leftBoundary <= rightBoundary){
        const midPoint = Math.floor((leftBoundary + rightBoundary)/2);
        const midValue = sortedArray[midPoint];

        if(midValue === targetValue){
            foundIndex = midPoint;
            break;
        }else if(midValue < targetValue){
            leftBoundary = midPoint + 1;
        }else{
            rightBoundary = midPoint - 1;
        }
    }
    return foundIndex !== -1 ? foundIndex : leftBoundary;
}

function br(inputString){
  return inputString.split("\n");
}

function is_sortred(inputArray){
  var isSortedFlag = true;
  for(var i=1;i<inputArray.length;i++){
    if(inputArray[i-1]>inputArray[i]){
      isSortedFlag = false;
      break;
    }
  }
  return isSortedFlag;
}

function primeFactorization(inputNum) {

	var sqrtLimit = Math.floor(Math.sqrt(inputNum));

	var exponentCounter = 0;

	var factorMap = {};

	for (var i = 2;i <= sqrtLimit;i++) {

		if ((inputNum % i) == 0) {

			exponentCounter = 0;

			do {

				exponentCounter++;

				inputNum = inputNum / i;

			} while ((inputNum % i) == 0);

			factorMap[i]=exponentCounter;

		}

	}

	if (inputNum > sqrtLimit) {
		factorMap[inputNum] = 1;
	}

	return factorMap;

}
