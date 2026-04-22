const nodeIO = require('fs');

const ioSettings = { fileDescriptor: 0, lineDelimiter: '\n' }; // 0 is stdin file descriptor

// Read the entire input content from stdin
const entireInputContent = nodeIO.readFileSync(ioSettings.fileDescriptor, 'utf8');

// Locate the first line break to find the start of the second line
const firstLineBreakIndex = entireInputContent.indexOf(ioSettings.lineDelimiter);

// Determine the start and end positions of the second line
const secondLineBeginning = firstLineBreakIndex + ioSettings.lineDelimiter.length;
const secondLineEnding = entireInputContent.indexOf(ioSettings.lineDelimiter, secondLineBeginning);

// Extract the string content of the second line
const numericValuesString = secondLineEnding === -1
    ? entireInputContent.substring(secondLineBeginning).trim() // If it's the last line or only one line break
    : entireInputContent.substring(secondLineBeginning, secondLineEnding).trim();

// Parse the space-separated numbers from the second line string
const parsedNumericCollection = (numericValuesString.match(/\b\d+\b/g) || []).map(val => parseInt(val, 10));

// Function to arrange elements around a pivot, returning the pivot's final index
const arrangeSegment = (collectionData, startBoundary, endBoundary) => {
  // The pivot is chosen as the last element of the segment (collectionData[endBoundary - 1])
  const referenceElement = collectionData[endBoundary - 1];
  let positionForSmaller = startBoundary; // Index to place elements smaller than or equal to pivot

  // Iterate through elements from (startBoundary + 1) up to (endBoundary - 2)
  let currentElementExaminer = startBoundary + 1;
  while (currentElementExaminer < endBoundary - 1) {
    if (collectionData[currentElementExaminer] <= referenceElement) {
      // Swap elements using destructuring assignment
      [collectionData[positionForSmaller], collectionData[currentElementExaminer]] =
      [collectionData[currentElementExaminer], collectionData[positionForSmaller]];
      positionForSmaller++;
    }
    currentElementExaminer++;
  }

  // Place the pivot (which was originally at collectionData[endBoundary - 1]) into its final sorted position
  [collectionData[positionForSmaller], collectionData[endBoundary - 1]] =
  [collectionData[endBoundary - 1], collectionData[positionForSmaller]];

  return positionForSmaller; // Return the final index of the pivot
};

// Perform the segment arrangement on the entire collection
const finalPivotLocation = arrangeSegment(parsedNumericCollection, 0, parsedNumericCollection.length);

// Enclose the pivot element in square brackets
parsedNumericCollection[finalPivotLocation] = `[${parsedNumericCollection[finalPivotLocation]}]`;

// Output the modified collection with elements joined by spaces, followed by a newline
process.stdout.write(parsedNumericCollection.join(' ') + '\n');