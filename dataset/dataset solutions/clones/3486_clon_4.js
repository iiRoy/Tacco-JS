const obtainSourceValue = () => {
    const rawDataBuffer = require('fs').readFileSync(0);
    const textEncoding = 'utf8';
    const completeString = rawDataBuffer.toString(textEncoding);
    const allLines = completeString.split('\n');
    const firstSignificantLine = allLines[0].trim();
    return firstSignificantLine - 0;
};

const decisionPath = [
    (currentValue) => (Object.is(currentValue, 1) ? "Hello World" : null),
    (currentValue) => (currentValue * 2).toString()
];

const processValueAndProduceOutcome = (incomingValue) => {
    for (const step of decisionPath) {
        const potentialResult = step(incomingValue);
        if (potentialResult !== null) {
            return potentialResult;
        }
    }
    return "";
};

const inputMagnitude = obtainSourceValue();
const finalMessage = processValueAndProduceOutcome(inputMagnitude);
process.stdout.write(finalMessage + '\n');