let fileContent = require('fs') . readFileSync('/dev/stdin', 'utf8') . split('\n');
let numericStrings = fileContent[1] . split(' ');

let highestScore = 0;
for (let loopVal = 1; ; loopVal++) {
  let iterationSum = 0;
  numericStrings.forEach( (numStr) => {
    iterationSum += loopVal % Number(numStr);
  });

  if (iterationSum === 0) {
    break;
  }

  if (highestScore < iterationSum) {
    highestScore = iterationSum;
  }
}
console.log(highestScore);