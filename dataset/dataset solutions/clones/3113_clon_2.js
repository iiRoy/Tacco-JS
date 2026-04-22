'use strict'; // Enforce strict mode for better code quality.

class PrimaryProcessor {

  // Method to carry out the core computation.
  executeTask() {
    // Obtain the initial numerical value from the input source.
    let countVal = dataReceiver.getIntegerArray()[0];
    // Initialize a container for number collections.
    const elementGroups = [];

    // If the count value is odd, add it as a single-element group.
    if (countVal % 2) {
      elementGroups.push([countVal]);
    }

    // Determine an adjusted limit based on parity.
    let limitVal = countVal % 2 ? countVal - 1 : countVal;

    // Populate element groups with paired numbers.
    for (let loopIter = 0; loopIter < limitVal / 2; ++loopIter) {
      elementGroups.push([loopIter + 1, limitVal - loopIter]);
    }

    // Prepare an array to store the final computed output.
    let computedOutput = [];

    // Iterate through the element groups to form new pairs.
    for (let loopIter = 0; loopIter < elementGroups.length; ++loopIter) {
      // For each element in the current group, combine it with elements from the next group (cyclically).
      elementGroups[loopIter].forEach((valA) =>
        computedOutput = computedOutput.concat(
          elementGroups[(loopIter + 1) % elementGroups.length].map((valB) => [valA, valB])
        )
      );
    }

    // Print the total count of the computed output pairs.
    console.log(computedOutput.length);
    // Format and print each computed pair on a new line.
    console.log(computedOutput.map((item) => item.join(' ')).join('\n'));
  }
}

class DataReader {
  // Initializes the data reader.
  constructor() {
    this.currentPos = 0; // Tracks the current reading position.
    this.loadAllData(); // Loads all input data upon instantiation.
  }

  // Reads all content from the standard input.
  loadAllData() {
    this.sourceContent = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.sourceContent;
  }

  // Retrieves one or more lines of text.
  fetchLine(numLines) {
    // If a number of lines is specified, retrieve a slice.
    if (numLines) {
      const retrievedLines = this.sourceContent.slice(this.currentPos, this.currentPos + numLines);
      this.currentPos += numLines; // Advance the cursor.
      return retrievedLines;
    }
    // Otherwise, retrieve a single line and advance the cursor.
    return this.sourceContent[this.currentPos++];
  }

  // Gets an array of strings from a single line.
  getStringArray() {
    return this.fetchLine().split(' ');
  }

  // Gets an array of integers from a single line.
  getIntegerArray() {
    return this.getStringArray().map((strItem) => Number(strItem));
  }

  // Gets an array of floating-point numbers from a single line.
  getFloatArray() {
    return this.getStringArray().map((strItem) => Number(strItem));
  }

  // Gets an array of integers from multiple lines.
  getIntegerLines(numLines) {
    return this.fetchLine(numLines).map((lineText) => Number(lineText));
  }

  // Gets an array of floating-point numbers from multiple lines.
  getFloatLines(numLines) {
    return this.fetchLine(numLines).map((lineText) => Number(lineText));
  }

  // Gets a 2D array of strings from multiple lines.
  getStringMatrix(numLines) {
    return this.fetchLine(numLines).map((individualLine) => individualLine.split(' '));
  }

  // Gets a 2D array of integers from multiple lines.
  getIntegerMatrix(numLines) {
    return this.fetchLine(numLines).map((individualLine) => individualLine.split(' ').map((strItem) => Number(strItem)));
  }

  // Gets a 2D array of floating-point numbers from multiple lines.
  getFloatMatrix(numLines) {
    return this.fetchLine(numLines).map((individualLine) => individualLine.split(' ').map((strItem) => Number(strItem)));
  }
}

// Instantiate the data reader utility.
const dataReceiver = new DataReader();

// Create an instance of the primary processor and run its main method.
(new PrimaryProcessor()).executeTask();