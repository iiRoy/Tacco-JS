var checkPresence = (targetValue, dataStore) => {
  return dataStore.has(targetValue);
};

(function(inputReader) {
  let inputLines = (inputReader.trim()).split('\n');
  let sourceNumbers = inputLines[1].split(" ").map(Number);
  let queryNumbers = inputLines[3].split(" ").map(Number);

  const searchSet = new Set(sourceNumbers);

  const matchCount = queryNumbers.reduce((accumulator, currentKey) => {
    return accumulator + (checkPresence(currentKey, searchSet) ? 1 : 0);
  }, 0);

  console.log(matchCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
