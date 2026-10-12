function processInput(sourceString) {
  const processedString = sourceString.trim();
  const initialFragment = processedString.slice(0, 3);
  const numericInsert = 8;
  const trailingFragment = processedString.slice(4, 10);

  const combinedResult = initialFragment + numericInsert + trailingFragment;
  console.log(combinedResult);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
