const processSequence = (rawDataPayload) => {
  // Defensive programming: Validate the input payload before processing.
  if (typeof rawDataPayload !== 'string' || rawDataPayload.trim() === '') {
    console.error("Error: Input payload is invalid or empty. Cannot process.");
    // Returning an empty string or throwing an error are valid Type III choices for handling invalid input.
    return "";
  }

  // Split the raw input into individual lines, trimming leading/trailing whitespace.
  const inputLines = rawDataPayload.trim().split("\n");

  // Ensure there are at least two lines for sequence length and values.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least 2.");
    return "";
  }

  // Parse the sequence length from the first line.
  // Using Number() for explicit type conversion and potential floating-point handling, though parseInt would also work for integers.
  const sequenceLength = Number(inputLines[0].split(" ")[0]);

  // Validate the parsed sequence length.
  if (isNaN(sequenceLength) || sequenceLength <= 0) {
    console.error(`Error: Invalid or non-positive sequence length detected: ${inputLines[0].split(" ")[0]}.`);
    return "";
  }

  // Parse the initial numerical values from the second line.
  // Using map(Number) directly converts all string parts to numbers.
  let currentNumericalSequence = inputLines[1].split(" ").map(Number);

  // Type III addition: Validate and potentially adjust the length of the parsed sequence.
  if (currentNumericalSequence.length !== sequenceLength) {
    console.warn(`Warning: Mismatch between declared sequence length (${sequenceLength}) and actual elements provided (${currentNumericalSequence.length}).`);
    // Truncate if too many, or pad with zeros if too few.
    if (currentNumericalSequence.length > sequenceLength) {
      currentNumericalSequence = currentNumericalSequence.slice(0, sequenceLength);
    } else {
      while (currentNumericalSequence.length < sequenceLength) {
        currentNumericalSequence.push(0); // Pad with default value (0)
      }
    }
  }

  // This array will meticulously log all transformation operations.
  const transformationLog = [];

  // Iterate through the numerical sequence, starting from the second element (index 1)
  // because operations depend on a preceding element.
  for (let currentElementIndex = 0; currentElementIndex < sequenceLength; ++currentElementIndex) {
    // The very first element does not have a preceding element, so no operation can be performed.
    if (currentElementIndex === 0) {
      continue; // Skip to the next element.
    }

    const valueAtCurrentIndex = currentNumericalSequence[currentElementIndex];
    const valueAtPreviousIndex = currentNumericalSequence[currentElementIndex - 1];

    // Scenario 1: Current element is positive and smaller than the previous element.
    if (valueAtCurrentIndex > 0 && valueAtCurrentIndex < valueAtPreviousIndex) {
      // Record the operation: indices of the previous and current elements.
      transformationLog.push([currentElementIndex - 1, currentElementIndex]);
      // Update the current element by adding the previous one to it.
      currentNumericalSequence[currentElementIndex] = valueAtPreviousIndex + valueAtCurrentIndex;
    }
    // Scenario 2: Current element is negative and smaller than the previous element.
    else if (valueAtCurrentIndex < 0 && valueAtCurrentIndex < valueAtPreviousIndex) {
      // This section reinterprets the original's potentially ambiguous loop structure
      // (`for(j=0; ...; i++)` with `i++` being a likely bug).
      // We aim to replicate the *intended* number of operations if `j++` was used,
      // which involved a specific number of additions within the loop plus one extra after.

      let simulatedLoopIterations = 0;
      // Calculate how many times the addition condition `a[i] + a[i-1]*j <= a[i-1]` would hold true for `j`.
      // We assume `valueAtPreviousIndex` is positive for this logic to be meaningful,
      // as adding a negative `valueAtPreviousIndex` would make `valueAtCurrentIndex` even smaller,
      // potentially leading to an infinite loop.
      if (valueAtPreviousIndex > 0) {
        // Determine the number of times the inner part of the original 'for' loop would execute.
        // The condition `currentElement + previousElement * j <= previousElement` is checked.
        // `j` starts from 0. `simulatedLoopIterations` will count how many `j` values satisfy this.
        while (valueAtCurrentIndex + valueAtPreviousIndex * simulatedLoopIterations <= valueAtPreviousIndex) {
          simulatedLoopIterations++;
          // Type III addition: A safety break for very large or pathological inputs
          // to prevent an actual infinite loop in edge cases (e.g., if previousElement is tiny).
          if (simulatedLoopIterations > 1_000_000) {
            console.warn(`Warning: Excessive iterations detected for complex adjustment at index ${currentElementIndex}. Breaking loop.`);
            simulatedLoopIterations = 0; // Reset or handle as error
            break;
          }
        }

        // Perform the additions and logging that would have occurred inside the original loop.
        // The `simulatedLoopIterations` value here represents `K+1` from the thought process,
        // meaning `K` was the last `j` that satisfied the condition, so `j` went from `0` to `K`.
        for (let operationCount = 0; operationCount < simulatedLoopIterations; operationCount++) {
          transformationLog.push([currentElementIndex - 1, currentElementIndex]);
          currentNumericalSequence[currentElementIndex] += valueAtPreviousIndex;
        }

        // The original code had an additional operation logged and performed AFTER its `for` loop.
        // We replicate this behavior here.
        transformationLog.push([currentElementIndex - 1, currentElementIndex]);
        currentNumericalSequence[currentElementIndex] += valueAtPreviousIndex;
      } else {
        // Type III addition: A fallback or warning for cases where `valueAtPreviousIndex` is not positive,
        // as the complex adjustment logic relies on it.
        console.warn(`Warning: Previous element (${valueAtPreviousIndex}) is not positive at index ${currentElementIndex}. Skipping complex adjustment for this element.`);
        // As a fallback, if the current element is still smaller, perform a single adjustment.
        if (valueAtCurrentIndex < valueAtPreviousIndex) {
            transformationLog.push([currentElementIndex - 1, currentElementIndex]);
            currentNumericalSequence[currentElementIndex] += valueAtPreviousIndex;
        }
      }
    }
  }

  // Construct the final output string.
  const resultLines = [];
  resultLines.push(transformationLog.length.toString()); // First line is the total count of operations.

  // Append each recorded operation as a space-separated pair of indices.
  for (const operationEntry of transformationLog) {
    resultLines.push(`${operationEntry[0]} ${operationEntry[1]}`);
  }

  // Join all lines with newline characters.
  return resultLines.join("\n");
};

// A separate function to handle file I/O, abstracting it from the core logic.
const processStandardInputFile = (inputFilePath) => {
  // Type III addition: Guard clause for the file path.
  if (typeof inputFilePath !== 'string' || inputFilePath.trim() === '') {
    console.error("Error: Invalid file path provided for standard input.");
    console.log(""); // Output empty string on error, similar to how original might fail.
    return;
  }

  try {
    // Synchronously read the file contents using Node.js 'fs' module.
    const fileContent = require("fs").readFileSync(inputFilePath, "utf8");
    // Call the main processing function.
    const finalOutput = processSequence(fileContent);
    // Output the result to the console.
    console.log(finalOutput);
  } catch (fileError) {
    // Catch and report any file reading errors.
    console.error(`Error: Failed to read or process input file at ${inputFilePath}. Details: ${fileError.message}`);
    console.log(""); // Output empty string on error.
  }
};

// Execute the program by processing the standard input file.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin"; // Use a constant for clarity.
processStandardInputFile(STANDARD_INPUT_FILE_PATH);