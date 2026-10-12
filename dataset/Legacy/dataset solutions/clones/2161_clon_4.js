const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8").trim();
const inputLinesArray = rawInputContent.split("\n");

function createInputIterator(linesCollection) {
    let currentPosition = 0;
    const totalEntries = linesCollection.length;

    const retrieveNextEntry = () => {
        if (currentPosition >= totalEntries) {
            throw "NoSuchElementException:次に要素は無いよ";
        }
        return linesCollection[currentPosition++];
    };

    const checkAvailability = () => currentPosition < totalEntries;

    return { retrieveNextEntry, checkAvailability };
}

const inputSource = createInputIterator(inputLinesArray);

function fetchNextLine() { return inputSource.retrieveNextEntry(); }
function hasMoreLines() { return inputSource.checkAvailability(); }

function printResult(content) { console.log(content); }
function logIssue(errorContent) { console.error(errorContent); }

function processData(valueToProcess, conversionType) {
    const transformationOperations = {
        1: (val) => Number.parseInt(val),
        2: (val) => val.split(" "),
        4: (val) => val.split(" ").map(Number),
        6: (val) => val.split(""),
        7: (val) => val.split("").map(Number),
        8: (val) => val.join(" "),
        9: (val) => val.join("\n"),
        0: (val) => val.join("")
    };

    try {
        const selectedOperation = transformationOperations[conversionType];
        return selectedOperation ? selectedOperation(valueToProcess) : valueToProcess;
    } catch (error) {
        return valueToProcess;
    }
}

function executeCoreLogic() {
    const rawDigitString = fetchNextLine();
    const digitSequence = processData(rawDigitString, 7);

    const initialProcessingState = { currentTotal: 0, carryValue: 0 };

    const finalProcessingState = digitSequence.reduceRight((accumulator, currentDigit) => {
        let effectiveDigit = currentDigit + accumulator.carryValue;
        let digitContribution;
        let nextCarry;

        if (effectiveDigit >= 6) {
            digitContribution = 10 - effectiveDigit;
            nextCarry = 1;
        } else {
            digitContribution = effectiveDigit;
            nextCarry = 0;
        }

        return {
            currentTotal: accumulator.currentTotal + digitContribution,
            carryValue: nextCarry
        };
    }, initialProcessingState);

    const finalCalculatedSum = finalProcessingState.currentTotal + finalProcessingState.carryValue;

    printResult(finalCalculatedSum);
}

executeCoreLogic();
