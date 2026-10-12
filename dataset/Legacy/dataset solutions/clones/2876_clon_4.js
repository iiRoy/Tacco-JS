var inputLines = [];
var lineReader = require('readline');

var interfaceReader = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceReader.on('line', function (x) {
    inputLines.push(x);
});

interfaceReader.on('close', function () {
    const numericParameters = inputLines[0].split(" ").map(Number);
    const pathSequence = inputLines[1];

    const playerAStart = numericParameters[1];
    const playerBStart = numericParameters[2];
    const playerAGoal = numericParameters[3];
    const playerBGoal = numericParameters[4];

    const doubleHashBlockageExists = Array.from({ length: pathSequence.length - 1 }, (_, currentIdx) => currentIdx)
        .some(currentIdx => {
            return pathSequence.substring(currentIdx, currentIdx + 2) === "##" &&
                   playerAStart <= currentIdx &&
                   currentIdx + 1 <= Math.max(playerAGoal, playerBGoal);
        });

    if (doubleHashBlockageExists) {
        console.log("No");
        return;
    }

    const tripleDotPassageFound = Array.from({ length: pathSequence.length - 2 }, (_, currentIdx) => currentIdx)
        .some(currentIdx => {
            return pathSequence.substring(currentIdx, currentIdx + 3) === "..." &&
                   playerBStart <= currentIdx + 1 &&
                   currentIdx + 1 <= playerBGoal;
        });

    const resolveOutcome = (isFinalConditionMet) => isFinalConditionMet ? "No" : "Yes";

    const finalCheckEvaluation = (playerBGoal < playerAGoal) &&
        [playerBStart - 2, playerBStart, playerBGoal - 2, playerBGoal].some(positionIndex =>
            pathSequence[positionIndex] === "#"
        ) &&
        !tripleDotPassageFound;

    console.log(resolveOutcome(finalCheckEvaluation));
});
