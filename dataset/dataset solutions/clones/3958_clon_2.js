executeProgram(function* (outputLine, fetchInput) {
  // Retrieve the first numerical input, adjusting its value.
  let firstCount = +(yield) - 1;
  // Retrieve the second numerical input, adjusting its value.
  let secondCount = +(yield) - 1;

  // Calculate and print the initial header line.
  // The calculation involves integer division and multiplication.
  outputLine(
    `${Math.floor((firstCount - 1) / 50) * 2 + 2 + Math.floor((secondCount - 1) / 50) * 2 + 2} 100`
  );

  // Loop to generate the first part of the pattern based on 'firstCount'.
  do {
    let patternRowA = ""; // Initialize the first pattern row for this iteration.
    let patternRowB = ""; // Initialize the second pattern row for this iteration.

    // Iterate to build the pattern rows.
    for (let idx = 0; idx < 100; idx += 2) {
      // Check if there are still 'firstCount' units to process.
      if (0 < firstCount) {
        patternRowA += ".#"; // Append specific characters for active units.
        patternRowB += "##";
        --firstCount; // Decrement the counter.
      } else {
        patternRowA += "##"; // Append default characters when units are exhausted.
        patternRowB += "##";
      }
    }
    outputLine(patternRowA); // Output the first generated row.
    outputLine(patternRowB); // Output the second generated row.
  } while (0 < firstCount); // Continue as long as 'firstCount' is positive.

  // Loop to generate the second part of the pattern based on 'secondCount'.
  do {
    let patternRowA = ""; // Re-initialize the first pattern row.
    let patternRowB = ""; // Re-initialize the second pattern row.

    // Iterate to build the pattern rows.
    for (let idx = 0; idx < 100; idx += 2) {
      // Check if there are still 'secondCount' units to process.
      if (0 < secondCount) {
        patternRowA += ".."; // Append specific characters for active units.
        patternRowB += "#.";
        --secondCount; // Decrement the counter.
      } else {
        patternRowA += ".."; // Append default characters when units are exhausted.
        patternRowB += "..";
      }
    }
    outputLine(patternRowA); // Output the first generated row.
    outputLine(patternRowB); // Output the second generated row.
  } while (0 < secondCount); // Continue as long as 'secondCount' is positive.
});

/**
 * This function orchestrates the execution of a generator-based program,
 * handling standard input and output streams.
 * @param {(outputLine: (text: string, ending?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} programGenerator
 */
function executeProgram(programGenerator) {
  const inputSource = process.stdin; // Standard input stream.
  const outputSink = process.stdout; // Standard output stream.

  /**
   * @type {[string|null]}
   */
  const inputTokens = []; // Buffer for individual input words/tokens.
  /**
   * @type {[string]}
   */
  const inputLines = []; // Buffer for complete input lines.
  let remainingBuffer = ""; // Stores partial lines from input chunks.
  let inputFinished = false; // Flag indicating if input stream has ended.

  const LINE_READ_MODE = 0; // Constant for line-by-line input mode.
  const WORD_READ_MODE = 1; // Constant for word-by-word input mode.
  let currentReadMode = WORD_READ_MODE; // Current mode for reading input.

  /**
   * Writes a line of text to the output stream.
   * @param {string} text The string to write.
   * @param {string} [ending] Optional string to append instead of OS-specific EOL.
   */
  function printOutput(text, ending) {
    outputSink.write(text + (void 0 === ending ? os.EOL : ending));
  }

  /**
   * Generator function to retrieve input.
   * Yields a line when in line mode, otherwise expects a line to be pushed.
   */
  function* retrieveInput() {
    if (inputLines.length > 0) {
      return inputLines.shift(); // Return an already buffered line.
    } else {
      currentReadMode = LINE_READ_MODE; // Switch to line mode.
      /**
       * @type {string}
       */
      const lineFromYield = yield; // Pause execution and wait for a line.
      currentReadMode = WORD_READ_MODE; // Switch back to word mode.
      return lineFromYield;
    }
  }

  const programIterator = programGenerator(printOutput, retrieveInput); // Initialize the main program generator.

  /**
   * Processes a received chunk of data from the input stream.
   * @param {string|null} chunk The data chunk, or null if stream ended.
   */
  function processInputChunk(chunk) {
    inputSource.pause(); // Temporarily pause the input stream.

    if (null === chunk) {
      inputLines.push(null); // Mark end of input with a null line.
    } else {
      remainingBuffer += chunk; // Append new chunk to the buffer.
      const lineRegex = /.*(\r?\n|\r)/g; // Regex to find complete lines.
      let lineMatchResult;
      let lastMatchPosition = 0;

      // Extract all complete lines from the buffer.
      while (null !== (lineMatchResult = lineRegex.exec(remainingBuffer))) {
        lastMatchPosition = lineRegex.lastIndex;
        inputLines.push(lineMatchResult[0]);
      }
      remainingBuffer = remainingBuffer.substring(lastMatchPosition); // Keep any remaining partial line.
    }
    processQueue(); // Continue processing the input queue.
  }

  /**
   * Main processing loop for buffered input and generator execution.
   */
  function processQueue() {
    while (inputLines.length > 0) {
      switch (currentReadMode) {
        case LINE_READ_MODE: {
          inputTokens.push(inputLines.shift()); // Move a line to tokens if in line mode.
          break;
        }
        case WORD_READ_MODE: {
          if (null === inputLines[0]) {
            inputTokens.push(inputLines.shift()); // If end of input, push null token.
          } else {
            const wordRegex = /[^\s]+/g; // Regex to find a word.
            let lineMatchResult;
            // Try to extract a word from the current line.
            if (null !== (lineMatchResult = wordRegex.exec(inputLines[0]))) {
              inputTokens.push(lineMatchResult[0]); // Push the found word.
              inputLines[0] = inputLines[0].substring(wordRegex.lastIndex); // Remove the word from the line.
            } else {
              inputLines.shift(); // If no word found, discard the line.
            }
          }
          break;
        }
      }

      // Process all available input tokens with the generator.
      while (inputTokens.length > 0) {
        const iteratorResult = programIterator.next(inputTokens.shift()); // Advance the generator with the next token.
        if (void 0 !== iteratorResult.value) {
          // If the generator yielded a value, print it.
          if ("string" === typeof iteratorResult.value) {
            printOutput(iteratorResult.value, ""); // Print string value.
          } else {
            printOutput(`${iteratorResult.value}`, ""); // Print other values as string.
          }
        }
        if (iteratorResult.done) return; // If generator is done, exit.
      }
    }

    // If no more lines are buffered, either signal end or resume input stream.
    inputFinished
      ? setTimeout(processInputChunk, 0, null)
      : inputSource.resume();
  }

  // Set up event listeners for input stream.
  inputSource.on("data", processInputChunk);
  inputSource.on("end", function () {
    inputFinished = true; // Mark input as finished.
    processInputChunk(null); // Process any remaining data and signal end.
  });

  inputSource.setEncoding("utf8"); // Set input encoding.
  processInputChunk(null); // Initialize by processing a null chunk to start the loop.
}

const os = require("os"); // Import the 'os' module for platform-specific EOL.
