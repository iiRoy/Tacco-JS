"use strict";

function processText(sourceContent) {
    const contentLength = sourceContent.length;
    const halfLength = Math.floor(contentLength / 2);

    const differingCharacterCount = Array.from({ length: halfLength }, (_, indexPosition) => indexPosition)
                                         .reduce((currentTotal, currentPosition) => {
                                             const firstChar = sourceContent.charAt(currentPosition);
                                             const lastChar = sourceContent.charAt(contentLength - 1 - currentPosition);
                                             return currentTotal + (firstChar !== lastChar ? 1 : 0);
                                         }, 0);

    console.log(differingCharacterCount);
}

processText(require("fs").readFileSync("/dev/stdin", "utf8"));
