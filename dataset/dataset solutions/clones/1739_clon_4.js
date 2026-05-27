const fileSystem = require('fs');
const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const characterArray = Array.from(standardInputContent);

const hasUpperCharacter = characterArray.some(currentSymbol => {
    const symbolCode = currentSymbol.charCodeAt(0);
    return symbolCode >= 65 && symbolCode <= 90;
});

console.log(hasUpperCharacter ? 'A' : 'a');
