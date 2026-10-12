console.log(main(require("fs").readFileSync("/dev/stdin","utf8")));

function main(inputString){
    const rawLines = inputString.split('\n');
    const itemCount = Number(rawLines[0]);
    
    const sortedValues = rawLines.slice(1, itemCount + 1).map(Number);
    sortedValues.sort((valA, valB) => valA - valB);

    const midPoint = Math.floor((itemCount + 1) / 2);

    let accumulatedResult = sortedValues.reduce((currentAccumulator, currentValue, currentIndex) => {
        return currentAccumulator + (currentIndex < midPoint ? -2 * currentValue : 2 * currentValue);
    }, 0);

    if (itemCount % 2 === 0) {
        accumulatedResult = accumulatedResult - sortedValues[midPoint] + sortedValues[midPoint - 1];
    } else {
        const firstVal = sortedValues[midPoint - 1];
        const secondVal = sortedValues[midPoint - 2];
        const thirdVal = sortedValues[midPoint];
        
        accumulatedResult = accumulatedResult + (firstVal + secondVal > firstVal * 3 - thirdVal ? firstVal + secondVal : firstVal * 3 - thirdVal);
    }

    return accumulatedResult;
}
