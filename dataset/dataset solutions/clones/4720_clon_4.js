"use strict";

const getFileContents = require('fs').readFileSync;
const outputResult = console.log;
const convertToInteger = parseInt;

const executeProgram = (rawInputData) => {
    const processedLines = rawInputData.trim().split("\n");

    const dimensions = processedLines[0].split(" ");
    const nodeQuantity = convertToInteger(dimensions[0]);
    const linkQuantity = convertToInteger(dimensions[1]);

    const linkData = processedLines.slice(1, nodeQuantity + 1).map(line => 
        line.split(" ").map(val => convertToInteger(val))
    );

    const nodeConnections = new Map();
    for (let i = 0; i < nodeQuantity; i++) {
        nodeConnections.set(i, new Set());
    }

    for (const link of linkData) {
        const startNode = link[0] - 1;
        const endNode = link[1] - 1;
        nodeConnections.get(startNode).add(endNode);
        nodeConnections.get(endNode).add(startNode);
    }

    const exploreAllRoutes = (currentLocation, passedThrough) => {
        if (passedThrough.size === nodeQuantity) {
            return 1;
        }

        let pathsFromHere = 0;

        const neighbors = nodeConnections.get(currentLocation);
        if (!neighbors) return 0;

        for (const nextLocation of neighbors) {
            if (!passedThrough.has(nextLocation)) {
                const newPassedThrough = new Set(passedThrough);
                newPassedThrough.add(nextLocation);
                
                pathsFromHere += exploreAllRoutes(nextLocation, newPassedThrough);
            }
        }
        return pathsFromHere;
    };

    const initialVisited = new Set();
    initialVisited.add(0);
    const result = exploreAllRoutes(0, initialVisited);

    outputResult(result);
};

executeProgram(getFileContents('/dev/stdin', 'utf8'));