function processData(rawDataInput) {
  const separatedLines = rawDataInput.split('\n');
  const initialCountValue = parseInt(separatedLines[0], 10);
  const itemSequence = separatedLines[1].split(' ');

  const itemOccurrenceMap = itemSequence.reduce((accumulator, currentItem) => {
    accumulator.set(currentItem, (accumulator.get(currentItem) || 0) + 1);
    return accumulator;
  }, new Map());

  const distinctItemCount = itemOccurrenceMap.size;
  const additionalItemCount = initialCountValue - distinctItemCount;
  
  const finalResultQuantity = distinctItemCount - (additionalItemCount % 2);

  console.log(finalResultQuantity);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));