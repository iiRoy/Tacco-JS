function processData(textualInput) {
    const cleansedLines = textualInput.trim().split('\n');
    const caseCount = Number(cleansedLines[0]);
    const inputSets = cleansedLines.slice(1, caseCount + 1); 

    const outcomes = inputSets.map(dataSet => {
        const numericValues = dataSet.split(' ').map(Number);
        return assessOrder(numericValues); 
    });

    return outcomes.join('\n');
}

function assessOrder(numbersArray) {
    const initialElement = numbersArray[0];
    const subsequentElements = numbersArray.slice(1);

    const filteredElements = subsequentElements.filter(element => element <= initialElement);

    let priorValue = -Infinity;
    const allAscending = filteredElements.every(currentValue => {
        if (currentValue > priorValue) {
            priorValue = currentValue;
            return true;
        }
        return false;
    });

    return allAscending ? 'YES' : 'NO';
}

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalOutput = processData(inputSource);
console.log(finalOutput);