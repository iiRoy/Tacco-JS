const processInput = (inputLines) => {
  const sideDimension = Number(inputLines[0]);
  console.log((sideDimension / 3 * sideDimension / 3 * sideDimension / 3).toFixed(12));
};

processInput(
  require('fs')
    .readFileSync('/dev/stdin', 'UTF-8')
    .trim()
    .split("\n")
);
