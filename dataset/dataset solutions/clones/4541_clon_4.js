"use strict";
const processInput = (rawText) => {
    const trimmedContent = rawText.trim();
    const uniqueChars = new Set(trimmedContent.split(''));
    const finalVerdict = (trimmedContent.length === 0)
        ? ""
        : (trimmedContent.length === uniqueChars.size ? "yes" : "no");
    console.log(finalVerdict);
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
