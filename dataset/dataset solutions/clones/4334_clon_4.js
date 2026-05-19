const inputSourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const createInputProcessor = (sourceLines) => {
    let currentLineIndex = 0;
    const totalLineCount = sourceLines.length;

    return {
        retrieveNext: function() {
            if (currentLineIndex >= totalLineCount) {
                throw "NoSuchElementException:次に要素は無いよ";
            }
            return sourceLines[currentLineIndex++];
        },
        checkAvailability: function() {
            return currentLineIndex < totalLineCount;
        }
    };
};

const lineProcessor = createInputProcessor(inputSourceData);

function getNextInput() { return lineProcessor.retrieveNext(); }
function hasMoreInput() { return lineProcessor.checkAvailability(); }

function emitResult(content) { console.log(content); }
function reportError(content) { console.error(content); }

const conversionDispatch = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join("")
};

function applyDataConversion(valueToProcess, conversionKey) {
    try {
        const handler = conversionDispatch[conversionKey];
        return handler ? handler(valueToProcess) : valueToProcess;
    } catch (e) {
        return valueToProcess;
    }
}

function executeMainLogic() {
    const initialValues = applyDataConversion(getNextInput(), 4);
    const [dimensionN, dimensionM, targetValueK] = initialValues;

    if (targetValueK % dimensionM === 0 || targetValueK % dimensionN === 0) {
        emitResult("Yes");
        return;
    }

    const conditionMet = Array.from({ length: dimensionN }, (_, iIndex) => iIndex + 1)
        .flatMap(currentI =>
            Array.from({ length: dimensionM }, (_, jIndex) => jIndex + 1)
                .map(currentJ => ({ iCoord: currentI, jCoord: currentJ }))
        )
        .some(({ iCoord, jCoord }) => {
            const computedSum = (dimensionM * iCoord) + (dimensionN * jCoord) - 2 * (iCoord * jCoord);
            return computedSum === targetValueK;
        });

    emitResult(conditionMet ? "Yes" : "No");
}

executeMainLogic();
