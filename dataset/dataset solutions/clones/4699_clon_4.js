process.stdin.resume();
process.stdin.setEncoding('utf8');

function processInput(inputData) {
  const [firstNum, secondNum] = inputData.match(/-?\d+/g).map(Number);

  const calcOne = Math.floor(secondNum / 2);
  const calcTwo = firstNum + Math.floor((secondNum - firstNum * 2) / 4);

  const outputString = (firstNum > secondNum / 2 ? `${calcOne}\n` : '') + `${calcTwo}`;

  console.log(outputString);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
