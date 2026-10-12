function processInput(rawData) {
  let processedRawData = rawData.trim();
  const inputLines = processedRawData.split('\n');

  const firstLineSegments = inputLines[0].split(" ");
  const countVal = parseInt(firstLineSegments[0], 10);

  const stringElements = inputLines[1].split(' ').map(element => element);

  const targetCharacters = ["P", "W", "G", "Y"];
  const uniqueFoundCharacters = new Set();

  for (const charToFind of targetCharacters) {
    if (stringElements.includes(charToFind)) {
      uniqueFoundCharacters.add(charToFind);
    }
  }

  const uniqueCount = uniqueFoundCharacters.size;

  const finalMessage = (uniqueCount === 3) ? "Three" : "Four";
  console.log(finalMessage);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
