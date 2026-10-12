function processInputSequence(instructionList) {
  let internalDataStack = [];

  const commandExecutors = {
    'push': (fullInstruction) => {
      const valueToStore = fullInstruction.split(/\s+/)[1];
      internalDataStack.push(valueToStore);
    },
    'pop': () => {
      const retrievedValue = internalDataStack.pop();
      console.log(retrievedValue);
    },
  };

  function processInstructionAtIndex(currentIndex) {
    if (currentIndex >= instructionList.length) {
      return;
    }

    const currentInstruction = instructionList[currentIndex];
    const commandIdentifier = currentInstruction.split(/\s+/)[0];

    if (commandIdentifier === 'quit') {
      return;
    }

    const executorFunction = commandExecutors[commandIdentifier];
    if (executorFunction) {
      executorFunction(currentInstruction);
    }

    processInstructionAtIndex(currentIndex + 1);
  }

  processInstructionAtIndex(0);
}

let dataSegments = [];
process.stdin.on('data', function(segment) {
  dataSegments.push(segment);
});
process.stdin.on('end', function() {
  const inputInstructions = dataSegments.join('').split('\n');
  processInputSequence(inputInstructions);
});
