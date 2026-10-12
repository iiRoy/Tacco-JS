var INPUT_PARSER = (function () {
  // This factory function creates an instance of the input processing utility.
  function createParser(sourceText) {
    return new InputSource(sourceText);
  }

  // The InputSource constructor initializes the internal state for reading lines.
  function InputSource(sourceText) {
    // Stores all input lines after trimming whitespace and splitting by newline.
    this._lines = sourceText.trim().split("\n");
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
  }

  // Reads a single value from the current line, treating it as a number by default.
  // Values on a line are assumed to be space-separated and are consumed from right-to-left.
  // The 'asString' parameter, if true, returns the value as a string instead of a number.
  InputSource.prototype.readNumber = function (asString) {
    var lineData = this._lines,
      lineIdx = this._currentLineIndex,
      resultVal;

    // If the current line is still a raw string, parse it into an array of strings,
    // reversing it to allow efficient 'pop' operations from the end.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Extract the next value from the current line.
    resultVal = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line for subsequent reads.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, converting to a number if 'asString' is not explicitly true.
    return asString ? resultVal : +resultVal;
  };

  // Reads an entire line of space-separated values.
  // By default, it converts all values to numbers. If 'asString' is true, it returns strings.
  InputSource.prototype.readNumbersLine = function (asString) {
    // Retrieve the current line, split it by spaces, and then increment the line index.
    var parsedData = this._lines[this._currentLineIndex++].split(" ");
    // Map the array elements to numbers if 'asString' is false, otherwise return as strings.
    return asString ? parsedData : parsedData.map((element) => +element);
  };

  // Reads a block of 'numLines' lines, treating each line as a row in a matrix.
  // Each row is split by spaces. By default, all values are converted to numbers.
  // If 'asString' is true, the matrix contains string values.
  InputSource.prototype.readMatrix = function (numLines, asString) {
    // Extract the specified number of lines and split each line into an array of strings.
    var parsedData = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((element) => element.split(" "));
    // If 'asString' is false, further map each string element to a number.
    return asString
      ? parsedData
      : parsedData.map((row) => row.map((element) => +element));
  };

  // Reads a block of 'numLines' lines, where each line contains a single value.
  // By default, these values are converted to numbers. If 'asString' is true, they remain strings.
  InputSource.prototype.readNumbersArray = function (numLines, asString) {
    // Extract the specified number of lines from the input source.
    var parsedData = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    // Convert each element to a number if 'asString' is false.
    return asString ? parsedData : parsedData.map((element) => +element);
  };

  // The IIFE returns the factory function 'createParser'.
  return createParser;
})();

// Initialize the input reader by synchronously reading the content of /dev/stdin.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Dynamically creates a multi-dimensional array with a specified initial value and dimensions.
// This function uses `eval` to construct the array creation expression.
function createMultiDimArray(initialValue) {
  var dimensions = arguments,
    dimCount = dimensions.length,
    arrayExpression =
      "Array(dimensions[" +
      --dimCount +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  // Build the nested Array.map structure for higher dimensions.
  while (--dimCount) {
    arrayExpression =
      "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayExpression + ")";
  }
  // Execute the constructed string as JavaScript code.
  return eval(arrayExpression);
}

// Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
function greatestCommonDivisor(num1, num2) {
  // Base case: if num2 is 0, num1 is the GCD.
  return num2 ? greatestCommonDivisor(num2, num1 % num2) : num1;
}

// Initiates the primary logic of the program.
executeSolution();

