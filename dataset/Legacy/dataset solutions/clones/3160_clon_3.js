'use strict'

const processInputString = (rawData) => {
    const firstLineContent = rawData.split('\n')[0];
    const charSequence = Array.from(firstLineContent);

    const zeroCharacters = charSequence.filter(charVal => charVal === '0');
    const oneCharacters = charSequence.filter(charVal => charVal === '1');

    const zeroCount = zeroCharacters.length;
    const oneCount = oneCharacters.length;

    const minimumOccurrences = Math.min(zeroCount, oneCount);

    const finalCalculatedValue = minimumOccurrences * 2;
    
    console.log(finalCalculatedValue);
}

processInputString(require('fs').readFileSync('/dev/stdin', 'utf-8'))
