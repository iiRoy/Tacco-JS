// Input handling utilities: Please do not modify this section.
const   consoleReader = require('readline') .createInterface(  {
    input  : process.stdin,
    output : process.stdout
} );
let     inputProcessor;
const   collectedLines = [];
consoleReader.on ( 'line',  (incomingLine) => {  collectedLines.push(incomingLine); }  );
consoleReader.on('close' , function ( ) {
    inputProcessor = initializeInputHandler(collectedLines);
    console.error ( "debug:--- Execution Start ---" );
    const executionStart = new Date();
    executeMainAlgorithm();
    const durationMs = new Date() - executionStart;
    console.error ( "debug:--- Execution End ---" );
    console.error ( `debug:Time elapsed: ${durationMs}ms` );
    console.error ( `debug:Memory used: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB` );
});

function retrieveInteger ( ) { return convertInputType ( fetchNextItem(), 1 ); }
function retrieveStringArray ( ) { return convertInputType ( fetchNextItem(), 2 ); }
function retrieveIntegerArray ( ) { return convertInputType ( fetchNextItem(), 4 ); }
function retrieveCharacterArray ( ) { return convertInputType ( fetchNextItem(), 6 ); }

function fetchNextItem ( ) { return inputProcessor.getNextValue(); }
function hasMoreInput ( ) { return inputProcessor.hasMoreElements(); }

// Initializes an object for sequential input processing.
function initializeInputHandler (sourceData) {
    const dataHandler = {
        valueList : sourceData,
        currentIdx : 0,
        maxCount : sourceData.length,
        hasMoreElements : function ( ) {
            return ( this.currentIdx < this.maxCount );
        },
        getNextValue : function ( ) {
            if ( !this.hasMoreElements() ) {
                throw new Error("InputOutOfBoundsException : No more elements to retrieve.");
            } else {
                const fetchedValue = this.valueList[this.currentIdx];
                this.currentIdx++;
                return fetchedValue;
            }
        }
    };
    return dataHandler;
}

function outputResult (content) { console.log(content); }

function logDebug (message) {
    console.error ( `debug:${require("util").inspect(message, false, null)}` );
}

/*
 * This function handles various input transformations.
 * Parameter 'dataItem': The item to be converted.
 * Parameter 'conversionType': Specifies the type of conversion.
 * 1: Convert to integer.
 * 2: Split by space into string array.
 * 4: Split by space and convert to number array.
 * 6: Split into character array.
 * 7: Split into character array and convert to number array.
 * 8: Join array elements with space.
 * 9: Join array elements with newline.
 * 0: Join array elements without separator.
 * Default: Return dataItem as is.
 */
function convertInputType (dataItem, conversionType) {
    try {
        switch (conversionType) {
            case 1: return parseInt(dataItem, 10);
            case 2: return dataItem.split(" ");
            case 4: return dataItem.split(" ").map(Number);
            case 6: return dataItem.split("");
            case 7: return dataItem.split("").map(Number);
            case 8: return dataItem.join(" ");
            case 9: return dataItem.join("\n");
            case 0: return dataItem.join("");
            default: return dataItem;
        }
    } catch (error) {
        return dataItem; // If conversion fails, return original.
    }
}

// End of helper functions. Do not alter this header.
function executeMainAlgorithm() {
  const currentNum = retrieveInteger();
  const primaryDivisors = calculateAllDivisors(currentNum);
  const oneLessDivisors = calculateAllDivisors(currentNum - 1);
  const distinctSolutions = new Set();

  // Add divisors of (N-1) to the set, excluding 1.
  for (let idx = 1; idx < oneLessDivisors.length; idx++) {
    distinctSolutions.add(oneLessDivisors[idx]);
  }

  // Iterate through divisors of N to find special cases.
  for (let jdx = 1; jdx < primaryDivisors.length; jdx++) {
    let tempValue = currentNum;
    const currentDiv = primaryDivisors[jdx];

    // Repeatedly divide or take modulo.
    while (tempValue >= currentDiv) {
      if (tempValue % currentDiv === 0) {
        tempValue /= currentDiv;
      } else {
        tempValue %= currentDiv;
      }
    }
    // If the value reduces to 1, add the divisor to solutions.
    if (tempValue === 1) {
      distinctSolutions.add(currentDiv);
    }
  }
  outputResult(distinctSolutions.size);
}

// Computes all divisors for a given number.
function calculateAllDivisors(inputNumber) {
  const divisorStorage = [];
  for (let kdx = 1; kdx * kdx <= inputNumber; kdx++) {
    if (inputNumber % kdx === 0) {
      divisorStorage.push(kdx);
      if (kdx * kdx !== inputNumber) {
        divisorStorage.push(inputNumber / kdx);
      }
    }
  }
  // Sort the divisors in ascending order.
  divisorStorage.sort((valA, valB) => valA - valB);
  return divisorStorage;
}

// Determines if a number is prime.
function checkIfPrime(numericValue) {
  if (numericValue === null || numericValue <= 1 || (numericValue !== 2 && numericValue % 2 === 0)) {
    return false;
  } else if (numericValue === 2) {
    return true;
  }
  const squareRootLimit = Math.floor(Math.sqrt(numericValue));
  for (let count = 3; count <= squareRootLimit; count += 2) {
    if (numericValue % count === 0) {
      return false;
    }
  }
  return true;
}

// Generates a map of prime factors and their counts.
function computePrimeFactors(valueToFactor) {
  const primeFactorMap = {};
  let currentFactor = 2;
  while (valueToFactor !== 1) {
    if (valueToFactor % currentFactor === 0) {
      primeFactorMap[currentFactor] = (primeFactorMap[currentFactor] === undefined) ? 1 : primeFactorMap[currentFactor] + 1;
      valueToFactor /= currentFactor;
      // Optimization: if remaining value is prime, add it and break.
      if (checkIfPrime(valueToFactor)) {
        primeFactorMap[valueToFactor] = (primeFactorMap[valueToFactor] === undefined) ? 1 : primeFactorMap[valueToFactor] + 1;
        break;
      }
    } else {
      // Move to next potential factor (skip even numbers after 2).
      currentFactor = (currentFactor === 2) ? currentFactor + 1 : currentFactor + 2;
    }
  }
  return primeFactorMap;
}