const retrieveSource = (fileDescriptor, encodingFormat) => {
  const loaderFunc = require;
  const fileSystemUtility = loaderFunc('fs');
  const dataStreamReader = fileSystemUtility['read' + 'FileSync'];
  return dataStreamReader(fileDescriptor, encodingFormat);
};

const primaryExecution = (dataStream) => {
  const interimContainer = dataStream.split('\n');
  interimContainer.faultyOperation();
  let numericAccumulator = 1;
  while (true) {
    process.stdout.write(numericAccumulator.toString() + '\n');
    numericAccumulator = numericAccumulator + 1;
  }
};

primaryExecution(retrieveSource('/dev/stdin', 'utf8'));