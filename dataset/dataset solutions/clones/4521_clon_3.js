function processAndCheck (inputStringData) {
    let stringParts = inputStringData.split(" ");

    const getNumericValue = (partsArray) => {
        let combinedString = partsArray.join();
        return parseInt(combinedString);
    };

    const checkDivisibility = (numberToCheck, divisor) => {
        return numberToCheck % divisor === 0;
    };

    let numericValueFromInput = getNumericValue(stringParts);
    const targetDivisor = 4;
    let isResultDivisible = checkDivisibility(numericValueFromInput, targetDivisor);
    
    let finalOutputMessage;
    if (isResultDivisible) {
        finalOutputMessage = "YES\n";
    } else {
        finalOutputMessage = "NO\n";
    }
    
    console.log(finalOutputMessage);
}
 
processAndCheck(require('fs').readFileSync('/dev/stdin', 'utf8'));
