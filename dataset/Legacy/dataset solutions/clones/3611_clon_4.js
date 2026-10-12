"use strict";
function processInput(rawInput) {
    const dataSegments = rawInput.split("\n");
    const primaryString = dataSegments[0].trim();
    const numericLimit = Number(dataSegments[1].trim());

    const prefixCharacters = Array.from(primaryString).slice(0, numericLimit);

    const firstDivergentChar = prefixCharacters.find(charElement => charElement !== '1');

    if (firstDivergentChar !== undefined) {
        console.log(firstDivergentChar);
    } else {
        console.log(primaryString.charAt(numericLimit));
    }
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
