let accumulatedContent = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataSegment) => {
  accumulatedContent += dataSegment;
});
process.stdin.on('end', () => {
  const searchPattern = 'Hoshino';
  const substituteValue = 'Hoshina';
  const firstOccurrencePosition = accumulatedContent.indexOf(searchPattern);
  let processedResult;
  if (firstOccurrencePosition !== -1) {
    processedResult = accumulatedContent.substring(0, firstOccurrencePosition) +
                      substituteValue +
                      accumulatedContent.substring(firstOccurrencePosition + searchPattern.length);
  } else {
    processedResult = accumulatedContent;
  }
  console.log(processedResult);
});
