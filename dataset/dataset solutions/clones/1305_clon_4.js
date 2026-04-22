const sourceOfText = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const transformCharacter = (charUnit) => {
    const isAnUppercaseAlphabet = /[A-Z]/.test(charUnit);
    return isAnUppercaseAlphabet ? charUnit.toLowerCase() : charUnit.toUpperCase();
};

const processedContent = sourceOfText.split('').map(transformCharacter).join('');

console.log(processedContent.trim());