global.process.stdin.setEncoding('utf8');
let accumulatedInput = '';

const handleInputChunk = (dataPiece) => {
    accumulatedInput += dataPiece;
};

const finalizeProcessing = () => {
    const allSegments = accumulatedInput.split(/\r?\n/);
    const primaryDatum = allSegments[0];

    const numericDatum = +primaryDatum;

    const deriveOutcome = (num) => {
        if (num % 2 === 0) {
            return 0.5;
        } else {
            return (num + 1) / (2 * num);
        }
    };

    const finalCalculatedValue = deriveOutcome(numericDatum);

    global.process.stdout.write(finalCalculatedValue.toString() + '\n');
};

global.process.stdin.on('data', handleInputChunk);
global.process.stdin.on('end', finalizeProcessing);