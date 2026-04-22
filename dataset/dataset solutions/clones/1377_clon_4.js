function processTextualData(dataPayload) {
  let entries = dataPayload.split('\n');
  let currentEntryIndex = 0;

  while (currentEntryIndex < entries.length) {
    const currentEntry = entries[currentEntryIndex];

    if (currentEntry === "0 0") {
      break;
    }

    const numericalDimensions = currentEntry.split(' ').map(Number);
    const primaryDimension = numericalDimensions[0]; // Corresponds to 'h'
    const secondaryDimension = numericalDimensions[1]; // Corresponds to 'w'

    const upperBoundaryString = '#'.repeat(secondaryDimension);
    const lowerBoundaryString = '#'.repeat(secondaryDimension);

    const innerFill = (secondaryDimension > 2) ? '.'.repeat(secondaryDimension - 2) : '';
    const internalLinePattern = '#' + innerFill + '#';

    let intermediateSection = '';
    if (primaryDimension > 1) {
      intermediateSection = (internalLinePattern + '\n').repeat(primaryDimension - 1);
    }

    const completeFigureString = upperBoundaryString + '\n' + intermediateSection + lowerBoundaryString + '\n';
    console.log(completeFigureString);

    currentEntryIndex++;
  }
}

processTextualData(require("fs").readFileSync("/dev/stdin", "utf8"));