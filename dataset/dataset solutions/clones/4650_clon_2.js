"use strict";

// This function establishes a mechanism to read input line by line.
const produceSource = () => {
  // Reads all data from standard input, cleans it, and splits it into an array of lines.
  const dataLines = require("fs").readFileSync("/dev/stdin", "utf8")
                                 .trim()
                                 .split("\n");

  const dataStream = {
    segmentList: dataLines,       // Stores the array of processed input lines.
    currentPosition: 0,           // Keeps track of the current line being accessed.
    maximumItems: dataLines.length, // The total count of available input lines.

    // Determines if there are additional input segments to be read.
    hasMoreSegments: function() {
      return this.currentPosition < this.maximumItems;
    },

    // Retrieves the subsequent input segment from the stream.
    retrieveNext: function() {
      if (!this.hasMoreSegments()) {
        throw "InputOutOfBoundsError"; // Throws an error if attempting to read beyond available input.
      }
      return this.segmentList[this.currentPosition++]; // Returns the current segment and advances the position.
    }
  };
  return dataStream; // Returns the configured input stream handler.
};

// Initializes the global input stream object.
const sourceReader = produceSource();

// Auxiliary functions for simplified input parsing.
const retrieveNextLine = () => sourceReader.retrieveNext(); // Fetches the next raw line as a string.
const readInteger = () => parseInt(sourceReader.retrieveNext()); // Parses the next line into an integer.
const readStringArray = () => sourceReader.retrieveNext().split(" "); // Splits the next line into an array of strings by space.
const readIntegerArray = () => sourceReader.retrieveNext().split(" ").map(numericElement => parseInt(numericElement)); // Splits and parses the next line into an array of integers.
const readCharacterArray = () => sourceReader.retrieveNext().split(""); // Splits the next line into an array of individual characters.
const checkMoreInput = () => sourceReader.hasMoreSegments(); // Verifies if more input is available.

// A utility function for printing output to the console.
const displayOutput = (...outputArgs) => console.log(...outputArgs);


// The primary execution routine of the program.
const ExecuteProgram = () => {
  let lineCount = readInteger(); // Reads the initial integer value, often representing N items.

  // Defines the standard lowercase English alphabet.
  const alphabetSequence = "abcdefghijklmnopqrstuvwxyz";

  // An array to store the minimum frequency of each character across all input lines.
  // Initialized to -1 to signify that a character has not yet been encountered.
  let charFrequencies = new Array(26).fill(-1);

  // Iterates through each subsequent line of input.
  while (checkMoreInput()) {
    let currentLine = retrieveNextLine(); // Obtains the current line of text.

    // Computes the frequency of each character within the current line.
    let lineCharCounts = new Array(26).fill(0);
    for (let charItem of currentLine) {
      let charIndex = alphabetSequence.indexOf(charItem); // Finds the alphabetical index of the character.
      lineCharCounts[charIndex]++;
    }

    // Updates the global minimum character frequencies.
    for (let iterator = 0; iterator < charFrequencies.length; iterator++) {
      if (lineCharCounts[iterator] === 0) {
        // If a character is absent in the current line, its overall minimum frequency becomes zero.
        charFrequencies[iterator] = 0;
      } else if (charFrequencies[iterator] === -1) {
        // If this is the first time observing this character, its frequency is set.
        charFrequencies[iterator] = lineCharCounts[iterator];
      } else if (charFrequencies[iterator] !== 0) {
        // If the character has been seen before, update its frequency to the minimum encountered so far.
        charFrequencies[iterator] = Math.min(charFrequencies[iterator], lineCharCounts[iterator]);
      }
    }
  }

  // Constructs the final character string based on the determined minimum frequencies.
  let resultCharacters = [];
  for (let iterator = 0; iterator < charFrequencies.length; iterator++) {
    if (charFrequencies[iterator] === 0) {
      continue; // Skips characters that did not appear in all input lines.
    }
    // Appends each character to the result array as many times as its calculated minimum frequency.
    while (charFrequencies[iterator] > 0) {
      resultCharacters.push(alphabetSequence[iterator]);
      charFrequencies[iterator]--;
    }
  }

  // Sorts the collected characters alphabetically and joins them into a single string for display.
  resultCharacters.sort();
  displayOutput(resultCharacters.join("")); // Outputs the final string.
};

// Initiates the program's main execution flow.
ExecuteProgram();