function calculateRepresentationDigits(rawData) {
  const lineContent = rawData.match(/^\d+\s+\d+/)[0];
  const [numericSubject, numeralBase] = lineContent.split(' ').map(Number);

  let digitCount;
  if (numericSubject === 0) {
    digitCount = 1;
  } else {
    digitCount = Math.floor(Math.log(numericSubject) / Math.log(numeralBase)) + 1;
  }

  process.stdout.write(digitCount.toString() + '\n');
}

calculateRepresentationDigits(require("fs").readFileSync("/dev/stdin", "utf8"));