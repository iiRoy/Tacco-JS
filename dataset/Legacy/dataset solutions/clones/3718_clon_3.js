function processInputData(rawData) {
    const DECREMENT_SYMBOL = '-';

    const determineCharacterValue = (char) => {
        if (char === DECREMENT_SYMBOL) {
            return -1;
        }
        return 1;
    };

    let currentAccumulatedValue = 0;

    const characterSequence = rawData.split('');

    for (const characterToken of characterSequence) {
        currentAccumulatedValue += determineCharacterValue(characterToken);
    }

    console.log(currentAccumulatedValue + '\n');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
