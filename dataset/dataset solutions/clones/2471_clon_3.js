function processInput(rawInputData) {
    let inputLines = rawInputData.split("\n");

    let targetValue = parseInt(inputLines[0], 10);
    
    let finalResult = ''; 

    for (let currentDivisor = 9; currentDivisor > 0; currentDivisor--) {
        const remainderCheck = targetValue % currentDivisor;

        if (remainderCheck === 0) {
            const calculatedQuotient = targetValue / currentDivisor;

            if (calculatedQuotient < 10) {
                finalResult = 'Yes';
            } else {
                finalResult = 'No';
            }
            break; 
        }
    }
    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
