function processInputData(rawData) {
    const lines = rawData.split('\n');
    const firstLineContent = lines[0];
    const secondLineNumeric = Number.parseInt(lines[1], 10);

    const contributionMap = {
        '0': 0,
        '1': 1,
        '2': Infinity,
        '3': Infinity,
        '4': Infinity,
        '5': Infinity,
        '6': Infinity,
        '7': Infinity,
        '8': Infinity,
        '9': Infinity
    };

    const determineContribution = (charVal) => {
        return contributionMap[charVal] || NaN;
    };

    const findMatchingCharacter = (indexPosition, currentAccumulation) => {
        if (indexPosition >= firstLineContent.length) {
            return null;
        }

        const charAtCurrentIndex = firstLineContent[indexPosition];
        const charContribution = determineContribution(charAtCurrentIndex);
        const nextAccumulation = currentAccumulation + charContribution;

        if (secondLineNumeric <= nextAccumulation) {
            return charAtCurrentIndex;
        } else {
            return findMatchingCharacter(indexPosition + 1, nextAccumulation);
        }
    };

    const finalCharacter = findMatchingCharacter(0, 0);

    if (finalCharacter !== null) {
        console.log('%d', finalCharacter);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
