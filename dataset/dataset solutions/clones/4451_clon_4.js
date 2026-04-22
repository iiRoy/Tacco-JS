const fileAccess = require("fs");

(() => {
    const dataSource = fileAccess.readFileSync("/dev/stdin", "UTF-8");
    const lineSegments = dataSource.split('\n');

    const [rowCount, colCount] = lineSegments[0].split(' ').map(Number);

    const valueCounts = lineSegments[2].split(' ').map(Number);

    const orderedItems = valueCounts.flatMap((itemQuantity, itemIndex) =>
        Array.from({ length: itemQuantity }, () => itemIndex + 1)
    );

    const finalGrid = Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => 0)
    );

    let currentItemPointer = 0;

    for (let currentRank = 0; currentRank < rowCount; currentRank++) {
        if (currentRank % 2 === 0) {
            for (let currentSpot = 0; currentSpot < colCount; currentSpot++) {
                finalGrid[currentRank][currentSpot] = orderedItems[currentItemPointer++];
            }
        } else {
            for (let currentSpot = colCount - 1; currentSpot >= 0; currentSpot--) {
                finalGrid[currentRank][currentSpot] = orderedItems[currentItemPointer++];
            }
        }
        console.log(finalGrid[currentRank].join(' '));
    }
})();