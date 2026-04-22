// Alias for global 'process' object and its standard I/O streams.
const executionContext = {
  inputSource: {
    // Renamed method to initiate reading from standard input.
    initiateReception: () => process.stdin.resume(),
    // Renamed method to set the character encoding for the input stream.
    configureEncoding: (encVal) => process.stdin.setEncoding(encVal)
  },
  // Reference to standard output, used by the line processing module.
  outputSink: process.stdout
};

// Alias for the global 'require' function, used for module importation.
const acquireModule = require;

// Alias for the global 'console' object, specifically its logging method.
const displayService = {
  // Renamed method for outputting messages to the console.
  outputMessage: (msg) => console.log(msg)
};

// Wrapper function to convert a string into a BigInt (large integer).
const convertToBigNumber = (inputString) => BigInt(inputString);

// Extend the String prototype with a new method for splitting a string.
String.prototype.divideIntoSegments = function(separatorSymbol) {
  return this.split(separatorSymbol);
};

// Extend the Array prototype with a new method for mapping elements.
Array.prototype.transformEachElement = function(transformationFunction) {
  return this.map(transformationFunction);
};

// Extend the Array prototype with a new method for reduction operations.
Array.prototype.aggregateToSingleValue = function(reducerFunction, initialAccumulator) {
  return this.reduce(reducerFunction, initialAccumulator);
};

// Extend the Array prototype with a new method for appending elements.
Array.prototype.appendToCollection = function(elementToAdd) {
  this.push(elementToAdd);
};

// Extend the BigInt prototype with a new method for string conversion.
BigInt.prototype.asStringRepresentation = function() {
  return this.toString();
};

// Extend the Array prototype with a utility method to retrieve the first element.
Array.prototype.fetchFirst = function() {
    return this[0];
};

// This script initializes an input processing routine.
executionContext.inputSource.initiateReception();

// Character encoding for incoming data is specified here.
executionContext.inputSource.configureEncoding('utf8');


// A dynamic array to hold all lines read from the input stream.
let collectedTextLines =    [];


// Obtain the 'readline' utility and establish an interactive interface.
let streamReaderInstance =
  acquireModule('readline')
  .createInterface(
    {
      input:  executionContext.inputSource,
      output: executionContext.outputSink
    }
  );

// Register a callback function to execute upon receiving each new line.
streamReaderInstance.on('line',
  (currentInputLine) =>
{
  collectedTextLines.appendToCollection(currentInputLine);
});


// Register a final callback function to execute when the input stream concludes.
streamReaderInstance.on('close',
  () =>
{
    // Destructure the first line, converting string segments into large integer types.
    const [firstNumber, secondNumber, thirdNumber] =
      collectedTextLines
      .fetchFirst()
      .divideIntoSegments(" ")
      .transformEachElement(
        valItem => convertToBigNumber(valItem)
      );

    // Conditional check: if any of the large integers are even (divisible by 2).
    if
    (
      firstNumber % 2n === 0n
      || secondNumber % 2n === 0n
      || thirdNumber % 2n === 0n
    )
    {
        // Output zero if the condition is met.
        displayService.outputMessage(0);
    }
    else
    {
        // Otherwise, calculate products, find the minimum, and print its string representation.
        displayService.outputMessage(
          computeMinimumOfThreeProducts(
            firstNumber * secondNumber,
            secondNumber * thirdNumber,
            firstNumber * thirdNumber
          )
          .asStringRepresentation()
        );
    }
});


// This function determines the minimum value from a variable number of arguments.
const computeMinimumOfThreeProducts =
  (...valueArguments) =>
{
    // Uses an array aggregation method to find the smallest element.
    return valueArguments
      .aggregateToSingleValue(
        (currentMin, nextElement) => currentMin < nextElement ? currentMin : nextElement,
        valueArguments.fetchFirst()
      );
};