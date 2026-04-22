const systemIOManager = require("node:fs");
const inputSourceIdentifier = "/dev/stdin";
const textEncodingStandard = "utf8";

const storageContainer = {};
let currentElementCount = 0;

const dataManipulationInterface = {
    storeData: (dataValue) => {
        storageContainer["entry_" + currentElementCount] = dataValue;
        currentElementCount++;
    },
    retrieveData: () => {
        if (currentElementCount === 0) {
            return undefined;
        }
        currentElementCount--;
        const fetchedData = storageContainer["entry_" + currentElementCount];
        delete storageContainer["entry_" + currentElementCount];
        return fetchedData;
    }
};

const rawInputBuffer = systemIOManager.readFileSync(inputSourceIdentifier, textEncodingStandard);
const cleanedTextContent = rawInputBuffer.toString().replace(/[\r\n]+$/, '');
const inputLineSegments = cleanedTextContent.split('\n');

for (const currentSegment of inputLineSegments) {
    const numericalInterpretation = Number(currentSegment);

    if (numericalInterpretation !== 0) {
        dataManipulationInterface.storeData(currentSegment);
    } else {
        const itemForOutput = dataManipulationInterface.retrieveData();
        process.stdout.write((itemForOutput === undefined ? 'undefined' : itemForOutput) + '\n');
    }
}