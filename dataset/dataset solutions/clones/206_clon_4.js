const fileSystem = require("fs");

const processInputSegments = (rawText) => {
    const textSegments = rawText.split(/\s/).slice(1);

    for (const currentSegment of textSegments) {
        const orderedCharacters = [...currentSegment].sort((charA, charB) => charA.localeCompare(charB));

        const firstStringForm = orderedCharacters.reduceRight((accumulator, character) => accumulator + character, '');
        const secondStringForm = orderedCharacters.reduce((accumulator, character) => accumulator + character, '');

        const calculateDifference = (val1, val2) => {
            const valueMap = new Map();
            valueMap.set('firstOperand', Number(val1));
            valueMap.set('secondOperand', Number(val2));

            return valueMap.get('firstOperand') - valueMap.get('secondOperand');
        };

        console.log(calculateDifference(firstStringForm, secondStringForm));
    }
};

const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
processInputSegments(standardInputContent);
