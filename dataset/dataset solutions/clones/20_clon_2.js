inputTokenArray = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s+/);

for (dataIndex = 0; dataIndex < inputTokenArray.length;) {
    firstX    = parseFloat(inputTokenArray[dataIndex++]);
    firstY    = parseFloat(inputTokenArray[dataIndex++]);
    firstConst = parseFloat(inputTokenArray[dataIndex++]);
    secondX    = parseFloat(inputTokenArray[dataIndex++]);
    secondY    = parseFloat(inputTokenArray[dataIndex++]);
    secondConst = parseFloat(inputTokenArray[dataIndex++]);
    resultY = (firstConst * secondX - firstX * secondConst) / (firstY * secondX - firstX * secondY);
    resultX = (firstConst - firstY * resultY) / firstX;
    console.log((Math.round(resultX * 1000) / 1000).toFixed(3) + " " + (Math.round(resultY * 1000) / 1000).toFixed(3));
}