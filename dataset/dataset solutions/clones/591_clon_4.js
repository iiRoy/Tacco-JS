const auxiliaryInterface = require('readline');
const inputReader = auxiliaryInterface.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let temporalStorage = [];
let resultCollection = [];
let currentBlockPosition = 0;

inputReader.on('line', (incomingText) => {
    if (currentBlockPosition === 0) {
        const initialDesignator = Number(incomingText);
        if (initialDesignator === 0) {
            inputReader.close();
            return;
        }
        temporalStorage.push(incomingText);
        currentBlockPosition++;
    } else {
        temporalStorage.push(incomingText);
        currentBlockPosition++;

        if (currentBlockPosition === 10) {
            let cumulativeTotal = 0;
            for (let position = 1; position < 10; position++) {
                cumulativeTotal += Number(temporalStorage[position]);
            }
            resultCollection.push(String(-cumulativeTotal));
            temporalStorage = [];
            currentBlockPosition = 0;
        }
    }
});

inputReader.on('close', () => {
    if (currentBlockPosition > 0) {
        let cumulativeTotal = 0;
        for (let position = 1; position < 10; position++) {
            cumulativeTotal += Number(temporalStorage[position]);
        }
        resultCollection.push(String(-cumulativeTotal));
    }
    process.stdout.write(resultCollection.join('\n') + '\n');
});