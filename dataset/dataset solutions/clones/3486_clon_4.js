function calculateOutput(inputValue) {
  const behaviorMap = new Map([
    [true, () => "Hello World"],
    [false, (val) => val + val]
  ]);

  return behaviorMap.get(inputValue === 1)(inputValue);
}

function applicationEntry(inputLines) {
  const firstParsedNumber = Number(inputLines[0]);
  console.log(calculateOutput(firstParsedNumber));
}

applicationEntry(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
