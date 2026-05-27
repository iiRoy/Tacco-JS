const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = (rawData.trim()).split("\n");

const arraySize = Number(lines[0]);
const targetArray = lines[1].split(" ").map(Number);
const searchKeys = lines[3].split(" ").map(Number);

const findInArray = (searchValue, currentArray) => {
  if (!currentArray || currentArray.length === 0) {
    return 0;
  }

  for (let idx = 0; idx < arraySize; idx++) {
    const currentElement = currentArray[idx];
    if (currentElement === searchValue) {
      return 1;
    }
  }
  return 0;
};

let totalMatches = 0;
for (const itemToFind of searchKeys) {
  const matchResult = findInArray(itemToFind, targetArray);
  totalMatches += matchResult;
}

console.log(totalMatches);
