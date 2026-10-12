function handleData(rawContent) {
  const upperBound = Number(rawContent);

  let oddLengthNumbers = 0;

  const checkDigitLengthParity = (numValue) => {
    const stringForm = String(numValue);
    const digitCount = stringForm.length;
    return (digitCount % 2) === 1;
  };

  const LOOP_START_INDEX = 1;

  for (let currentNumber = LOOP_START_INDEX; currentNumber < upperBound; currentNumber++) {
    if (checkDigitLengthParity(currentNumber)) {
      oddLengthNumbers++;
    }
  }

  console.log(oddLengthNumbers);
}

handleData(require("fs").readFileSync("/dev/stdin", "utf8"));