// The main function encapsulating the problem's solution.
function executeSolution() {
  // Read the total count of elements from the input.
  var countElements = inputReader.readNumber();
  // Read an array of numbers, including an additional element as per problem specification.
  var inputNumbers = inputReader.readNumbersArray(countElements + 1);

  // Calculate the GCD of all numbers in the 'inputNumbers' array.
  var commonDivisor = inputNumbers[0];
  for (var idx = 1; idx <= countElements; idx++) {
    commonDivisor = greatestCommonDivisor(commonDivisor, inputNumbers[idx]);
  }

  // Find the prime factors of the absolute value of the calculated common divisor.
  var primeFactorsSet = getPrimeFactors(Math.abs(commonDivisor));

  // Divide each number in the input array by the common divisor.
  inputNumbers = inputNumbers.map((val) => val / commonDivisor);

  // Determine an initial set of potential primes based on the last element of the modified array.
  var potentialPrimes = getPrimeFactors(Math.abs(inputNumbers[countElements]));
  // If the last element is zero, consider all primes up to 'countElements' as potential.
  if (inputNumbers[countElements] === 0) {
    potentialPrimes = sieveOfEratosthenes(countElements);
  }

  // Iterate through each potential prime to check for a specific divisibility condition.
  for (var currentPrime of potentialPrimes) {
    // Skip if the prime is already in our set or if it's too large for the current 'countElements'.
    if (primeFactorsSet.has(currentPrime) || countElements < currentPrime) {
      continue;
    }

    // Flag to track if the current prime satisfies the divisibility condition.
    var isDivisible = 1;
    // Loop through 'currentPrime - 1' possible starting indices for sub-array sums.
    for (
      var startIdx = 0;
      startIdx < currentPrime - 1 && isDivisible;
      startIdx++
    ) {
      var currentSum = 0;
      // Calculate the sum of elements, stepping by 'currentPrime - 1'.
      for (
        var innerLoopIdx = startIdx;
        innerLoopIdx < countElements;
        innerLoopIdx += currentPrime - 1
      ) {
        currentSum += inputNumbers[innerLoopIdx];
      }
      // If the sum is not divisible by 'currentPrime', then this prime fails the condition.
      if (currentSum % currentPrime !== 0) {
        isDivisible = 0;
      }
    }
    // If the prime passed all divisibility checks, add it to the final set of prime factors.
    if (isDivisible) {
      primeFactorsSet.add(currentPrime);
    }
  }

  // If any prime factors were found, sort them numerically and print each on a new line.
  if (primeFactorsSet.size) {
    console.log(
      Array.from(primeFactorsSet)
        .sort((valA, valB) => valA - valB)
        .join("\n")
    );
  }
}

// Finds all unique prime factors of a given positive integer.
function getPrimeFactors(targetNumber) {
  var factorsCollection = new Set();
  // Iterate from 2 up to the square root of the target number.
  for (var divisor = 2; divisor * divisor <= targetNumber; divisor++) {
    // If 'divisor' is a factor of 'targetNumber'.
    if (targetNumber % divisor === 0) {
      factorsCollection.add(divisor); // Add it to the set of factors.
      // Continuously divide 'targetNumber' by 'divisor' until it's no longer divisible.
      while (targetNumber % divisor === 0) {
        targetNumber /= divisor;
      }
    }
  }
  // If 'targetNumber' is still greater than 1 after the loop, it means the remaining
  // 'targetNumber' itself is a prime factor (larger than its square root).
  if (1 < targetNumber) {
    factorsCollection.add(targetNumber);
  }
  return factorsCollection;
}

// Implements the Sieve of Eratosthenes to find all prime numbers up to a specified limit.
function sieveOfEratosthenes(limitValue) {
  // Initialize an array where `isPrimeArray[i]` is 1 if 'i' is potentially prime, 0 otherwise.
  // All numbers are initially considered prime.
  var isPrimeArray = Array(limitValue + 1).fill(1);
  var primeNumbersSet = new Set();

  // Start checking for primes from 2.
  for (var currentNum = 2; currentNum <= limitValue; currentNum++) {
    // If 'currentNum' has already been marked as not prime, skip it.
    if (isPrimeArray[currentNum] === 0) {
      continue;
    }
    // If 'currentNum' is prime, add it to our set.
    primeNumbersSet.add(currentNum);
    // Mark all multiples of 'currentNum' (starting from currentNum * 2) as not prime.
    for (
      var multiple = currentNum + currentNum;
      multiple <= limitValue;
      multiple += currentNum
    ) {
      isPrimeArray[multiple] = 0;
    }
  }
  return primeNumbersSet;
}
