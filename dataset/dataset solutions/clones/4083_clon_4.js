const acquireInputProcessor = (sourceContent) => {
    const contentFragments = sourceContent.trim().split('\n');
    let currentFragmentPosition = 0;

    const streamHandler = {
        grabLeadingNumber: () => {
            if (currentFragmentPosition >= contentFragments.length) {
                throw new Error("Insufficient data for leading number.");
            }
            const firstNumericToken = contentFragments[currentFragmentPosition].split(' ')[0];
            currentFragmentPosition++;
            return Number(firstNumericToken);
        },

        extractNumericGrid: (rowCount) => {
            if (currentFragmentPosition + rowCount > contentFragments.length) {
                throw new Error("Insufficient data for numeric grid.");
            }
            const extractedGrid = contentFragments
                                    .slice(currentFragmentPosition, currentFragmentPosition + rowCount)
                                    .map(lineText => lineText.split(' ').map(Number));
            currentFragmentPosition += rowCount;
            return extractedGrid;
        }
    };
    return streamHandler;
};

const processInput = acquireInputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

const determineFeasibility = () => {
    const instructionCount = processInput.grabLeadingNumber();
    const movementPlan = processInput.extractNumericGrid(instructionCount);

    const initialStatus = { viable: true, timeElapsed: 0, currentXCoordinate: 0, currentYCoordinate: 0 };

    const finalStatus = movementPlan.reduce((previousStatus, currentInstruction) => {
        if (!previousStatus.viable) {
            return previousStatus;
        }

        const targetTime = currentInstruction[0];
        const targetX = currentInstruction[1];
        const targetY = currentInstruction[2];

        const timeDifference = targetTime - previousStatus.timeElapsed;
        const coordinateDistance = Math.abs(previousStatus.currentXCoordinate - targetX) + Math.abs(previousStatus.currentYCoordinate - targetY);

        if (coordinateDistance > timeDifference || (coordinateDistance % 2 !== timeDifference % 2)) {
            return { viable: false, timeElapsed: 0, currentXCoordinate: 0, currentYCoordinate: 0 };
        }

        return { viable: true, timeElapsed: targetTime, currentXCoordinate: targetX, currentYCoordinate: targetY };
    }, initialStatus);

    return finalStatus.viable ? "Yes" : "No";
};

console.log(determineFeasibility());