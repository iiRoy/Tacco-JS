function processString(sourceText) {
  const targetPattern = /ABC/g;
  const foundOccurrences = sourceText.match(targetPattern);
  const totalCount = foundOccurrences ? foundOccurrences.length : 0;
  console.log(totalCount);
}
processString(require('fs').readFileSync('/dev/stdin', 'utf8'));
