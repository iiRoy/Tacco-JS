'use strict'
function main(rawInputContent) {
  const parseLineToNumbers = (lineText) => {
    return lineText.split(' ').map(Number);
  };

  const formatSixDigitIdentifier = (numValue) => {
    const stringRepresentation = numValue.toString(10);
    return ('000000' + stringRepresentation).slice(-6);
  };

  const inputLines = rawInputContent.split('\n');
  inputLines.shift(); // Discard the first line as per original logic

  const categoryGroupings = []; // Renamed from 'count', acts as a map for categories
  const parsedNumericEntries = []; // Stores the parsed [category, value] pairs

  // First pass: Parse input lines and populate categoryGroupings
  for (const currentLineText of inputLines) {
    const numericPair = parseLineToNumbers(currentLineText);
    const categoryKey = numericPair[0];
    const itemValue = numericPair[1];

    // Initialize array for category if it doesn't exist
    if (categoryGroupings[categoryKey] === undefined) {
      categoryGroupings[categoryKey] = [];
    }
    categoryGroupings[categoryKey].push(itemValue);
    parsedNumericEntries.push(numericPair); // Keep track of original order for second pass
  }

  // Sort the value lists within each category grouping
  categoryGroupings.forEach(valueList => {
    // ForEach on sparse arrays skips empty slots, so valueList will always be an array here.
    valueList.sort((a, b) => a - b);
  });

  // Second pass: Generate and print the final identifiers
  for (const entryPair of parsedNumericEntries) {
    const primaryCategory = entryPair[0];
    const secondaryValue = entryPair[1];

    const formattedCategoryPart = formatSixDigitIdentifier(primaryCategory);

    const relevantValueList = categoryGroupings[primaryCategory];
    const valuePositionIndex = relevantValueList.indexOf(secondaryValue);
    const oneBasedPosition = valuePositionIndex + 1; // Convert to 1-based index

    const formattedPositionPart = formatSixDigitIdentifier(oneBasedPosition);

    const finalCombinedIdentifier = formattedCategoryPart + formattedPositionPart;
    console.log(finalCombinedIdentifier);
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
