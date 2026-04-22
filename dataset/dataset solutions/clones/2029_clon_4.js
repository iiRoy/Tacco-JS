"use strict";

function extractNumericalParameters(sourceData) {
    const rawValues = sourceData[0].split(" ").map(Number);
    return {
        countOfElements: rawValues[0],
        portalA: rawValues[1],
        portalB: rawValues[2]
    };
}

function coordinateProcessor(dataLines) {
    const { countOfElements, portalA, portalB } = extractNumericalParameters(dataLines);

    const elementIdentifiers = Array.from({ length: countOfElements }, (_, idx) => idx + 1);

    const allPathLengths = elementIdentifiers.flatMap(node1 =>
        elementIdentifiers
            .filter(node2 => node2 > node1)
            .map(node2 => {
                const directPath = Math.abs(node2 - node1);
                const portalPath = Math.abs(portalA - node1) + Math.abs(portalB - node2) + 1;
                return Math.min(directPath, portalPath);
            })
    );

    const pathLengthFrequencies = allPathLengths.reduce((accumulator, currentLength) => {
        accumulator.set(currentLength, (accumulator.get(currentLength) || 0) + 1);
        return accumulator;
    }, new Map());

    const statisticalResults = Array.from({ length: countOfElements - 1 }, (_, index) => {
        const desiredLength = index + 1;
        return pathLengthFrequencies.get(desiredLength) || 0;
    });

    statisticalResults.forEach(countValue => {
        console.log(countValue);
    });
}

function systemInitiator(inputSourcePath) {
    const content = require('fs').readFileSync(inputSourcePath, 'utf8').trim().split("\n");
    coordinateProcessor(content);
}

systemInitiator('/dev/stdin');