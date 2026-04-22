"use strict";

const obtainInputSource = (textData) => {
    let entireInputLines = textData.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokens = [];

    const extractSingleNumeric = (returnAsString = false) => {
        if (currentLineTokens.length === 0) {
            if (currentLineIndex >= entireInputLines.length) {
                return undefined;
            }
            currentLineTokens = entireInputLines[currentLineIndex++].split(' ').reverse();
        }
        const tokenValue = currentLineTokens.pop();
        return returnAsString ? tokenValue : Number(tokenValue);
    };

    const extractFullLine = (returnAsStrings = false) => {
        if (currentLineIndex >= entireInputLines.length) {
            return [];
        }
        const lineContent = entireInputLines[currentLineIndex++].split(' ');
        return returnAsStrings ? lineContent : lineContent.map(Number);
    };

    const extractGridData = (linesCount, returnAsStrings = false) => {
        const dataGrid = [];
        for (let i = 0; i < linesCount; i++) {
            if (currentLineIndex >= entireInputLines.length) {
                break;
            }
            const lineContent = entireInputLines[currentLineIndex++].split(' ');
            dataGrid.push(returnAsStrings ? lineContent : lineContent.map(Number));
        }
        return dataGrid;
    };

    const extractValueList = (linesCount, returnAsStrings = false) => {
        const valueList = [];
        for (let i = 0; i < linesCount; i++) {
            if (currentLineIndex >= entireInputLines.length) {
                break;
            }
            const lineContent = entireInputLines[currentLineIndex++];
            valueList.push(returnAsStrings ? lineContent : Number(lineContent));
        }
        return valueList;
    };

    return {
        grabNumeric: extractSingleNumeric,
        grabLineContents: extractFullLine,
        grabDataGrid: extractGridData,
        grabValueList: extractValueList,
    };
};

const inputSource = obtainInputSource(require("node:fs").readFileSync("/dev/stdin","utf8"));

const computeGridPathMin = () => {
    const totalRows = inputSource.grabNumeric();
    const totalColumns = inputSource.grabNumeric();

    const primaryGrid = inputSource.grabDataGrid(totalRows);
    const secondaryGrid = inputSource.grabDataGrid(totalRows);

    const differenceValues = primaryGrid.map((row, rIndex) =>
        row.map((value, cIndex) => value - secondaryGrid[rIndex][cIndex])
    );

    const pathValueCache = new Map();

    const deriveCellPathSums = (r, c) => {
        const coordinateKey = `${r},${c}`;
        if (pathValueCache.has(coordinateKey)) {
            return pathValueCache.get(coordinateKey);
        }

        const currentCellDelta = differenceValues[r][c];
        let currentCellAccumulations = new Set();

        if (r === 0 && c === 0) {
            currentCellAccumulations.add(Math.abs(currentCellDelta));
        } else {
            if (r > 0) {
                const sumsFromAbove = deriveCellPathSums(r - 1, c);
                for (const priorSum of sumsFromAbove) {
                    currentCellAccumulations.add(Math.abs(priorSum + currentCellDelta));
                    currentCellAccumulations.add(Math.abs(priorSum - currentCellDelta));
                }
            }
            if (c > 0) {
                const sumsFromLeft = deriveCellPathSums(r, c - 1);
                for (const priorSum of sumsFromLeft) {
                    currentCellAccumulations.add(Math.abs(priorSum + currentCellDelta));
                    currentCellAccumulations.add(Math.abs(priorSum - currentCellDelta));
                }
            }
        }

        pathValueCache.set(coordinateKey, currentCellAccumulations);
        return currentCellAccumulations;
    };

    const finalCellSums = deriveCellPathSums(totalRows - 1, totalColumns - 1);

    let minimumOverallResult = Infinity;
    for (const value of finalCellSums) {
        if (value < minimumOverallResult) {
            minimumOverallResult = value;
        }
    }
    return minimumOverallResult;
};

console.log(computeGridPathMin());