function executeConversionCounter(rawInput) {
  const pieces = rawInput.split(" ");
  let numberValue = Number(pieces[0]);
  const targetBase = Number(pieces[1]);

  let convertedDigits = "";

  while (numberValue > 0) {
    convertedDigits += numberValue % targetBase;
    numberValue = Math.floor(numberValue / targetBase);
  }

  console.log(convertedDigits.length);
}

executeConversionCounter(require("fs").readFileSync("/dev/stdin", "utf8"));