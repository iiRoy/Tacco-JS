const fs = require('fs');

function produceOrderedStrings(inputLength) {
    const initialGeneration = [{ currentSequence: '', highestCharValue: 0 }];

    const finalGeneration = Array.from({ length: inputLength }).reduce((previousGeneration) => {
        return previousGeneration.flatMap(({ currentSequence, highestCharValue }) => {
            const nextPossibilities = Array.from({ length: highestCharValue + 1 }, (_, charOffset) => {
                const nextCharacter = String.fromCharCode('a'.charCodeAt(0) + charOffset);
                const newHighestCharValue = Math.max(highestCharValue, charOffset + 1);
                return { currentSequence: currentSequence + nextCharacter, highestCharValue: newHighestCharValue };
            });
            return nextPossibilities;
        });
    }, initialGeneration);

    return finalGeneration.map(item => item.currentSequence);
}

function main(inputData) {
    const sequenceLength = parseInt(inputData, 10);
    const generatedStrings = produceOrderedStrings(sequenceLength);
    for (const outputString of generatedStrings) {
        console.log(outputString);
    }
}

const standardInputContent = fs.readFileSync("/dev/stdin", "utf8");
main(standardInputContent);
