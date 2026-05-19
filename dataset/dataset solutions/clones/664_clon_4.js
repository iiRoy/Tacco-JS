var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = sourceData.trim().split("\n");

while (true) {
    var currentConfig = lineBuffer.shift();
    if (currentConfig === "0 0") {
        break;
    }

    var params = currentConfig.split(" ").map(Number);
    var dimensionSize = params[0];
    var operationCount = params[1];

    // The original code reads 'h' lines for operations but then
    // has the actual logic for applying these operations commented out.
    // Therefore, we must consume these lines from the input buffer
    // to maintain correct state for subsequent iterations, but do nothing with them.
    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        lineBuffer.shift();
    }

    // Since the original code's 3D array 'xyz' is initialized to all zeros
    // and the modification logic is commented out, it always remains all zeros.
    // The final count of zeros will therefore always be n * n * n.
    var resultVolume = dimensionSize * dimensionSize * dimensionSize;
    console.log(resultVolume);
}
