const obtainSourceMaterial = () => require("node:fs").readFileSync(0, "utf8");
const separatorPattern = /[\s,]+/;
const rawEntries = obtainSourceMaterial().split(separatorPattern);

const initialCounts = {
    firstCategory: 0,
    secondCategory: 0,
    thirdCategory: 0,
    fourthCategory: 0
};

const processEntryAndAccumulate = (accumulator, elementValue, positionIndex) => {
    if (positionIndex % 2 !== 0) {
        console.log(positionIndex, elementValue);

        switch (elementValue) {
            case 'A':
                accumulator.firstCategory++;
                break;
            case 'B':
                accumulator.secondCategory++;
                break;
            case 'O':
                accumulator.thirdCategory++;
                break;
            default:
                accumulator.fourthCategory++;
                break;
        }
    }
    return accumulator;
};

const finalTallies = rawEntries.reduce(processEntryAndAccumulate, initialCounts);

const lineBreak = '\n';
console.log(
    finalTallies.firstCategory + lineBreak +
    finalTallies.secondCategory + lineBreak +
    finalTallies.fourthCategory + lineBreak +
    finalTallies.thirdCategory
);