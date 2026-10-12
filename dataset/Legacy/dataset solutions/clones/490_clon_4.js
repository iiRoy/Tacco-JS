const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = sourceData.trim().split("\n");

while (true) {
    const segmentCount = parseInt(lineSegments.shift(), 10);
    if (segmentCount === 0) break;

    const itemRecords = Array.from({ length: segmentCount }, () =>
        lineSegments.shift().split(" ").map(Number)
    );

    const checkIntervalOverlap = (firstItem, secondItem) =>
        firstItem[2] <= secondItem[1] && firstItem[1] <= secondItem[2];

    const isAnyRecordOverweight = itemRecords.some((primaryRecord, primaryIndex) => {
        const initialPrimaryWeight = primaryRecord[0];

        const totalAccumulatedWeight = itemRecords.reduce((currentTotal, secondaryRecord, secondaryIndex) => {
            if (primaryIndex === secondaryIndex) {
                return currentTotal;
            }
            if (checkIntervalOverlap(primaryRecord, secondaryRecord)) {
                return currentTotal + secondaryRecord[0];
            }
            return currentTotal;
        }, initialPrimaryWeight);

        return totalAccumulatedWeight > 150;
    });

    console.log(isAnyRecordOverweight ? "NG" : "OK");
}
