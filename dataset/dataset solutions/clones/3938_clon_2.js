// This script processes some numerical inputs from standard input.
// It calculates the sum of two minimums from four provided values.

// Acquire the necessary modules for file operations.
const obtainModuleReference = require;

// Get the filesystem utility module.
const fileSystemUtility = obtainModuleReference("fs");

// Alias the function to read file contents synchronously.
const retrieveFileContent = fileSystemUtility.readFileSync;

// Alias the global function to parse a string into a floating-point number.
const parseNumericString = parseFloat;

// Alias the console object for output.
const outputLogger = console;

// Alias the logging method.
const displayResult = outputLogger.log;

// Alias the Math object for mathematical operations.
const mathOperations = Math;

// Alias the minimum selection method.
const selectSmallest = mathOperations.min;

// Read the input data, process it, and assign values.
// The data is read from standard input, decoded as UTF-8,
// split by newline characters, and each part is converted to a number.
let [firstInputVal, secondInputVal, thirdInputVal, fourthInputVal] = retrieveFileContent("/dev/stdin", "utf8").split("\n").map(parseNumericString);

// Calculate the sum of the minimum of the first two values and the minimum of the last two values.
// Then, display this computed total.
displayResult(selectSmallest(firstInputVal, secondInputVal) + selectSmallest(thirdInputVal, fourthInputVal));