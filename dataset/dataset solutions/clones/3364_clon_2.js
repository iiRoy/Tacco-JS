const inputBuffer = [];
let auxiliaryVariable;

const inputProcessor = require("readline");
const interfaceHandle = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandle.on(
    "line",
    function (currentTextLine) {
        inputBuffer.push(currentTextLine);
    }
);

interfaceHandle.on(
    "close",
    function () {
        const initialParameters = inputBuffer.shift().split(" ");
        const totalSpan = Number(initialParameters[0]);
        const elementCount = Number(initialParameters[1]);


        const sortedPositions = Array(elementCount);
        for (let indexVal = 0; indexVal < elementCount; indexVal++) {
            sortedPositions[indexVal] = Number(inputBuffer[indexVal]);
        }
        sortedPositions.sort(function (valA, valB) {
            return (valA - valB);
        });


        let rightPointer = 0;
        let leftPointer = elementCount - 1;
        let distanceLeft = totalSpan - sortedPositions[leftPointer];
        let distanceRight = sortedPositions[rightPointer];
        let scoreIfStartingLeft = 0;

        // Commence calculations, assuming an initial move towards the left boundary
        for (let iterationCount = 0; iterationCount < elementCount; iterationCount++) {
            // Scenario: The current optimal move is towards the left
            if (distanceRight <= distanceLeft || iterationCount === 0) {
                scoreIfStartingLeft += distanceLeft;
                distanceRight += distanceLeft;
                distanceLeft = sortedPositions[leftPointer] - sortedPositions[leftPointer - 1];
                leftPointer--;
            }

            // Scenario: The current optimal move is towards the right
            else {
                scoreIfStartingLeft += distanceRight;
                distanceLeft += distanceRight;
                distanceRight = sortedPositions[rightPointer + 1] - sortedPositions[rightPointer];
                rightPointer++;
            }
        }


        rightPointer = 0;
        leftPointer = elementCount - 1;
        distanceLeft = totalSpan - sortedPositions[leftPointer];
        distanceRight = sortedPositions[rightPointer];
        let scoreIfStartingRight = 0;

        // Commence calculations, assuming an initial move towards the right boundary
        for (let iterationCount = 0; iterationCount < elementCount; iterationCount++) {
            // Scenario: The current optimal move is towards the right
            if (distanceLeft <= distanceRight || iterationCount === 0) {
                scoreIfStartingRight += distanceRight;
                distanceLeft += distanceRight;
                distanceRight = sortedPositions[rightPointer + 1] - sortedPositions[rightPointer];
                rightPointer++;
            }

            // Scenario: The current optimal move is towards the left
            else {
                scoreIfStartingRight += distanceLeft;
                distanceRight += distanceLeft;
                distanceLeft = sortedPositions[leftPointer] - sortedPositions[leftPointer - 1];
                leftPointer--;
            }
        }
        console.log(Math.max(scoreIfStartingLeft, scoreIfStartingRight));
    }
);