"use strict"; // Enforce strict mode for cleaner code.

const initializeInputReader = () => {
    // Read all input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into lines.
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    const readerInstance = {
        "dataLines": rawInputData, // Stores all input lines.
        "currentPosition": 0x0, // Current index for reading.
        "totalLines": rawInputData.length, // Total number of lines available.

        // Checks if there are more lines to read.
        "hasMoreEntries": function() {
            return this.currentPosition < this.totalLines;
        },

        // Retrieves the next line from the input.
        "retrieveNextEntry": function() {
            if (!this.hasMoreEntries()) {
                throw "ArrayIndexOutOfBoundsException"; // Indicate no more data.
            } else {
                return this.dataLines[this.currentPosition++]; // Return current line and advance position.
            }
        }
    };
    return readerInstance;
};

const inputSource = initializeInputReader(); // Initialize the input reader utility.

const fetchNextLine = () => inputSource.retrieveNextEntry(); // Get the next raw line.
const fetchNextInteger = () => parseInt(inputSource.retrieveNextEntry()); // Get the next line and parse as an integer.
const fetchStringArray = () => inputSource.retrieveNextEntry().split(" "); // Get the next line and split by space into strings.
const fetchIntegerArray = () => inputSource.retrieveNextEntry().split(" ").map(itemValue => parseInt(itemValue)); // Get the next line, split by space, and parse each part as an integer.
const fetchCharacterArray = () => inputSource.retrieveNextEntry().split(""); // Get the next line and split into individual characters.
const checkMoreInput = () => inputSource.hasMoreEntries(); // Check if more input is available.

const displayOutput = (...outputArgs) => console.log(...outputArgs); // Custom function for console output.

const executeProgram = () => {
    // Read two integers from the input line.
    const [firstValue, secondValue] = fetchIntegerArray();

    // Perform a calculation and print the result to the console.
    // The calculation is: 1900 * secondValue + 100 * (firstValue - secondValue) * 2^secondValue
    console.log(0x76C * secondValue + 0x64 * (firstValue - secondValue) * Math.pow(0b10, secondValue));
};

executeProgram(); // Start the main program execution.
