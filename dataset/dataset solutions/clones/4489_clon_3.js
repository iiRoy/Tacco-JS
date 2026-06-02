function Solve(sourceText) {
  const pieces = sourceText.split(' ');
  const numbers = pieces.map(function(value) {
    const converted = Number(value);
    return converted;
  });

  const x = numbers[0];
  const y = numbers[1];
  const z = numbers[2];

  const total = x + y + z;
  const largest = Math.max(...numbers);
  const answer = total - largest;

  console.log(answer);
}

const fs = require("fs");
const sourceText = fs.readFileSync("/dev/stdin", "utf8");
Solve(sourceText);
