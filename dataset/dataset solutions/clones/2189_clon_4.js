'use strict';
function Main(inputData) {
    const processedLines = inputData.split('\n');
    
    const firstLineElements = processedLines[0].split(' ');
    const secondLineElements = processedLines[1].split(' ');
    
    const comparisonTarget = Number(firstLineElements[0]);
    
    const accumulatedValue = secondLineElements.reduce((currentTotal, stringNumber) => {
        return currentTotal + Number(stringNumber);
    }, 0);
    
    const finalVerdict = (accumulatedValue >= comparisonTarget) ? "Yes" : "No";
    
    console.log(finalVerdict);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
