#!/usr/bin/node
const { createInterface } = require('readline');
const { stdin: inputSource, stdout: outputSink } = require('process');

const collectedInputLines = [];

const inputInterface = createInterface({
  input: inputSource,
  output: outputSink,
  terminal: false
});

inputInterface.on('line', (currentInputSegment) => {
  collectedInputLines.push(currentInputSegment);
});

inputInterface.on('close', () => {
  // Extract the first line, which represents the iteration count.
  // This mimics the original's `a.shift()` behavior.
  const countString = collectedInputLines.shift();
  const loopIterations = Number(countString);

  // Output the iteration count as per original behavior.
  console.log(loopIterations);

  // Process subsequent lines using a functional iteration approach.
  // Create an array of the desired length to ensure the loop runs
  // exactly 'loopIterations' times, even if there aren't enough lines,
  // replicating the original's potential for accessing undefined array elements.
  Array.from({ length: loopIterations }).forEach((_, lineIndex) => {
    const currentDataLine = collectedInputLines[lineIndex]; // Can be undefined if input is short

    // Parse the three numeric components from the line.
    // If currentDataLine is undefined, .split() will throw a TypeError,
    // preserving the original's error behavior for insufficient input.
    const [firstVal, secondVal, thirdVal] = currentDataLine.split(' ').map(Number);

    // Calculate adjusted values.
    const adjustedFirst = firstVal - 1;
    const adjustedSecond = secondVal - 1;

    // Determine the 'remainder' value using a ternary expression.
    const remainderValue = (adjustedFirst % 3 !== 2) ? Math.floor(adjustedSecond / 2) : 0;

    // Perform the final complex calculation.
    const finalComputedResult = 196471 - adjustedFirst * 195 - Math.floor(adjustedFirst / 3) * 5 - adjustedSecond * 20 + remainderValue - thirdVal;

    // Output the result for the current line.
    console.log(finalComputedResult);
  });
});
