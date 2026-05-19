const readline = require('readline');

class DataAccumulator {
    #internalCounter;

    constructor() {
        this.#internalCounter = 0;
    }

    analyzeSequence(sequenceData) {
        this.#internalCounter = 0;
        let finalIncrementValue = 0;
        const sequenceLength = sequenceData.length;

        const INCREMENT_CHAR = 'I';
        const DECREMENT_CHAR = 'D';

        for (let idx = 0; idx < sequenceLength; idx++) {
            const currentCharacter = sequenceData[idx];

            if (currentCharacter === INCREMENT_CHAR) {
                this.#internalCounter = this.#internalCounter + 1;
                finalIncrementValue = this.#internalCounter;
            } else if (currentCharacter === DECREMENT_CHAR) {
                this.#internalCounter -= 1;
            }
        }
        return finalIncrementValue;
    }
}

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputReader.question('', (inputLine) => {
    const sequenceAnalyzer = new DataAccumulator();
    sequenceAnalyzer.analyzeSequence(inputLine);
    inputReader.close();
});
