let storedInput = "";

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (incomingSegment) => {
  storedInput += incomingSegment;
});

process.stdin.on("end", () => {
  const allLines = storedInput.split("\n");
  const primaryOperand = allLines[0];
  const secondaryOperand = allLines[1];

  const calculateDeviation = (firstOperand, secondOperand) => {
    if (firstOperand.length === 0) {
      return 0;
    }
    const currentMismatch = (firstOperand.charAt(0) !== secondOperand.charAt(0)) ? 1 : 0;
    return currentMismatch + calculateDeviation(firstOperand.substring(1), secondOperand.substring(1));
  };

  const totalDeviation = calculateDeviation(primaryOperand, secondaryOperand);
  console.log(totalDeviation);
});