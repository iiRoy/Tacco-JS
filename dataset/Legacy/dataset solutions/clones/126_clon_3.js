const fsModule = require("fs");
const MAX_BIT_POSITION = 10;

let inputTokenIndex = 0;
let currentProcessedValue;
let outputAccumulator;

for (
    inputTokenIndex = 0;
    (currentProcessedValue = fsModule.readFileSync("/dev/stdin", "utf8").split(/\s/)[inputTokenIndex++]) !== undefined;
    console.log(outputAccumulator.trim())
) {
    outputAccumulator = '';
    for (let bitPosition = 0; bitPosition < MAX_BIT_POSITION; bitPosition++) {
        const currentPowerOfTwo = 1 << bitPosition;
        if ((currentPowerOfTwo & currentProcessedValue) !== 0) {
            outputAccumulator += currentPowerOfTwo + ' ';
        }
    }
}
