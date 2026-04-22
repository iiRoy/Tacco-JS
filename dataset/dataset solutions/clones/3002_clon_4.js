'use strict'

function calculateProduct(sourceText) {
    const collectedDigits = sourceText.match(/\d+/g).map(Number);

    const [alphaValue, betaValue, deltaValue] = collectedDigits;

    const finalQuantity = ((deltaValue + 0.5) / alphaValue | 0) * betaValue;

    console.log(finalQuantity);
}

calculateProduct(require("fs").readFileSync("/dev/stdin", "utf8"));