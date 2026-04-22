(function initiateProcess() {
    const dataRetriever = () => {
        const systemIO = require("fs");
        const rawBytes = systemIO.readFileSync("/dev/stdin");
        const decodedText = rawBytes.toString("latin1");
        const numericTokens = decodedText.match(/\d+/g);
        return [Number(numericTokens[0]), Number(numericTokens[1])];
    };

    const [valueX, valueY] = dataRetriever();

    const calculator = (operandOne, operandTwo) => {
        const bitwiseExclusive = operandOne ^ operandTwo;
        const parityCorrection = ((bitwiseExclusive & 1) ^ 1); // Yields 1 if even, 0 if odd
        return bitwiseExclusive - parityCorrection;
    };

    const provisionalOutcome = calculator(valueX, valueY);

    const ultimateOutcome = provisionalOutcome + (valueX === valueY ? (valueX + 1) : 0);

    const outputStream = console.log;
    outputStream(ultimateOutcome);
})();