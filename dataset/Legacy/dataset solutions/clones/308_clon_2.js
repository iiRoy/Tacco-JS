let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

let currentIdx = 0;

for (
    console.log(
        Math.floor(
            inputData[currentIdx++] * inputData[currentIdx++] / 0.000003305785
        ) / 1000000
    );
    currentIdx < inputData.length - 1;
) {
    // This loop body is intentionally empty, mirroring the original's structure.
}
