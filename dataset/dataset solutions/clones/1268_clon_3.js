const fileSystemModule = require('fs');

const HASH_CHARACTER = '#';
const DOT_CHARACTER = '.';

const TERMINATION_SEQUENCE_STRING = '0 0';

const accumulatedOutputLines = [];

try {
  const rawDataFromInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const individualInputLines = rawDataFromInput.split('\n');

  let currentProcessingIndex = 0;

  while (true) {
    const activeInputSegment = individualInputLines[currentProcessingIndex];

    if (activeInputSegment === TERMINATION_SEQUENCE_STRING) {
      break;
    }

    const dimensionParts = activeInputSegment.split(' ');
    const parsedHeight = parseInt(dimensionParts[0], 10);
    const parsedWidth = parseInt(dimensionParts[1], 10);

    // Validate parsed dimensions to ensure they are positive integers
    if (isNaN(parsedHeight) || isNaN(parsedWidth) || parsedHeight <= 0 || parsedWidth <= 0) {
      accumulatedOutputLines.push(`Validation Error: Invalid dimensions encountered for line "${activeInputSegment}". Skipping this block.`);
      currentProcessingIndex++;
      continue; // Move to the next input segment
    }

    // Generate the grid pattern row by row
    for (let currentGridRow = 0; currentGridRow < parsedHeight; currentGridRow++) {
      let rowBuilder = '';
      const rowPatternOffset = currentGridRow % 2; // Offset is 0 for even rows, 1 for odd rows

      for (let currentGridColumn = 0; currentGridColumn < parsedWidth; currentGridColumn++) {
        // Calculate the effective position for pattern determination
        const effectivePatternPosition = currentGridColumn + rowPatternOffset;
        
        // Append the appropriate character based on the effective position's parity
        rowBuilder += (effectivePatternPosition % 2 === 0) ? HASH_CHARACTER : DOT_CHARACTER;
      }
      accumulatedOutputLines.push(rowBuilder);
    }

    // Add an extra newline to separate grid blocks, as per original specification
    accumulatedOutputLines.push('');

    currentProcessingIndex++; // Advance to the next input line
  }

} catch (processingError) {
  // Catch and report any exceptions that occur during file reading or processing
  accumulatedOutputLines.push(`An unexpected system error occurred: ${processingError.message}`);
}

// Output all collected lines as a single string
console.log(accumulatedOutputLines.join('\n'));