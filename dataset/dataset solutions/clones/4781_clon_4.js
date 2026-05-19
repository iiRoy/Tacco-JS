"use strict";

const processPath = (inputData) => {
    const parsedLines = inputData.trim().split("\n");
    const [initialX, initialY, targetX, targetY] = parsedLines[0].split(" ").map(Number);

    const deltaX = targetX - initialX;
    const deltaY = targetY - initialY;

    const generateSequence = (charSymbol, countValue) => charSymbol.repeat(countValue);

    let constructedPath = "";

    constructedPath += generateSequence("R", deltaX);
    constructedPath += generateSequence("U", deltaY);
    constructedPath += generateSequence("L", deltaX);
    constructedPath += generateSequence("D", deltaY);

    constructedPath += "L";

    constructedPath += generateSequence("U", deltaY + 1);
    constructedPath += generateSequence("R", deltaX + 1);

    constructedPath += "D";

    constructedPath += generateSequence("D", deltaY + 1);
    constructedPath += generateSequence("L", deltaX + 1);

    constructedPath += "U";

    return constructedPath;
};

console.log(processPath(require('fs').readFileSync('/dev/stdin', 'utf8')));
