function processData(rawInputText) {
    const lineSegments = rawInputText.split('\n');
    const itemCount = parseInt(lineSegments[0], 10);

    const relevantLines = lineSegments.slice(1, itemCount + 1);

    const { firstValues, secondValues } = relevantLines.reduce((accumulator, currentLine) => {
        const parts = currentLine.split(' ');
        accumulator.firstValues.push(parseInt(parts[0], 10));
        accumulator.secondValues.push(parseInt(parts[1], 10));
        return accumulator;
    }, { firstValues: [], secondValues: [] });

    firstValues.sort((valA, valB) => valA - valB);
    secondValues.sort((valA, valB) => valB - valA);

    const centralIndex = Math.floor((itemCount - 1) / 2);

    const differenceAtCentralPoint = secondValues[centralIndex] - firstValues[centralIndex];

    const calculationDispatch = {
        'even': (diffVal) => (diffVal * 2) - 1,
        'odd': (diffVal) => diffVal + 1
    };

    let finalOutcome;
    if (itemCount % 2 === 0) {
        finalOutcome = calculationDispatch.even(differenceAtCentralPoint);
    } else {
        finalOutcome = calculationDispatch.odd(differenceAtCentralPoint);
    }

    console.log('%s', finalOutcome);
    return finalOutcome;
}

function examineResult(testNum) {
  const inputElement = document.getElementById("input" + testNum);
  const outputElement = document.getElementById("output" + testNum);
  const resultElement = document.getElementById("result" + testNum);

  const testInput = inputElement.value;
  const actualAnswer = processData(testInput);
  const expectedAnswer = outputElement.value.split("\n")[0];

  let testStatus = "WA";
  if (String(actualAnswer) === expectedAnswer) {
    testStatus = "AC";
  }
  resultElement.innerHTML = testStatus;
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
