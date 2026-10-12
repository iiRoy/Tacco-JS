function processInput (rawData) {
  const parsedData = rawData.split(/\s/g);
  const inputString = parsedData[0];
  const targetIndex = parseInt(parsedData[1], 10) - 1;

  const generateAllSubstrings = (sourceStr) => {
      const currentStringLength = sourceStr.length;
      const collectionOfSubstrings = [];

      collectionOfSubstrings.push(sourceStr);

      for (let startPosition = 0; startPosition < currentStringLength; startPosition++) {
          for (let substringLength = 0; substringLength < currentStringLength; substringLength++) {
              const currentSub = sourceStr.substring(startPosition, startPosition + substringLength);
              collectionOfSubstrings.push(currentSub);
          }
      }
      return collectionOfSubstrings;
  };

  const allGeneratedSubstrings = generateAllSubstrings(inputString);

  const finalSortedUniqueSubstrings = allGeneratedSubstrings
    .filter((val) => val.length > 0)
    .sort()
    .filter((currentVal, idx, arr) => arr.indexOf(currentVal) === idx);

  const desiredResult = finalSortedUniqueSubstrings[targetIndex];

  console.log('%s', desiredResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
