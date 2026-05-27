'use strict';

let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
    let dimensions = inputLines.shift().split(' ').map(Number);
    if (dimensions[0] === 0) {
        break;
    }

    let scoreMap = {};
    for (let rowIdx = 0; rowIdx < dimensions[0]; rowIdx++) {
        let currentLineData = inputLines.shift().split(' ').map(Number);
        for (let colIdx = 0; colIdx < dimensions[1]; colIdx++) {
            let currentKey = colIdx + 1;
            scoreMap[currentKey] = (currentKey in scoreMap ? scoreMap[currentKey] : 0) + currentLineData[colIdx];
        }
    }

    console.log(Object.keys(scoreMap).sort(function(keyA, keyB) {
        return scoreMap[keyA] === scoreMap[keyB] ? keyA - keyB : scoreMap[keyB] - scoreMap[keyA];
    }).join(' '));
}
