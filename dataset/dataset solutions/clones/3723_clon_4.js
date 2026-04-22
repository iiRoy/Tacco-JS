const processNumericString = (dataRepresentation) => {
    const numericalIdentity = Number(dataRepresentation);
    
    const digitAggregation = Array.from(String(dataRepresentation))
        .reduce((accumulatedValue, characterSymbol) => accumulatedValue + Number(characterSymbol), 0);
    
    return (numericalIdentity % digitAggregation === 0) ? 'Yes' : 'No';
};

const acquiredInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processNumericString(acquiredInput.trim()));