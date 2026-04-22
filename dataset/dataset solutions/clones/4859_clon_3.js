const INPUT_TRANSFORMATION_TYPE = {
  TO_INTEGER: 1,
  SPLIT_BY_WHITESPACE: 2,
  SPLIT_AND_PARSE_INTEGERS: 4,
  SPLIT_BY_CHARACTER: 6,
  SPLIT_AND_PARSE_CHARACTER_INTEGERS: 7,
  JOIN_WITH_SPACES: 8,
  JOIN_WITH_NEWLINES: 9,
  JOIN_CONCATENATED: 0,
};

// Encapsulates raw input line processing
class InputLineProcessor {
  #inputDataLines;
  #currentLinePointer;
  #totalLineCount;

  constructor(rawData) {
    if (typeof rawData !== 'string') {
      throw new Error("InputLineProcessor requires raw string data for initialization.");
    }
    this.#inputDataLines = rawData.trim().split("\n");
    this.#currentLinePointer = 0;
    this.#totalLineCount = this.#inputDataLines.length;
  }

  // Checks if there are any remaining lines to be processed
  hasMoreInputAvailable() {
    return this.#currentLinePointer < this.#totalLineCount;
  }

  // Retrieves the next line from the input stream and advances the pointer
  getNextDataLine() {
    if (!this.hasMoreInputAvailable()) {
      // Returns an empty string if no more data, mimicking original behavior
      return ""; 
    }
    const lineContent = this.#inputDataLines[this.#currentLinePointer];
    this.#currentLinePointer++;
    return lineContent;
  }
}

// Initialize the global input processor by reading from standard input
const fileSystem = require("node:fs");
const rawInputBuffer = fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" });
const globalInputProcessor = new InputLineProcessor(rawInputBuffer);

// Function for standard output
const emitOutput = (content) => {
  console.log(content);
};

// Function for logging diagnostic messages to standard error
const logDiagnostic = (message, severity = "ERROR") => {
  console.error(`[${severity.toUpperCase()}] ${new Date().toISOString()}: ${message}`);
};

// Core utility for transforming input strings based on a specified type
const transformRawInput = (inputValue, transformationType) => {
  try {
    if (inputValue === null || inputValue === undefined) {
      logDiagnostic(`Attempted to transform null/undefined input with type ${transformationType}. Returning original.`, "WARN");
      return inputValue;
    }

    switch (transformationType) {
      case INPUT_TRANSFORMATION_TYPE.TO_INTEGER:
        const parsedInteger = Number.parseInt(inputValue, 10);
        if (Number.isNaN(parsedInteger)) {
          logDiagnostic(`Failed to parse integer from value: '${inputValue}'. Returning null.`, "WARN");
          return null; 
        }
        return parsedInteger;
      case INPUT_TRANSFORMATION_TYPE.SPLIT_BY_WHITESPACE:
        return String(inputValue).split(" ");
      case INPUT_TRANSFORMATION_TYPE.SPLIT_AND_PARSE_INTEGERS:
        return String(inputValue).split(" ").map((item) => {
          const num = Number.parseInt(item, 10);
          if (Number.isNaN(num)) {
            logDiagnostic(`Failed to parse integer for array element: '${item}'. Returning null for this element.`, "WARN");
            return null; 
          }
          return num;
        });
      case INPUT_TRANSFORMATION_TYPE.SPLIT_BY_CHARACTER:
        return String(inputValue).split("");
      case INPUT_TRANSFORMATION_TYPE.SPLIT_AND_PARSE_CHARACTER_INTEGERS: 
        return String(inputValue).split("").map((item) => {
          const num = Number.parseInt(item, 10);
          if (Number.isNaN(num)) {
            logDiagnostic(`Failed to parse integer for character element: '${item}'. Returning null for this element.`, "WARN");
            return null;
          }
          return num;
        });
      case INPUT_TRANSFORMATION_TYPE.JOIN_WITH_SPACES:
        return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue);
      case INPUT_TRANSFORMATION_TYPE.JOIN_WITH_NEWLINES:
        return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
      case INPUT_TRANSFORMATION_TYPE.JOIN_CONCATENATED:
        return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
      default:
        logDiagnostic(`Unknown transformation type '${transformationType}' for value: '${inputValue}'. Returning original.`, "WARN");
        return inputValue; 
    }
  } catch (error) {
    logDiagnostic(`Critical error during input transformation: ${error.message}. Value: '${inputValue}', Type: ${transformationType}. Returning original.`, "ERROR");
    return inputValue; 
  }
};

