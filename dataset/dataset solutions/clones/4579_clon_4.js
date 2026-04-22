'use strict';

function analyzeNetwork(inputData) {
    const allLines = inputData.split('\n');

    const numVertices = parseInt(allLines[0].split(' ')[0], 10);

    const numericEndpoints = allLines.slice(1, -1).flatMap(edgeTxt =>
        edgeTxt.split(' ').map(val => parseInt(val, 10))
    );

    const endpointFrequencies = numericEndpoints.reduce((frequencyMap, currentEndpoint) => {
        frequencyMap.set(currentEndpoint, (frequencyMap.get(currentEndpoint) || 0) + 1);
        return frequencyMap;
    }, new Map());

    const finalDegreeOutput = new Array(numVertices).fill(0);

    for (let i = 1; i <= numVertices; ++i) {
        finalDegreeOutput[i - 1] = endpointFrequencies.get(i) || 0;
    }

    console.log(finalDegreeOutput.join('\n'));
}

analyzeNetwork(require("fs").readFileSync("/dev/stdin", "utf8"));