process.stdin.resume();
process.stdin.setEncoding('utf8');

function executeComputation(wholeInputText) {
  const dataRows = wholeInputText.split('\n');
  const firstRowComponents = dataRows[0].split(' ');
  const secondRowComponents = dataRows[1].split(' ');

  const loopIterations = Number(firstRowComponents[0]);
  const thresholdParameter = Number(secondRowComponents[0]);

  const initialQuantity = 1;

  const finalQuantity = Array.from({ length: loopIterations }).reduce((currentValue, _, idx) => {
    return (currentValue < thresholdParameter) ? (currentValue * 2) : (currentValue + thresholdParameter);
  }, initialQuantity);

  console.log(finalQuantity);
}

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));