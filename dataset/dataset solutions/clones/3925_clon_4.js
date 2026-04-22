function processData(rawDataInput) {
    const dataLines = rawDataInput.trim().split('\n');
    let currentLinePointer = 0;

    const fetchInteger = () => parseInt(dataLines[currentLinePointer++], 10);
    const fetchMatrix = (rowQuantity) => {
        const matrixContent = [];
        for (let r = 0; r < rowQuantity; ++r) {
            matrixContent.push(dataLines[currentLinePointer++].split(' ').map(val => parseInt(val, 10)));
        }
        return matrixContent;
    };

    const totalRows = fetchInteger();
    const valueMatrix = fetchMatrix(totalRows);

    let sumOfFirstElements = 0;
    let smallestSecondFromGreaterFirst = Number.MAX_SAFE_INTEGER;
    let allElementsPaired = true;
    let anyFirstElementGreater = false;

    for (let currentIdx = 0; currentIdx < totalRows; ++currentIdx) {
        const currentEntry = valueMatrix[currentIdx];
        const valAlpha = currentEntry[0];
        const valBeta = currentEntry[1];

        sumOfFirstElements += valAlpha;

        if (valAlpha !== valBeta) {
            allElementsPaired = false;
        }

        if (valAlpha > valBeta) {
            anyFirstElementGreater = true;
            if (valBeta < smallestSecondFromGreaterFirst) {
                smallestSecondFromGreaterFirst = valBeta;
            }
        }
    }

    if (allElementsPaired) {
        return 0;
    }

    const finalMinimumConsideration = anyFirstElementGreater ? smallestSecondFromGreaterFirst : 0;

    return sumOfFirstElements - finalMinimumConsideration;
}

const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const computedOutcome = processData(inputContent);
console.log(computedOutcome);