'use strict';

function executeProgram(inputLines) {
  const [initialLengthVal, operationCount] = inputLines[0].split(' ').map(Number);
  const inputSequence = inputLines[1];

  const initialCondensed = condenseString(inputSequence);

  const finalSequence = applyOperations(initialCondensed, operationCount);

  const resultValue = initialLengthVal - finalSequence.length;
  console.log(resultValue);
}

function condenseString(sourceStr) {
  const charAccumulator = [];
  for (const currentCharacter of sourceStr) {
    if (charAccumulator.length > 0 && currentCharacter === charAccumulator[charAccumulator.length - 1]) {
      charAccumulator.pop();
    } else {
      charAccumulator.push(currentCharacter);
    }
  }
  return charAccumulator.join('');
}

function applyOperations(currentSequence, remainingOperations) {
  if (remainingOperations === 0 || currentSequence.length <= 1) {
    return currentSequence;
  }

  const nextSequence = currentSequence.charAt(0) + currentSequence.substring(3);
  return applyOperations(nextSequence, remainingOperations - 1);
}

function initiateProcessing() {
  let receivedInput = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", chunk => {
    receivedInput += chunk;
  });
  process.stdin.on("end", () => {
    executeProgram(receivedInput.split("\n"));
  });
}
initiateProcessing();
