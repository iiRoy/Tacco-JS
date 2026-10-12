const parseNumericArray = (lineString) => lineString.split(" ").map(Number);

const calculateArraySum = (numericArray) => numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const itemCount = parseInt(inputLines[0], 10);
    const arrayA = parseNumericArray(inputLines[1]);
    const arrayB = parseNumericArray(inputLines[2]);
    
    const sumA = calculateArraySum(arrayA);
    const sumB = calculateArraySum(arrayB);
    
    let requiredAdjustments = 0;
    
    for (let idx = 0; idx < itemCount; idx++) {
        const currentDifference = arrayB[idx] - arrayA[idx];
        const positiveDifference = Math.max(currentDifference, 0);
        
        const adjustmentForPair = Math.ceil(positiveDifference / 2);
        requiredAdjustments += adjustmentForPair;
    }
    
    const canAchieveBalance = requiredAdjustments <= (sumB - sumA);
    
    console.log(canAchieveBalance ? "Yes" : "No");
}

const readStandardInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

processInputData(readStandardInput());
