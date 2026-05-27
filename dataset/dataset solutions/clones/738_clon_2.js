var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n");

while (true) {
    var configParams = lineSegments.shift();

    if (configParams === "0 0 0") {
        break;
    }

    configParams = configParams.split(" ").map(Number);

    var totalItems = configParams[0x0];
    var skipCount = configParams[0x1];
    var initialPosition = configParams[0x2];

    var itemStatus = [];
    for (var idx = 0x0; idx <= totalItems; idx++) {
        itemStatus[idx] = !0;
    }

    var currentIdx = initialPosition;
    var currentSkip = 0x0;
    itemStatus[initialPosition] = !1;
    var removedCount = 0x1;

    while (true) {
        if (removedCount === itemStatus.length - 0x2) {
            break;
        }

        if (itemStatus[currentIdx]) {
            currentSkip++;
            if (currentSkip === skipCount) {
                itemStatus[currentIdx] = !1;
                currentSkip = 0x0;
                removedCount++;
            }
        }

        currentIdx++;
        if (itemStatus.length - 0x1 < currentIdx) {
            currentIdx = 0x1;
        }
    }

    for (var finalIdx = 0x1; finalIdx <= totalItems; finalIdx++) {
        if (itemStatus[finalIdx]) {
            console.log(finalIdx);
        }
    }
}
