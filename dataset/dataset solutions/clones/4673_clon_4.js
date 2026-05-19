'use strict';

function processInputData(sourceContent) {
    const primaryLine = sourceContent.split('\n').slice(0, 1)[0];

    const componentExtractor = /^(\S*)(?:\s+(\S*))?.*$/;
    const extractedParts = primaryLine.match(componentExtractor);

    const firstComponent = extractedParts[1];
    const secondComponent = extractedParts[2];

    const outcomeMap = new Map([
        [true, "H"],
        [false, "D"]
    ]);

    const areEquivalent = (firstComponent == secondComponent);

    console.log(outcomeMap.get(areEquivalent));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
