process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
inputHandler.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});
inputHandler.on('close', () => {
    const [limitN, limitA, limitB] = inputBuffer[0].split(" ").map(val => Number(val));
    const charSequence = inputBuffer[1].split("");

    const initialProcessingState = {
        totalAcceptedCount: 0,
        bAcceptedCount: 0,
        outcomeList: []
    };

    const processItem = (accumulator, currentItem) => {
        let nextTotalAcceptedCount = accumulator.totalAcceptedCount;
        let nextBAcceptedCount = accumulator.bAcceptedCount;
        let decisionResult = "No";

        const canAcceptOverall = accumulator.totalAcceptedCount < limitA + limitB;

        if (canAcceptOverall) {
            if (currentItem === "a") {
                nextTotalAcceptedCount++;
                decisionResult = "Yes";
            } else if (currentItem === "b") {
                const canAcceptSpecificB = accumulator.bAcceptedCount < limitB;
                if (canAcceptSpecificB) {
                    nextTotalAcceptedCount++;
                    nextBAcceptedCount++;
                    decisionResult = "Yes";
                }
            }
        }

        return {
            totalAcceptedCount: nextTotalAcceptedCount,
            bAcceptedCount: nextBAcceptedCount,
            outcomeList: [...accumulator.outcomeList, decisionResult]
        };
    };

    const finalProcessingState = charSequence.reduce(processItem, initialProcessingState);
    console.log(finalProcessingState.outcomeList.join("\n"));
});
