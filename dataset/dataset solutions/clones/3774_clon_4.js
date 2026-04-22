'use strict'

function calculateMinimumDiscomfort(rawInputText) {
    const numericValues = rawInputText.split(/\s+/).filter(Boolean).map(Number);

    const gridSide = numericValues.shift();
    const colorOptions = numericValues.shift();

    const colorDistances = Array.from({ length: colorOptions }, (_, rowIndex) =>
        numericValues.splice(0, colorOptions)
    );

    const initialCellColors = Array.from({ length: gridSide }, (_, rowIndex) =>
        Array.from({ length: gridSide }, (_, colIndex) => numericValues[rowIndex * gridSide + colIndex] - 1)
    );

    const cellPartitions = { 0: [], 1: [], 2: [] };
    initialCellColors.forEach((row, rowIndex) => {
        row.forEach((cellColor, colIndex) => {
            cellPartitions[(rowIndex + colIndex) % 3].push(cellColor);
        });
    });

    const groupDiscomforts = Object.keys(cellPartitions).map(groupKey => {
        const currentGroup = cellPartitions[groupKey];
        return Array.from({ length: colorOptions }, (_, targetColorIndex) =>
            currentGroup.reduce((sum, originalColorIndex) =>
                sum + colorDistances[originalColorIndex][targetColorIndex], 0
            )
        );
    });

    let minimalOverallDiscomfort = Infinity;

    function findOptimalCombination(discomfortMatrix, availableColorCount, currentSection, selectedPalette, currentAccumulation) {
        if (currentSection === 3) {
            minimalOverallDiscomfort = Math.min(minimalOverallDiscomfort, currentAccumulation);
            return;
        }

        for (let potentialNewColor = 0; potentialNewColor < availableColorCount; potentialNewColor++) {
            if (!selectedPalette.has(potentialNewColor)) {
                selectedPalette.add(potentialNewColor);
                findOptimalCombination(
                    discomfortMatrix,
                    availableColorCount,
                    currentSection + 1,
                    selectedPalette,
                    currentAccumulation + discomfortMatrix[currentSection][potentialNewColor]
                );
                selectedPalette.delete(potentialNewColor);
            }
        }
    }

    findOptimalCombination(groupDiscomforts, colorOptions, 0, new Set(), 0);

    console.log(minimalOverallDiscomfort);
}

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
calculateMinimumDiscomfort(inputData);