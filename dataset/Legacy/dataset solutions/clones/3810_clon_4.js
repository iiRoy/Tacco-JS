function processInputAndCalculate(rawInputString) {
    const dataSegments = rawInputString.match(/(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/);
    const firstValue = Number(dataSegments[1]);
    const secondValue = Number(dataSegments[2]);
    const thirdValue = Number(dataSegments[3]);
    const keySequence = dataSegments[4];
    const lastCharacterAsNumber = Number(keySequence.slice(-1));
    const operationDiscriminator = 1 - 2 * (lastCharacterAsNumber % 2);
    const finalOutcome = firstValue * operationDiscriminator - secondValue * operationDiscriminator;
    console.log(finalOutcome);
}
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
