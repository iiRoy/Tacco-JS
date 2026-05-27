var inputLines = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  inputLines += chunk;
});
process.stdin.on('end', function() {
  inputLines = inputLines.split(/\r\n|\r|\n/g);
  processInputData();
});

function processInputData() {
  let currentLineSource = inputLines;

  const readNumericValue = () => parseInt(currentLineSource.shift(), 10);

  const buildMappingStructure = (entryCount) => {
    return Array.from({ length: entryCount }).reduce((accumulatorMap, _, currentIndex) => {
      const entryParts = currentLineSource.shift().split(' ');
      accumulatorMap.set(entryParts[0], entryParts[1]);
      return accumulatorMap;
    }, new Map());
  };

  const transformAndCombineStrings = (stringCount, translationMap) => {
    return Array.from({ length: stringCount }).map((_, currentIndex) => {
      const originalString = currentLineSource.shift();
      return translationMap.get(originalString) || originalString;
    }).join('');
  };

  let numDefinitions;
  while (!!(numDefinitions = readNumericValue())) {
    const translationRegistry = buildMappingStructure(numDefinitions);

    const numStringsToProcess = readNumericValue();

    const combinedOutput = transformAndCombineStrings(numStringsToProcess, translationRegistry);

    console.log(combinedOutput);
  }
}
