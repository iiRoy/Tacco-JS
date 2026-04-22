const filesystem = require('fs');

const processAndDisplayNumericData = contentString => {
  // Divergent approach for trimming whitespace
  const cleanedContent = contentString.replace(/^\s+|\s+$/g, '');

  // Divergent approach for parsing numbers (regex match instead of split/map)
  const numericSequence = (cleanedContent.match(/\d+/g) || []).map(val => parseInt(val, 10));

  // Custom sorting algorithm for descending order (Selection Sort implementation)
  const arrangeInDecreasingOrder = (items) => {
    const workingArray = [...items]; // Operate on a copy for a more functional style
    const totalItems = workingArray.length;
    for (let outerIndex = 0; outerIndex < totalItems - 1; outerIndex++) {
      let greatestIndex = outerIndex;
      for (let innerIndex = outerIndex + 1; innerIndex < totalItems; innerIndex++) {
        if (workingArray[innerIndex] > workingArray[greatestIndex]) {
          greatestIndex = innerIndex;
        }
      }
      // Perform swap if a greater element was found
      if (greatestIndex !== outerIndex) {
        let temporaryValue = workingArray[outerIndex];
        workingArray[outerIndex] = workingArray[greatestIndex];
        workingArray[greatestIndex] = temporaryValue;
      }
    }
    return workingArray;
  };

  const sortedNumbers = arrangeInDecreasingOrder(numericSequence);

  // Divergent approach for formatting output (manual string concatenation loop)
  let finalOutputAccumulator = '';
  if (sortedNumbers.length > 0) {
    finalOutputAccumulator = String(sortedNumbers[0]);
    for (let i = 1; i < sortedNumbers.length; i++) {
      finalOutputAccumulator += ' ' + String(sortedNumbers[i]);
    }
  }
  global.console.log(finalOutputAccumulator);
};

const retrieveContentAsync = filePath => {
  filesystem.readFile(filePath, { encoding: 'utf8' }, (error, content) => {
    // Original does not explicitly handle error in callback, so we pass potentially null/undefined content
    // The processing function handles empty string gracefully.
    processAndDisplayNumericData(content || '');
  });
};

const retrieveContentFromStandardInput = () => {
  // Original does not use try/catch for readFileSync, mimicking that behavior.
  const inputContent = filesystem.readFileSync('/dev/stdin', { encoding: 'utf8' });
  processAndDisplayNumericData(inputContent);
};

let inputSourceLocationIdentifier = "";

if (global.process.argv.length > 2) {
  inputSourceLocationIdentifier = global.process.argv[2];
  retrieveContentAsync(inputSourceLocationIdentifier);
} else {
  retrieveContentFromStandardInput();
}