// Convenient wrappers for common input operations
const retrieveNextLineString = () => globalInputProcessor.getNextDataLine();
const retrieveNextParsedInteger = () => transformRawInput(retrieveNextLineString(), INPUT_TRANSFORMATION_TYPE.TO_INTEGER);
const retrieveNextStringArray = () => transformRawInput(retrieveNextLineString(), INPUT_TRANSFORMATION_TYPE.SPLIT_BY_WHITESPACE);
const retrieveNextIntegerArray = () => transformRawInput(retrieveNextLineString(), INPUT_TRANSFORMATION_TYPE.SPLIT_AND_PARSE_INTEGERS);
const retrieveNextCharacterArray = () => transformRawInput(retrieveNextLineString(), INPUT_TRANSFORMATION_TYPE.SPLIT_BY_CHARACTER);
const checkInputAvailability = () => globalInputProcessor.hasMoreInputAvailable();

// Determines the outcome of a pair comparison based on specific rules
const calculatePairReductionValue = (firstVal, secondVal) => {
  if (firstVal > secondVal) {
    return firstVal - secondVal;
  } else if (firstVal < secondVal) {
    return secondVal - firstVal;
  } else {
    // If values are identical, return one of them as per original problem logic
    return firstVal;
  }
};

// Main execution flow of the program, simulating a tournament-like reduction
const executeTournamentSimulation = () => {
  const initialExponent = retrieveNextParsedInteger();

  // Validate the initial exponent input
  if (initialExponent === null || initialExponent < 0 || initialExponent > 30) { 
    logDiagnostic(`Invalid or out-of-range initial exponent: ${initialExponent}. Must be a non-negative integer up to 30. Exiting.`, "ERROR");
    return;
  }

  const initialDataSetSize = 1 << initialExponent; // Calculate 2^N efficiently
  let currentRoundParticipants = Array.from({ length: initialDataSetSize });

  // Populate the initial array of participants/values
  for (let participantIdx = 0; participantIdx < initialDataSetSize; participantIdx++) {
    const participantValue = retrieveNextParsedInteger();
    if (participantValue === null) {
      logDiagnostic(`Failed to read participant value at index ${participantIdx} during initial data load. Exiting.`, "ERROR");
      return;
    }
    currentRoundParticipants[participantIdx] = participantValue;
  }

  // Handle case where initial data set is empty
  if (currentRoundParticipants.length === 0) {
    emitOutput(0); 
    return;
  }

  // Iterate through rounds to reduce the participant list
  for (let roundNumber = 0; roundNumber < initialExponent; roundNumber++) {
    const nextRoundSize = currentRoundParticipants.length / 2;
    // Pre-allocate array for the next round's results
    const nextRoundParticipants = Array.from({ length: nextRoundSize }); 

    // Process participants in pairs
    for (let pairStartingIndex = 0; pairStartingIndex < currentRoundParticipants.length; pairStartingIndex += 2) {
      const valueA = currentRoundParticipants[pairStartingIndex];
      const valueB = currentRoundParticipants[pairStartingIndex + 1];

      // Validate pair values before comparison
      if (typeof valueA !== 'number' || typeof valueB !== 'number' || Number.isNaN(valueA) || Number.isNaN(valueB)) {
        logDiagnostic(`Non-numeric value encountered in pair at index ${pairStartingIndex}. Values: ${valueA}, ${valueB}. Exiting.`, "ERROR");
        return;
      }

      nextRoundParticipants[pairStartingIndex / 2] = calculatePairReductionValue(valueA, valueB);
    }
    currentRoundParticipants = nextRoundParticipants; // Update list for the subsequent round
  }

  // Output the final remaining value after all rounds
  if (currentRoundParticipants.length > 0) {
    emitOutput(currentRoundParticipants[0]);
  } else {
    logDiagnostic("No final result available after all tournament rounds completed.", "ERROR");
    emitOutput("N/A"); 
  }
};

// Initiate the program execution
executeTournamentSimulation();