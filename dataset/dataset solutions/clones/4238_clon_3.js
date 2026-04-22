"use strict"

/**
 * @file This script processes input from standard input to calculate a specific competition score.
 * It uses a custom input stream iterator for robust data handling.
 */

// A custom class to manage reading lines from an input source, providing iterator-like functionality.
class InputLineStreamAccessor {
    // Private fields to encapsulate the stream's internal state.
    #bufferedInputLines; // Stores all lines read from the source.
    #currentReadPosition; // Tracks the current line being pointed to.
    #totalAvailableLines; // The total number of lines in the buffer.

    /**
     * Initializes the input stream accessor by reading content from a specified path.
     * @param {string} sourceFilePath The path to the input file (e.g., "/dev/stdin").
     * @throws {Error} If the source file path is invalid or reading fails.
     */
    constructor(sourceFilePath) {
        // Ensure a valid file path is provided.
        if (typeof sourceFilePath !== 'string' || sourceFilePath.trim() === '') {
            throw new Error("Initialization Error: A valid source file path must be provided.");
        }

        try {
            // Dynamically import 'fs' module for file system operations.
            const fileSystemModule = require("fs");
            const rawFileContent = fileSystemModule.readFileSync(sourceFilePath, "utf8");

            // Process the raw content: trim whitespace and split into individual lines.
            // If content is empty, ensure an empty array to prevent errors.
            this.#bufferedInputLines = rawFileContent ? rawFileContent.trim().split("\n") : [];
            this.#currentReadPosition = 0;
            this.#totalAvailableLines = this.#bufferedInputLines.length;

        } catch (errorDetails) {
            // Log and re-throw an enriched error if file reading fails.
            console.error(`Input Stream Error: Could not process data from '${sourceFilePath}'. Details: ${errorDetails.message}`);
            this.#bufferedInputLines = []; // Ensure buffer is empty on failure.
            this.#currentReadPosition = 0;
            this.#totalAvailableLines = 0;
            throw new Error(`Input Stream Initialization Failed: ${errorDetails.message}`);
        }
    }

    /**
     * Checks if there are more lines available to read in the input stream.
     * @returns {boolean} True if more data exists, false otherwise.
     */
    hasMoreData() {
        return this.#currentReadPosition < this.#totalAvailableLines;
    }

    /**
     * Retrieves the next line from the input stream and advances the read position.
     * @returns {string} The next line of text.
     * @throws {Error} If an attempt is made to read beyond the end of the stream.
     */
    retrieveNextEntry() {
        if (!this.hasMoreData()) {
            // Throw a specific error for out-of-bounds access.
            throw new Error("Stream Read Error: Attempted to read past the end of the input stream.");
        }
        // Return the current line and then increment the position for the next read.
        return this.#bufferedInputLines[this.#currentReadPosition++];
    }

    /**
     * Previews the next line without advancing the read position.
     * @returns {string | null} The next line of text, or null if no more data.
     */
    peekNextEntry() {
        if (!this.hasMoreData()) {
            return null; // Return null if nothing to peek at.
        }
        return this.#bufferedInputLines[this.#currentReadPosition];
    }
}

// Instantiate our custom input stream handler for standard input.
const standardInputReader = new InputLineStreamAccessor("/dev/stdin");

// --- Utility Functions for Input Parsing ---

/**
 * Fetches the next raw line from the input stream.
 * @returns {string} The next line.
 */
const getNextRawLine = () => standardInputReader.retrieveNextEntry();

/**
 * Parses the next line as a single integer.
 * @returns {number} The parsed integer.
 */
const extractNextInteger = () => parseInt(standardInputReader.retrieveNextEntry(), 10);

/**
 * Retrieves the next line and splits it into an array of strings (words).
 * @returns {string[]} An array of strings from the line.
 */
const getWordsFromCurrentLine = () => standardInputReader.retrieveNextEntry().split(" ");

/**
 * Retrieves the next line, splits it, and maps each part to an integer.
 * Uses `Number()` for conversion which handles both integers and floats implicitly.
 * @returns {number[]} An array of integers from the line.
 */
const getIntegersFromCurrentLine = () => standardInputReader.retrieveNextEntry().split(" ").map(value => Number(value));

/**
 * Retrieves the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters from the line.
 */
const getCharactersFromCurrentLine = () => standardInputReader.retrieveNextEntry().split("");

/**
 * Checks if there's more data available in the input stream.
 * @returns {boolean} True if more data, false otherwise.
 */
const canProcessFurtherInput = () => standardInputReader.hasMoreData();

// --- Output Function ---

/**
 * Displays the provided arguments to the console, effectively printing output.
 * @param {...any} data The data elements to be printed.
 */
const outputResult = (...data) => console.log(...data);

// --- Main Program Logic ---

/**
 * Encapsulates the primary logic to solve the competition problem.
 * It reads parameters, performs calculations, and outputs the final score.
 */
const calculateCompetitionScore = () => {
    // Read the first line which contains N (total problems) and M (solved problems).
    const challengeParameters = getIntegersFromCurrentLine();

    // Basic validation: ensure we received exactly two parameters.
    if (challengeParameters.length !== 2) {
        throw new Error(`Input Format Error: Expected two integer parameters (N, M) but received ${challengeParameters.length}.`);
    }

    const [totalChallenges, completedChallenges] = challengeParameters; // Destructure N and M.

    // Additional input validation for problem constraints.
    if (totalChallenges < 0 || completedChallenges < 0) {
        throw new Error("Input Constraint Error: Number of problems or solved problems cannot be negative.");
    }
    if (completedChallenges > totalChallenges) {
        throw new Error("Input Constraint Error: Solved problems count cannot exceed total problems count.");
    }

    // Calculate the base penalty points.
    // Each solved problem contributes 1900 points.
    const pointsFromSolved = 1900 * completedChallenges;
    // Each unsolved problem (N - M) contributes 100 points.
    const pointsFromUnsolved = 100 * (totalChallenges - completedChallenges);

    // Sum up the base penalty.
    const totalBasePoints = pointsFromSolved + pointsFromUnsolved;

    // Calculate the multiplier, which is 2 raised to the power of M.
    // Using a bitwise left shift (1 << M) as an alternative to Math.pow(2, M) for powers of 2.
    const difficultyFactor = (1 << completedChallenges);

    // Compute the final score.
    const finalCalculatedScore = totalBasePoints * difficultyFactor;

    // Display the computed score.
    outputResult(finalCalculatedScore);
};

// --- Program Execution Entry Point ---

// Use a try-catch block to handle potential errors during the main execution flow gracefully.
try {
    calculateCompetitionScore();
} catch (programExecutionError) {
    // Log any unhandled errors that occur during the problem-solving process.
    console.error("Program Execution Failed:", programExecutionError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}