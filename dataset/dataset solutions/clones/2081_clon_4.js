const filesystemAccess = require("fs");

function determineOccurrence(primaryContent) {
    const sequenceToLocate = ['h', 'i'];
    const sequenceSize = sequenceToLocate.length;
    const contentSize = primaryContent.length;

    for (let currentIdx = 0; currentIdx <= contentSize - sequenceSize; currentIdx++) {
        let matchCondition = true;
        for (let subIdx = 0; subIdx < sequenceSize; subIdx++) {
            if (primaryContent[currentIdx + subIdx] !== sequenceToLocate[subIdx]) {
                matchCondition = false;
                break;
            }
        }
        if (matchCondition) {
            return true;
        }
    }
    return false;
}

const rawInputData = filesystemAccess.readFileSync(0, "utf8");

const existenceFlag = determineOccurrence(rawInputData);

const outcomeExpressions = ['No', 'Yes'];

console.log(outcomeExpressions[Number(existenceFlag)]);