'use strict';

function processGridData(rawData) {
    const numericValues = rawData.split(/\s+/).map(Number);

    let currentParseIndex = 0;
    const gridDimension = numericValues[currentParseIndex++];
    const colorPaletteSize = numericValues[currentParseIndex++];

    const discomfortMatrix = Array.from({ length: colorPaletteSize }, () => {
        const rowSegment = numericValues.slice(currentParseIndex, currentParseIndex + colorPaletteSize);
        currentParseIndex += colorPaletteSize;
        return rowSegment;
    });

    const initialGridColors = Array.from({ length: gridDimension }, () => {
        const rowSegment = numericValues.slice(currentParseIndex, currentParseIndex + gridDimension).map(val => val - 1);
        currentParseIndex += gridDimension;
        return rowSegment;
    });

    const groupedCellColors = new Map();
    for (let i = 0; i < 3; i++) {
        groupedCellColors.set(i, []);
    }

    for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
        for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
            groupedCellColors.get((rowIndex + colIndex) % 3).push(initialGridColors[rowIndex][colIndex]);
        }
    }

    const groupTargetCosts = Array.from({ length: 3 }, () => Array(colorPaletteSize).fill(0));

    for (let groupIdentifier = 0; groupIdentifier < 3; groupIdentifier++) {
        const cellsInGroup = groupedCellColors.get(groupIdentifier);
        for (let targetColorOption = 0; targetColorOption < colorPaletteSize; targetColorOption++) {
            groupTargetCosts[groupIdentifier][targetColorOption] = cellsInGroup.reduce((accumulatedCost, originalCellColor) =>
                accumulatedCost + discomfortMatrix[originalCellColor][targetColorOption], 0
            );
        }
    }

    const topColorOptions = Array.from({ length: 3 }, (_, groupIdentifier) => {
        return Array.from({ length: colorPaletteSize }, (_, colorIndex) => ({
            costValue: groupTargetCosts[groupIdentifier][colorIndex],
            colorIdentifier: colorIndex
        }))
        .sort((a, b) => a.costValue - b.costValue)
        .slice(0, 3);
    });

    const potentialTotalCosts = topColorOptions[0].flatMap(optionA =>
        topColorOptions[1].flatMap(optionB =>
            topColorOptions[2].map(optionC => {
                const chosenColors = [optionA.colorIdentifier, optionB.colorIdentifier, optionC.colorIdentifier];
                if (new Set(chosenColors).size === 3) {
                    return optionA.costValue + optionB.costValue + optionC.costValue;
                }
                return Infinity;
            })
        )
    ).filter(cost => cost !== Infinity);

    const minimumDiscomfort = Math.min(...potentialTotalCosts);

    console.log(minimumDiscomfort);
}

const fileSystem = require('fs');
const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
processGridData(inputContent);
