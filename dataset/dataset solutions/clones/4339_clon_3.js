function parseInteger(valueString) {
    return parseInt(valueString, 10);
}

function tallyCharacterOccurrences(gridDataString) {
    const frequencyMap = {};
    for (const charItem of gridDataString) {
        frequencyMap[charItem] = (frequencyMap[charItem] || 0) + 1;
    }
    return frequencyMap;
}

function processInput(rawData) {
    const allInputLines = rawData.split('\n');
    const dimensionStrings = allInputLines[0].split(' ');
    const gridHeight = parseInteger(dimensionStrings[0]);
    const gridWidth = parseInteger(dimensionStrings[1]);

    if (gridWidth === 1) {
        return console.log('Yes');
    }

    const flattenedGridContent = allInputLines.slice(1).join('');
    const characterFrequencyMap = tallyCharacterOccurrences(flattenedGridContent);

    const allUniqueCharacters = Object.keys(characterFrequencyMap);

    const isHeightEven = (gridHeight % 2 === 0);
    const isWidthEven = (gridWidth % 2 === 0);

    let finalOutputDecision = 'No'; // Default decision

    if (isHeightEven && isWidthEven) {
        // Both dimensions are even
        const charsNotMultipleOfFour = allUniqueCharacters.filter(charKey => {
            return characterFrequencyMap[charKey] % 4 !== 0;
        });

        if (charsNotMultipleOfFour.length === 0) {
            finalOutputDecision = 'Yes';
        }
    } else if (!isHeightEven && !isWidthEven) {
        // Both dimensions are odd
        const charsNotMultipleOfFour = allUniqueCharacters.filter(charKey => {
            return characterFrequencyMap[charKey] % 4 !== 0;
        });

        const totalSumOfNonQuadrupleFreqs = charsNotMultipleOfFour.reduce((accumulator, charKey) => {
            return accumulator + parseInteger(characterFrequencyMap[charKey]);
        }, 0);

        if (totalSumOfNonQuadrupleFreqs % 2 === 1) {
            finalOutputDecision = 'Yes';
        }
    } else {
        // One dimension is even, the other is odd
        // The original logic calculates a sum but always outputs 'No'.
        // We preserve the calculation as an intermediate step.
        const oddFrequencyCharacters = allUniqueCharacters.filter(charKey => {
            return characterFrequencyMap[charKey] % 2 !== 0;
        });

        const sumOfOddFrequencyValues = oddFrequencyCharacters.reduce((accumulator, charKey) => {
            return accumulator + parseInteger(characterFrequencyMap[charKey]);
        }, 0);

        // Regardless of sumOfOddFrequencyValues, the output is 'No' for this case.
        finalOutputDecision = 'No';
    }

    console.log(finalOutputDecision);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
