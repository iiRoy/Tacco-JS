function processInputData(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineSegments = inputLines[0].split(" ");
    const secondLineSegments = inputLines[1].split(" ");

    const countLimit = Number(firstLineSegments[1]);
    const numberValues = secondLineSegments.map(strElement => Number(strElement));

    numberValues.sort(numericAscendingComparator);

    const valuesToSum = numberValues.slice(0, countLimit);
    const finalSum = valuesToSum.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    
    console.log(finalSum);
}   

function numericAscendingComparator(firstVal, secondVal) {
    return firstVal - secondVal;
}
 
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
