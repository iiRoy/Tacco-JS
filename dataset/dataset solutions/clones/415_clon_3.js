let ans;

const calculateNewColor = (charA, charB) => {
    const numericA = +charA;
    const numericB = +charB;
    return 3 - numericA - numericB;
};

function findMinTransformations(initialStateString){
    const visitedStates = {};
    const transformationQueue = [[initialStateString, 0]];
    visitedStates[initialStateString] = true;

    const targetStatePattern = /^0+$|^1+$|^2+$/;

    while (transformationQueue.length > 0) {
        const [currentState, currentSteps] = transformationQueue.shift();

        if (targetStatePattern.test(currentState)) {
            ans = currentSteps;
            return;
        }

        for (let i = 0; i < currentState.length - 1; i++) {
            if (currentState[i] === currentState[i+1]) {
                continue;
            }

            const tempCharArray = currentState.split("");
            const newColor = calculateNewColor(tempCharArray[i], tempCharArray[i+1]);

            tempCharArray[i] = newColor;
            tempCharArray[i+1] = newColor;

            const nextStateString = tempCharArray.join("");

            if (!visitedStates.hasOwnProperty(nextStateString)) {
                visitedStates[nextStateString] = true;
                transformationQueue.push([nextStateString, currentSteps + 1]);
            }
        }
    }

    ans = "NA";
}

const processInputLine = (lineContent) => {
    const numericString = lineContent
        .replace(/r/g, "0")
        .replace(/g/g, "1")
        .replace(/b/g, "2");
    
    findMinTransformations(numericString);
    
    console.log(ans);
};

const fs = require('fs');
const rawFileContent = fs.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawFileContent.trim().split("\n");

while (true) {
    const currentLine = processedInputLines.shift();
    if (currentLine === "0") {
        break;
    }
    processInputLine(currentLine);
}
