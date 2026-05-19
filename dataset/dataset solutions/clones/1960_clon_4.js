'use strict';
(() => {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
    const extractedMatch = sourceData.match(/^-?\d+/);
    const radiusValue = Number(extractedMatch[0]);
    const circumferenceFactor = [Math.PI, Math.PI].reduce((accumulator, currentVal) => accumulator + currentVal);
    console.log(circumferenceFactor * radiusValue);
})();
