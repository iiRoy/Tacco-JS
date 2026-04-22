const moduleLoader = require;

const diskUtilities = moduleLoader('fs');
const obtainFileContent = diskUtilities.readFileSync;

const stripEnds = String.prototype.trim;
const separateBy = String.prototype.split;

const takeFirst = Array.prototype.shift;
const processElements = Array.prototype.map;
const getArrayCount = (arr) => arr.length;

const stringToInteger = parseInt;

const systemOutput = console;
const printMessage = systemOutput.log;

const initialContent = obtainFileContent('/dev/stdin', 'utf8').stripEnds();

const dataLines = stripEnds.call(initialContent).separateBy("\n");

while (getArrayCount(dataLines) > 1) {
    const [limitValue, targetQuantity] = processElements.call(
        separateBy.call(
            stripEnds.call(
                takeFirst.call(dataLines)
            ),
            " "
        ),
        stringToInteger
    );

    let currentSpot = 0,
        budgetRemaining = targetQuantity,
        stateTracker = [];

    while (stateTracker[currentSpot] !== targetQuantity) {
        if (budgetRemaining > 0) {
            stateTracker[currentSpot] = (stateTracker[currentSpot] || 0) + 1;
            budgetRemaining--;
        } else {
            budgetRemaining = stateTracker[currentSpot];
            stateTracker[currentSpot] = 0;
        }
        currentSpot = (currentSpot + 1) % limitValue;
    }
    printMessage.call(systemOutput, currentSpot);
}