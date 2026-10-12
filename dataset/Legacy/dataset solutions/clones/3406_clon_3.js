function processInputData(rawInputString) {
    const lines = rawInputString.split('\n');
    const parseRadix = 10;
    let numericValues = lines.map(lineContent => parseInt(lineContent, parseRadix));

    const initialCountValue = numericValues[0];
    numericValues.shift();

    const currentMaxValue = Math.max(...numericValues);
    const maxElementIndex = numericValues.indexOf(currentMaxValue);

    numericValues[maxElementIndex] /= 2;
    
    const totalSum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    console.log(totalSum);
}
 
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
