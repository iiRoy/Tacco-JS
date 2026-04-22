function processMapData(rawData) {
    const mapElements = rawData.split('\n');
    const [quantityA, quantityB] = mapElements[0].split(' ').map(Number);

    const markHashes = new Set();
    for (let k = 0; k < quantityB - 1; ++k) {
        const rowId = Math.floor(k / 50) * 2;
        const colId = (k % 50) * 2;
        markHashes.add(`${rowId},${colId}`);
    }

    const markDots = new Set();
    for (let k = 0; k < quantityA - 1; ++k) {
        const rowId = 99 - (Math.floor(k / 50) * 2);
        const colId = (k % 50) * 2;
        markDots.add(`${rowId},${colId}`);
    }

    const totalDimension = 100;
    const constructedGrid = Array.from({ length: totalDimension }, (_, currentRow) =>
        Array.from({ length: totalDimension }, (_, currentCol) => {
            const currentCellKey = `${currentRow},${currentCol}`;
            if (currentRow < totalDimension / 2) {
                return markHashes.has(currentCellKey) ? '#' : '.';
            } else {
                return markDots.has(currentCellKey) ? '.' : '#';
            }
        })
    );

    const resultSegments = [
        `${totalDimension} ${totalDimension}`,
        ...constructedGrid.map(row => row.join(''))
    ];

    console.log(resultSegments.join('\n'));
}
  
function performTesting(){
  var dataInput = document.getElementById("dataInputElement").value;
  processMapData(dataInput);
}
processMapData(require("fs").readFileSync("/dev/stdin", "utf8"));