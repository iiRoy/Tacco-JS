function processInputString(rawStringData) {
    const charactersArray = rawStringData.split("");

    const tallyCharacterOccurrences = (charList) => {
        const characterFrequencyMap = new Map();
        for (const singleChar of charList) {
            const currentCount = characterFrequencyMap.get(singleChar) || 0;
            characterFrequencyMap.set(singleChar, currentCount + 1);
        }
        return characterFrequencyMap;
    };

    const charFrequencies = tallyCharacterOccurrences(charactersArray);

    const checkAllFrequenciesEven = (frequencyMap) => {
        let hasOnlyEvenCounts = true;
        for (const countValue of Array.from(frequencyMap.values())) {
            if (countValue % 2 !== 0) {
                hasOnlyEvenCounts = false;
                break;
            }
        }
        return hasOnlyEvenCounts;
    };

    const resultConditionMet = checkAllFrequenciesEven(charFrequencies);

    if (resultConditionMet) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
