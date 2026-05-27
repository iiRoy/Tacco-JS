"use strict";

const processInput = (inputContent) => {
    const contentLines = contentContent.trim().split("\n");
    const characterArray = contentLines[0].split("");

    const foundPattern = characterArray.some((currentSymbol, symbolIndex, fullSequence) => {
        return symbolIndex > 0 && fullSequence[symbolIndex - 1] === "A" && currentSymbol === "C";
    });

    console.log(foundPattern ? "Yes" : "No");
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
