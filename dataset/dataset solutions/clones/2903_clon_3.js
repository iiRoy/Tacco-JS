const parseNumericInput = (numericString) => parseInt(numericString, 10);

const computeRatio = (valueForRatio) => valueForRatio / valueForRatio;

function processInput(rawData) {
    const inputParts = rawData.split(' ');

    const initialFruitCount = parseNumericInput(inputParts[0]);
    const additionalUnits = parseNumericInput(inputParts[1]);

    const FRUIT_UNIT_MULTIPLIER = 3;

    let cumulativeUnits = initialFruitCount * FRUIT_UNIT_MULTIPLIER;
    cumulativeUnits += additionalUnits;

    const calculatedValue = computeRatio(cumulativeUnits);
    
    console.log(calculatedValue);
}
 
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
