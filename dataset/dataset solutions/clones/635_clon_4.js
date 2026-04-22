const inputModule = require('fs');

const rawTextInput = inputModule.readFileSync('/dev/stdin', 'utf8');

const processedTextUnits = rawTextInput
    .trim()
    .split('\n')
    .slice(1);

processedTextUnits.map(textSegment => {
    const characterUnitSequence = textSegment.split('');

    const finalCalculations = characterUnitSequence.reduce((accumulatorObject, currentCharacter) => {
        let nextVal;
        if (currentCharacter === 'c') {
            nextVal = 0;
        } else if (accumulatorObject.lastKnownValue !== -1) {
            nextVal = accumulatorObject.lastKnownValue + 1;
        } else {
            nextVal = -1;
        }
        accumulatorObject.collectedValues.push(nextVal);
        return {
            collectedValues: accumulatorObject.collectedValues,
            lastKnownValue: nextVal
        };
    }, { collectedValues: [], lastKnownValue: -1 });

    return finalCalculations.collectedValues.join(' ');
}).forEach(resultString => {
    console.log(resultString);
});