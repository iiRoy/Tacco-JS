const evaluateGridPath = (eventStream) => {
    const [settingsLine, startCoordLine, robotPathLine, obstaclePathLine] = eventStream.split('\n');
    const [gridRows, gridCols, totalOperations] = settingsLine.split(' ').map(Number);
    const [originRow, originCol] = startCoordLine.split(' ').map(Number);
    const robotSequence = robotPathLine.split('');
    const obstacleSequence = obstaclePathLine.split('');

    let dynamicState = {
        maxLeft: 0,
        maxRight: 0,
        maxUp: 0,
        maxDown: 0,
        trapCounterLeft: 0,
        trapCounterRight: 0,
        trapCounterUp: 0,
        trapCounterDown: 0
    };

    const robotMoveActions = {
        'L': (state) => { state.maxLeft++; },
        'R': (state) => { state.maxRight++; },
        'U': (state) => { state.maxUp++; },
        'D': (state) => { state.maxDown++; }
    };

    const trapMoveActions = {
        'R': (state) => {
            if (originCol + state.trapCounterRight + 1 <= gridCols) {
                state.maxLeft--;
                state.trapCounterRight++;
            }
        },
        'L': (state) => {
            if (originCol - state.trapCounterLeft - 1 > 0) {
                state.maxRight--;
                state.trapCounterLeft++;
            }
        },
        'U': (state) => {
            if (originRow - state.trapCounterUp - 1 > 0) {
                state.maxDown--;
                state.trapCounterUp++;
            }
        },
        'D': (state) => {
            if (originRow + state.trapCounterDown + 1 >= gridRows) {
                state.maxUp--;
                state.trapCounterDown++;
            }
        }
    };

    const finalOutcome = Array.from({ length: totalOperations }).every((_, stepIndex) => {
        const currentRobotAction = robotSequence[stepIndex];
        if (robotMoveActions[currentRobotAction]) {
            robotMoveActions[currentRobotAction](dynamicState);
        }

        if (originCol + dynamicState.maxRight > gridCols) return false;
        if (originCol - dynamicState.maxLeft <= 0) return false;
        if (originRow + dynamicState.maxDown > gridRows) return false;
        if (originRow - dynamicState.maxUp <= 0) return false;

        const currentTrapAction = obstacleSequence[stepIndex];
        if (trapMoveActions[currentTrapAction]) {
            trapMoveActions[currentTrapAction](dynamicState);
        }

        return true;
    });

    return finalOutcome ? "YES" : "NO";
};

const processInputAndOutput = (dataPayload) => {
    const resultString = evaluateGridPath(dataPayload);
    console.log(resultString);
    return resultString;
};

const systemFileHandler = require("fs");
const dataFromSystem = systemFileHandler.readFileSync("/dev/stdin", "utf8");
processInputAndOutput(dataFromSystem);