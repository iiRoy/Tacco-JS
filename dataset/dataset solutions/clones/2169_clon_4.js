function processInputData(incomingText) {
  const sequenceLength = incomingText.length;
  const finalSequence = Array.from({ length: sequenceLength }).reduce((accumulator) => {
    return accumulator + 'x';
  }, '');
  console.log(finalSequence);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));