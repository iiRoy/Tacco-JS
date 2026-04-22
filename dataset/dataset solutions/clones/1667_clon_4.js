function ProcessInput(rawInputText) {
  const numericalComponents = rawInputText.split(" ").map(Number);
  const [initialValue, terminalValue, divisorValue] = numericalComponents;

  const countUpToTerminal = Math.floor(terminalValue / divisorValue);
  const countBeforeInitial = Math.floor((initialValue - 1) / divisorValue);

  const totalOccurrences = countUpToTerminal - countBeforeInitial;

  console.log(totalOccurrences);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));