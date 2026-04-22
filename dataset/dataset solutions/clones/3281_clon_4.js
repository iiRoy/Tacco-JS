const buildReader = (textData) => {
    let allInputLines = textData.trim().split('\n');
    let currentLinePointer = 0;
    let activeLineTokens = [];

    const obtainNextLineTokens = () => {
        if (currentLinePointer < allInputLines.length) {
            activeLineTokens = allInputLines[currentLinePointer].split(' ');
            currentLinePointer++;
        } else {
            activeLineTokens = [];
        }
    };

    const fetchSingle = (asStringOutput) => {
        if (activeLineTokens.length === 0) {
            obtainNextLineTokens();
        }
        if (activeLineTokens.length === 0) {
            return asStringOutput ? '' : NaN;
        }
        const extractedValue = activeLineTokens.shift();
        return asStringOutput ? extractedValue : Number(extractedValue);
    };

    const fetchLine = (asStringOutput) => {
        activeLineTokens = []; 
        if (currentLinePointer >= allInputLines.length) {
            return [];
        }
        obtainNextLineTokens();
        const tokensCopy = [...activeLineTokens];
        activeLineTokens = [];
        return asStringOutput ? tokensCopy : tokensCopy.map(Number);
    };

    const fetchMatrix = (numRows, asStringOutput) => {
        const matrixResult = [];
        activeLineTokens = []; 
        for (let i = 0; i < numRows; i++) {
            if (currentLinePointer >= allInputLines.length) break;
            obtainNextLineTokens();
            const rowTokens = [...activeLineTokens];
            matrixResult.push(asStringOutput ? rowTokens : rowTokens.map(Number));
        }
        activeLineTokens = []; 
        return matrixResult;
    };

    const fetchRows = (numRows, asStringOutput) => {
        const rowResult = [];
        activeLineTokens = []; 
        for (let i = 0; i < numRows; i++) {
            if (currentLinePointer >= allInputLines.length) break;
            obtainNextLineTokens();
            const rowValue = activeLineTokens[0];
            rowResult.push(asStringOutput ? rowValue : Number(rowValue));
        }
        activeLineTokens = []; 
        return rowResult;
    };

    return {
        fetchSingle,
        fetchLine,
        fetchMatrix,
        fetchRows
    };
};

const processData = (inputAccess) => {
    const totalElements = inputAccess.fetchSingle();
    const limitOne = inputAccess.fetchSingle();
    const limitTwo = inputAccess.fetchSingle();
    const elementCollection = inputAccess.fetchLine();

    const categoryCounts = elementCollection.reduce((tally, currentElement) => {
        if (currentElement <= limitOne) {
            tally.firstGroup++;
        } else if (currentElement > limitTwo) {
            tally.secondGroup++;
        }
        return tally;
    }, { firstGroup: 0, secondGroup: 0 });

    const thirdGroupCount = totalElements - categoryCounts.firstGroup - categoryCounts.secondGroup;

    return Math.min(categoryCounts.firstGroup, categoryCounts.secondGroup, thirdGroupCount);
};

const systemInput = require("fs").readFileSync("/dev/stdin","utf8");
const dataAccessor = buildReader(systemInput);

console.log(processData(dataAccessor));