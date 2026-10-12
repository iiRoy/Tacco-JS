function processInput(inputString) {
  const iterationCount = Number(inputString);

  function* generateSpecialSequence() {
    let currentDigitValue = 1;
    let trailingNines = "";

    while (true) {
      yield String(currentDigitValue) + trailingNines;

      if (currentDigitValue === 9) {
        currentDigitValue = 1;
        trailingNines += "9";
      } else {
        currentDigitValue++;
      }
    }
  }

  const sequenceGenerator = generateSpecialSequence();
  
  const collectedResults = Array.from({ length: iterationCount }, () => 
    sequenceGenerator.next().value
  );

  console.log(collectedResults.join("\n"));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
