const dataStream = require("fs").readFileSync(0, "utf8");
const contentLines = dataStream.split("\n");
const headerParts = contentLines[0].split(" ");
const initialValue = +headerParts[0];
const activityCount = +headerParts[1];

const activityCollection = contentLines.slice(1, 1 + activityCount).reduce((accumulatorList, currentEntry) => {
    const [startPoint, endPoint] = currentEntry.split(" ").map(Number);
    accumulatorList.push({ startPointValue: startPoint, endPointValue: endPoint });
    return accumulatorList;
}, []);

activityCollection.sort((firstItem, secondItem) => firstItem.endPointValue - secondItem.endPointValue);

const selectionProcessResult = activityCollection.reduce((stateAccumulator, currentActivityRecord) => {
    const { lastSelectedFinish, totalSelections } = stateAccumulator;
    if (lastSelectedFinish <= currentActivityRecord.startPointValue) {
        return {
            lastSelectedFinish: currentActivityRecord.endPointValue,
            totalSelections: totalSelections + 1
        };
    }
    return stateAccumulator;
}, { lastSelectedFinish: -1, totalSelections: 0 });

console.log(selectionProcessResult.totalSelections);
