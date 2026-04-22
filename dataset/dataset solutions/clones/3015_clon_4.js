function ProcessData(rawData) {
    const dataLines = rawData.trim().split('\n');
    const numberTokens = dataLines[1].split(' ');
    
    const numericalValues = numberTokens.map(val => Number(val));

    const allMagnitudes = numericalValues.map(num => num < 0 ? -num : num);
    
    const countNegativeElements = numericalValues.filter(num => num < 0).length;
    
    const containsZeroElement = numericalValues.some(num => num === 0);
    
    const totalMagnitudeSum = allMagnitudes.reduce((accumulator, current) => accumulator + current, 0);
    
    const smallestAbsoluteValue = allMagnitudes.length > 0 ? Math.min(...allMagnitudes) : 0; 

    let finalCalculation;
    if (containsZeroElement || (countNegativeElements % 2 === 0)) {
        finalCalculation = totalMagnitudeSum;
    } else {
        finalCalculation = totalMagnitudeSum - (2 * smallestAbsoluteValue);
    }
    
    console.log(finalCalculation);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));