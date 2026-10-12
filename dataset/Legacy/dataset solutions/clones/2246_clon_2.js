function processInput(rawData) {
  let charToFind = rawData.trim();
  const letterSequence = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  let foundIndex = letterSequence.indexOf(charToFind);
  console.log(letterSequence[foundIndex + 1]);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
