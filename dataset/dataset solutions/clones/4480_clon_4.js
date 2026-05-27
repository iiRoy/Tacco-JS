function processInput(inputString) {
    const lineSegments = inputString.split("\n");
 
    const firstLineElements = lineSegments[0].split(" ");
    const elementQuantity = Number(firstLineElements[0]);
 
    const numericalSequence = lineSegments[1].split(" ").map(Number);
    
    const totalSequenceSum = numericalSequence.reduce((accumulated, currentVal) => accumulated + currentVal, 0);
 
    let minimumAbsoluteDifference = Infinity;
    let currentLeftPartitionSum = 0;
 
    for (let divisionPoint = 0; divisionPoint < elementQuantity - 1; divisionPoint++) {
        currentLeftPartitionSum += numericalSequence[divisionPoint];
        const currentRightPartitionSum = totalSequenceSum - currentLeftPartitionSum;
 
        const currentDifference = Math.abs(currentLeftPartitionSum - currentRightPartitionSum);
 
        if (currentDifference < minimumAbsoluteDifference) {
            minimumAbsoluteDifference = currentDifference;
        }
    }
    
    console.log(minimumAbsoluteDifference);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
