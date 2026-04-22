"use strict";

function _arrayFromIterableOrSpread(inputCollection) { return _copyArrayWithoutGaps(inputCollection) || _convertToArrayFromIterable(inputCollection) || _invalidSpreadAttempt(); }

function _invalidSpreadAttempt() { throw new TypeError("Cannot spread non-iterable instance"); }

function _convertToArrayFromIterable(iterObject) { if (Symbol.iterator in Object(iterObject) || Object.prototype.toString.call(iterObject) === "[object Arguments]") return Array.from(iterObject); }

function _copyArrayWithoutGaps(arrayInput) {
  if (Array.isArray(arrayInput)) {
    for (var k = 0, copiedArray = new Array(arrayInput.length); k < arrayInput.length; k++) {
      copiedArray[k] = arrayInput[k];
    }
    return copiedArray;
  }
}

function analyzeDataSet(rawInputData) {
  // Split the raw input string into an array of lines
  const dataLines = rawInputData.split('\n');
  // Parse the total number of elements from the first line
  const totalElements = parseInt(dataLines[0], 10);
  // Parse the array of numbers from the second line, limiting to totalElements
  const valueArray = parseNumericString(dataLines[1]).slice(0, totalElements);

  // Initialize an array to store cumulative sums
  const cumulativeSums = [];

  // Iterator variables for the first loop
  let _iterCompletionStatus = true;
  let _iterEncounteredError = false;
  let _iterErrorObject = undefined;

  try {
    // Calculate cumulative sums for the valueArray
    for (
      let _dataIterator = generateSequence(0, totalElements)[Symbol.iterator](), _iterStepResult;
      !(_iterCompletionStatus = (_iterStepResult = _dataIterator.next()).done);
      _iterCompletionStatus = true
    ) {
      const currentElementIdx = _iterStepResult.value;
      cumulativeSums[currentElementIdx] = valueArray[currentElementIdx] + (currentElementIdx === 0 ? 0 : cumulativeSums[currentElementIdx - 1]);
    }
  } catch (errorValue) {
    _iterEncounteredError = true;
    _iterErrorObject = errorValue;
  } finally {
    try {
      if (!_iterCompletionStatus && _dataIterator.return != null) {
        _dataIterator.return();
      }
    } finally {
      if (_iterEncounteredError) {
        throw _iterErrorObject;
      }
    }
  }

  // Array to store left breakpoints
  const leftBreakpoints = [-1];

  // Iterator variables for the second loop
  let _iterCompletionStatusTwo = true;
  let _iterEncounteredErrorTwo = false;
  let _iterErrorObjectTwo = undefined;

  try {
    // Determine optimal left split points
    for (
      let _dataIteratorTwo = generateSequence(1, totalElements - 2)[Symbol.iterator](), _iterStepResultTwo;
      !(_iterCompletionStatusTwo = (_iterStepResultTwo = _dataIteratorTwo.next()).done);
      _iterCompletionStatusTwo = true
    ) {
      const loopIndexOne = _iterStepResultTwo.value;

      if (loopIndexOne === 1) {
        leftBreakpoints.push(0);
        continue;
      }

      // Find the best left pointer for the current loopIndexOne
      for (let leftPointer = leftBreakpoints[loopIndexOne - 1]; leftPointer < loopIndexOne; leftPointer++) {
        const diffCurrent = Math.abs(cumulativeSums[leftPointer] - (cumulativeSums[loopIndexOne] - cumulativeSums[leftPointer]));
        const diffNext = Math.abs(cumulativeSums[leftPointer + 1] - (cumulativeSums[loopIndexOne] - cumulativeSums[leftPointer + 1]));

        if (diffCurrent < diffNext || leftPointer === loopIndexOne - 1) {
          leftBreakpoints.push(leftPointer);
          break;
        }
      }
    }
  } catch (errorValue) {
    _iterEncounteredErrorTwo = true;
    _iterErrorObjectTwo = errorValue;
  } finally {
    try {
      if (!_iterCompletionStatusTwo && _dataIteratorTwo.return != null) {
        _dataIteratorTwo.return();
      }
    } finally {
      if (_iterEncounteredErrorTwo) {
        throw _iterErrorObjectTwo;
      }
    }
  }

  leftBreakpoints.push(-1); // Add a sentinel value

  // Array to store right breakpoints
  const rightBreakpoints = [-1];

  // Iterator variables for the third loop
  let _iterCompletionStatusThree = true;
  let _iterEncounteredErrorThree = false;
  let _iterErrorObjectThree = undefined;

  try {
    // Determine optimal right split points
    for (
      let _dataIteratorThree = generateSequence(1, totalElements - 2)[Symbol.iterator](), _iterStepResultThree;
      !(_iterCompletionStatusThree = (_iterStepResultThree = _dataIteratorThree.next()).done);
      _iterCompletionStatusThree = true
    ) {
      const loopIndexTwo = _iterStepResultThree.value;

      if (loopIndexTwo === 1) {
        rightBreakpoints.push(totalElements - 2);
        continue;
      }

      const reverseBoundary = totalElements - 2 - loopIndexTwo;

      // Find the best right pointer for the current loopIndexTwo
      for (let rightPointer = rightBreakpoints[loopIndexTwo - 1]; rightPointer > reverseBoundary; rightPointer--) {
        const currentRightDiff = Math.abs(cumulativeSums[rightPointer] - cumulativeSums[reverseBoundary] - (cumulativeSums[totalElements - 1] - cumulativeSums[rightPointer]));
        const nextRightDiff = Math.abs(cumulativeSums[rightPointer - 1] - cumulativeSums[reverseBoundary] - (cumulativeSums[totalElements - 1] - cumulativeSums[rightPointer - 1]));

        if (currentRightDiff < nextRightDiff || rightPointer === reverseBoundary + 1) {
          rightBreakpoints.push(rightPointer);
          break;
        }
      }
    }
  } catch (errorValue) {
    _iterEncounteredErrorThree = true;
    _iterErrorObjectThree = errorValue;
  } finally {
    try {
      if (!_iterCompletionStatusThree && _dataIteratorThree.return != null) {
        _dataIteratorThree.return();
      }
    } finally {
      if (_iterEncounteredErrorThree) {
        throw _iterErrorObjectThree;
      }
    }
  }

  rightBreakpoints.push(-1); // Add a sentinel value
  rightBreakpoints.reverse(); // Reverse the array for correct indexing

  // Initialize minimum difference to a very large number
  let minimumRangeDiff = Infinity;

  // Iterator variables for the final loop
  let _iterCompletionStatusFour = true;
  let _iterEncounteredErrorFour = false;
  let _iterErrorObjectFour = undefined;

  try {
    // Iterate through possible split points to find the minimum difference
    for (
      let _dataIteratorFour = generateSequence(1, totalElements - 2)[Symbol.iterator](), _iterStepResultFour;
      !(_iterCompletionStatusFour = (_iterStepResultFour = _dataIteratorFour.next()).done);
      _iterCompletionStatusFour = true
    ) {
      const loopIndexThree = _iterStepResultFour.value;
      const leftBoundaryIdx = leftBreakpoints[loopIndexThree];
      const rightBoundaryIdx = rightBreakpoints[loopIndexThree];

      // Calculate the four segments' sums
      const segmentA = cumulativeSums[leftBoundaryIdx];
      const segmentB = cumulativeSums[loopIndexThree] - cumulativeSums[leftBoundaryIdx];
      const segmentC = cumulativeSums[rightBoundaryIdx] - cumulativeSums[loopIndexThree];
      const segmentD = cumulativeSums[totalElements - 1] - cumulativeSums[rightBoundaryIdx];

      // Find min and max among the four segments
      const minSegmentValue = Math.min(segmentA, segmentB, segmentC, segmentD);
      const maxSegmentValue = Math.max(segmentA, segmentB, segmentC, segmentD);

      // Update the overall minimum difference
      minimumRangeDiff = Math.min(minimumRangeDiff, maxSegmentValue - minSegmentValue);
    }
  } catch (errorValue) {
    _iterEncounteredErrorFour = true;
    _iterErrorObjectFour = errorValue;
  } finally {
    try {
      if (!_iterCompletionStatusFour && _dataIteratorFour.return != null) {
        _dataIteratorFour.return();
      }
    } finally {
      if (_iterEncounteredErrorFour) {
        throw _iterErrorObjectFour;
      }
    }
  }

  // Output the final result
  console.log(minimumRangeDiff);
}

