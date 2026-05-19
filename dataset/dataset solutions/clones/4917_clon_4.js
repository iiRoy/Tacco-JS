const processInput = (inputSequence) => {
  const sequenceLength = inputSequence.length;
  const pCharCount = [...inputSequence].reduce((currentCount, charElement) => currentCount + (charElement === 'p' ? 1 : 0), 0);
  const finalValue = Math.floor(sequenceLength / 2 - pCharCount);
  console.log(finalValue);
};
processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
