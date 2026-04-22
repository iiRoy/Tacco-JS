const retrieveSourceData = (sourceText) => {
    const lines = sourceText.trim().split('\n');
    let lineCursor = 0;
    const allConfigurations = [];

    while (true) {
        const dimensions = lines[lineCursor++].split(' ').map(Number);
        const dimensionH = dimensions[0];
        const dimensionW = dimensions[1];

        if (dimensionH === 0 && dimensionW === 0) {
            break;
        }

        const currentGrid = [];
        for (let r = 0; r < dimensionH; r++) {
            currentGrid.push(lines[lineCursor++].split(''));
        }
        allConfigurations.push({ verticalExtent: dimensionH, horizontalExtent: dimensionW, symbolMatrix: currentGrid });
    }
    return allConfigurations;
};

const buildContiguousHeights = (initialMatrix) => {
    const rowsCount = initialMatrix.length;
    const colsCount = initialMatrix[0].length;
    const depthMap = Array.from({ length: rowsCount }, () => Array(colsCount).fill(0));

    for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
            if (initialMatrix[r][c] === '.') {
                depthMap[r][c] = (r === 0) ? 1 : depthMap[r - 1][c] + 1;
            } else {
                depthMap[r][c] = 0;
            }
        }
    }
    return depthMap;
};

const computeLargestRectangle = (elevationProfile) => {
    const profileLength = elevationProfile.length;
    let maximumExtent = 0;

    const findLeftBoundary = (bars) => {
        const boundaryIndices = Array(profileLength).fill(-1);
        const processingStack = [];
        for (let idx = 0; idx < profileLength; idx++) {
            while (processingStack.length > 0 && bars[processingStack[processingStack.length - 1]] >= bars[idx]) {
                processingStack.pop();
            }
            if (processingStack.length > 0) {
                boundaryIndices[idx] = processingStack[processingStack.length - 1];
            }
            processingStack.push(idx);
        }
        return boundaryIndices;
    };

    const findRightBoundary = (bars) => {
        const boundaryIndices = Array(profileLength).fill(profileLength);
        const processingStack = [];
        for (let idx = profileLength - 1; idx >= 0; idx--) {
            while (processingStack.length > 0 && bars[processingStack[processingStack.length - 1]] >= bars[idx]) {
                processingStack.pop();
            }
            if (processingStack.length > 0) {
                boundaryIndices[idx] = processingStack[processingStack.length - 1];
            }
            processingStack.push(idx);
        }
        return boundaryIndices;
    };

    const leftLimits = findLeftBoundary(elevationProfile);
    const rightLimits = findRightBoundary(elevationProfile);

    for (let idx = 0; idx < profileLength; idx++) {
        const currentHeight = elevationProfile[idx];
        const currentWidth = rightLimits[idx] - leftLimits[idx] - 1;
        maximumExtent = Math.max(maximumExtent, currentHeight * currentWidth);
    }
    return maximumExtent;
};

const executeProcessing = (rawInputContent) => {
    const configurations = retrieveSourceData(rawInputContent);
    const resultOutputs = [];

    for (const config of configurations) {
        const heightData = buildContiguousHeights(config.symbolMatrix);
        let currentMaxArea = 0;
        for (let r = 0; r < config.verticalExtent; r++) {
            currentMaxArea = Math.max(currentMaxArea, computeLargestRectangle(heightData[r]));
        }
        resultOutputs.push(currentMaxArea);
    }
    return resultOutputs;
};

const sourceData = `2 4
...*
.*..
0 0`; // Using the provided example string directly

const finalOutcomes = executeProcessing(sourceData);
finalOutcomes.forEach(res => console.log(res));