'use strict';

function evaluateCharacterUniqueness(sourceText) {
    const firstSymbol = sourceText.charAt(0);
    const secondSymbol = sourceText.charAt(1);
    const thirdSymbol = sourceText.charAt(2);

    const uniqueSymbolCollection = new Set();
    uniqueSymbolCollection.add(firstSymbol);
    uniqueSymbolCollection.add(secondSymbol);
    uniqueSymbolCollection.add(thirdSymbol);

    const allAreDistinct = uniqueSymbolCollection.size === 3;

    console.log(allAreDistinct ? "Yes" : "No");
}

evaluateCharacterUniqueness(require("fs").readFileSync("/dev/stdin", "utf8"));
