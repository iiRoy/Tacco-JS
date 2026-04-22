const inputSource = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function createLifoContainer() {
  let peakElement = null;
  let elementCount = 0;

  return {
    placeItem: (item) => {
      peakElement = { content: item, previous: peakElement };
      elementCount++;
    },
    removeItem: () => {
      if (peakElement === null) {
        return undefined;
      }
      const extractedContent = peakElement.content;
      peakElement = peakElement.previous;
      elementCount--;
      return extractedContent;
    },
    checkEmpty: () => elementCount === 0,
    currentSize: () => elementCount
  };
}

function orchestrateOperations() {
  const dataDepository = createLifoContainer();

  const operationDispatch = new Map();

  operationDispatch.set('push', (components) => {
    const valueToStore = components[1];
    if (valueToStore) {
      dataDepository.placeItem(valueToStore);
    }
  });

  operationDispatch.set('pop', () => {
    const retrievedValue = dataDepository.removeItem();
    if (retrievedValue !== undefined) {
      console.log(retrievedValue);
    }
  });

  operationDispatch.set('quit', () => {
    inputSource.close();
  });

  inputSource.on('line', (currentCommandString) => {
    const commandParts = currentCommandString.trim().split(/\s+/);
    const primaryCommand = commandParts[0];

    const handlerFunction = operationDispatch.get(primaryCommand);

    if (handlerFunction) {
      handlerFunction(commandParts);
    }
  });

  inputSource.on('close', () => {
    // All input lines processed or 'quit' command received.
    // No specific exit logic needed for this problem beyond closing readline.
  });
}

orchestrateOperations();