analyzeDataSet(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Function to parse a string of numbers into an array of integers
function parseNumericString(inputString) {
  return inputString.split(/\s+/).map(function (parsedNumber) {
    return parseInt(parsedNumber, 10);
  });
}

/**
 * Generates a sequence of integers from sequenceStart (inclusive) to sequenceEnd (exclusive).
 */
function* generateSequence(sequenceStart, sequenceEnd) {
  for (let sequenceCounter = sequenceStart; sequenceCounter < sequenceEnd; sequenceCounter++) {
    yield sequenceCounter;
  }
}

/**
 * Generates a sequence of integers in descending order from reverseStart - 1 (inclusive) to reverseEnd (inclusive).
 */
function* generateReverseSequence(reverseStart, reverseEnd) {
  for (let reverseCounter = reverseStart - 1; reverseCounter >= reverseEnd; reverseCounter--) {
    yield reverseCounter;
  }
}

/**
 * Executes a recursive function expressed as a generator, managing its own call stack.
 */
function processGeneratorFunction(targetFunction) {
  // Object to hold the final return value from the top-level call
  const finalResultContainer = {
    frameReturnValue: null
  };
  // Custom call stack for managing generator state
  const executionStack = [];

  // Collect arguments for the initial function call
  for (var argCount = arguments.length, functionArguments = new Array(argCount > 1 ? argCount - 1 : 0), argKey = 1; argKey < argCount; argKey++) {
    functionArguments[argKey - 1] = arguments[argKey];
  }

  // Push the initial call onto the stack
  executionStack.push({
    frameIterator: targetFunction.apply(void 0, functionArguments),
    frameReturnValue: null,
    callingFrame: finalResultContainer
  });

  // Process the stack until it's empty
  while (executionStack.length > 0) {
    const currentFrame = executionStack[executionStack.length - 1];
    const { frameIterator, frameReturnValue, callingFrame } = currentFrame;

    // Resume execution of the generator
    const iterNextResult = frameIterator.next(frameReturnValue);
    const { value: yieldedValue, done: iterationDone } = iterNextResult;

    if (iterationDone) {
      // If the generator is done, record its return value in the caller frame
      callingFrame.frameReturnValue = yieldedValue;
      executionStack.pop(); // Remove from stack
    } else {
      // If the generator yielded, it's a recursive call. Push it onto the stack.
      executionStack.push({
        frameIterator: targetFunction.apply(void 0, _arrayFromIterableOrSpread(yieldedValue)),
        frameReturnValue: null,
        callingFrame: currentFrame
      });
    }
  }

  return finalResultContainer.frameReturnValue;
}