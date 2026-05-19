"use strict";

const processInput = (inputTxt) => {
    const inputLines = inputTxt.split("\n");
    const [nodeQuantity, connectionQuantity] = inputLines[0].split(" ").map(Number);

    const nodeFrequencies = new Array(nodeQuantity + 1).fill(0);

    inputLines.slice(1, connectionQuantity + 1).forEach(connectionLine => {
        const [firstEndpoint, secondEndpoint] = connectionLine.split(" ").map(Number);
        nodeFrequencies[firstEndpoint]++;
        nodeFrequencies[secondEndpoint]++;
    });

    for (let currentId = 1; currentId <= nodeQuantity; currentId++) {
        console.log(nodeFrequencies[currentId]);
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
