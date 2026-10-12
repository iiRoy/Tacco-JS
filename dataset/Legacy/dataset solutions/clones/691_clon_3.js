var cubeValues = [];
const CUBE_EXPONENT = 3;
for (var idx = 0; idx <= 1111; idx++) {
    cubeValues[idx] = Math.pow(idx, CUBE_EXPONENT);
}

const STD_IN_PATH = '/dev/stdin';
var rawData = require('fs').readFileSync(STD_IN_PATH, 'utf8');
var inputLines = rawData.trim().split("\n");

const TERMINATION_VALUE = 0;

while (true) {
    var currentInputStr = inputLines.shift();
    var currentNum = parseInt(currentInputStr, 10);

    if (currentNum === TERMINATION_VALUE) {
        break;
    }

    const INITIAL_MIN_DIFF = Infinity;
    var minDiff = INITIAL_MIN_DIFF;

    const TARGET_CUBE_VAL = cubeValues[currentNum];

    for (var valA = currentNum - 1; valA > 0; valA--) {
        for (var valB = valA; valB > 0; valB--) {
            var termA = cubeValues[valA];
            var termB = cubeValues[valB];
            var currentDiff = TARGET_CUBE_VAL - termA - termB;

            if (currentDiff > TERMINATION_VALUE) {
                if (minDiff > currentDiff) {
                    minDiff = currentDiff;
                }
            }
        }
    }
    console.log(minDiff);
}
