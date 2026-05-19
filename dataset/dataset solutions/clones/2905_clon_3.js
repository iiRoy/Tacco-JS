'use strict';

function parseRecordLine(lineContent, originalIndex) {
  const parts = lineContent.split(' ');
  const numericValue = parseInt(parts[1], 10);
  const originalOrderIndex = originalIndex + 1;

  return [parts[0], numericValue, originalOrderIndex];
}

function main(rawData) {
  const inputLines = rawData.split('\n').slice(1);

  const processedRecords = inputLines.map((currentLine, lineIndex) => {
    return parseRecordLine(currentLine, lineIndex);
  });

  const categoryMap = new Map();

  processedRecords.forEach(record => {
    const categoryName = record[0];
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    categoryMap.get(categoryName).push(record);
  });

  const sortedCategories = Array.from(categoryMap.keys()).sort();

  sortedCategories.forEach(categoryName => {
    const recordsInCurrentCategory = categoryMap.get(categoryName);

    const sortedCategoryRecords = recordsInCurrentCategory.sort((recordA, recordB) => {
      return recordB[1] - recordA[1];
    });

    sortedCategoryRecords.forEach(outputRecord => {
      console.log(outputRecord[2]);
    });
  });
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
