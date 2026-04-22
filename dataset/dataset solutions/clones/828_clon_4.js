const fsModule = require('node:fs');
const sourceData = fsModule.readFileSync('/dev/stdin', 'utf8');

function processStreamSegments(fullContent) {
    let pointerPosition = 0;

    function retrieveNextLine() {
        const newlineIndex = fullContent.indexOf('\n', pointerPosition);
        if (newlineIndex === -1) {
            if (pointerPosition < fullContent.length) {
                const finalSegment = fullContent.substring(pointerPosition).trim();
                pointerPosition = fullContent.length;
                return finalSegment;
            }
            return null;
        }
        const currentSegment = fullContent.substring(pointerPosition, newlineIndex).trim();
        pointerPosition = newlineIndex + 1;
        return currentSegment;
    }

    let blockHeader;
    while ((blockHeader = retrieveNextLine()) !== null) {
        const itemsInBlock = parseInt(blockHeader, 10);
        if (itemsInBlock === 0) {
            break;
        }

        const blockResultCollection = [];
        for (let j = 0; j < itemsInBlock; ++j) {
            const currentLineContent = retrieveNextLine();
            if (currentLineContent === null) {
                break;
            }
            const dataFields = currentLineContent.split(' ');
            const primaryIdentifier = dataFields.shift();
            const numericFieldValues = dataFields.map(val => parseFloat(val));

            const calculationParameters = {
                id: primaryIdentifier,
                paramP: numericFieldValues[0],
                paramA: numericFieldValues[1],
                paramB: numericFieldValues[2],
                paramC: numericFieldValues[3],
                paramD: numericFieldValues[4],
                paramE: numericFieldValues[5],
                paramF: numericFieldValues[6],
                paramS: numericFieldValues[7],
                paramM: numericFieldValues[8]
            };
            const calculatedYield = calculatePerformanceMetric(calculationParameters);
            blockResultCollection.push([calculatedYield.identifier, calculatedYield.metricValue]);
        }

        blockResultCollection.sort((unitA, unitB) => {
            const metricDifference = unitB[1] - unitA[1];
            if (metricDifference === 0) {
                return unitA[0].localeCompare(unitB[0]);
            }
            return metricDifference;
        });

        for (const element of blockResultCollection) {
            console.log(element[0]);
        }
        console.log("##");
    }
}

function calculatePerformanceMetric({ id, paramP, paramA, paramB, paramC, paramD, paramE, paramF, paramS, paramM }) {
    const timeComponentSum = paramA + paramB + paramC + ((paramD + paramE) * paramM);
    const monetaryComponentDifference = (paramF * paramS * paramM) - paramP;
    return { identifier: id, metricValue: monetaryComponentDifference / timeComponentSum };
}

processStreamSegments(sourceData);