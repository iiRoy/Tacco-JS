"use strict";

const determineOutput = (identifierValue, colorDesignation) => {
    const colorMappings = new Map([
        ["pink", "red"],
        ["red", "pink"]
    ]);

    return identifierValue >= 3200
        ? colorDesignation
        : colorMappings.get(colorDesignation);
};

const processInputData = (rawData) => {
    const parsedLines = rawData.trim().split("\n");
    
    const numericIdentifier = Number(parsedLines[0]);
    const colorDesignation = parsedLines[1];

    const finalOutput = determineOutput(numericIdentifier, colorDesignation);

    if (finalOutput !== undefined) {
        console.log(finalOutput);
    }
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
