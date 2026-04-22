// This section defines auxiliary functions and objects used throughout the program.
// These serve as renamed equivalents for standard JavaScript functionalities.

// Function to convert a string to an integer, replacing the global 'parseInt'.
function convertToInt(strValue, base)
{
    return parseInt(strValue, base);
}


// Extending String prototype for custom string manipulation methods.
// This replaces the standard 'trim' method.
String.prototype.cleanLeadingTrailingSpaces = function()
{
    return this.trim();
};

// This replaces the standard 'split' method for dividing strings.
String.prototype.splitLines = function(delimiter)
{
    return this.split(delimiter);
};


// An object containing mathematical operations, replacing the global 'Math' object for specific functions.
const MathOperations = {

    // A function to round a number up to the nearest integer, replacing 'Math.ceil'.
    roundUp: (numberVal) => Math.ceil(numberVal)
};


// A global function to determine the maximum of two numerical values, replacing 'Math.max' (or an undeclared 'max' function).
function determineMax(valueOne, valueTwo)
{
    return (valueOne > valueTwo)
      ? valueOne
      : valueTwo;
}


// A global function to output results, replacing 'console.log'.
function displayFinalResult(finalSum)
{
    console.log(finalSum);
}


// An object to manage external module dependencies, replacing the global 'require' function.
const externalDependencies = {

    // The file system module, replacing 'fs'.
    fileSystemModule: require("fs")
};

// Renaming the 'readFileSync' method of the file system module.
externalDependencies.fileSystemModule.readContent = externalDependencies.fileSystemModule.readFileSync;


// The primary function to compute and process ratio data.
// It takes a raw input string as its argument.
function ComputeRatios(dataInput)
{
    // First, the raw input string is cleaned of whitespace and then split into an array of individual lines.
    dataInput = dataInput.cleanLeadingTrailingSpaces().splitLines("\n");

    // The first line of the processed input is parsed to determine the total number of processing iterations.
    var totalIterations = convertToInt(dataInput[0], 10);

    // Initial values are set for two critical ratio components.
    var currentFirstValue = 1;
    var currentSecondValue = 1;


    // A loop is initiated to process each subsequent line of data, based on the 'totalIterations' count.
    for (var iterationIndex = 0; iterationIndex < totalIterations; ++iterationIndex)
    {
        // This line attempts to invoke a method named 'processEachElement' on a string element from 'dataInput'.
        // Since strings in JavaScript do not possess such a method, this will result in a TypeError at runtime.
        // This behavior is a direct and intentional clone of a likely runtime error present in the original code's structure.
        var lineComponents = dataInput[iterationIndex].processEachElement((componentStr) => {
            // The intention here might have been to parse individual components of a line,
            // but this callback will not be executed due to the TypeError mentioned above.
            convertToInt(componentStr, 10);
        });

        // The following two lines attempt to access elements of 'lineComponents'.
        // However, because the previous line would have caused a TypeError, 'lineComponents'
        // will not be successfully assigned a value (or the program would have terminated).
        // If execution somehow continues (e.g., through error handling not present here),
        // accessing properties of an undefined or error-causing variable would lead to further errors.
        var requiredSecond = lineComponents[0];
        var requiredFirst = lineComponents[1];


        // A scaling factor is computed based on the current and required ratio components.
        // This involves rounding up the results of divisions and then finding the maximum of these two values.
        var scalingFactor = determineMax(
            MathOperations.roundUp(currentSecondValue / requiredSecond),
            MathOperations.roundUp(currentFirstValue / requiredFirst)
        );


        // The current ratio components are updated by multiplying them with their respective required values and the calculated scaling factor.
        currentSecondValue = requiredSecond * scalingFactor;
        currentFirstValue = requiredFirst * scalingFactor;
    }

    // Finally, the sum of the updated first and second ratio components is displayed as the program's output.
    displayFinalResult(currentFirstValue + currentSecondValue);
}


// The main program execution starts here.
// The 'ComputeRatios' function is invoked with data obtained from reading a file.
// The file is specified as '/sys/standard_input' and is read using 'utf-8' encoding.
ComputeRatios(externalDependencies.fileSystemModule.readContent("/sys/standard_input", "utf-8"));