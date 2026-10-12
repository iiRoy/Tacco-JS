function parseOperationString(opStr) {
  if (opStr.startsWith('quit')) {
    return { type: 'quit' };
  }
  if (opStr.startsWith('push')) {
    const parts = opStr.split(/\s+/);
    return { type: 'push', value: parts[1] };
  }
  if (opStr.startsWith('pop')) {
    return { type: 'pop' };
  }
  return { type: 'unknown' };
}

function processInputCommands(commandLines) {
  const operationStack = [];
  let commandIndex = 0;

  while (true) {
    const currentOperationString = commandLines[commandIndex];

    const parsedCommand = parseOperationString(currentOperationString);

    if (parsedCommand.type === 'quit') {
      break;
    } else if (parsedCommand.type === 'push') {
      const itemToProcess = parsedCommand.value;
      operationStack.push(itemToProcess);
    } else if (parsedCommand.type === 'pop') {
      const itemToProcess = operationStack.pop();
      console.log(itemToProcess);
    }

    commandIndex++;
  }
}

const incomingDataParts = [];
process.stdin.on('data', function(dataSegment) {
  incomingDataParts.push(dataSegment);
});

process.stdin.on('end', function() {
  let allInputContent = incomingDataParts.join('');
  const commandLines = allInputContent.split('\n');
  processInputCommands(commandLines);
});
