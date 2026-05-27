function ProcessInput(rawData) {
    // This function processes the given raw data.
    // It checks if the numerical value of the trimmed input is 30 or greater.
    const numericValue = Number(rawData.trim());

    if (numericValue >= 30) {
        console.log('Yes'); // Output 'Yes' if the condition is met.
    } else {
        console.log('No');  // Otherwise, output 'No'.
    }
}

// Read the input from standard input and pass it to the processing function.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

ProcessInput(fileSystemModule.readFileSync(standardInputPath, encodingType));
