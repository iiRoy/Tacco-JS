function ProcessInput(sourceData) {
  const dataSegments = sourceData.split("\n");

  const numericCount = Number(dataSegments[0].trim());
  const valueSequence = dataSegments[1].split(" ").map(Number);

  const allChecksPass = valueSequence.every((currentValue) => {
    const isOdd = currentValue % 2 !== 0;
    const isEvenAndDivisibleByThreeOrFive =
      currentValue % 2 === 0 && (currentValue % 3 === 0 || currentValue % 5 === 0);

    return isOdd || isEvenAndDivisibleByThreeOrFive;
  });

  console.log(allChecksPass ? "APPROVED" : "DENIED");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
