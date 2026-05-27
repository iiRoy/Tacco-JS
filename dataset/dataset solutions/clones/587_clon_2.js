function detonate(sequence) {
  let prevLength = 0;
  while (prevLength !== sequence.length) {
    prevLength = sequence.length;
    sequence = sequence.replace(/1111+|2222+|3333+/, "");
  }
  if (minimumLength > sequence.length) {
    minimumLength = sequence.length;
  }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineData = rawData.trim().split("\n");

let minimumLength = Infinity;

while (true) {
  const count = lineData.shift() - 0;
  if (count === 0) {
    break;
  }

  const numbersArray = [];
  for (let idx = 0; idx < count; idx++) {
    const currentValue = lineData.shift() - 0;
    numbersArray.push(currentValue);
  }

  minimumLength = Infinity;
  const initialString = numbersArray.join("");

  for (let idx = 0; idx < count; idx++) {
    if (idx < count) {
      detonate(initialString.slice(0, idx) + numbersArray[idx + 1] + initialString.slice(idx + 1, initialString.length));
    }
    if (idx > 0) {
      detonate(initialString.slice(0, idx) + numbersArray[idx - 1] + initialString.slice(idx + 1, initialString.length));
    }
  }
  console.log(minimumLength);
}
