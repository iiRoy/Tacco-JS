var INPUT_PARSER=(function(){
  // This function acts as a factory for creating input processing objects.
  function createReader(textData){
    return new LineByLineReader(textData);
  }

  // The core class responsible for parsing input line by line.
  function LineByLineReader(rawText){
    // Stores the input text, split into individual lines.
    this.textLines = rawText.trim().split("\n");
    // Pointer to the current line being processed.
    this.linePointer = 0;
  }

  // Extracts the last number from the current line, optionally returning it as a string.
  LineByLineReader.prototype.extractLastNumber=function(asString){
    var currentLines = this.textLines,
        lineIdx = this.linePointer,
        resultVal;
    // If the current line is a string, process it by reversing and splitting.
    if(typeof currentLines[lineIdx]==="string") {
      currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
    }
    // Pop the last element from the processed line.
    resultVal = currentLines[lineIdx].pop();
    // If the line is now empty, advance to the next line.
    if(!currentLines[lineIdx].length) this.linePointer++;
    // Return either the string or its numeric conversion.
    return asString ? resultVal : +resultVal;
  };

  // Reads an entire line and returns its space-separated values, optionally as strings.
  LineByLineReader.prototype.getLineAsNumbers=function(asString){
    var valuesOnLine = this.textLines[this.linePointer++].split(" ");
    // Return strings or map to numbers.
    return asString ? valuesOnLine : valuesOnLine.map(item => +item);
  };

  // Reads 'numRows' lines and parses them into a matrix (2D array of numbers).
  LineByLineReader.prototype.getMatrix=function(numRows,asString){
    var matrixData = this.textLines.slice(this.linePointer,this.linePointer+=numRows).map(line => line.split(" "));
    // Return string matrix or number matrix.
    return asString ? matrixData : matrixData.map(row => row.map(cell => +cell));
  };

  // Reads 'numElements' lines and parses them into a vector (1D array of numbers).
  LineByLineReader.prototype.getVector=function(numElements,asString){
    var vectorData = this.textLines.slice(this.linePointer,this.linePointer+=numElements);
    // Return string vector or number vector.
    return asString ? vectorData : vectorData.map(val => +val);
  };

  // The factory function is returned as the public interface.
  return createReader;
})();

// Create an input handler instance by reading from standard input.
var dataHandler = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Utility function to dynamically construct multi-dimensional arrays.
// It takes an initial value and then dimensions as subsequent arguments.
function createNDArray(initialValue){
  var argumentList = arguments,
      countOfArgs = argumentList.length,
      arrayDefinition = "Array(argumentList["+--countOfArgs+"]).fill(0).map(elem=>{return "+initialValue+";})";
  // Build the nested array creation string.
  while(--countOfArgs) arrayDefinition="Array(argumentList["+countOfArgs+"]).fill(0).map(elem=>"+arrayDefinition+")";
  // Evaluate the string to create the array.
  return eval(arrayDefinition);
}

// Computes the greatest common divisor of two non-negative integers using Euclidean algorithm.
function findCommonDivisor(firstNum,secondNum){
  return secondNum ? findCommonDivisor(secondNum,firstNum % secondNum) : firstNum;
}

// Entry point for the program execution.
runSolution();

// Main logic for the problem.
function runSolution(){
  // Read the total number of elements.
  var elementCount = dataHandler.extractLastNumber();
  // Read a sequence of numbers, including an extra element.
  var numericSequence = dataHandler.getVector(elementCount+1);

  // Calculate the GCD of all elements in the sequence.
  var overallGCD = numericSequence[0];
  for(var idx = 1; idx <= elementCount; idx++) overallGCD = findCommonDivisor(overallGCD, numericSequence[idx]);

  // Find prime factors of the absolute value of the overall GCD.
  var solutionSet = decomposeIntoPrimes(Math.abs(overallGCD));
  // Normalize the numeric sequence by dividing each element by the overall GCD.
  numericSequence = numericSequence.map(val => val / overallGCD);

  // Determine a set of candidate divisors for further checks.
  var candidateDivisors = decomposeIntoPrimes(Math.abs(numericSequence[elementCount]));
  // Special case: if the last element is zero, use a sieve to find primes up to elementCount.
  if(numericSequence[elementCount] === 0) candidateDivisors = generatePrimesUpTo(elementCount);

  // Iterate through the candidate divisors.
  for(var divisorCandidate of candidateDivisors){
    // Skip if already found or if the divisor is too large for the problem context.
    if(solutionSet.has(divisorCandidate) || elementCount < divisorCandidate) continue;

    // Flag to track if a specific condition holds for the current divisor.
    var conditionMet = 1;
    // Perform a series of checks based on modular arithmetic.
    for(var innerIdx = 0; innerIdx < divisorCandidate-1 && conditionMet; innerIdx++){
      var segmentSum = 0;
      // Sum elements with a specific step pattern.
      for(var jmpIdx = innerIdx; jmpIdx < elementCount; jmpIdx += divisorCandidate-1){
        segmentSum += numericSequence[jmpIdx];
      }
      // If the sum is not divisible by the candidate, the condition is not met.
      if(segmentSum % divisorCandidate !== 0) conditionMet = 0;
    }
    // If all checks pass, add the candidate divisor to the solution set.
    if(conditionMet) solutionSet.add(divisorCandidate);
  }

  // If there are any solutions, print them in sorted order.
  if(solutionSet.size) console.log(Array.from(solutionSet).sort((a,b)=>a-b).join("\n"));
}

// Function to find all unique prime factors of a given number.
function decomposeIntoPrimes(inputNumber){
  var factorSet = new Set(); // Stores the unique prime factors.
  // Iterate from 2 up to the square root of the number.
  for(var divisor = 2; divisor * divisor <= inputNumber; divisor++){
    // If 'divisor' is a factor.
    if(inputNumber % divisor === 0){
      factorSet.add(divisor); // Add it to the set.
      // Remove all occurrences of this factor.
      while(inputNumber % divisor === 0) inputNumber /= divisor;
    }
  }
  // If 'inputNumber' is still greater than 1, it means the remaining number is a prime factor itself.
  if(1 < inputNumber) factorSet.add(inputNumber);
  return factorSet;
}

// Generates a set of prime numbers up to a specified upper limit using the Sieve of Eratosthenes.
function generatePrimesUpTo(upperLimit){
  // Initialize a boolean array for the sieve, true means potentially prime.
  var sieveArray = Array(upperLimit+1).fill(1);
  var primeNumbers = new Set(); // Stores the found prime numbers.
  // Iterate from 2 up to the limit.
  for(var currentPrime = 2; currentPrime <= upperLimit; currentPrime++){
    // If currentPrime is marked as prime.
    if(sieveArray[currentPrime] === 0) continue; // Not prime, skip.
    primeNumbers.add(currentPrime); // Add to the set of primes.
    // Mark all multiples of currentPrime as not prime.
    for(var multiple = currentPrime+currentPrime; multiple <= upperLimit; multiple += currentPrime) sieveArray[multiple] = 0;
  }
  return primeNumbers;
}